/**
 * screens/auth/RegisterScreen.tsx
 * ─────────────────────────────────────────────
 * Account creation screen with:
 *   • Full name, email, password, confirm-password fields
 *   • Real-time password strength meter
 *   • Field-level validation
 *   • Redux async registerUser thunk
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { registerUser, clearError } from '../../store/authSlice';
import { AuthStackParamList } from '../../types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';

import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import LoadingOverlay from '../../components/LoadingOverlay';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

// ─── Password strength ────────────────────────
function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: Colors.error };
  if (score <= 2) return { score, label: 'Fair', color: Colors.warning };
  if (score <= 3) return { score, label: 'Good', color: Colors.info };
  return { score, label: 'Strong', color: Colors.success };
}

// ─── Field validation ─────────────────────────
function validate(name: string, email: string, password: string, confirmPassword: string) {
  const errors: { name?: string; email?: string; password?: string; confirm?: string } = {};
  if (!name.trim()) errors.name = 'Name is required';
  else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

  if (!email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address';

  if (!password) errors.password = 'Password is required';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters';

  if (!confirmPassword) errors.confirm = 'Please confirm your password';
  else if (password !== confirmPassword) errors.confirm = 'Passwords do not match';

  return errors;
}

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(s => s.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string; email?: string; password?: string; confirm?: string;
  }>({});

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

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

  const pwStrength = passwordStrength(password);

  const handleRegister = async () => {
    if (error) dispatch(clearError());
    const errors = validate(name, email, password, confirmPassword);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) { shake(); return; }

    const result = await dispatch(registerUser({ name: name.trim(), email, password }));
    if (registerUser.rejected.match(result)) shake();
  };

  const clearFieldError = (field: keyof typeof fieldErrors) =>
    setFieldErrors(p => ({ ...p, [field]: undefined }));

  return (
    <LinearGradient colors={Colors.gradientBackground} locations={[0, 0.5, 1]} style={styles.gradient}>
      <LoadingOverlay visible={loading} message="Creating account…" />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🚀</Text>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSub}>Join TodoMaster and conquer your tasks</Text>
          </View>

          {/* Card */}
          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
            {/* Global error */}
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️  {error}</Text>
              </View>
            ) : null}

            <AppInput
              label="Full Name"
              value={name}
              onChangeText={v => { setName(v); clearFieldError('name'); }}
              placeholder="Jane Doe"
              autoCapitalize="words"
              error={fieldErrors.name}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />

            <AppInput
              ref={emailRef}
              label="Email Address"
              value={email}
              onChangeText={v => { setEmail(v); clearFieldError('email'); }}
              placeholder="jane@example.com"
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
              onChangeText={v => { setPassword(v); clearFieldError('password'); }}
              placeholder="Min. 8 characters"
              secureTextEntry
              error={fieldErrors.password}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              blurOnSubmit={false}
            />

            {/* Password strength meter */}
            {password.length > 0 && (
              <View style={styles.strengthWrapper}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.strengthSegment,
                        {
                          backgroundColor:
                            i <= pwStrength.score ? pwStrength.color : Colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: pwStrength.color }]}>
                  {pwStrength.label}
                </Text>
              </View>
            )}

            <AppInput
              ref={confirmRef}
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={v => { setConfirmPassword(v); clearFieldError('confirm'); }}
              placeholder="Re-enter password"
              secureTextEntry
              error={fieldErrors.confirm}
              returnKeyType="go"
              onSubmitEditing={handleRegister}
            />

            <AppButton label="Create Account" onPress={handleRegister} loading={loading} />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text style={styles.loginTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Password requirements hint */}
          <View style={styles.requirementsBox}>
            <Text style={styles.requirementsTitle}>Password tips:</Text>
            {[
              '8+ characters',
              'Mix UPPER and lower case',
              'Include numbers (0-9)',
              'Use special characters (!@#…)',
            ].map(tip => (
              <Text key={tip} style={styles.requirementItem}>• {tip}</Text>
            ))}
          </View>
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
  headerIcon: { fontSize: 52, marginBottom: Spacing.sm },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius['2xl'],
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.lg,
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
  strengthWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  strengthBars: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    width: 44,
    textAlign: 'right',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.sm,
    marginHorizontal: Spacing.md,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  loginText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  loginTextBold: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  requirementsBox: {
    marginTop: Spacing.xl,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: `${Colors.primary}22`,
  },
  requirementsTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  requirementItem: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

export default RegisterScreen;
