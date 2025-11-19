// Storage Keys
export const STORAGE_KEYS = {
  SUBSCRIPTION_STATUS: '@paywall_subscription_status',
  USER_ID: '@paywall_user_id',
  LAST_SEEN_PAYWALL: '@paywall_last_seen',
  PROMO_CODES_CACHE: '@paywall_promo_codes_cache',
  PURCHASE_HISTORY: '@paywall_purchase_history',
} as const;

// Default Configuration
export const DEFAULT_CONFIG = {
  title: 'Unlock Premium Features',
  subtitle: 'Get unlimited access to all features and remove all limitations',
  features: [
    {
      id: 'unlimited_access',
      title: 'Unlimited Access',
      description: 'Access all premium features without limits',
      icon: '✨',
      isInPro: true,
    },
    {
      id: 'no_ads',
      title: 'Ad-Free Experience',
      description: 'Enjoy the app without any advertisements',
      icon: '🚫',
      isInPro: true,
    },
    {
      id: 'priority_support',
      title: 'Priority Support',
      description: 'Get help faster with our premium support',
      icon: '⭐',
      isInPro: true,
    },
  ],
  plans: [],
  ctaText: 'Start Premium Trial',
  secondaryCtaText: 'Maybe Later',
  showTermsAndPrivacy: true,
  restorePurchaseText: 'Restore Purchases',
  termsText: 'Terms of Service',
  privacyText: 'Privacy Policy',
} as const;

// Error Codes
export const ERROR_CODES = {
  PURCHASE_FAILED: 'PURCHASE_FAILED',
  RESTORE_FAILED: 'RESTORE_FAILED',
  PLAN_FETCH_FAILED: 'PLAN_FETCH_FAILED',
  STATUS_FETCH_FAILED: 'STATUS_FETCH_FAILED',
  PROMO_CODE_INVALID: 'PROMO_CODE_INVALID',
  PROMO_CODE_EXPIRED: 'PROMO_CODE_EXPIRED',
  PROMO_CODE_USED: 'PROMO_CODE_USED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

// Event Types
export const ANALYTICS_EVENTS = {
  PAYWALL_VIEWED: 'paywall_viewed',
  PURCHASE_STARTED: 'purchase_started',
  PURCHASE_COMPLETED: 'purchase_completed',
  PURCHASE_FAILED: 'purchase_failed',
  RESTORE_STARTED: 'restore_started',
  RESTORE_COMPLETED: 'restore_completed',
  RESTORE_FAILED: 'restore_failed',
  PROMO_CODE_APPLIED: 'promo_code_applied',
  PROMO_CODE_FAILED: 'promo_code_failed',
  PROMO_CODE_REMOVED: 'promo_code_removed',
  PLAN_SELECTED: 'plan_selected',
  TERMS_PRESSED: 'terms_pressed',
  PRIVACY_PRESSED: 'privacy_pressed',
  PAYWALL_CLOSED: 'paywall_closed',
} as const;

// Trigger Types
export const TRIGGER_TYPES = {
  FEATURE_GATE: 'feature_gate',
  USAGE_LIMIT: 'usage_limit',
  TIME_BASED: 'time_based',
  MANUAL: 'manual',
  FIRST_LAUNCH: 'first_launch',
  SESSION_LIMIT: 'session_limit',
  RETRY_PURCHASE: 'retry_purchase',
} as const;

// Subscription Durations
export const DURATIONS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime',
  TRIAL: 'trial',
} as const;

// Promo Code Types
export const PROMO_CODE_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  FREE_TRIAL: 'free_trial',
} as const;

