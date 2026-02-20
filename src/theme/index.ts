/**
 * theme/index.ts
 * Global design system — colors, typography, spacing, shadows, and gradients.
 * A dark-first, vibrant color palette inspired by modern productivity apps.
 */

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─────────────────────────────────────────────
//  Color Palette
// ─────────────────────────────────────────────
export const Colors = {
  // Background layers
  background: '#0A0E1A',       // deep navy — main bg
  surface: '#111827',          // cards, modals
  surfaceLight: '#1C2333',     // elevated cards
  border: '#2A3347',           // subtle borders
  borderLight: '#374151',      // hover borders

  // Brand accent — electric violet-blue gradient pair
  primary: '#6C63FF',
  primaryLight: '#8B83FF',
  primaryDark: '#4F46E5',
  secondary: '#06B6D4',        // cyan accent
  secondaryLight: '#22D3EE',

  // Status colors
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  error: '#EF4444',
  errorLight: '#F87171',
  info: '#3B82F6',

  // Priority badge colors
  priorityCritical: '#FF3366',
  priorityHigh: '#FF6B35',
  priorityMedium: '#F59E0B',
  priorityLow: '#10B981',

  // Category accent colors
  categoryPersonal: '#EC4899',
  categoryWork: '#6C63FF',
  categoryHealth: '#10B981',
  categoryFinance: '#F59E0B',
  categoryEducation: '#3B82F6',
  categoryShopping: '#F97316',
  categoryTravel: '#06B6D4',
  categoryOther: '#8B5CF6',

  // Text
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textInverse: '#111827',

  // Special
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0,0,0,0.65)',

  // Gradient stops (used with LinearGradient)
  gradientPrimary: ['#6C63FF', '#4F46E5'] as string[],
  gradientSuccess: ['#10B981', '#059669'] as string[],
  gradientWarning: ['#F59E0B', '#D97706'] as string[],
  gradientError: ['#EF4444', '#DC2626'] as string[],
  gradientCyan: ['#06B6D4', '#0891B2'] as string[],
  gradientCard: ['#1C2333', '#111827'] as string[],
  gradientDark: ['#111827', '#0A0E1A'] as string[],
  gradientBackground: ['#0A0E1A', '#0F1729', '#0A0E1A'] as string[],
};

// ─────────────────────────────────────────────
//  Typography
// ─────────────────────────────────────────────
export const Typography = {
  fontFamily: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

// ─────────────────────────────────────────────
//  Spacing Scale (4px base)
// ─────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// ─────────────────────────────────────────────
//  Border Radius
// ─────────────────────────────────────────────
export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  '2xl': 28,
  full: 9999,
};

// ─────────────────────────────────────────────
//  Shadows
// ─────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  glow: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
};

// ─────────────────────────────────────────────
//  Layout
// ─────────────────────────────────────────────
export const Layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  cardWidth: SCREEN_WIDTH - Spacing.base * 2,
  headerHeight: 60,
  tabBarHeight: 70,
  inputHeight: 52,
  buttonHeight: 54,
};

// ─────────────────────────────────────────────
//  Animation Durations (ms)
// ─────────────────────────────────────────────
export const Animations = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// ─────────────────────────────────────────────
//  Priority Config (label + color)
// ─────────────────────────────────────────────
export const PRIORITY_CONFIG = {
  critical: {
    label: 'Critical',
    color: Colors.priorityCritical,
    bgColor: 'rgba(255,51,102,0.15)',
    icon: '🔴',
    weight: 4,
  },
  high: {
    label: 'High',
    color: Colors.priorityHigh,
    bgColor: 'rgba(255,107,53,0.15)',
    icon: '🟠',
    weight: 3,
  },
  medium: {
    label: 'Medium',
    color: Colors.priorityMedium,
    bgColor: 'rgba(245,158,11,0.15)',
    icon: '🟡',
    weight: 2,
  },
  low: {
    label: 'Low',
    color: Colors.priorityLow,
    bgColor: 'rgba(16,185,129,0.15)',
    icon: '🟢',
    weight: 1,
  },
} as const;

export const CATEGORY_CONFIG = {
  personal: { label: 'Personal', color: Colors.categoryPersonal, icon: '👤' },
  work: { label: 'Work', color: Colors.categoryWork, icon: '💼' },
  health: { label: 'Health', color: Colors.categoryHealth, icon: '💪' },
  finance: { label: 'Finance', color: Colors.categoryFinance, icon: '💰' },
  education: { label: 'Education', color: Colors.categoryEducation, icon: '📚' },
  shopping: { label: 'Shopping', color: Colors.categoryShopping, icon: '🛒' },
  travel: { label: 'Travel', color: Colors.categoryTravel, icon: '✈️' },
  other: { label: 'Other', color: Colors.categoryOther, icon: '📌' },
} as const;

export default {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
  Layout,
  Animations,
  PRIORITY_CONFIG,
  CATEGORY_CONFIG,
};
