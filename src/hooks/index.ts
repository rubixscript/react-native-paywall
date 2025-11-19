import { useEffect, useState, useCallback } from 'react';
import { usePaywall } from '../contexts/PaywallProvider';
import {
  SubscriptionPlan,
  PromoCodeValidation,
  PaywallState,
  PromoCodeState,
  SubscriptionStatusResponse,
  PaywallConfig,
} from '../types';

// Hook for paywall visibility and state management
export const usePaywallState = () => {
  const { paywallState, showPaywall, hidePaywall } = usePaywall();

  return {
    isVisible: paywallState.isVisible,
    isLoading: paywallState.isLoading,
    error: paywallState.error,
    purchaseState: paywallState.purchaseState,
    showPaywall,
    hidePaywall,
  };
};

// Hook for subscription status
export const useSubscription = () => {
  const { subscriptionStatus, refreshSubscriptionStatus, isFeatureUnlocked } = usePaywall();

  const isActive = subscriptionStatus?.isActive || false;
  const willRenew = subscriptionStatus?.willRenew || false;
  const isTrialPeriod = subscriptionStatus?.trialPeriod || false;
  const entitlements = subscriptionStatus?.entitlements || [];

  return {
    isActive,
    willRenew,
    isTrialPeriod,
    entitlements,
    subscriptionStatus,
    refreshSubscriptionStatus,
    isFeatureUnlocked,
  };
};

// Hook for plan selection
export const useSubscriptionPlans = () => {
  const { config, paywallState, selectPlan } = usePaywall();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(config.plans);

  useEffect(() => {
    setPlans(config.plans);
  }, [config.plans]);

  const selectedPlan = paywallState.selectedPlan;
  const handleSelectPlan = useCallback((plan: SubscriptionPlan) => {
    selectPlan(plan);
  }, [selectPlan]);

  const getPlanById = useCallback((planId: string) => {
    return plans.find(plan => plan.id === planId);
  }, [plans]);

  const getPopularPlan = useCallback(() => {
    return plans.find(plan => plan.isPopular);
  }, [plans]);

  const getCheapestPlan = useCallback(() => {
    if (plans.length === 0) return undefined;
    return plans.reduce((cheapest, current) =>
      current.price < cheapest.price ? current : cheapest
    );
  }, [plans]);

  const getBestValuePlan = useCallback(() => {
    if (plans.length === 0) return undefined;

    // Calculate value score (features/price ratio)
    return plans.reduce((best, current) => {
      const currentValue = current.features.length / current.price;
      const bestValue = best.features.length / best.price;
      return currentValue > bestValue ? current : best;
    });
  }, [plans]);

  return {
    plans,
    selectedPlan,
    selectPlan: handleSelectPlan,
    getPlanById,
    getPopularPlan,
    getCheapestPlan,
    getBestValuePlan,
  };
};

// Hook for promo code functionality
export const usePromoCode = () => {
  const { promoCodeState, validatePromoCode, applyPromoCode, removePromoCode } = usePaywall();

  const {
    code,
    validation,
    isApplying,
    appliedPromo,
  } = promoCodeState;

  const handleValidateCode = useCallback(async (promoCode: string) => {
    return await validatePromoCode(promoCode);
  }, [validatePromoCode]);

  const handleApplyCode = useCallback(async (promoCode: string) => {
    await applyPromoCode(promoCode);
  }, [applyPromoCode]);

  const handleRemoveCode = useCallback(() => {
    removePromoCode();
  }, [removePromoCode]);

  const isValidPromo = validation?.isValid || false;
  const hasAppliedPromo = !!appliedPromo;
  const discountAmount = appliedPromo ?
    appliedPromo.originalPlan.price - appliedPromo.discountedPlan.price : 0;

  return {
    code,
    validation,
    isApplying,
    appliedPromo,
    isValidPromo,
    hasAppliedPromo,
    discountAmount,
    validatePromoCode: handleValidateCode,
    applyPromoCode: handleApplyCode,
    removePromoCode: handleRemoveCode,
  };
};

// Hook for paywall configuration
export const usePaywallConfig = () => {
  const { config } = usePaywall();

  const updateConfig = useCallback((updates: Partial<PaywallConfig>) => {
    // This would typically update the config in the context
    // For now, we'll just return the current config
    console.log('Config update requested:', updates);
  }, []);

  const getFeatureById = useCallback((featureId: string) => {
    return config.features.find(feature => feature.id === featureId);
  }, [config.features]);

  const getProFeatures = useCallback(() => {
    return config.features.filter(feature => feature.isInPro);
  }, [config.features]);

  return {
    config,
    updateConfig,
    getFeatureById,
    getProFeatures,
  };
};

// Hook for purchase flow
export const usePurchaseFlow = () => {
  const { paywallState, purchasePlan, restorePurchases } = usePaywall();
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handlePurchase = useCallback(async () => {
    try {
      setPurchaseError(null);
      await purchasePlan();
    } catch (error: any) {
      setPurchaseError(error.message);
    }
  }, [purchasePlan]);

  const handleRestore = useCallback(async () => {
    try {
      setPurchaseError(null);
      await restorePurchases();
    } catch (error: any) {
      setPurchaseError(error.message);
    }
  }, [restorePurchases]);

  const isProcessing = paywallState.purchaseState === 'processing';
  const isCompleted = paywallState.purchaseState === 'success';
  const hasError = paywallState.purchaseState === 'error' || !!purchaseError;

  return {
    isProcessing,
    isCompleted,
    hasError,
    purchaseError: paywallState.error || purchaseError,
    purchasePlan: handlePurchase,
    restorePurchases: handleRestore,
  };
};

