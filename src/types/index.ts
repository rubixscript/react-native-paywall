// Core Paywall Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  originalPrice?: number;
  discountPercentage?: number;
  isPopular?: boolean;
  productId?: string; // For app store integration
}

export interface PaywallFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  isInPro: boolean;
}

export interface PaywallConfig {
  title: string;
  subtitle: string;
  features: PaywallFeature[];
  plans: SubscriptionPlan[];
  ctaText: string;
  secondaryCtaText?: string;
  showTermsAndPrivacy: boolean;
  customTheme?: PaywallTheme;
  restorePurchaseText?: string;
  termsText?: string;
  privacyText?: string;
}

export interface PaywallTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonTextColor: string;
  borderColor?: string;
  borderRadius?: number;
  fontFamily?: string;
}

// Paywall State
export interface PaywallState {
  isVisible: boolean;
  selectedPlan?: SubscriptionPlan;
  isLoading: boolean;
  error?: string;
  purchaseState: 'idle' | 'processing' | 'success' | 'error';
}

// Promo Code Types
export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount: {
    type: 'percentage' | 'fixed' | 'free_trial';
    value: number;
    duration?: number; // in days for free trial
  };
  maxUses?: number;
  currentUses: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicablePlans?: string[]; // Plan IDs this code applies to
  restrictions?: {
    newCustomersOnly?: boolean;
    minimumPlan?: string;
    maximumDiscount?: number;
  };
}

export interface PromoCodeValidation {
  isValid: boolean;
  promoCode?: PromoCode;
  discountedPrice?: number;
  message: string;
  error?: string;
}

export interface PromoCodeApplication {
  promoCode: PromoCode;
  originalPlan: SubscriptionPlan;
  discountedPlan: SubscriptionPlan;
  appliedAt: string;
}

export interface PromoCodeState {
  code: string;
  validation: PromoCodeValidation | null;
  isApplying: boolean;
  appliedPromo: PromoCodeApplication | null;
}

// Purchase and Revenue Types
export interface PurchaseInfo {
  transactionId: string;
  productId: string;
  purchaseDate: string;
  expirationDate?: string;
  isActive: boolean;
  promoCodeUsed?: string;
  originalPrice: number;
  finalPrice: number;
  currency: string;
}

export interface RevenueCatConfig {
  apiKey: string;
  entitlementId: string;
  offeringId?: string;
}

// Analytics and Events
export interface PaywallAnalytics {
  event: 'paywall_viewed' | 'purchase_started' | 'purchase_completed' | 'purchase_failed' | 'promo_code_applied' | 'promo_code_failed';
  timestamp: string;
  data?: Record<string, any>;
}

export interface PaywallEventHandlers {
  onPurchaseStart?: (plan: SubscriptionPlan) => void;
  onPurchaseSuccess?: (purchase: PurchaseInfo) => void;
  onPurchaseError?: (error: string) => void;
  onRestoreSuccess?: (purchases: PurchaseInfo[]) => void;
  onRestoreError?: (error: string) => void;
  onPromoCodeApplied?: (application: PromoCodeApplication) => void;
  onPromoCodeError?: (error: string) => void;
  onPaywallClose?: () => void;
  onTermsPressed?: () => void;
  onPrivacyPressed?: () => void;
}

// API Response Types
export interface SubscriptionStatusResponse {
  isActive: boolean;
  entitlements: string[];
  expirationDate?: string;
  willRenew: boolean;
  trialPeriod?: boolean;
  promoCodeUsed?: string;
}

export interface PlansResponse {
  plans: SubscriptionPlan[];
  defaultPlan?: string;
  promotionalPlans?: SubscriptionPlan[];
}

// Error Types
export interface PaywallError {
  code: string;
  message: string;
  details?: any;
  userFriendlyMessage?: string;
}

// Configuration Types
export interface PaywallProviderConfig {
  revenueCat?: RevenueCatConfig;
  customBackend?: {
    baseUrl: string;
    apiKey: string;
  };
  enablePromoCodes: boolean;
  enableAnalytics: boolean;
  debugMode?: boolean;
  cachePromoCodes?: boolean;
}

// UI Component Props
export interface PaywallModalProps {
  isVisible: boolean;
  config: PaywallConfig;
  state: PaywallState;
  onClose: () => void;
  onPlanSelect: (plan: SubscriptionPlan) => void;
  onPurchase: () => void;
  onRestore: () => void;
  onTermsPress: () => void;
  onPrivacyPress: () => void;
}

export interface PromoCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onApply: () => void;
  onRemove: () => void;
  validation: PromoCodeValidation | null;
  isApplying: boolean;
  placeholder?: string;
  applyButtonText?: string;
  removeButtonText?: string;
}

// Context Types
export interface PaywallContextType {
  // State
  paywallState: PaywallState;
  promoCodeState: PromoCodeState;
  subscriptionStatus: SubscriptionStatusResponse | null;

  // Configuration
  config: PaywallConfig;

  // Actions
  showPaywall: () => void;
  hidePaywall: () => void;
  selectPlan: (plan: SubscriptionPlan) => void;
  purchasePlan: () => Promise<void>;
  restorePurchases: () => Promise<void>;

  // Promo Code Actions
  validatePromoCode: (code: string) => Promise<PromoCodeValidation>;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => void;

  // Utility
  refreshSubscriptionStatus: () => Promise<void>;
  isFeatureUnlocked: (featureId: string) => boolean;
}

// Export all types
export type {
  SubscriptionPlan,
  PaywallFeature,
  PaywallConfig,
  PaywallTheme,
  PaywallState,
  PromoCode,
  PromoCodeValidation,
  PromoCodeApplication,
  PromoCodeState,
  PurchaseInfo,
  RevenueCatConfig,
  PaywallAnalytics,
  PaywallEventHandlers,
  SubscriptionStatusResponse,
  PlansResponse,
  PaywallError,
  PaywallProviderConfig,
  PaywallModalProps,
  PromoCodeInputProps,
  PaywallContextType,
};