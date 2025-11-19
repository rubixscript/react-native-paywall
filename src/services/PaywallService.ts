import {
  SubscriptionPlan,
  PurchaseInfo,
  SubscriptionStatusResponse,
  PlansResponse,
  PaywallError,
  RevenueCatConfig,
  PaywallAnalytics
} from '../types';

export class PaywallService {
  private revenueCatConfig?: RevenueCatConfig;
  private customBackendUrl?: string;
  private customBackendApiKey?: string;
  private debugMode: boolean = false;

  constructor(config: {
    revenueCat?: RevenueCatConfig;
    customBackend?: {
      baseUrl: string;
      apiKey: string;
    };
    debugMode?: boolean;
  }) {
    this.revenueCatConfig = config.revenueCat;
    this.customBackendUrl = config.customBackend?.baseUrl;
    this.customBackendApiKey = config.customBackend?.apiKey;
    this.debugMode = config.debugMode || false;
  }

  // Initialize the service
  async initialize(): Promise<void> {
    try {
      if (this.revenueCatConfig) {
        await this.initializeRevenueCat();
      }
      if (this.customBackendUrl) {
        await this.validateCustomBackend();
      }
      this.log('PaywallService initialized successfully');
    } catch (error) {
      this.logError('Failed to initialize PaywallService', error);
      throw error;
    }
  }

