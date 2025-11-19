import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaywallService } from '../services/PaywallService';
import { PromoCodeService } from '../services/PromoCodeService';
import {
  PaywallContextType,
  PaywallState,
  PromoCodeState,
  SubscriptionStatusResponse,
  PaywallConfig,
  SubscriptionPlan,
  PromoCodeValidation,
  PromoCodeApplication,
  PaywallProviderConfig,
  PaywallEventHandlers,
} from '../types';

// Constants
const STORAGE_KEYS = {
  SUBSCRIPTION_STATUS: '@paywall_subscription_status',
  USER_ID: '@paywall_user_id',
  LAST_SEEN_PAYWALL: '@paywall_last_seen',
} as const;

// Default Configuration
const DEFAULT_CONFIG: PaywallConfig = {
  title: 'Unlock Premium Features',
  subtitle: 'Get unlimited access to all features and remove all limitations',
  features: [
    {
      id: 'unlimited_recipes',
      title: 'Unlimited Recipes',
      description: 'Access our entire recipe database with thousands of recipes',
      icon: '🍳',
      isInPro: true,
    },
    {
      id: 'advanced_filters',
      title: 'Advanced Filters',
      description: 'Filter recipes by dietary restrictions, cooking time, and more',
      icon: '🔍',
      isInPro: true,
    },
    {
      id: 'meal_planning',
      title: 'Meal Planning',
      description: 'Plan your meals for the week with smart suggestions',
      icon: '📅',
      isInPro: true,
    },
    {
      id: 'priority_support',
      title: 'Priority Support',
      description: 'Get help faster with our priority customer support',
      icon: '⭐',
      isInPro: true,
    },
  ],
  plans: [],
  ctaText: 'Start Free Trial',
  secondaryCtaText: 'Maybe Later',
  showTermsAndPrivacy: true,
  restorePurchaseText: 'Restore Purchases',
  termsText: 'Terms of Service',
  privacyText: 'Privacy Policy',
};

// Initial States
const initialPaywallState: PaywallState = {
  isVisible: false,
  selectedPlan: undefined,
  isLoading: false,
  error: undefined,
  purchaseState: 'idle',
};

const initialPromoCodeState: PromoCodeState = {
  code: '',
  validation: null,
  isApplying: false,
  appliedPromo: null,
};

// Action Types
type PaywallAction =
  | { type: 'SHOW_PAYWALL' }
  | { type: 'HIDE_PAYWALL' }
  | { type: 'SELECT_PLAN'; payload: SubscriptionPlan }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_PURCHASE_STATE'; payload: 'idle' | 'processing' | 'success' | 'error' };

type PromoCodeAction =
  | { type: 'SET_CODE'; payload: string }
  | { type: 'SET_VALIDATION'; payload: PromoCodeValidation | null }
  | { type: 'SET_APPLYING'; payload: boolean }
  | { type: 'SET_APPLIED_PROMO'; payload: PromoCodeApplication | null }
  | { type: 'CLEAR_PROMO_CODE' };

