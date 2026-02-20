/**
 * store/tasksSlice.ts
 * Redux slice for task management.
 * Handles CRUD operations, filtering, sorting, and completion toggling.
 * All tasks are persisted in AsyncStorage via the redux-persist setup.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, TasksState, TaskFilter, SortOrder, Priority, Category } from '../types';
import { taskService } from '../services/taskService';
import { calculateSmartScore } from '../utils/sortAlgorithm';

// ─────────────────────────────────────────────
//  Initial State
// ─────────────────────────────────────────────
const initialFilter: TaskFilter = {
  status: 'all',
  priority: 'all',
  category: 'all',
  searchQuery: '',
  tag: null,
};

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  filter: initialFilter,
  sortOrder: 'smart',
};

// ─────────────────────────────────────────────
//  Async Thunks
// ─────────────────────────────────────────────

/** Loads all tasks for the currently authenticated user. */
export const fetchTasks = createAsyncThunk<Task[], string, { rejectValue: string }>(
  'tasks/fetchAll',
  async (userId, { rejectWithValue }) => {
    try {
      const tasks = await taskService.getTasksByUser(userId);
      // Attach smart scores to each task
      return tasks.map(t => ({ ...t, sortScore: calculateSmartScore(t) }));
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load tasks');
    }
  },
);

/** Adds a new task and persists it. */
export const addTask = createAsyncThunk<Task, Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'sortScore'>, { rejectValue: string }>(
  'tasks/add',
  async (taskData, { rejectWithValue }) => {
    try {
      const task = await taskService.createTask(taskData);
      return { ...task, sortScore: calculateSmartScore(task) };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add task');
    }
  },
);

/** Updates an existing task. */
export const updateTask = createAsyncThunk<Task, { id: string; updates: Partial<Task> }, { rejectValue: string }>(
  'tasks/update',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const task = await taskService.updateTask(id, updates);
      return { ...task, sortScore: calculateSmartScore(task) };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update task');
    }
  },
);

/** Permanently deletes a task. */
export const deleteTask = createAsyncThunk<string, string, { rejectValue: string }>(
  'tasks/delete',
  async (taskId, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete task');
    }
  },
);

/** Toggles the completed state of a task. */
export const toggleTaskComplete = createAsyncThunk<Task, string, { rejectValue: string }>(
  'tasks/toggleComplete',
  async (taskId, { rejectWithValue, getState }) => {
    try {
      const state = (getState() as any).tasks as TasksState;
      const existing = state.tasks.find(t => t.id === taskId);
      if (!existing) throw new Error('Task not found');
      const task = await taskService.updateTask(taskId, { completed: !existing.completed });
      return { ...task, sortScore: calculateSmartScore(task) };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle task');
    }
  },
);

// ─────────────────────────────────────────────
//  Slice
// ─────────────────────────────────────────────
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    /** Sets a new filter configuration. */
    setFilter(state, action: PayloadAction<Partial<TaskFilter>>) {
      state.filter = { ...state.filter, ...action.payload };
    },
    /** Resets filter to defaults. */
    resetFilter(state) {
      state.filter = initialFilter;
    },
    /** Changes the sort order. */
    setSortOrder(state, action: PayloadAction<SortOrder>) {
      state.sortOrder = action.payload;
    },
    /** Updates the text search query. */
    setSearchQuery(state, action: PayloadAction<string>) {
      state.filter.searchQuery = action.payload;
    },
    /** Applies a priority filter. */
    setPriorityFilter(state, action: PayloadAction<Priority | 'all'>) {
      state.filter.priority = action.payload;
    },
    /** Applies a category filter. */
    setCategoryFilter(state, action: PayloadAction<Category | 'all'>) {
      state.filter.category = action.payload;
    },
    /** Clears all tasks (used on logout). */
    clearTasks(state) {
      state.tasks = [];
      state.filter = initialFilter;
      state.error = null;
    },
    /** Clears any error. */
    clearTaskError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // ── Fetch ────────────────────────────────────
    builder
      .addCase(fetchTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });

    // ── Add ──────────────────────────────────────
    builder
      .addCase(addTask.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });

    // ── Update ───────────────────────────────────
    builder
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload ?? 'Update failed';
      });

    // ── Delete ───────────────────────────────────
    builder
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload ?? 'Delete failed';
      });

    // ── Toggle Complete ──────────────────────────
    builder
      .addCase(toggleTaskComplete.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(toggleTaskComplete.rejected, (state, action) => {
        state.error = action.payload ?? 'Toggle failed';
      });
  },
});

export const {
  setFilter,
  resetFilter,
  setSortOrder,
  setSearchQuery,
  setPriorityFilter,
  setCategoryFilter,
  clearTasks,
  clearTaskError,
} = tasksSlice.actions;

export default tasksSlice.reducer;
