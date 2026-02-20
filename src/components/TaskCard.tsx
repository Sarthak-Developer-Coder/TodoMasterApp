/**
 * components/TaskCard.tsx
 * Rich task card with swipe-to-delete, priority colour accent stripe,
 * deadline countdown, completion toggle, and category badge.
 * Uses Animated for smooth press feedback.
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
  PRIORITY_CONFIG,
  CATEGORY_CONFIG,
} from '../theme';
import { Task } from '../types';
import { getDeadlineLabel, getDeadlineColor, formatDateTime } from '../utils/dateUtils';
import { isOverdue, isDueSoon } from '../utils/sortAlgorithm';

interface Props {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  style?: object;
}

const TaskCard: React.FC<Props> = ({
  task,
  onPress,
  onToggleComplete,
  onDelete,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const priorityCfg = PRIORITY_CONFIG[task.priority];
  const categoryCfg = CATEGORY_CONFIG[task.category];
  const deadlineColor = getDeadlineColor(task.deadline, task.completed);
  const overdue = isOverdue(task);
  const dueSoon = isDueSoon(task, 24);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Task',
      `"${task.title}" will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ],
    );
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, task.completed && styles.cardCompleted]}>

        {/* Left accent stripe (priority colour) */}
        <View style={[styles.accent, { backgroundColor: priorityCfg.color }]} />

        {/* Main content */}
        <View style={styles.body}>

          {/* Top row: category + priority + delete btn */}
          <View style={styles.topRow}>
            {/* Category badge */}
            <View style={[styles.categoryBadge, { borderColor: categoryCfg.color }]}>
              <Text style={styles.categoryEmoji}>{categoryCfg.icon}</Text>
              <Text style={[styles.categoryLabel, { color: categoryCfg.color }]}>
                {categoryCfg.label}
              </Text>
            </View>

            {/* Priority badge */}
            <View style={[styles.priorityBadge, { backgroundColor: priorityCfg.bgColor }]}>
              <Text style={[styles.priorityText, { color: priorityCfg.color }]}>
                {priorityCfg.icon} {priorityCfg.label}
              </Text>
            </View>

            {/* Delete button */}
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={confirmDelete}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Task title */}
          <Text
            style={[styles.title, task.completed && styles.titleCompleted]}
            numberOfLines={2}>
            {task.title}
          </Text>

          {/* Description */}
          {task.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}

          {/* Tags */}
          {task.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {task.tags.slice(0, 3).map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
              {task.tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{task.tags.length - 3}</Text>
              )}
            </View>
          )}

          {/* Bottom row: deadline + start time + complete toggle */}
          <View style={styles.bottomRow}>
            {/* Deadline */}
            <View style={styles.deadlineRow}>
              <Text style={styles.clockEmoji}>🕐</Text>
              <Text style={[styles.deadlineText, { color: deadlineColor }]}>
                {getDeadlineLabel(task.deadline)}
              </Text>
              {overdue && !task.completed && (
                <View style={styles.overdueChip}>
                  <Text style={styles.overdueText}>OVERDUE</Text>
                </View>
              )}
              {dueSoon && !overdue && !task.completed && (
                <View style={styles.dueSoonChip}>
                  <Text style={styles.dueSoonText}>SOON</Text>
                </View>
              )}
            </View>

            {/* Completion toggle */}
            <TouchableOpacity
              style={[styles.toggleBtn, task.completed && styles.toggleBtnDone]}
              onPress={onToggleComplete}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              {task.completed ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <View style={styles.toggleInner} />
              )}
            </TouchableOpacity>
          </View>

          {/* Smart score indicator (subtle) */}
          {!task.completed && task.sortScore !== undefined && (
            <View style={styles.scoreRow}>
              <View style={styles.scoreBar}>
                <View
                  style={[
                    styles.scoreFill,
                    {
                      width: `${Math.min((task.sortScore / 10) * 100, 100)}%` as any,
                      backgroundColor: overdue
                        ? Colors.error
                        : dueSoon
                        ? Colors.warning
                        : Colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.scoreText}>
                Urgency: {task.sortScore.toFixed(1)}/10
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginVertical: Spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  cardCompleted: {
    opacity: 0.65,
  },
  accent: {
    width: 4,
    borderTopLeftRadius: Radius.lg,
    borderBottomLeftRadius: Radius.lg,
  },
  body: {
    flex: 1,
    padding: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: `${Colors.surfaceLight}99`,
  },
  categoryEmoji: {
    fontSize: 10,
    marginRight: 3,
  },
  categoryLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  priorityText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  deleteBtn: {
    marginLeft: 'auto',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: `${Colors.error}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: Colors.error,
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tag: {
    backgroundColor: `${Colors.secondary}22`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  tagText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  moreTagsText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    alignSelf: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.xs,
  },
  clockEmoji: {
    fontSize: 13,
  },
  deadlineText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  overdueChip: {
    backgroundColor: `${Colors.error}22`,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  overdueText: {
    fontSize: 9,
    color: Colors.error,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  dueSoonChip: {
    backgroundColor: `${Colors.warning}22`,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  dueSoonText: {
    fontSize: 9,
    color: Colors.warning,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  toggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  toggleBtnDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  toggleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  checkmark: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
  },
  scoreRow: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scoreBar: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 2,
  },
  scoreText: {
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
});

export default TaskCard;
