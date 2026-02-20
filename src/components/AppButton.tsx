/**
 * components/AppButton.tsx
 * Reusable button component with gradient background, loading state,
 * and multiple visual variants.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Radius, Spacing, Layout } from '../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const SIZE_MAP: Record<Size, { height: number; fontSize: number; paddingH: number }> = {
  sm: { height: 38, fontSize: Typography.fontSize.sm, paddingH: Spacing.md },
  md: { height: 48, fontSize: Typography.fontSize.base, paddingH: Spacing.lg },
  lg: { height: Layout.buttonHeight, fontSize: Typography.fontSize.lg, paddingH: Spacing.xl },
};

const AppButton: React.FC<Props> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const { height, fontSize, paddingH } = SIZE_MAP[size];
  const isDisabled = disabled || loading;

  const content = (
    <View style={[styles.inner, { paddingHorizontal: paddingH }]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
        />
      ) : (
        <>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            style={[
              styles.label,
              { fontSize },
              variant === 'outline' || variant === 'ghost'
                ? styles.labelDark
                : styles.labelLight,
              isDisabled && styles.labelDisabled,
              textStyle,
            ]}>
            {label}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </>
      )}
    </View>
  );

  const containerStyle: ViewStyle = {
    height,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    opacity: isDisabled ? 0.6 : 1,
    ...(style as object),
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={containerStyle}>
        <LinearGradient
          colors={Colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, styles.gradient]}>
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[containerStyle, styles.secondary]}>
        {content}
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={containerStyle}>
        <LinearGradient
          colors={Colors.gradientError}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, styles.gradient]}>
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[containerStyle, styles.outline]}>
        {content}
      </TouchableOpacity>
    );
  }

  // ghost
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[containerStyle, styles.ghost]}>
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.3,
  },
  labelLight: {
    color: Colors.white,
  },
  labelDark: {
    color: Colors.primary,
  },
  labelDisabled: {
    opacity: 0.7,
  },
  iconLeft: { marginRight: Spacing.sm },
  iconRight: { marginLeft: Spacing.sm },
  secondary: {
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outline: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppButton;
