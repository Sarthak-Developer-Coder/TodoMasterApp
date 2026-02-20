/**
 * screens/tasks/AddTaskScreen.tsx
 * ─────────────────────────────────────────────
 * Create / Edit task screen.
 * Fields: title, description, dateTime, deadline, priority, category, tags.
 * Supports both "create new" and "edit existing" via taskId route param.
 *
 * UI highlights:
 *   • Section cards with gradient headers
 *   • Native DateTimePicker integration
 *   • Inline tag chip input
 *   • Priority selector with colour feedback
 *   • Category selector grid
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addTask, updateTask } from '../../store/tasksSlice';
import { Task, TaskStackParamList, Priority, Category } from '../../types';
import { Colors, Typography, Spacing, Radius, Shadows, PRIORITY_CONFIG, CATEGORY_CONFIG } from '../../theme';
import { formatDateTimeLong, hoursFromNowISO, nowISO } from '../../utils/dateUtils';

import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import LoadingOverlay from '../../components/LoadingOverlay';

type Nav = NativeStackNavigationProp<TaskStackParamList, 'AddTask'>;
type RouteT = RouteProp<TaskStackParamList, 'AddTask'>;

// ─── Date picker state type ───────────────────
type DateField = 'dateTime' | 'deadline' | null;

// ─── Validation ───────────────────────────────
function validate(fields: {
  title: string; description: string; dateTime: Date; deadline: Date;
}) {
  const errors: Partial<Record<keyof typeof fields, string>> = {};
  if (!fields.title.trim()) errors.title = 'Title is required';
  else if (fields.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
  if (fields.deadline <= fields.dateTime) {
    errors.deadline = 'Deadline must be after the start time';
  }
  return errors;
}

const AddTaskScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(s => s.auth);
  const { tasks, loading } = useAppSelector(s => s.tasks);

  const editTaskId = route.params?.taskId;
  const isEditing = !!editTaskId;

  // Find existing task when in edit mode
  const existingTask = isEditing ? tasks.find(t => t.id === editTaskId) : undefined;

  // ── Form state ────────────────────────────────
  const [title, setTitle] = useState(existingTask?.title ?? '');
  const [description, setDescription] = useState(existingTask?.description ?? '');
  const [dateTime, setDateTime] = useState<Date>(
    existingTask ? new Date(existingTask.dateTime) : new Date(),
  );
  const [deadline, setDeadline] = useState<Date>(
    existingTask ? new Date(existingTask.deadline) : new Date(hoursFromNowISO(24)),
  );
  const [priority, setPriority] = useState<Priority>(existingTask?.priority ?? 'medium');
  const [category, setCategory] = useState<Category>(existingTask?.category ?? 'personal');
  const [tags, setTags] = useState<string[]>(existingTask?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

  // DateTimePicker visibility
  const [activePicker, setActivePicker] = useState<DateField>(null);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [pickerStep, setPickerStep] = useState<0 | 1>(0); // 0=date, 1=time

  // ── DatePicker helpers ────────────────────────
  const openPicker = (field: DateField, mode: 'date' | 'time' = 'date') => {
    setActivePicker(field);
    setPickerMode(mode);
    setPickerStep(0);
  };

  const handlePickerChange = (_: any, selected?: Date) => {
    if (!selected) { setActivePicker(null); return; }

    if (pickerStep === 0) {
      // Date was selected — now pick time
      if (activePicker === 'dateTime') {
        const merged = new Date(selected);
        merged.setHours(dateTime.getHours(), dateTime.getMinutes());
        setDateTime(merged);
      } else {
        const merged = new Date(selected);
        merged.setHours(deadline.getHours(), deadline.getMinutes());
        setDeadline(merged);
      }
      setPickerMode('time');
      setPickerStep(1);
    } else {
      // Time was selected
      if (activePicker === 'dateTime') {
        const merged = new Date(dateTime);
        merged.setHours(selected.getHours(), selected.getMinutes());
        setDateTime(merged);
      } else {
        const merged = new Date(deadline);
        merged.setHours(selected.getHours(), selected.getMinutes());
        setDeadline(merged);
      }
      setActivePicker(null);
      setPickerStep(0);
    }
  };

  // ── Tag management ────────────────────────────
  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 8) {
      setTags(p => [...p, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(p => p.filter(t => t !== tag));

  // ── Submit ────────────────────────────────────
  const handleSubmit = async () => {
    const errors = validate({ title, description, dateTime, deadline });
    setFieldErrors(errors as any);
    if (Object.keys(errors).length > 0) return;

    const taskPayload = {
      userId: currentUser!.id,
      title: title.trim(),
      description: description.trim(),
      dateTime: dateTime.toISOString(),
      deadline: deadline.toISOString(),
      priority,
      category,
      tags,
      completed: existingTask?.completed ?? false,
    };

    if (isEditing && editTaskId) {
      await dispatch(updateTask({ id: editTaskId, updates: taskPayload }));
    } else {
      await dispatch(addTask(taskPayload));
    }

    navigation.goBack();
  };

  // ── Render ────────────────────────────────────
  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} message={isEditing ? 'Updating task…' : 'Adding task…'} />

      {/* Screen header */}
      <LinearGradient colors={[Colors.surface, Colors.background]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backLabel}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>{isEditing ? 'Edit Task' : 'New Task'}</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* ── Basic Info ──────────────────── */}
          <SectionCard title="📝 Basic Info" gradient={Colors.gradientPrimary}>
            <AppInput
              label="Task Title *"
              value={title}
              onChangeText={v => { setTitle(v); setFieldErrors(p => ({ ...p, title: undefined })); }}
              placeholder="What needs to be done?"
              error={fieldErrors.title}
              returnKeyType="next"
              autoFocus={!isEditing}
            />
            <AppInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Add details, notes, or context…"
              multiline
              numberOfLines={3}
            />
          </SectionCard>

          {/* ── Date & Time ─────────────────── */}
          <SectionCard title="📅 Schedule" gradient={Colors.gradientCyan}>
            {/* Start date-time */}
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Start</Text>
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => openPicker('dateTime')}>
                <Text style={styles.datePickerText}>
                  📅 {formatDateTimeLong(dateTime.toISOString())}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Deadline */}
            <View style={[styles.dateRow, styles.dateRowBottom]}>
              <Text style={styles.dateLabel}>Deadline *</Text>
              <TouchableOpacity
                style={[styles.datePicker, fieldErrors.deadline ? styles.datePickerError : null]}
                onPress={() => openPicker('deadline')}>
                <Text style={styles.datePickerText}>
                  ⏰ {formatDateTimeLong(deadline.toISOString())}
                </Text>
              </TouchableOpacity>
            </View>
            {fieldErrors.deadline && (
              <Text style={styles.fieldError}>{fieldErrors.deadline}</Text>
            )}
          </SectionCard>

          {/* ── Priority ────────────────────── */}
          <SectionCard title="🔥 Priority" gradient={Colors.gradientWarning}>
            <View style={styles.priorityGrid}>
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(p => {
                const cfg = PRIORITY_CONFIG[p];
                const active = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityOption,
                      { borderColor: active ? cfg.color : Colors.border },
                      active && { backgroundColor: cfg.bgColor },
                    ]}
                    onPress={() => setPriority(p)}
                    activeOpacity={0.75}>
                    <Text style={styles.priorityEmoji}>{cfg.icon}</Text>
                    <Text style={[styles.priorityLabel, { color: active ? cfg.color : Colors.textSecondary }]}>
                      {cfg.label}
                    </Text>
                    {active && (
                      <View style={[styles.priorityCheck, { backgroundColor: cfg.color }]}>
                        <Text style={styles.priorityCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </SectionCard>

          {/* ── Category ────────────────────── */}
          <SectionCard title="🗂️ Category" gradient={Colors.gradientSuccess}>
            <View style={styles.categoryGrid}>
              {(Object.keys(CATEGORY_CONFIG) as Category[]).map(c => {
                const cfg = CATEGORY_CONFIG[c];
                const active = category === c;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.categoryOption,
                      { borderColor: active ? cfg.color : Colors.border },
                      active && { backgroundColor: `${cfg.color}18` },
                    ]}
                    onPress={() => setCategory(c)}
                    activeOpacity={0.75}>
                    <Text style={styles.categoryEmoji}>{cfg.icon}</Text>
                    <Text style={[styles.categoryLabel, { color: active ? cfg.color : Colors.textSecondary }]}>
                      {cfg.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SectionCard>

          {/* ── Tags ────────────────────────── */}
          <SectionCard title="🏷️ Tags" gradient={[Colors.secondary, Colors.secondaryLight]}>
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add a tag…"
                placeholderTextColor={Colors.textMuted}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                returnKeyType="done"
                cursorColor={Colors.secondary}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.tagAddBtn} onPress={addTag}>
                <Text style={styles.tagAddBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagChips}>
              {tags.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tagChip}
                  onPress={() => removeTag(tag)}>
                  <Text style={styles.tagChipText}>#{tag}</Text>
                  <Text style={styles.tagChipRemove}> ✕</Text>
                </TouchableOpacity>
              ))}
              {tags.length === 0 && (
                <Text style={styles.noTagsHint}>Type a tag and press Enter or +</Text>
              )}
            </View>
          </SectionCard>

          {/* Submit button */}
          <View style={styles.submitRow}>
            <AppButton
              label={isEditing ? 'Save Changes' : 'Add Task'}
              onPress={handleSubmit}
              loading={loading}
            />
          </View>

          <View style={{ height: Spacing['4xl'] }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Native DateTimePicker */}
      {activePicker !== null && (
        <DateTimePicker
          value={activePicker === 'dateTime' ? dateTime : deadline}
          mode={pickerMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handlePickerChange}
          minimumDate={activePicker === 'deadline' ? dateTime : undefined}
          themeVariant="dark"
        />
      )}
    </View>
  );
};

