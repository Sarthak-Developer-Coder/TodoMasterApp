/**
 * services/taskService.ts
 * ─────────────────────────────────────────────
 * CRUD service for task management, backed by AsyncStorage.
 * All tasks for all users are stored under a single key as a JSON array
 * and filtered per user on read.
 *
 * This design makes it trivial to swap AsyncStorage for a real REST/GraphQL
 * backend — just replace the implementation of each method.
 */

import { Task } from '../types';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import uuid from 'react-native-uuid';

// ─────────────────────────────────────────────
//  Internal helpers
// ─────────────────────────────────────────────
async function readAll(): Promise<Task[]> {
  return (await getItem<Task[]>(STORAGE_KEYS.TASKS)) ?? [];
}

async function writeAll(tasks: Task[]): Promise<void> {
  await setItem(STORAGE_KEYS.TASKS, tasks);
}

// ─────────────────────────────────────────────
//  Task Service
// ─────────────────────────────────────────────
export const taskService = {
  /**
   * Returns all tasks belonging to the given user, sorted by createdAt desc.
   */
  async getTasksByUser(userId: string): Promise<Task[]> {
    const all = await readAll();
    return all
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Returns a single task by id.
   * Throws if not found.
   */
  async getTaskById(taskId: string): Promise<Task> {
    const all = await readAll();
    const task = all.find(t => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    return { ...task };
  },

  /**
   * Creates a new task and persists it.
   */
  async createTask(
    data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'sortScore'>,
  ): Promise<Task> {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...data,
      id: uuid.v4() as string,
      createdAt: now,
      updatedAt: now,
    };

    const all = await readAll();
    all.push(newTask);
    await writeAll(all);

    return { ...newTask };
  },

  /**
   * Partially updates a task by id.
   * Automatically updates the `updatedAt` timestamp.
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const all = await readAll();
    const index = all.findIndex(t => t.id === taskId);
    if (index === -1) throw new Error(`Task ${taskId} not found`);

    all[index] = {
      ...all[index],
      ...updates,
      id: taskId, // prevent overwriting id
      updatedAt: new Date().toISOString(),
    };

    await writeAll(all);
    return { ...all[index] };
  },

  /**
   * Permanently deletes a task by id.
   */
  async deleteTask(taskId: string): Promise<void> {
    const all = await readAll();
    const filtered = all.filter(t => t.id !== taskId);
    await writeAll(filtered);
  },

  /**
   * Deletes all tasks belonging to a user (used on account deletion).
   */
  async deleteAllByUser(userId: string): Promise<void> {
    const all = await readAll();
    await writeAll(all.filter(t => t.userId !== userId));
  },

  /**
   * Returns aggregated statistics for dashboard display.
   */
  async getStats(userId: string): Promise<{
    total: number;
    completed: number;
    active: number;
    overdue: number;
    completionRate: number;
  }> {
    const tasks = await this.getTasksByUser(userId);
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
  },
};
