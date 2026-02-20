/**
 * screens/tasks/TaskDetailScreen.tsx
 * ─────────────────────────────────────────────
 * Full-detail view of a single task.
 * Shows all fields, urgency score breakdown, and quick action buttons.
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toggleTaskComplete, deleteTask } from '../../store/tasksSlice';
import { TaskStackParamList } from '../../types';
import {
  Colors, Typography, Spacing, Radius, Shadows,
  PRIORITY_CONFIG, CATEGORY_CONFIG,
} from '../../theme';
import {
  formatDateTimeLong, getDeadlineLabel, getDeadlineColor, fromNow,
} from '../../utils/dateUtils';
import { isOverdue, isDueSoon } from '../../utils/sortAlgorithm';

import AppButton from '../../components/AppButton';

type Nav = NativeStackNavigationProp<TaskStackParamList, 'TaskDetail'>;
type RouteT = RouteProp<TaskStackParamList, 'TaskDetail'>;

const TaskDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector(s => s.tasks);

  const task = tasks.find(t => t.id === route.params.taskId);

  if (!task) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.notFound}>Task not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.goBack}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const priorityCfg = PRIORITY_CONFIG[task.priority];
  const categoryCfg = CATEGORY_CONFIG[task.category];
  const deadlineColor = getDeadlineColor(task.deadline, task.completed);
  const overdue = isOverdue(task);
  const dueSoon = isDueSoon(task);

  const handleToggle = () => dispatch(toggleTaskComplete(task.id));

  const handleDelete = () => {
    Alert.alert('Delete Task', `Delete "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await dispatch(deleteTask(task.id));
          navigation.goBack();
        },
      },
    ]);
  };

  const handleEdit = () => navigation.navigate('AddTask', { taskId: task.id });

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[priorityCfg.color, Colors.surface]}
        locations={[0, 0.85]}
        style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backLabel}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.headerBadges}>
          <View style={[styles.priorityBadge, { backgroundColor: `${priorityCfg.color}30` }]}>
            <Text style={[styles.priorityText, { color: priorityCfg.color }]}>
              {priorityCfg.icon} {priorityCfg.label}
            </Text>
          </View>
          <View style={[styles.categoryBadge, { borderColor: categoryCfg.color }]}>
            <Text style={[styles.categoryText, { color: categoryCfg.color }]}>
              {categoryCfg.icon} {categoryCfg.label}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{task.title}</Text>
        {task.completed && (
          <View style={styles.completedBanner}>
            <Text style={styles.completedBannerText}>✓ Completed {fromNow(task.updatedAt)}</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Urgency score card */}
        {!task.completed && (
          <View style={styles.scoreCard}>
            <Text style={styles.scoreCardTitle}>🧠 Smart Urgency Score</Text>
            <Text style={[styles.scoreValue, {
              color: (task.sortScore ?? 0) >= 7 ? Colors.error
                : (task.sortScore ?? 0) >= 4 ? Colors.warning
                : Colors.success,
            }]}>
              {task.sortScore?.toFixed(2) ?? '—'} / 10
            </Text>
            <View style={styles.scoreBarBg}>
              <View
                style={[styles.scoreBarFill, {
                  width: `${Math.min(((task.sortScore ?? 0) / 10) * 100, 100)}%` as any,
                  backgroundColor:
                    overdue ? Colors.error :
                    dueSoon ? Colors.warning :
                    Colors.primary,
                }]}
              />
            </View>
            <Text style={styles.scoreHint}>
              {overdue
                ? '🔴 This task is overdue!'
                : dueSoon
                ? '🟡 Deadline approaching — act soon!'
                : '🟢 Comfortable time remaining.'}
            </Text>
          </View>
        )}

        {/* Description */}
        {task.description ? (
          <DetailSection title="Description" icon="📄">
            <Text style={styles.descriptionText}>{task.description}</Text>
          </DetailSection>
        ) : null}

        {/* Schedule */}
        <DetailSection title="Schedule" icon="📅">
          <DetailRow label="Start" value={formatDateTimeLong(task.dateTime)} />
          <DetailRow
            label="Deadline"
            value={formatDateTimeLong(task.deadline)}
            valueStyle={{ color: deadlineColor }}
            extra={
              <Text style={[styles.deadlineBadge, { color: deadlineColor }]}>
                {getDeadlineLabel(task.deadline)}
              </Text>
            }
          />
        </DetailSection>

        {/* Tags */}
        {task.tags.length > 0 && (
          <DetailSection title="Tags" icon="🏷️">
            <View style={styles.tagsRow}>
              {task.tags.map(tag => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </DetailSection>
        )}

        {/* Meta */}
        <DetailSection title="Created" icon="🕐">
          <Text style={styles.metaText}>{fromNow(task.createdAt)}</Text>
          <Text style={styles.metaSubText}>{formatDateTimeLong(task.createdAt)}</Text>
        </DetailSection>

        {/* Actions */}
        <View style={styles.actions}>
          <AppButton
            label={task.completed ? 'Mark as Active' : 'Mark as Complete ✓'}
            onPress={handleToggle}
            variant={task.completed ? 'outline' : 'primary'}
            style={{ marginBottom: Spacing.sm }}
          />
          <View style={styles.actionsRow}>
            <AppButton
              label="✏️ Edit"
              onPress={handleEdit}
              variant="secondary"
              fullWidth={false}
              style={styles.actionHalf}
            />
            <AppButton
              label="🗑 Delete"
              onPress={handleDelete}
              variant="danger"
              fullWidth={false}
              style={styles.actionHalf}
            />
          </View>
        </View>

        <View style={{ height: Spacing['4xl'] }} />
      </ScrollView>
    </View>
  );
};

