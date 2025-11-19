# React Native Paywall Library

A comprehensive React Native paywall library with subscription management and promo code support. Perfect for adding monetization to your React Native and Expo applications.

## Features

- 🎨 **Beautiful UI Components** - Modern, customizable paywall modal and promo code input
- 💳 **Subscription Management** - Full support for RevenueCat and custom backend integration
- 🎫 **Promo Code Support** - Built-in promo code validation and application system
- 🔧 **Highly Configurable** - Extensive customization options for branding and UX
- 📊 **Analytics Integration** - Built-in event tracking for purchase behavior
- 🚀 **Easy Setup** - Simple provider-based API with convenient hooks
- 🎯 **TypeScript Support** - Full TypeScript support with comprehensive type definitions
- 📱 **React Native & Expo Compatible** - Works with both vanilla React Native and Expo projects

## Installation

```bash
npm install @onepage/react-native-paywall
# or
yarn add @onepage/react-native-paywall
```

### Peer Dependencies

Make sure you have these dependencies installed in your project:

```bash
npm install react react-native @react-native-async-storage/async-storage expo-linear-gradient @expo/vector-icons
# For RevenueCat support
npm install react-native-purchases
```

## Quick Start

### 1. Wrap your app with PaywallProvider

```tsx
import React from 'react';
import { PaywallProvider } from '@onepage/react-native-paywall';
import { NavigationContainer } from '@react-navigation/native';
import App from './App';

const config = {
  title: 'Unlock Premium Features',
  subtitle: 'Get unlimited access to all features',
  features: [
    {
      id: 'unlimited_recipes',
      title: 'Unlimited Recipes',
      description: 'Access thousands of recipes',
      icon: '🍳',
      isInPro: true,
    },
    // ... more features
  ],
  plans: [
    {
      id: 'monthly',
      name: 'Monthly Premium',
      description: 'Billed monthly',
      price: 9.99,
      currency: 'USD',
      duration: 'monthly',
      features: ['Feature 1', 'Feature 2'],
      productId: 'premium_monthly',
    },
    // ... more plans
  ],
};

const providerConfig = {
  revenueCat: {
    apiKey: 'your_revenuecat_api_key',
    entitlementId: 'premium',
  },
  enablePromoCodes: true,
  debugMode: __DEV__,
};

export default function Root() {
  return (
    <PaywallProvider config={config} providerConfig={providerConfig}>
      <NavigationContainer>
        <App />
      </NavigationContainer>
    </PaywallProvider>
  );
}
```

### 2. Use the paywall in your components

```tsx
import React from 'react';
import { View, Button } from 'react-native';
import { usePaywall, PaywallModal, PromoCodeInput } from '@onepage/react-native-paywall';

const PremiumFeatures = () => {
  const { showPaywall, paywallState, selectPlan, purchasePlan, hidePaywall } = usePaywall();

  const handleUnlockPremium = () => {
    showPaywall();
  };

  const handlePurchase = async () => {
    await purchasePlan();
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button
        title="Unlock Premium Features"
        onPress={handleUnlockPremium}
      />

      <PaywallModal
        isVisible={paywallState.isVisible}
        config={paywallConfig} // Your config
        state={paywallState}
        onClose={hidePaywall}
        onPlanSelect={selectPlan}
        onPurchase={handlePurchase}
        onRestore={async () => {
          // Handle restore purchases
        }}
        onTermsPress={() => {
          // Handle terms press
        }}
        onPrivacyPress={() => {
          // Handle privacy press
        }}
      />
    </View>
  );
};
```

### 3. Add promo code support

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { usePromoCode, PromoCodeInput } from '@onepage/react-native-paywall';

const CheckoutScreen = () => {
  const { code, setCode, validatePromoCode, applyPromoCode, validation, isApplying } = usePromoCode();

  const handleApplyPromoCode = async () => {
    const isValid = await validatePromoCode(code);
    if (isValid) {
      await applyPromoCode(code);
    }
  };

  return (
    <View>
      <PromoCodeInput
        value={code}
        onChange={setCode}
        onApply={handleApplyPromoCode}
        validation={validation}
        isApplying={isApplying}
      />
    </View>
  );
};
```

## Advanced Usage

### Custom Hooks

The library provides several custom hooks for different use cases:

#### useSubscription

```tsx
import { useSubscription } from '@onepage/react-native-paywall';

const MyComponent = () => {
  const {
    isActive,
    willRenew,
    isTrialPeriod,
    entitlements,
    isFeatureUnlocked,
  } = useSubscription();

  if (isActive) {
    return <PremiumContent />;
  }

  return <FreeContent />;
};
```

#### useSubscriptionPlans

```tsx
import { useSubscriptionPlans } from '@onepage/react-native-paywall';