// Purchase States
export const PURCHASE_STATES = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Default Plans (for development/mock)
export const DEFAULT_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly Premium',
    description: 'Billed monthly',
    price: 9.99,
    currency: 'USD',
    duration: 'monthly',
    features: [
      'Unlimited access',
      'Priority support',
      'Ad-free experience',
      'Early access to features'
    ],
    productId: 'premium_monthly',
  },
  {
    id: 'yearly',
    name: 'Annual Premium',
    description: 'Best value - Save 20%',
    price: 95.99,
    currency: 'USD',
    duration: 'yearly',
    features: [
      'Unlimited access',
      'Priority support',
      'Ad-free experience',
      'Early access to features',
      'Exclusive content'
    ],
    originalPrice: 119.88,
    discountPercentage: 20,
    isPopular: true,
    productId: 'premium_yearly',
  },
  {
    id: 'lifetime',
    name: 'Lifetime Premium',
    description: 'Pay once, use forever',
    price: 299.99,
    currency: 'USD',
    duration: 'lifetime',
    features: [
      'Lifetime unlimited access',
      'All current & future features',
      'VIP priority support',
      'Exclusive beta access',
      'Personal onboarding session'
    ],
    productId: 'premium_lifetime',
  },
] as const;

// Cache Settings
export const CACHE_SETTINGS = {
  PROMO_CODE_TTL: 5 * 60 * 1000, // 5 minutes
  SUBSCRIPTION_STATUS_TTL: 60 * 1000, // 1 minute
  PLANS_TTL: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  MODAL_SHOW: 300,
  MODAL_HIDE: 250,
  BUTTON_PRESS: 150,
  INPUT_FOCUS: 200,
  SUCCESS_FLASH: 1000,
} as const;

// UI Breakpoints
export const BREAKPOINTS = {
  SMALL: 375,
  MEDIUM: 768,
  LARGE: 1024,
} as const;

// Theme Defaults
export const DEFAULT_THEME = {
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  buttonTextColor: '#ffffff',
  borderColor: '#e5e7eb',
  borderRadius: 12,
  fontFamily: 'System',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PROMO_CODE_MIN_LENGTH: 3,
  PROMO_CODE_MAX_LENGTH: 20,
  PROMO_CODE_PATTERN: /^[A-Z0-9-_]+$/i,
} as const;

// API Endpoints (for custom backend)
export const API_ENDPOINTS = {
  SUBSCRIPTION_STATUS: '/subscription/status',
  PLANS: '/plans',
  PURCHASE: '/purchase',
  RESTORE: '/restore',
  PROMO_CODES_VALIDATE: '/promo-codes/validate',
  PROMO_CODES_REDEEM: '/promo-codes/redeem',
  PROMO_CODES_CHECK_USAGE: '/promo-codes/check-usage',
  RECEIPT_VALIDATE: '/validate-receipt',
} as const;

// HTTP Headers
export const HTTP_HEADERS = {
  CONTENT_TYPE: 'application/json',
  AUTHORIZATION: 'Authorization',
  USER_AGENT: 'User-Agent',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Local Storage Keys
export const LOCAL_STORAGE = {
  ONBOARDING_COMPLETED: 'onboarding_completed',
  SUBSCRIPTION_PROMPT_SHOWN: 'subscription_prompt_shown',
  LAST_PROMPT_TIMESTAMP: 'last_prompt_timestamp',
  USER_PREFERENCES: 'user_preferences',
  ANALYTICS_CONSENT: 'analytics_consent',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: 'enable_analytics',
  ENABLE_PROMO_CODES: 'enable_promo_codes',
  ENABLE_CUSTOM_THEMING: 'enable_custom_theming',
  DEBUG_MODE: 'debug_mode',
  FORCE_PAYWALL: 'force_paywall',
  DISABLE_PURCHASES: 'disable_purchases',
} as const;

// Export all constants
export const CONSTANTS = {
  STORAGE_KEYS,
  DEFAULT_CONFIG,
  ERROR_CODES,
  ANALYTICS_EVENTS,
  TRIGGER_TYPES,
  DURATIONS,
  PROMO_CODE_TYPES,
  PURCHASE_STATES,
  DEFAULT_PLANS,
  CACHE_SETTINGS,
  ANIMATION_DURATIONS,
  BREAKPOINTS,
  DEFAULT_THEME,
  VALIDATION_RULES,
  API_ENDPOINTS,
  HTTP_HEADERS,
  HTTP_STATUS,
  LOCAL_STORAGE,
  FEATURE_FLAGS,
} as const;