// Hook for paywall analytics
export const usePaywallAnalytics = () => {
  const [analytics, setAnalytics] = useState<any[]>([]);

  const trackEvent = useCallback((event: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const analytic = { event, timestamp, data };

    setAnalytics(prev => [...prev, analytic]);

    // Here you would typically send to your analytics service
    console.log('Paywall Analytics:', analytic);
  }, []);

  const trackPaywallView = useCallback(() => {
    trackEvent('paywall_viewed');
  }, [trackEvent]);

  const trackPurchaseStarted = useCallback((planId: string) => {
    trackEvent('purchase_started', { planId });
  }, [trackEvent]);

  const trackPurchaseCompleted = useCallback((planId: string, amount: number) => {
    trackEvent('purchase_completed', { planId, amount });
  }, [trackEvent]);

  const trackPromoCodeApplied = useCallback((code: string, discount: number) => {
    trackEvent('promo_code_applied', { code, discount });
  }, [trackEvent]);

  const trackPromoCodeFailed = useCallback((code: string, reason: string) => {
    trackEvent('promo_code_failed', { code, reason });
  }, [trackEvent]);

  const clearAnalytics = useCallback(() => {
    setAnalytics([]);
  }, []);

  return {
    analytics,
    trackEvent,
    trackPaywallView,
    trackPurchaseStarted,
    trackPurchaseCompleted,
    trackPromoCodeApplied,
    trackPromoCodeFailed,
    clearAnalytics,
  };
};

// Hook for managing paywall display triggers
export const usePaywallTriggers = () => {
  const { showPaywall, subscriptionStatus } = usePaywall();
  const [triggerHistory, setTriggerHistory] = useState<any[]>([]);

  const recordTrigger = useCallback((trigger: string, context?: any) => {
    const timestamp = new Date().toISOString();
    const record = { trigger, timestamp, context };
    setTriggerHistory(prev => [...prev, record]);
  }, []);

  const triggerPaywall = useCallback((trigger: string, context?: any) => {
    recordTrigger(trigger, context);
    showPaywall();
  }, [recordTrigger, showPaywall]);

  const shouldShowPaywall = useCallback((trigger: string) => {
    // Don't show paywall if user is already subscribed
    if (subscriptionStatus?.isActive) {
      return false;
    }

    // Check if this trigger was recently shown
    const recentTriggers = triggerHistory.filter(
      record => record.trigger === trigger &&
      (Date.now() - new Date(record.timestamp).getTime()) < 24 * 60 * 60 * 1000 // 24 hours
    );

    return recentTriggers.length === 0;
  }, [subscriptionStatus, triggerHistory]);

  const triggerPaywallIfNeeded = useCallback((trigger: string, context?: any) => {
    if (shouldShowPaywall(trigger)) {
      triggerPaywall(trigger, context);
      return true;
    }
    return false;
  }, [shouldShowPaywall, triggerPaywall]);

  // Common trigger methods
  const triggerFeatureGate = useCallback((featureId: string) => {
    triggerPaywallIfNeeded('feature_gate', { featureId });
  }, [triggerPaywallIfNeeded]);

  const triggerUsageLimit = useCallback((limit: string, current: number, max: number) => {
    triggerPaywallIfNeeded('usage_limit', { limit, current, max });
  }, [triggerPaywallIfNeeded]);

  const triggerTimeBased = useCallback(() => {
    triggerPaywallIfNeeded('time_based');
  }, [triggerPaywallIfNeeded]);

  return {
    triggerHistory,
    triggerPaywall,
    triggerPaywallIfNeeded,
    shouldShowPaywall,
    triggerFeatureGate,
    triggerUsageLimit,
    triggerTimeBased,
  };
};

// Hook for subscription utilities
export const useSubscriptionUtils = () => {
  const { subscriptionStatus, isFeatureUnlocked } = usePaywall();

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const getTimeUntilExpiration = useCallback(() => {
    if (!subscriptionStatus?.expirationDate) return null;

    const expiration = new Date(subscriptionStatus.expirationDate);
    const now = new Date();
    const diff = expiration.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return { days, hours };
  }, [subscriptionStatus]);

  const isExpiringSoon = useCallback((daysThreshold: number = 3) => {
    const timeUntil = getTimeUntilExpiration();
    if (!timeUntil) return false;
    return timeUntil.days <= daysThreshold;
  }, [getTimeUntilExpiration]);

  const hasEntitlement = useCallback((entitlement: string) => {
    return subscriptionStatus?.entitlements.includes(entitlement) || false;
  }, [subscriptionStatus]);

  const getSubscriptionType = useCallback(() => {
    if (!subscriptionStatus?.isActive) return 'none';
    if (subscriptionStatus.trialPeriod) return 'trial';
    if (subscriptionStatus.willRenew) return 'active';
    return 'expired';
  }, [subscriptionStatus]);

  return {
    formatDate,
    getTimeUntilExpiration,
    isExpiringSoon,
    hasEntitlement,
    getSubscriptionType,
    isFeatureUnlocked,
  };
};

// Export all hooks
export {
  usePaywall,
};