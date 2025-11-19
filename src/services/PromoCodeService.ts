import {
  PromoCode,
  PromoCodeValidation,
  PromoCodeApplication,
  SubscriptionPlan,
  PaywallError
} from '../types';

export class PromoCodeService {
  private backendUrl?: string;
  private apiKey?: string;
  private debugMode: boolean = false;
  private cache: Map<string, PromoCodeValidation> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  constructor(config: {
    backendUrl?: string;
    apiKey?: string;
    debugMode?: boolean;
    enableCache?: boolean;
  }) {
    this.backendUrl = config.backendUrl;
    this.apiKey = config.apiKey;
    this.debugMode = config.debugMode || false;

    if (config.enableCache === false) {
      this.cache.clear();
    }
  }

  // Validate a promo code
  async validatePromoCode(
    code: string,
    planId?: string,
    userId?: string
  ): Promise<PromoCodeValidation> {
    try {
      // Check cache first
      const cacheKey = `${code}_${planId}_${userId}`;
      const cached = this.getCachedValidation(cacheKey);
      if (cached) {
        this.log(`Returning cached validation for code: ${code}`);
        return cached;
      }

      // Normalize the promo code
      const normalizedCode = this.normalizeCode(code);

      if (this.backendUrl) {
        const validation = await this.validateWithBackend(normalizedCode, planId, userId);
        this.setCachedValidation(cacheKey, validation);
        return validation;
      }

      // Use mock validation for development
      const validation = await this.mockValidate(normalizedCode, planId);
      this.setCachedValidation(cacheKey, validation);
      return validation;
    } catch (error) {
      this.logError(`Failed to validate promo code: ${code}`, error);
      return {
        isValid: false,
        message: 'Invalid promo code',
        error: 'VALIDATION_FAILED',
      };
    }
  }

  // Apply a promo code to a subscription plan
  async applyPromoCode(
    code: string,
    plan: SubscriptionPlan,
    userId?: string
  ): Promise<PromoCodeApplication> {
    try {
      const validation = await this.validatePromoCode(code, plan.id, userId);

      if (!validation.isValid || !validation.promoCode) {
        throw new PaywallError(
          'INVALID_PROMO_CODE',
          validation.message || 'Invalid promo code'
        );
      }

      // Apply discount to the plan
      const discountedPlan = this.applyDiscountToPlan(plan, validation.promoCode);

      const application: PromoCodeApplication = {
        promoCode: validation.promoCode,
        originalPlan: plan,
        discountedPlan,
        appliedAt: new Date().toISOString(),
      };

      this.log(`Promo code applied successfully: ${code}`, {
        originalPrice: plan.price,
        discountedPrice: discountedPlan.price,
      });

      return application;
    } catch (error) {
      this.logError(`Failed to apply promo code: ${code}`, error);
      throw error;
    }
  }

  // Get available promo codes (for admin/marketing purposes)
  async getAvailablePromoCodes(filters?: {
    active?: boolean;
    planId?: string;
    limit?: number;
  }): Promise<PromoCode[]> {
    try {
      if (this.backendUrl) {
        return await this.getPromoCodesFromBackend(filters);
      }

      // Return mock promo codes for development
      return this.getMockPromoCodes(filters);
    } catch (error) {
      this.logError('Failed to fetch available promo codes', error);
      throw this.createPaywallError('FETCH_FAILED', 'Failed to fetch promo codes', error);
    }
  }

  // Redeem a promo code (track usage)
  async redeemPromoCode(
    code: string,
    userId: string,
    purchaseId?: string
  ): Promise<void> {
    try {
      if (this.backendUrl) {
        await this.redeemWithBackend(code, userId, purchaseId);
      }

      // Mock redemption for development
      this.mockRedeem(code, userId, purchaseId);
    } catch (error) {
      this.logError(`Failed to redeem promo code: ${code}`, error);
      throw this.createPaywallError('REDEEM_FAILED', 'Failed to redeem promo code', error);
    }
  }

