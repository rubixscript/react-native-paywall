import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PaywallModalProps, SubscriptionPlan } from '../types';

const { width, height } = Dimensions.get('window');

const PaywallModal: React.FC<PaywallModalProps> = ({
  isVisible,
  config,
  state,
  onClose,
  onPlanSelect,
  onPurchase,
  onRestore,
  onTermsPress,
  onPrivacyPress,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlanId(plan.id);
    onPlanSelect(plan);
  };

  const handlePurchasePress = () => {
    if (state.selectedPlan) {
      onPurchase();
    }
  };

  const handleRestorePress = () => {
    Alert.alert(
      'Restore Purchases',
      'This will restore any previous purchases you made with this account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', onPress: onRestore },
      ]
    );
  };

  const renderFeature = (feature: any, index: number) => (
    <View key={index} style={styles.featureContainer}>
      <View style={styles.featureIconContainer}>
        <Text style={styles.featureIcon}>✓</Text>
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );

  const renderPlan = (plan: SubscriptionPlan) => {
    const isSelected = selectedPlanId === plan.id;
    const showPopularBadge = plan.isPopular;
    const showDiscount = plan.originalPrice && plan.originalPrice > plan.price;

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planContainer,
          isSelected && styles.selectedPlanContainer,
          showPopularBadge && styles.popularPlanContainer,
        ]}
        onPress={() => handlePlanSelect(plan)}
        activeOpacity={0.8}
      >
        {showPopularBadge && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
        </View>

        <View style={styles.planPricing}>
          <Text style={styles.planPrice}>
            ${plan.price.toFixed(2)}
          </Text>
          <Text style={styles.planCurrency}>/{plan.duration}</Text>
          {showDiscount && (
            <Text style={styles.originalPrice}>
              ${plan.originalPrice?.toFixed(2)}
            </Text>
          )}
        </View>

        {showDiscount && plan.discountPercentage && (
          <Text style={styles.discountText}>
            Save {plan.discountPercentage}%
          </Text>
        )}

        <View style={styles.planFeatures}>
          {plan.features.slice(0, 3).map((feature, index) => (
            <Text key={index} style={styles.planFeature}>
              • {feature}
            </Text>
          ))}
          {plan.features.length > 3 && (
            <Text style={styles.moreFeaturesText}>
              +{plan.features.length - 3} more features
            </Text>
          )}
        </View>

        <View style={[
          styles.planRadio,
          isSelected && styles.selectedPlanRadio,
        ]}>
          {isSelected && (
            <View style={styles.planRadioInner} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Gradient Background */}
        <LinearGradient
          colors={config.customTheme ?
            [config.customTheme.primaryColor, config.customTheme.secondaryColor] :
            ['#667eea', '#764ba2']
          }
          style={styles.gradientBackground}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={state.isLoading}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.subtitle}>{config.subtitle}</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            {config.features.slice(0, 4).map((feature, index) =>
              renderFeature(feature, index)
            )}
          </View>

          {/* Plans */}
          <View style={styles.plansSection}>
            <Text style={styles.plansTitle}>Choose Your Plan</Text>
            {config.plans.map(renderPlan)}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[
                styles.purchaseButton,
                (!state.selectedPlan || state.isLoading) && styles.disabledButton,
              ]}
              onPress={handlePurchasePress}
              disabled={!state.selectedPlan || state.isLoading}
            >
              {state.isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.purchaseButtonText}>
                  {config.ctaText}
                </Text>
              )}
            </TouchableOpacity>

            {config.secondaryCtaText && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onClose}
                disabled={state.isLoading}
              >
                <Text style={styles.secondaryButtonText}>
                  {config.secondaryCtaText}
                </Text>
              </TouchableOpacity>
            )}

            {config.restorePurchaseText && (
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestorePress}
                disabled={state.isLoading}
              >
                <Text style={styles.restoreButtonText}>
                  {config.restorePurchaseText}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Legal Links */}
          {config.showTermsAndPrivacy && (
            <View style={styles.legalSection}>
              <View style={styles.legalRow}>
                <TouchableOpacity
                  style={styles.legalLink}
                  onPress={onTermsPress}
                >
                  <Text style={styles.legalText}>Terms of Service</Text>
                </TouchableOpacity>
                <Text style={styles.legalSeparator}>•</Text>
                <TouchableOpacity
                  style={styles.legalLink}
                  onPress={onPrivacyPress}
                >
                  <Text style={styles.legalText}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.legalDisclaimer}>
                By subscribing, you agree to our terms and privacy policy.
                Subscriptions will automatically renew unless canceled.
              </Text>
            </View>
          )}

          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  featureContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  plansSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  plansTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  planContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  selectedPlanContainer: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  popularPlanContainer: {
    borderColor: '#f59e0b',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 20,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  planCurrency: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  originalPrice: {
    fontSize: 16,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  discountText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 12,
  },
  planFeatures: {
    marginBottom: 8,
  },
  planFeature: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 2,
  },
  moreFeaturesText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  planRadio: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  selectedPlanRadio: {
    borderColor: '#667eea',
  },
  planRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#667eea',
    position: 'absolute',
    top: 2,
    left: 2,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  purchaseButton: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#6b7280',
    fontSize: 14,
  },
  legalSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legalLink: {
    paddingVertical: 4,
  },
  legalText: {
    color: '#667eea',
    fontSize: 14,
  },
  legalSeparator: {
    color: '#d1d5db',
    fontSize: 16,
    marginHorizontal: 12,
  },
  legalDisclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomPadding: {
    height: 20,
  },
});

export default PaywallModal;