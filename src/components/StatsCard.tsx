/**
 * components/StatsCard.tsx
 * Dashboard stats card — shows total, active, completed, overdue counts
 * along with a circular progress ring for completion rate.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

interface Stat {
  label: string;
  value: number | string;
  color: string;
  emoji: string;
}

interface Props {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  completionRate: number;
}

const StatsCard: React.FC<Props> = ({ total, completed, active, overdue, completionRate }) => {
  const stats: Stat[] = [
    { label: 'Total', value: total, color: Colors.primary, emoji: '📋' },
    { label: 'Active', value: active, color: Colors.info, emoji: '⚡' },
    { label: 'Done', value: completed, color: Colors.success, emoji: '✅' },
    { label: 'Overdue', value: overdue, color: Colors.error, emoji: '⚠️' },
  ];

  return (
    <LinearGradient
      colors={[Colors.surfaceLight, Colors.surface]}
      style={styles.card}>
      {/* Completion rate ring (text-based) */}
      <View style={styles.rateWrapper}>
        <View style={[styles.ring, { borderColor: completionRate > 66 ? Colors.success : completionRate > 33 ? Colors.warning : Colors.error }]}>
          <Text style={styles.ratePercent}>{completionRate}%</Text>
          <Text style={styles.rateLabel}>Done</Text>
        </View>
      </View>

      {/* Grid of stat boxes */}
      <View style={styles.grid}>
        {stats.map(s => (
          <View key={s.label} style={[styles.statBox, { borderColor: `${s.color}33` }]}>
            <Text style={styles.statEmoji}>{s.emoji}</Text>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  rateWrapper: {
    marginRight: Spacing.base,
  },
  ring: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratePercent: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.textPrimary,
  },
  rateLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeight.medium,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statBox: {
    width: '47%',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  statEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.extrabold,
    lineHeight: 26,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeight.medium,
    letterSpacing: 0.3,
  },
});

export default StatsCard;