// ─── Small helper components ──────────────────
const DetailSection: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <View style={detailStyles.section}>
    <Text style={detailStyles.sectionTitle}>{icon} {title}</Text>
    {children}
  </View>
);

interface DetailRowProps {
  label: string;
  value: string;
  valueStyle?: object;
  extra?: React.ReactNode;
}
const DetailRow: React.FC<DetailRowProps> = ({ label, value, valueStyle, extra }) => (
  <View style={detailStyles.row}>
    <Text style={detailStyles.rowLabel}>{label}</Text>
    <View style={detailStyles.rowRight}>
      <Text style={[detailStyles.rowValue, valueStyle]}>{value}</Text>
      {extra}
    </View>
  </View>
);

const detailStyles = StyleSheet.create({
  section: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  rowLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    width: 80,
  },
  rowRight: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  rowValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  notFound: { color: Colors.textSecondary, fontSize: Typography.fontSize.lg },
  goBack: { color: Colors.primary, marginTop: Spacing.md, fontSize: Typography.fontSize.base },
  header: {
    paddingTop: Spacing['2xl'],
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: Radius['2xl'],
    borderBottomRightRadius: Radius['2xl'],
  },
  backBtn: { marginBottom: Spacing.md },
  backLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    fontWeight: Typography.fontWeight.medium,
    opacity: 0.85,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  priorityText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  categoryText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.white,
    lineHeight: 32,
  },
  completedBanner: {
    marginTop: Spacing.sm,
    backgroundColor: `${Colors.success}30`,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  completedBannerText: {
    color: Colors.success,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  scroll: { paddingTop: Spacing.base },
  scoreCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  scoreCardTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  scoreValue: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
    marginBottom: Spacing.sm,
  },
  scoreBarBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreHint: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  descriptionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  deadlineBadge: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tagChip: {
    backgroundColor: `${Colors.secondary}22`,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: `${Colors.secondary}44`,
  },
  tagText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  metaText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
  metaSubText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  actions: {
    padding: Spacing.base,
    marginTop: Spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionHalf: {
    flex: 1,
  },
});

export default TaskDetailScreen;