const PlanSelector = () => {
  const { plans, selectedPlan, selectPlan, getPopularPlan, getCheapestPlan } = useSubscriptionPlans();

  const popularPlan = getPopularPlan();
  const cheapestPlan = getCheapestPlan();

  return (
    <View>
      {plans.map(plan => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isSelected={selectedPlan?.id === plan.id}
          onPress={() => selectPlan(plan)}
        />
      ))}
    </View>
  );
};
```

#### usePaywallTriggers

```tsx
import { usePaywallTriggers } from '@onepage/react-native-paywall';

const FeatureGate = ({ featureId, children }) => {
  const { triggerFeatureGate, isFeatureUnlocked } = usePaywallTriggers();
  const { isFeatureUnlocked: checkFeature } = useSubscription();

  if (checkFeature(featureId)) {
    return children;
  }

  return (
    <Button
      title="Upgrade to Access"
      onPress={() => triggerFeatureGate(featureId)}
    />
  );
};
```

### Custom Backend Integration

If you're not using RevenueCat, you can integrate with a custom backend:

```tsx
const providerConfig = {
  customBackend: {
    baseUrl: 'https://your-api.com',
    apiKey: 'your-backend-api-key',
  },
  enablePromoCodes: true,
  cachePromoCodes: true,
};

// Your backend should implement these endpoints:
// GET /subscription/status - Get user's subscription status
// GET /plans - Get available subscription plans
// POST /purchase - Process a purchase
// POST /restore - Restore previous purchases
// POST /promo-codes/validate - Validate a promo code
// POST /promo-codes/redeem - Redeem a promo code
```

### Custom Styling

Customize the look and feel with the `customTheme` prop:

```tsx
const customTheme = {
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  buttonTextColor: '#ffffff',
  borderColor: '#e5e7eb',
  borderRadius: 16,
  fontFamily: 'YourCustomFont',
};

const config = {
  // ... other config
  customTheme,
};
```

### Event Handling

Listen to paywall events:

```tsx
const eventHandlers = {
  onPurchaseStart: (plan) => {
    analytics.track('purchase_started', { planId: plan.id });
  },
  onPurchaseSuccess: (purchase) => {
    analytics.track('purchase_completed', purchase);
  },
  onPurchaseError: (error) => {
    analytics.track('purchase_failed', { error });
  },
  onPromoCodeApplied: (application) => {
    analytics.track('promo_code_applied', application);
  },
};

<PaywallProvider eventHandlers={eventHandlers}>
  {/* Your app */}
</PaywallProvider>
```

## API Reference

### Components

#### PaywallModal

The main paywall modal component.

```tsx
interface PaywallModalProps {
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
```

#### PromoCodeInput

A reusable promo code input component.

```tsx
interface PromoCodeInputProps {
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
```

### Hooks

#### usePaywall

Main hook for accessing paywall functionality.

```tsx
const {
  paywallState,
  promoCodeState,
  subscriptionStatus,
  config,
  showPaywall,
  hidePaywall,
  selectPlan,
  purchasePlan,
  restorePurchases,
  validatePromoCode,
  applyPromoCode,
  removePromoCode,
  refreshSubscriptionStatus,
  isFeatureUnlocked,
} = usePaywall();
```

#### useSubscription

Hook for subscription status and feature gating.

```tsx
const {
  isActive,
  willRenew,
  isTrialPeriod,
  entitlements,
  subscriptionStatus,
  refreshSubscriptionStatus,
  isFeatureUnlocked,
} = useSubscription();
```

#### usePromoCode

Hook for promo code functionality.

```tsx
const {
  code,
  validation,
  isApplying,
  appliedPromo,
  isValidPromo,
  hasAppliedPromo,
  discountAmount,
  validatePromoCode,
  applyPromoCode,
  removePromoCode,
} = usePromoCode();
```

### Types

#### PaywallConfig

```tsx
interface PaywallConfig {
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
```

#### SubscriptionPlan

```tsx
interface SubscriptionPlan {
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
  productId?: string;
}
```

#### PromoCode

```tsx
interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount: {
    type: 'percentage' | 'fixed' | 'free_trial';
    value: number;
    duration?: number;
  };
  maxUses?: number;
  currentUses: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicablePlans?: string[];
  restrictions?: {
    newCustomersOnly?: boolean;
    minimumPlan?: string;
    maximumDiscount?: number;
  };
}
```

## Examples

Check out the `/examples` directory for complete implementation examples:

- [Basic Usage](examples/basic/README.md)
- [Custom Backend](examples/custom-backend/README.md)
- [Advanced Configuration](examples/advanced/README.md)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/onepage/react-native-paywall.git
cd react-native-paywall

# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Run in development mode
npm run dev
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://paywall.onepage.dev)
- 🐛 [Issues](https://github.com/onepage/react-native-paywall/issues)
- 💬 [Discussions](https://github.com/onepage/react-native-paywall/discussions)
- 📧 [Email Support](mailto:support@onepage.dev)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.