/**
 * components/AppInput.tsx
 * Reusable, styled TextInput with floating label, error state,
 * password visibility toggle, and optional prefix/suffix icons.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  Platform,
} from 'react-native';
import { Colors, Typography, Radius, Spacing, Layout } from '../theme';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  maxLength?: number;
  editable?: boolean;
  returnKeyType?: 'done' | 'next' | 'go' | 'search';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  autoFocus?: boolean;
}

const AppInput = React.forwardRef<TextInput, Props>(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      secureTextEntry = false,
      keyboardType = 'default',
      autoCapitalize = 'sentences',
      multiline = false,
      numberOfLines = 1,
      error,
      leftIcon,
      rightIcon,
      containerStyle,
      inputStyle,
      maxLength,
      editable = true,
      returnKeyType,
      onSubmitEditing,
      blurOnSubmit,
      autoFocus = false,
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const borderColor = error
      ? Colors.error
      : focused
      ? Colors.primary
      : Colors.border;

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Label */}
        <Text style={[styles.label, error ? styles.labelError : focused ? styles.labelFocused : null]}>
          {label}
        </Text>

        {/* Input wrapper */}
        <View
          style={[
            styles.inputWrapper,
            { borderColor },
            focused && styles.inputWrapperFocused,
            !editable && styles.inputWrapperDisabled,
          ]}>
          {/* Left icon */}
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              multiline && styles.inputMultiline,
              leftIcon ? styles.inputWithLeft : null,
              (secureTextEntry || rightIcon) ? styles.inputWithRight : null,
              inputStyle,
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Colors.textMuted}
            secureTextEntry={secureTextEntry && !showPassword}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : 1}
            maxLength={maxLength}
            editable={editable}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={blurOnSubmit}
            autoFocus={autoFocus}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            // Consistent cursor colour
            cursorColor={Colors.primary}
            selectionColor={`${Colors.primary}44`}
          />

          {/* Password toggle */}
          {secureTextEntry && (
            <TouchableOpacity
              style={styles.rightIcon}
              onPress={() => setShowPassword(v => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          )}

          {/* Custom right icon */}
          {!secureTextEntry && rightIcon && (
            <View style={styles.rightIcon}>{rightIcon}</View>
          )}
        </View>

        {/* Error message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.3,
  },
  labelFocused: {
    color: Colors.primary,
  },
  labelError: {
    color: Colors.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    minHeight: Layout.inputHeight,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    backgroundColor: `${Colors.primary}08`,
  },
  inputWrapperDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    minHeight: Layout.inputHeight,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  inputWithLeft: {
    paddingLeft: Spacing.xs,
  },
  inputWithRight: {
    paddingRight: Spacing.xs,
  },
  leftIcon: {
    paddingLeft: Spacing.md,
    justifyContent: 'center',
  },
  rightIcon: {
    paddingRight: Spacing.md,
    paddingLeft: Spacing.sm,
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    letterSpacing: 0.2,
  },
});

AppInput.displayName = 'AppInput';
export default AppInput;
