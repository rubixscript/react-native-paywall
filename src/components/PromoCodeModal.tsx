import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { PromoCodeInputProps, PromoCodeValidation } from '../types';

const { width } = Dimensions.get('window');

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  value,
  onChange,
  onApply,
  onRemove,
  validation,
  isApplying,
  placeholder = 'Enter promo code',
  applyButtonText = 'Apply',
  removeButtonText = 'Remove',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedWidth = useRef(new Animated.Value(60)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isFocused) {
      Animated.timing(animatedWidth, {
        toValue: width - 40,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedWidth, {
        toValue: 60,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (!value) {
      setIsFocused(false);
    }
  };

  const handleApply = () => {
    Keyboard.dismiss();
    onApply();
  };

  const handleRemove = () => {
    onChange('');
    onRemove();
    setIsFocused(false);
  };

  const handleSubmitEditing = () => {
    if (value.trim()) {
      handleApply();
    }
  };

  const renderInputField = () => (
    <Animated.View style={[styles.inputContainer, { width: animatedWidth }]}>
      <TextInput
        ref={inputRef}
        style={[
          styles.textInput,
          validation?.isValid === false && styles.errorInput,
          validation?.isValid === true && styles.successInput,
        ]}
        value={value}
        onChangeText={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={handleSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        autoCapitalize="characters"
        autoCorrect={false}
        returnKeyType="done"
        editable={!isApplying}
      />
      {!isFocused && value && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => onChange('')}
          disabled={isApplying}
        >
          <Text style={styles.clearButtonText}>×</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const renderApplyButton = () => {
    if (!value.trim()) return null;

    return (
      <TouchableOpacity
        style={[
          styles.applyButton,
          isApplying && styles.disabledButton,
          validation?.isValid === false && styles.errorButton,
          validation?.isValid === true && styles.successButton,
        ]}
        onPress={handleApply}
        disabled={isApplying}
      >
        {isApplying ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.applyButtonText}>{applyButtonText}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderValidationMessage = () => {
    if (!validation) return null;

    return (
      <View style={[
        styles.validationMessage,
        validation.isValid ? styles.successMessage : styles.errorMessage,
      ]}>
        <Text style={[
          styles.validationMessageText,
          validation.isValid ? styles.successMessageText : styles.errorMessageText,
        ]}>
          {validation.message}
        </Text>
      </View>
    );
  };

  const renderDiscountInfo = () => {
    if (!validation?.isValid || !validation.discountedPrice) return null;

    return (
      <View style={styles.discountInfo}>
        <Text style={styles.discountInfoText}>
          Your discount will be applied at checkout
        </Text>
      </View>
    );
  };

  const renderAppliedPromo = () => {
    if (!validation?.isValid || !validation.promoCode) return null;

    return (
      <View style={styles.appliedPromoContainer}>
        <View style={styles.appliedPromoHeader}>
          <Text style={styles.appliedPromoCode}>{validation.promoCode.code}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemove}
          >
            <Text style={styles.removeButtonText}>{removeButtonText}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.appliedPromoDescription}>
          {validation.promoCode.description}
        </Text>
        {renderDiscountInfo()}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!validation?.isValid && (
        <View style={styles.inputSection}>
          <Text style={styles.title}>Have a promo code?</Text>
          <View style={styles.inputRow}>
            {renderInputField()}
            {renderApplyButton()}
          </View>
          {renderValidationMessage()}
        </View>
      )}

      {renderAppliedPromo()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputContainer: {
    position: 'relative',
    height: 50,
  },
  textInput: {
    flex: 1,
    height: '100%',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 40,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  errorInput: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  successInput: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  errorButton: {
    backgroundColor: '#ef4444',
  },
  successButton: {
    backgroundColor: '#10b981',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  validationMessage: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
  },
  successMessage: {
    backgroundColor: '#f0fdf4',
  },
  validationMessageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorMessageText: {
    color: '#ef4444',
  },
  successMessageText: {
    color: '#10b981',
  },
  appliedPromoContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
  },
  appliedPromoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appliedPromoCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065f46',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dc2626',
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  appliedPromoDescription: {
    fontSize: 14,
    color: '#047857',
    marginBottom: 8,
  },
  discountInfo: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  discountInfoText: {
    fontSize: 12,
    color: '#059669',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PromoCodeInput;