  // Check if a user has used a specific promo code
  async hasUserUsedPromoCode(code: string, userId: string): Promise<boolean> {
    try {
      if (this.backendUrl) {
        return await this.checkUsageWithBackend(code, userId);
      }

      // Mock check for development
      return this.mockCheckUsage(code, userId);
    } catch (error) {
      this.logError(`Failed to check promo code usage: ${code}`, error);
      return false; // Assume not used on error
    }
  }

  // Clear promo code cache
  clearCache(): void {
    this.cache.clear();
    this.log('Promo code cache cleared');
  }

  // Private methods
  private normalizeCode(code: string): string {
    return code.trim().toUpperCase().replace(/\s+/g, '');
  }

  private getCachedValidation(key: string): PromoCodeValidation | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache has expired
    const age = Date.now() - Date.parse(cached.message); // Using timestamp in message field
    if (age > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  private setCachedValidation(key: string, validation: PromoCodeValidation): void {
    // Add timestamp to message for cache expiry checking
    const validationWithTimestamp = {
      ...validation,
      message: validation.message.includes('|') ? validation.message : `${validation.message}|${Date.now()}`,
    };
    this.cache.set(key, validationWithTimestamp);
  }

  private async validateWithBackend(
    code: string,
    planId?: string,
    userId?: string
  ): Promise<PromoCodeValidation> {
    const response = await fetch(`${this.backendUrl}/promo-codes/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        code,
        planId,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend validation failed: ${response.status}`);
    }

    return await response.json();
  }

  private async mockValidate(
    code: string,
    planId?: string
  ): Promise<PromoCodeValidation> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockPromoCodes = this.getMockPromoCodes();
    const promoCode = mockPromoCodes.find(pc => pc.code === code);

    if (!promoCode || !promoCode.isActive) {
      return {
        isValid: false,
        message: 'Invalid promo code',
        error: 'CODE_NOT_FOUND',
      };
    }

    // Check expiration
    const now = new Date();
    const validFrom = new Date(promoCode.validFrom);
    const validUntil = new Date(promoCode.validUntil);

    if (now < validFrom || now > validUntil) {
      return {
        isValid: false,
        message: 'Promo code has expired',
        error: 'CODE_EXPIRED',
      };
    }

