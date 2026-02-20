/**
 * screens/tasks/ProfileScreen.tsx
 * ─────────────────────────────────────────────
 * User profile & settings screen:
 *   • Avatar with initials
 *   • Account metadata
 *   • Task completion stats
 *   • Logout button
 *   • App info
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/authSlice';
import { clearTasks } from '../../store/tasksSlice';
import {
  Colors, Typography, Spacing, Radius, Shadows, CATEGORY_CONFIG, PRIORITY_CONFIG,
} from '../../theme';
import { formatDateLong, fromNow } from '../../utils/dateUtils';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(s => s.auth);
  const { tasks } = useAppSelector(s => s.tasks);

  // ── Derived stats ─────────────────────────────
  const stats = useMemo(() => {
    const now = new Date();
    const userTasks = tasks.filter(t => t.userId === currentUser?.id);
    const completed = userTasks.filter(t => t.completed).length;
    const overdue = userTasks.filter(t => !t.completed && new Date(t.deadline) < now).length;
    const completionRate = userTasks.length > 0
      ? Math.round((completed / userTasks.length) * 100)
      : 0;

    // Category breakdown
    const byCategory = Object.keys(CATEGORY_CONFIG).map(cat => ({
      cat,
      count: userTasks.filter(t => t.category === cat).length,
      cfg: CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG],
    })).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

    // Priority breakdown
    const byPriority = Object.keys(PRIORITY_CONFIG).map(p => ({
      p,
      count: userTasks.filter(t => t.priority === p).length,
      cfg: PRIORITY_CONFIG[p as keyof typeof PRIORITY_CONFIG],
    })).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

    return { total: userTasks.length, completed, overdue, completionRate, byCategory, byPriority };
  }, [tasks, currentUser]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          dispatch(clearTasks());
          dispatch(logout());
        },
      },
    ]);
  };

  const initials = currentUser?.name
    ?.split(' ')
    .map(w => w.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <LinearGradient
        colors={[Colors.primaryDark, Colors.surface]}
        locations={[0, 1]}
        style={styles.header}>
        {/* Back button (when navigated here from Home stack, not tab) */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backLabel}>‹ Back</Text>
        </TouchableOpacity>

        {/* Avatar */}
        <LinearGradient
          colors={Colors.gradientPrimary}
          style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>

        <Text style={styles.userName}>{currentUser?.name}</Text>
        <Text style={styles.userEmail}>{currentUser?.email}</Text>
        <Text style={styles.joinDate}>
          Member since {currentUser ? formatDateLong(currentUser.createdAt) : '—'}
        </Text>
      </LinearGradient>

      {/* Completion ring */}
      <View style={styles.completionCard}>
        <View style={[styles.completionRing, {
          borderColor: stats.completionRate >= 75 ? Colors.success
            : stats.completionRate >= 40 ? Colors.warning
            : Colors.error,
        }]}>
          <Text style={styles.completionPct}>{stats.completionRate}%</Text>
          <Text style={styles.completionLabel}>Completed</Text>
        </View>
        <View style={styles.completionStats}>
          {[
            { label: 'Total Tasks', value: stats.total, color: Colors.primary },
            { label: 'Completed', value: stats.completed, color: Colors.success },
            { label: 'Active', value: stats.total - stats.completed, color: Colors.info },
            { label: 'Overdue', value: stats.overdue, color: Colors.error },
          ].map(s => (
            <View key={s.label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Category breakdown */}
      {stats.byCategory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks by Category</Text>
          {stats.byCategory.map(({ cat, count, cfg }) => (
            <View key={cat} style={styles.breakdownRow}>
              <Text style={styles.breakdownIcon}>{cfg.icon}</Text>
              <Text style={styles.breakdownLabel}>{cfg.label}</Text>
              <View style={styles.breakdownBarBg}>
                <View style={[styles.breakdownBarFill, {
                  width: `${Math.round((count / stats.total) * 100)}%` as any,
                  backgroundColor: cfg.color,
                }]} />
              </View>
              <Text style={[styles.breakdownCount, { color: cfg.color }]}>{count}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Priority breakdown */}
      {stats.byPriority.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks by Priority</Text>
          {stats.byPriority.map(({ p, count, cfg }) => (
            <View key={p} style={styles.breakdownRow}>
              <Text style={styles.breakdownIcon}>{cfg.icon}</Text>
              <Text style={styles.breakdownLabel}>{cfg.label}</Text>
              <View style={styles.breakdownBarBg}>
                <View style={[styles.breakdownBarFill, {
                  width: `${Math.round((count / stats.total) * 100)}%` as any,
                  backgroundColor: cfg.color,
                }]} />
              </View>
              <Text style={[styles.breakdownCount, { color: cfg.color }]}>{count}</Text>
            </View>
          ))}
        </View>
      )}

      {/* App info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <InfoRow label="App" value="TodoMaster v1.0.0" />
        <InfoRow label="Framework" value="React Native CLI + TypeScript" />
        <InfoRow label="State" value="Redux Toolkit + redux-persist" />
        <InfoRow label="Storage" value="AsyncStorage (local)" />
        <InfoRow label="Algorithm" value="Smart Priority Sort (AI-like scoring)" />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: Spacing['4xl'] }} />
    </ScrollView>
  );
};

// ─── Small helpers ────────────────────────────
const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={infoStyles.row}>
    <Text style={infoStyles.label}>{label}</Text>
    <Text style={infoStyles.value}>{value}</Text>
  </View>
);
const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: { fontSize: Typography.fontSize.sm, color: Colors.textMuted },
  value: { fontSize: Typography.fontSize.sm, color: Colors.textPrimary, fontWeight: Typography.fontWeight.medium, flex: 1, textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing['3xl'] },
  header: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['2xl'],
    borderBottomLeftRadius: Radius['2xl'],
    borderBottomRightRadius: Radius['2xl'],
    marginBottom: Spacing.base,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.base,
  },
  backLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    fontWeight: Typography.fontWeight.medium,
    opacity: 0.8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
    ...Shadows.glow,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.white,
  },
  userName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
  },
  completionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  completionRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.base,
  },
  completionPct: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.textPrimary,
  },
  completionLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
  completionStats: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statItem: {
    width: '44%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.extrabold,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  breakdownIcon: { fontSize: 16, width: 22 },
  breakdownLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    width: 72,
    fontWeight: Typography.fontWeight.medium,
  },
  breakdownBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownCount: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    width: 24,
    textAlign: 'right',
  },
  logoutBtn: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    backgroundColor: `${Colors.error}18`,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.error}33`,
  },
  logoutText: {
    fontSize: Typography.fontSize.base,
    color: Colors.error,
    fontWeight: Typography.fontWeight.bold,
  },
});

export default ProfileScreen;