// Reducers
const paywallReducer = (state: PaywallState, action: PaywallAction): PaywallState => {
  switch (action.type) {
    case 'SHOW_PAYWALL':
      return { ...state, isVisible: true, error: undefined };
    case 'HIDE_PAYWALL':
      return { ...state, isVisible: false, selectedPlan: undefined, error: undefined };
    case 'SELECT_PLAN':
      return { ...state, selectedPlan: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PURCHASE_STATE':
      return { ...state, purchaseState: action.payload };
    default:
      return state;
  }
};

const promoCodeReducer = (state: PromoCodeState, action: PromoCodeAction): PromoCodeState => {
  switch (action.type) {
    case 'SET_CODE':
      return { ...state, code: action.payload };
    case 'SET_VALIDATION':
      return { ...state, validation: action.payload };
    case 'SET_APPLYING':
      return { ...state, isApplying: action.payload };
    case 'SET_APPLIED_PROMO':
      return { ...state, appliedPromo: action.payload };
    case 'CLEAR_PROMO_CODE':
      return { ...state, code: '', validation: null, appliedPromo: null };
    default:
      return state;
  }
};

// Context
const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

// Provider Component
interface PaywallProviderProps {
  children: ReactNode;
  config?: Partial<PaywallConfig>;
  providerConfig?: PaywallProviderConfig;
  eventHandlers?: PaywallEventHandlers;
}

export const PaywallProvider: React.FC<PaywallProviderProps> = ({
  children,
  config: customConfig = {},
  providerConfig = {},
  eventHandlers = {},
}) => {
  // State Management
  const [paywallState, dispatchPaywall] = useReducer(paywallReducer, initialPaywallState);
  const [promoCodeState, dispatchPromo] = useReducer(promoCodeReducer, initialPromoCodeState);
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<SubscriptionStatusResponse | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);

  // Services
  const [paywallService] = useState(() => new PaywallService({
    revenueCat: providerConfig.revenueCat,
    customBackend: providerConfig.customBackend,
    debugMode: providerConfig.debugMode,
  }));

  const [promoCodeService] = useState(() => new PromoCodeService({
    backendUrl: providerConfig.customBackend?.baseUrl,
    apiKey: providerConfig.customBackend?.apiKey,
    debugMode: providerConfig.debugMode,
    enableCache: providerConfig.cachePromoCodes,
  }));

  // Configuration
  const config = React.useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...customConfig,
  }), [customConfig]);

  // Initialize
  useEffect(() => {
    initializePaywall();
  }, []);

  const initializePaywall = async () => {
    try {
      await paywallService.initialize();

      // Load stored data
      const storedUserId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      const storedStatus = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_STATUS);

      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, newUserId);
        setUserId(newUserId);
      }

      if (storedStatus) {
        setSubscriptionStatus(JSON.parse(storedStatus));
      } else {
        await refreshSubscriptionStatus();
      }

      // Load subscription plans
      const plans = await paywallService.getSubscriptionPlans();
      if (config.plans.length === 0) {
        config.plans = plans;
      }
    } catch (error) {
      console.error('Failed to initialize paywall:', error);
      dispatchPaywall({ type: 'SET_ERROR', payload: 'Failed to initialize paywall' });
    }
  };

  // Paywall Actions
  const showPaywall = () => {
    dispatchPaywall({ type: 'SHOW_PAYWALL' });
    eventHandlers.onPaywallClose = eventHandlers.onPaywallClose;
    AsyncStorage.setItem(STORAGE_KEYS.LAST_SEEN_PAYWALL, new Date().toISOString());
  };

  const hidePaywall = () => {
    dispatchPaywall({ type: 'HIDE_PAYWALL' });
    eventHandlers.onPaywallClose?.();
  };

  const selectPlan = (plan: SubscriptionPlan) => {
    dispatchPaywall({ type: 'SELECT_PLAN', payload: plan });
  };

  const purchasePlan = async () => {
    if (!paywallState.selectedPlan) {
      dispatchPaywall({ type: 'SET_ERROR', payload: 'No plan selected' });
      return;
    }

    try {
      dispatchPaywall({ type: 'SET_LOADING', payload: true });
      dispatchPaywall({ type: 'SET_PURCHASE_STATE', payload: 'processing' });

      eventHandlers.onPurchaseStart?.(paywallState.selectedPlan);

      const promoCode = promoCodeState.appliedPromo?.promoCode.code;
      const purchaseInfo = await paywallService.purchasePlan(
        paywallState.selectedPlan,
        promoCode
      );

      // Update subscription status
      await refreshSubscriptionStatus();

      dispatchPaywall({ type: 'SET_PURCHASE_STATE', payload: 'success' });
      eventHandlers.onPurchaseSuccess?.(purchaseInfo);

      // Clear promo code after successful purchase
      if (promoCode) {
        await promoCodeService.redeemPromoCode(promoCode, userId!);
        dispatchPromo({ type: 'CLEAR_PROMO_CODE' });
      }

      // Hide paywall after successful purchase
      setTimeout(() => {
        hidePaywall();
        dispatchPaywall({ type: 'SET_PURCHASE_STATE', payload: 'idle' });
      }, 2000);

    } catch (error: any) {
      dispatchPaywall({ type: 'SET_PURCHASE_STATE', payload: 'error' });
      dispatchPaywall({ type: 'SET_ERROR', payload: error.message || 'Purchase failed' });
      eventHandlers.onPurchaseError?.(error.message);
    } finally {
      dispatchPaywall({ type: 'SET_LOADING', payload: false });
    }
  };

  const restorePurchases = async () => {
    try {
      dispatchPaywall({ type: 'SET_LOADING', payload: true });

      const purchases = await paywallService.restorePurchases();
      await refreshSubscriptionStatus();

      eventHandlers.onRestoreSuccess?.(purchases);
    } catch (error: any) {
      eventHandlers.onRestoreError?.(error.message);
      dispatchPaywall({ type: 'SET_ERROR', payload: error.message || 'Restore failed' });
    } finally {
      dispatchPaywall({ type: 'SET_LOADING', payload: false });
    }
  };

  // Promo Code Actions
  const validatePromoCode = async (code: string): Promise<PromoCodeValidation> => {
    try {
      dispatchPromo({ type: 'SET_APPLYING', payload: true });

      const planId = paywallState.selectedPlan?.id;
      const validation = await promoCodeService.validatePromoCode(code, planId, userId!);

      dispatchPromo({ type: 'SET_VALIDATION', payload: validation });

      if (validation.isValid) {
        eventHandlers.onPromoCodeApplied?.({
          promoCode: validation.promoCode!,
          originalPlan: paywallState.selectedPlan!,
          discountedPlan: paywallState.selectedPlan!, // Will be updated in applyPromoCode
          appliedAt: new Date().toISOString(),
        });
      } else {
        eventHandlers.onPromoCodeError?.(validation.error || 'Invalid promo code');
      }

      return validation;
    } catch (error: any) {
      const errorValidation: PromoCodeValidation = {
        isValid: false,
        message: error.message || 'Failed to validate promo code',
        error: 'VALIDATION_ERROR',
      };
      dispatchPromo({ type: 'SET_VALIDATION', payload: errorValidation });
      eventHandlers.onPromoCodeError?.(error.message);
      return errorValidation;
    } finally {
      dispatchPromo({ type: 'SET_APPLYING', payload: false });
    }
  };

  const applyPromoCode = async (code: string) => {
    if (!paywallState.selectedPlan) {
      dispatchPaywall({ type: 'SET_ERROR', payload: 'Select a plan first' });
      return;
    }

    try {
      dispatchPromo({ type: 'SET_APPLYING', payload: true });

      const application = await promoCodeService.applyPromoCode(
        code,
        paywallState.selectedPlan,
        userId!
      );

      // Update the selected plan with discounted price
      dispatchPaywall({ type: 'SELECT_PLAN', payload: application.discountedPlan });
      dispatchPromo({ type: 'SET_APPLIED_PROMO', payload: application });

      eventHandlers.onPromoCodeApplied?.(application);
    } catch (error: any) {
      eventHandlers.onPromoCodeError?.(error.message);
    } finally {
      dispatchPromo({ type: 'SET_APPLYING', payload: false });
    }
  };

  const removePromoCode = () => {
    dispatchPromo({ type: 'CLEAR_PROMO_CODE' });

    // Restore original plan price if we have an applied promo
    if (paywallState.selectedPlan && promoCodeState.appliedPromo) {
      dispatchPaywall({
        type: 'SELECT_PLAN',
        payload: promoCodeState.appliedPromo.originalPlan,
      });
    }
  };

  // Utility Methods
  const refreshSubscriptionStatus = async () => {
    try {
      const status = await paywallService.getSubscriptionStatus();
      setSubscriptionStatus(status);
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_STATUS, JSON.stringify(status));
    } catch (error) {
      console.error('Failed to refresh subscription status:', error);
    }
  };

  const isFeatureUnlocked = (featureId: string): boolean => {
    if (!subscriptionStatus || !subscriptionStatus.isActive) {
      return false;
    }

    // Check if feature is included in user's entitlements
    return subscriptionStatus.entitlements.includes(featureId) ||
           subscriptionStatus.entitlements.includes('premium');
  };

  // Context Value
  const contextValue: PaywallContextType = {
    // State
    paywallState,
    promoCodeState,
    subscriptionStatus,

    // Configuration
    config,

    // Actions
    showPaywall,
    hidePaywall,
    selectPlan,
    purchasePlan,
    restorePurchases,

    // Promo Code Actions
    validatePromoCode,
    applyPromoCode,
    removePromoCode,

    // Utility
    refreshSubscriptionStatus,
    isFeatureUnlocked,
  };

  return (
    <PaywallContext.Provider value={contextValue}>
      {children}
    </PaywallContext.Provider>
  );
};

// Hook for using the paywall context
export const usePaywall = (): PaywallContextType => {
  const context = useContext(PaywallContext);
  if (!context) {
    throw new Error('usePaywall must be used within a PaywallProvider');
  }
  return context;
};

export default PaywallProvider;