// ─── Section card helper ──────────────────────
const SectionCard: React.FC<{
  title: string;
  gradient: string[];
  children: React.ReactNode;
}> = ({ title, gradient, children }) => (
  <View style={sectionStyles.card}>
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={sectionStyles.header}>
      <Text style={sectionStyles.title}>{title}</Text>
    </LinearGradient>
    <View style={sectionStyles.body}>{children}</View>
  </View>
);

const sectionStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginBottom: Spacing.base,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  body: {
    padding: Spacing.base,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing['2xl'],
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  backBtn: { width: 60 },
  backLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  screenTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.textPrimary,
  },
  headerRight: { width: 60 },
  scroll: {
    padding: Spacing.base,
  },
  // Dates
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dateRowBottom: { marginBottom: 0 },
  dateLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    width: 68,
  },
  datePicker: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  datePickerError: { borderColor: Colors.error },
  datePickerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
  fieldError: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
  },
  // Priority
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  priorityOption: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    backgroundColor: Colors.background,
    gap: Spacing.sm,
  },
  priorityEmoji: { fontSize: 18 },
  priorityLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
  },
  priorityCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityCheckText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
  },
  // Category
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryOption: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    backgroundColor: Colors.background,
    gap: 4,
  },
  categoryEmoji: { fontSize: 20 },
  categoryLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  // Tags
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
  },
  tagAddBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagAddBtnText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 26,
  },
  tagChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    minHeight: 32,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.secondary}22`,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: `${Colors.secondary}44`,
  },
  tagChipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  tagChipRemove: {
    fontSize: 10,
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.bold,
  },
  noTagsHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  submitRow: {
    marginTop: Spacing.sm,
  },
});

export default AddTaskScreen;
