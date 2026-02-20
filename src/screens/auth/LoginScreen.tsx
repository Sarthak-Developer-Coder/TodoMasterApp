/**
 * screens/auth/LoginScreen.tsx
 * ─────────────────────────────────────────────
 * Sign-in screen with:
 *   • Validated email + password inputs
 *   • Redux async login thunk
 *   • Per-field inline error messages
 *   • Gradient background + glassmorphism card
 *   • Link to Registration
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Animated,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { loginUser, clearError } from '../../store/authSlice';
import { AuthStackParamList } from '../../types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';

import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import LoadingOverlay from '../../components/LoadingOverlay';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

// ─── Field-level validation ───────────────────
function validate(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};
  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!password) {
    errors.password = 'Password is required';
  }
  return errors;
}

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(s => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const passwordRef = useRef<TextInput>(null);

  // Shake animation for error feedback
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (error) dispatch(clearError());
    const errors = validate(email, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      shake();
      return;
    }

    const result = await dispatch(loginUser({ email: email.toLowerCase().trim(), password }));
    if (loginUser.rejected.match(result)) {
      shake();
    }
  };

  return (
    <LinearGradient
      colors={Colors.gradientBackground}
      locations={[0, 0.5, 1]}
      style={styles.gradient}>

      <LoadingOverlay visible={loading} message="Signing in…" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Brand header */}
          <View style={styles.header}>
            <Text style={styles.brandIcon}>✅</Text>
            <Text style={styles.brandName}>TodoMaster</Text>
            <Text style={styles.brandTagline}>Your intelligent task companion</Text>
          </View>

          {/* Card */}
          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Sign in to continue</Text>

            {/* Global error banner */}
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️  {error}</Text>
              </View>
            ) : null}

            <AppInput
              label="Email address"
              value={email}
              onChangeText={v => { setEmail(v); setFieldErrors(p => ({ ...p, email: undefined })); }}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={fieldErrors.email}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />

            <AppInput
              ref={passwordRef}
              label="Password"
              value={password}
              onChangeText={v => { setPassword(v); setFieldErrors(p => ({ ...p, password: undefined })); }}
              placeholder="••••••••"
              secureTextEntry
              error={fieldErrors.password}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />

            <AppButton
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.submitBtn}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.registerLink}>
              <Text style={styles.registerText}>
                Don&apos;t have an account?{' '}
                <Text style={styles.registerTextBold}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Demo hint */}
          <Text style={styles.hint}>
            First time? Register with any email + password (8+ chars)
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  brandIcon: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  brandName: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius['2xl'],
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.lg,
  },
  cardTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  errorBanner: {
    backgroundColor: `${Colors.error}18`,
    borderWidth: 1,
    borderColor: `${Colors.error}44`,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  errorBannerText: {
    color: Colors.error,
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  submitBtn: { marginTop: Spacing.sm },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.sm,
    marginHorizontal: Spacing.md,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  registerText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  registerTextBold: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  hint: {
    textAlign: 'center',
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xl,
    lineHeight: 18,
  },
});

export default LoginScreen;
