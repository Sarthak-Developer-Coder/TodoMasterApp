/**
 * screens/tasks/HomeScreen.tsx
 * ─────────────────────────────────────────────
 * Main task list screen:
 *   • Welcome header with user name & date
 *   • Stats dashboard card
 *   • Search bar
 *   • Filter / Sort bar
 *   • Animated task list with TaskCard components
 *   • Smart empty states per filter context
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchTasks,
  toggleTaskComplete,
  deleteTask,
  setSearchQuery,
  setFilter,
  setSortOrder,
} from '../../store/tasksSlice';
import { Task, TaskStackParamList } from '../../types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { sortAndFilterTasks } from '../../utils/sortAlgorithm';
import { formatDate } from '../../utils/dateUtils';

import TaskCard from '../../components/TaskCard';
import FilterBar from '../../components/FilterBar';
import EmptyState from '../../components/EmptyState';
import LoadingOverlay from '../../components/LoadingOverlay';
import StatsCard from '../../components/StatsCard';

type Nav = NativeStackNavigationProp<TaskStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(s => s.auth);
  const { tasks, loading, filter, sortOrder } = useAppSelector(s => s.tasks);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Load tasks whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (currentUser) {
        dispatch(fetchTasks(currentUser.id));
      }
    }, [currentUser, dispatch]),
  );

  // Sync typed search text into the Redux filter (debounced locally)
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchQuery(searchText));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, dispatch]);

  // Derived: sorted + filtered task list
  const displayedTasks = useMemo(
    () => sortAndFilterTasks(tasks, filter, sortOrder),
    [tasks, filter, sortOrder],
  );

  // Stats derived from full (unfiltered) task list
  const stats = useMemo(() => {
    const now = new Date();
    const completed = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter(t => !t.completed && new Date(t.deadline) < now).length;
    return {
      total: tasks.length,
      completed,
      active: tasks.length - completed,
      overdue,
      completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    };
  }, [tasks]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (currentUser) await dispatch(fetchTasks(currentUser.id));
    setRefreshing(false);
  };

  const handleToggle = (id: string) => dispatch(toggleTaskComplete(id));
  const handleDelete = (id: string) => dispatch(deleteTask(id));

  const renderTask = ({ item, index }: { item: Task; index: number }) => (
    <Animated.View
      style={{
        opacity: 1,
        transform: [{ translateY: 0 }],
      }}>
      <TaskCard
        task={item}
        onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
        onToggleComplete={() => handleToggle(item.id)}
        onDelete={() => handleDelete(item.id)}
        style={{ marginHorizontal: Spacing.base }}
      />
    </Animated.View>
  );

  const firstName = currentUser?.name?.split(' ')[0] ?? 'there';
  const todayLabel = formatDate(new Date().toISOString());

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hey, {firstName} 👋</Text>
            <Text style={styles.dateLabel}>{todayLabel}</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Profile')}>
            <LinearGradient
              colors={Colors.gradientPrimary}
              style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser?.name?.charAt(0).toUpperCase() ?? 'U'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks, tags…"
            placeholderTextColor={Colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            cursorColor={Colors.primary}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(''); dispatch(setSearchQuery('')); }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Stats (only when not searching) */}
      {!searchText && tasks.length > 0 && (
        <StatsCard {...stats} />
      )}

      {/* Filters */}
      <FilterBar
        filter={filter}
        sortOrder={sortOrder}
        onFilterChange={f => dispatch(setFilter(f))}
        onSortChange={s => dispatch(setSortOrder(s))}
      />

      {/* Task list */}
      <FlatList
        data={displayedTasks}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        contentContainerStyle={[
          styles.listContent,
          displayedTasks.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={tasks.length === 0 ? '🎯' : '🔍'}
            title={tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
            subtitle={
              tasks.length === 0
                ? 'Tap the + button to add your first task!'
                : 'Try adjusting your filters or search query.'
            }
          />
        }
        // Section headers for completed vs active
        ListFooterComponent={
          displayedTasks.length > 0 ? (
            <Text style={styles.listFooter}>
              Showing {displayedTasks.length} / {tasks.length} tasks
            </Text>
          ) : null
        }
      />

      <LoadingOverlay visible={loading && !refreshing} message="Loading tasks…" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Spacing['2xl'],
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  greeting: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.textPrimary,
  },
  dateLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  avatarBtn: {
    ...Shadows.glow,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 46,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    padding: 0,
  },
  clearBtn: {
    color: Colors.textMuted,
    fontSize: 14,
    paddingLeft: Spacing.sm,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['4xl'],
  },
  listEmpty: {
    flex: 1,
  },
  listFooter: {
    textAlign: 'center',
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
});

export default HomeScreen;