  // Get available subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      if (this.revenueCatConfig) {
        return await this.getRevenueCatPlans();
      }

      if (this.customBackendUrl) {
        return await this.getCustomBackendPlans();
      }

      // Return default mock plans for development
      return this.getDefaultPlans();
    } catch (error) {
      this.logError('Failed to fetch subscription plans', error);
      throw this.createPaywallError('PLAN_FETCH_FAILED', 'Failed to load subscription plans', error);
    }
  }

  // Get current subscription status
  async getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
    try {
      if (this.revenueCatConfig) {
        return await this.getRevenueCatStatus();
      }

      if (this.customBackendUrl) {
        return await this.getCustomBackendStatus();
      }

      // Return mock status for development
      return this.getDefaultStatus();
    } catch (error) {
      this.logError('Failed to fetch subscription status', error);
      throw this.createPaywallError('STATUS_FETCH_FAILED', 'Failed to check subscription status', error);
    }
  }

  // Purchase a subscription plan
  async purchasePlan(plan: SubscriptionPlan, promoCode?: string): Promise<PurchaseInfo> {
    try {
      this.logEvent('purchase_started', { planId: plan.id, promoCode });

      if (this.revenueCatConfig) {
        return await this.purchaseRevenueCatPlan(plan, promoCode);
      }

      if (this.customBackendUrl) {
        return await this.purchaseCustomBackendPlan(plan, promoCode);
      }

      // Mock purchase for development
      return await this.mockPurchase(plan, promoCode);
    } catch (error) {
      this.logError('Purchase failed', error);
      this.logEvent('purchase_failed', { planId: plan.id, error: error.message });
      throw this.createPaywallError('PURCHASE_FAILED', 'Purchase failed. Please try again.', error);
    }
  }

  // Restore previous purchases
  async restorePurchases(): Promise<PurchaseInfo[]> {
    try {
      if (this.revenueCatConfig) {
        return await this.restoreRevenueCatPurchases();
      }

      if (this.customBackendUrl) {
        return await this.restoreCustomBackendPurchases();
      }

      // Mock restore for development
      return this.getDefaultPurchases();
    } catch (error) {
      this.logError('Restore purchases failed', error);
      throw this.createPaywallError('RESTORE_FAILED', 'Failed to restore purchases. Please try again.', error);
    }
  }

  // Validate receipt (for custom backend)
  async validateReceipt(receiptData: string): Promise<PurchaseInfo> {
    if (!this.customBackendUrl) {
      throw this.createPaywallError('RECEIPT_VALIDATION_NOT_SUPPORTED', 'Receipt validation not available');
    }

    try {
      const response = await fetch(`${this.customBackendUrl}/validate-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.customBackendApiKey}`,
        },
        body: JSON.stringify({ receiptData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logError('Receipt validation failed', error);
      throw this.createPaywallError('RECEIPT_VALIDATION_FAILED', 'Failed to validate receipt', error);
    }
  }

  // Private methods for RevenueCat integration
  private async initializeRevenueCat(): Promise<void> {
    // This would integrate with the actual RevenueCat SDK
    this.log('RevenueCat initialization (placeholder)');
  }

  private async getRevenueCatPlans(): Promise<SubscriptionPlan[]> {
    // Placeholder for RevenueCat offering fetch
    this.log('Fetching RevenueCat plans (placeholder)');
    return this.getDefaultPlans();
  }

  private async getRevenueCatStatus(): Promise<SubscriptionStatusResponse> {
    // Placeholder for RevenueCat customer info fetch
    this.log('Fetching RevenueCat status (placeholder)');
    return this.getDefaultStatus();
  }

  private async purchaseRevenueCatPlan(plan: SubscriptionPlan, promoCode?: string): Promise<PurchaseInfo> {
    // Placeholder for RevenueCat purchase
    this.log(`RevenueCat purchase: ${plan.id}, promo: ${promoCode}`);
    return this.mockPurchase(plan, promoCode);
  }

  private async restoreRevenueCatPurchases(): Promise<PurchaseInfo[]> {
    // Placeholder for RevenueCat restore
    this.log('RevenueCat restore (placeholder)');
    return this.getDefaultPurchases();
  }

  // Private methods for custom backend integration
  private async validateCustomBackend(): Promise<void> {
    const response = await fetch(`${this.customBackendUrl}/health`, {
      headers: {
        'Authorization': `Bearer ${this.customBackendApiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Custom backend health check failed: ${response.status}`);
    }
  }

  private async getCustomBackendPlans(): Promise<SubscriptionPlan[]> {
    const response = await fetch(`${this.customBackendUrl}/plans`, {
      headers: {
        'Authorization': `Bearer ${this.customBackendApiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch plans: ${response.status}`);
    }

    const plansResponse: PlansResponse = await response.json();
    return plansResponse.plans;
  }

  private async getCustomBackendStatus(): Promise<SubscriptionStatusResponse> {
    const response = await fetch(`${this.customBackendUrl}/subscription/status`, {
      headers: {
        'Authorization': `Bearer ${this.customBackendApiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch status: ${response.status}`);
    }

    return await response.json();
  }

  private async purchaseCustomBackendPlan(plan: SubscriptionPlan, promoCode?: string): Promise<PurchaseInfo> {
    const response = await fetch(`${this.customBackendUrl}/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.customBackendApiKey}`,
      },
      body: JSON.stringify({ planId: plan.id, promoCode }),
    });

    if (!response.ok) {
      throw new Error(`Purchase failed: ${response.status}`);
    }

    const purchaseInfo: PurchaseInfo = await response.json();
    this.logEvent('purchase_completed', { planId: plan.id, transactionId: purchaseInfo.transactionId });

    return purchaseInfo;
  }

  private async restoreCustomBackendPurchases(): Promise<PurchaseInfo[]> {
    const response = await fetch(`${this.customBackendUrl}/restore`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.customBackendApiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Restore failed: ${response.status}`);
    }

    return await response.json();
  }

  // Mock data for development
  private getDefaultPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'monthly',
        name: 'Monthly Premium',
        description: 'Access all premium features',
        price: 4.99,
        currency: 'USD',
        duration: 'monthly',
        features: [
          'Unlimited recipes',
          'Advanced meal planning',
          'Nutritional insights',
          'Priority support'
        ],
        productId: 'premium_monthly',
      },
      {
        id: 'yearly',
        name: 'Annual Premium',
        description: 'Best value - Save 50%',
        price: 49.99,
        currency: 'USD',
        duration: 'yearly',
        features: [
          'Unlimited recipes',
          'Advanced meal planning',
          'Nutritional insights',
          'Priority support',
          'Exclusive recipes',
          'Ad-free experience'
        ],
        originalPrice: 59.88,
        discountPercentage: 17,
        isPopular: true,
        productId: 'premium_yearly',
      },
      {
        id: 'lifetime',
        name: 'Lifetime Access',
        description: 'Pay once, enjoy forever',
        price: 149.99,
        currency: 'USD',
        duration: 'lifetime',
        features: [
          'Lifetime unlimited access',
          'All current & future features',
          'Priority lifetime support',
          'Exclusive beta access'
        ],
        productId: 'premium_lifetime',
      },
    ];
  }

  private getDefaultStatus(): SubscriptionStatusResponse {
    return {
      isActive: false,
      entitlements: [],
      willRenew: false,
      trialPeriod: false,
    };
  }

  private getDefaultPurchases(): PurchaseInfo[] {
    return [];
  }

  private async mockPurchase(plan: SubscriptionPlan, promoCode?: string): Promise<PurchaseInfo> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const discountedPrice = promoCode ? plan.price * 0.8 : plan.price;

    const purchaseInfo: PurchaseInfo = {
      transactionId: `mock_${Date.now()}`,
      productId: plan.productId || plan.id,
      purchaseDate: new Date().toISOString(),
      expirationDate: plan.duration === 'lifetime' ? undefined :
        new Date(Date.now() + this.getDurationMs(plan.duration)).toISOString(),
      isActive: true,
      promoCodeUsed: promoCode,
      originalPrice: plan.price,
      finalPrice: discountedPrice,
      currency: plan.currency,
    };

    this.logEvent('purchase_completed', {
      planId: plan.id,
      transactionId: purchaseInfo.transactionId,
      promoCode
    });

    return purchaseInfo;
  }

  private getDurationMs(duration: 'monthly' | 'yearly' | 'lifetime'): number {
    switch (duration) {
      case 'monthly': return 30 * 24 * 60 * 60 * 1000;
      case 'yearly': return 365 * 24 * 60 * 60 * 1000;
      case 'lifetime': return 0;
    }
  }

  // Utility methods
  private createPaywallError(code: string, message: string, originalError?: any): PaywallError {
    return {
      code,
      message,
      details: originalError,
      userFriendlyMessage: message,
    };
  }

  private logEvent(event: PaywallAnalytics['event'], data?: Record<string, any>): void {
    if (!this.debugMode) return;

    console.log(`[PaywallService] Event: ${event}`, data);

    // Here you would integrate with your analytics service
    // analytics.track(event, data);
  }

  private log(message: string, data?: any): void {
    if (!this.debugMode) return;
    console.log(`[PaywallService] ${message}`, data || '');
  }

  private logError(message: string, error: any): void {
    if (!this.debugMode) return;
    console.error(`[PaywallService] ${message}`, error);
  }
}