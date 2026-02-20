/**
 * types/index.ts
 * Central type definitions for the entire application.
 * Covers User, Task, Priority, Category, and Navigation types.
 */

// ─────────────────────────────────────────────
//  Authentication Types
// ─────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  /** Hashed password stored locally for demo purposes */
  passwordHash: string;
  createdAt: string;
  avatar?: string; // initials fallback supported
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─────────────────────────────────────────────
//  Task Types
// ─────────────────────────────────────────────

/** Three-level priority system */
export type Priority = 'low' | 'medium' | 'high' | 'critical';

/** Built-in categories — user can also add custom ones */
export type Category =
  | 'personal'
  | 'work'
  | 'health'
  | 'finance'
  | 'education'
  | 'shopping'
  | 'travel'
  | 'other';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  /** ISO date-time string when the task is scheduled to start */
  dateTime: string;
  /** ISO date-time string — when the task must be done by */
  deadline: string;
  priority: Priority;
  category: Category;
  /** Freeform tags for fine-grained filtering */
  tags: string[];
  completed: boolean;
  /** ISO date-time string when the task was created */
  createdAt: string;
  /** ISO date-time string when the task was last updated */
  updatedAt: string;
  /** Computed smart-sort score (higher = more urgent) */
  sortScore?: number;
}

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filter: TaskFilter;
  sortOrder: SortOrder;
}

// ─────────────────────────────────────────────
//  Filter & Sort Types
// ─────────────────────────────────────────────

export interface TaskFilter {
  status: 'all' | 'active' | 'completed';
  priority: Priority | 'all';
  category: Category | 'all';
  searchQuery: string;
  tag: string | null;
}

export type SortOrder = 'smart' | 'deadline' | 'priority' | 'createdAt' | 'alpha';

// ─────────────────────────────────────────────
//  Navigation Types
// ─────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type TaskStackParamList = {
  Home: undefined;
  AddTask: { taskId?: string }; // taskId signals edit mode
  TaskDetail: { taskId: string };
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

// ─────────────────────────────────────────────
//  Utility Types
// ─────────────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}
