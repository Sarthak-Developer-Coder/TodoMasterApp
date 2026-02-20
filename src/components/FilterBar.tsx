/**
 * components/FilterBar.tsx
 * Horizontal scrollable pill-row for status, priority, and sort filters.
 * Emits filter/sort changes via callbacks.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { TaskFilter, SortOrder, Priority, Category } from '../types';

interface Props {
  filter: TaskFilter;
  sortOrder: SortOrder;
  onFilterChange: (f: Partial<TaskFilter>) => void;
  onSortChange: (s: SortOrder) => void;
}

type StatusOption = { label: string; value: TaskFilter['status'] };
type SortOption = { label: string; value: SortOrder };

const STATUS_OPTIONS: StatusOption[] = [
  { label: 'All', value: 'all' },
  { label: '⚡ Active', value: 'active' },
  { label: '✓ Done', value: 'completed' },
];

const SORT_OPTIONS: SortOption[] = [
  { label: '🧠 Smart', value: 'smart' },
  { label: '⏰ Deadline', value: 'deadline' },
  { label: '🔥 Priority', value: 'priority' },
  { label: '🆕 Newest', value: 'createdAt' },
  { label: '🔤 Alpha', value: 'alpha' },
];

const PRIORITY_OPTIONS: Array<{ label: string; value: Priority | 'all' }> = [
  { label: 'Any Priority', value: 'all' },
  { label: '🔴 Critical', value: 'critical' },
  { label: '🟠 High', value: 'high' },
  { label: '🟡 Medium', value: 'medium' },
  { label: '🟢 Low', value: 'low' },
];

const FilterBar: React.FC<Props> = ({ filter, sortOrder, onFilterChange, onSortChange }) => {
  const [activeSection, setActiveSection] = useState<'status' | 'sort' | 'priority'>('status');

  return (
    <View style={styles.wrapper}>
      {/* Section switcher */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionRow}>
        {(['status', 'sort', 'priority'] as const).map(s => (
          <TouchableOpacity
            key={s}
            onPress={() => setActiveSection(s)}
            style={[styles.sectionBtn, activeSection === s && styles.sectionBtnActive]}>
            <Text style={[styles.sectionLabel, activeSection === s && styles.sectionLabelActive]}>
              {s === 'status' ? 'Status' : s === 'sort' ? 'Sort' : 'Priority'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dynamic options row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionRow}>
        {activeSection === 'status' &&
          STATUS_OPTIONS.map(opt => (
            <Pill
              key={opt.value}
              label={opt.label}
              active={filter.status === opt.value}
              onPress={() => onFilterChange({ status: opt.value })}
            />
          ))}
        {activeSection === 'sort' &&
          SORT_OPTIONS.map(opt => (
            <Pill
              key={opt.value}
              label={opt.label}
              active={sortOrder === opt.value}
              onPress={() => onSortChange(opt.value)}
            />
          ))}
        {activeSection === 'priority' &&
          PRIORITY_OPTIONS.map(opt => (
            <Pill
              key={opt.value}
              label={opt.label}
              active={filter.priority === opt.value}
              onPress={() => onFilterChange({ priority: opt.value })}
            />
          ))}
      </ScrollView>
    </View>
  );
};

// ─── Pill chip component ──────────────────────
interface PillProps {
  label: string;
  active: boolean;
  onPress: () => void;
}
const Pill: React.FC<PillProps> = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.pill, active && styles.pillActive]}
    activeOpacity={0.75}>
    <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  sectionRow: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  sectionBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}18`,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  sectionLabelActive: {
    color: Colors.primary,
  },
  optionRow: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  pillTextActive: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default FilterBar;