    // Check usage limits
    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return {
        isValid: false,
        message: 'Promo code has been fully redeemed',
        error: 'CODE_EXHAUSTED',
      };
    }

    // Check plan restrictions
    if (promoCode.applicablePlans && planId && !promoCode.applicablePlans.includes(planId)) {
      return {
        isValid: false,
        message: 'Promo code is not applicable to this plan',
        error: 'PLAN_NOT_APPLICABLE',
      };
    }

    // Calculate discount (mock calculation)
    let discountedPrice: number | undefined;
    if (planId) {
      const mockPlans = this.getMockPlans();
      const plan = mockPlans.find(p => p.id === planId);
      if (plan) {
        discountedPrice = this.calculateDiscountedPrice(plan, promoCode);
      }
    }

    return {
      isValid: true,
      promoCode,
      discountedPrice,
      message: 'Promo code applied successfully',
    };
  }

  private applyDiscountToPlan(plan: SubscriptionPlan, promoCode: PromoCode): SubscriptionPlan {
    const discountedPrice = this.calculateDiscountedPrice(plan, promoCode);

    return {
      ...plan,
      price: discountedPrice,
      description: promoCode.discount.type === 'free_trial'
        ? `${plan.description} - ${promoCode.discount.duration} days free trial`
        : plan.description,
    };
  }

  private calculateDiscountedPrice(plan: SubscriptionPlan, promoCode: PromoCode): number {
    const { discount } = promoCode;

    switch (discount.type) {
      case 'percentage':
        return Math.max(0, plan.price * (1 - discount.value / 100));

      case 'fixed':
        return Math.max(0, plan.price - discount.value);

      case 'free_trial':
        return 0; // Free trial means no charge for the trial period

      default:
        return plan.price;
    }
  }

  private getMockPromoCodes(filters?: any): PromoCode[] {
    const mockCodes: PromoCode[] = [
      {
        id: '1',
        code: 'SAVE20',
        description: 'Save 20% on your first subscription',
        discount: {
          type: 'percentage',
          value: 20,
        },
        maxUses: 1000,
        currentUses: 342,
        validFrom: '2024-01-01T00:00:00Z',
        validUntil: '2024-12-31T23:59:59Z',
        isActive: true,
        applicablePlans: ['monthly', 'yearly'],
        restrictions: {
          newCustomersOnly: true,
        },
      },
      {
        id: '2',
        code: 'FREEMONTH',
        description: 'Get your first month free',
        discount: {
          type: 'free_trial',
          value: 30, // 30 days
          duration: 30,
        },
        maxUses: 500,
        currentUses: 198,
        validFrom: '2024-01-01T00:00:00Z',
        validUntil: '2024-06-30T23:59:59Z',
        isActive: true,
        applicablePlans: ['monthly'],
        restrictions: {
          newCustomersOnly: true,
        },
      },
      {
        id: '3',
        code: 'SPECIAL50',
        description: '$50 off annual subscription',
        discount: {
          type: 'fixed',
          value: 50,
        },
        maxUses: 200,
        currentUses: 67,
        validFrom: '2024-01-01T00:00:00Z',
        validUntil: '2024-03-31T23:59:59Z',
        isActive: true,
        applicablePlans: ['yearly'],
      },
    ];

    // Apply filters
    let filtered = mockCodes;

    if (filters?.active !== undefined) {
      filtered = filtered.filter(code => code.isActive === filters.active);
    }

    if (filters?.planId) {
      filtered = filtered.filter(code =>
        !code.applicablePlans || code.applicablePlans.includes(filters.planId)
      );
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  private getMockPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'monthly',
        name: 'Monthly Premium',
        description: 'Monthly subscription',
        price: 9.99,
        currency: 'USD',
        duration: 'monthly',
        features: [],
      },
      {
        id: 'yearly',
        name: 'Annual Premium',
        description: 'Annual subscription',
        price: 99.99,
        currency: 'USD',
        duration: 'yearly',
        features: [],
      },
    ];
  }

  private async getPromoCodesFromBackend(filters?: any): Promise<PromoCode[]> {
    const queryParams = new URLSearchParams(filters as any).toString();
    const response = await fetch(`${this.backendUrl}/promo-codes?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch promo codes: ${response.status}`);
    }

    return await response.json();
  }

  private async redeemWithBackend(code: string, userId: string, purchaseId?: string): Promise<void> {
    const response = await fetch(`${this.backendUrl}/promo-codes/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        code,
        userId,
        purchaseId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to redeem promo code: ${response.status}`);
    }
  }

  private mockRedeem(code: string, userId: string, purchaseId?: string): void {
    this.log(`Mock redemption: ${code} for user ${userId}`, { purchaseId });
    // In a real implementation, this would update a database
  }

  private async checkUsageWithBackend(code: string, userId: string): Promise<boolean> {
    const response = await fetch(`${this.backendUrl}/promo-codes/check-usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        code,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to check usage: ${response.status}`);
    }

    const result = await response.json();
    return result.hasUsed;
  }

  private mockCheckUsage(code: string, userId: string): boolean {
    // Mock implementation - in reality this would check a database
    const usedCodes = ['SAVE20', 'FREEMONTH']; // Simulate some used codes
    return usedCodes.includes(code);
  }

  private createPaywallError(code: string, message: string, originalError?: any): PaywallError {
    return {
      code,
      message,
      details: originalError,
      userFriendlyMessage: message,
    };
  }

  private log(message: string, data?: any): void {
    if (!this.debugMode) return;
    console.log(`[PromoCodeService] ${message}`, data || '');
  }

  private logError(message: string, error: any): void {
    if (!this.debugMode) return;
    console.error(`[PromoCodeService] ${message}`, error);
  }
}