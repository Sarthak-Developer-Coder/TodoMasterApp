/**
 * utils/sortAlgorithm.ts
 * ─────────────────────────────────────────────
 * SMART SORT ALGORITHM
 * ─────────────────────────────────────────────
 * Computes a numeric urgency score for each task using a weighted blend of:
 *
 *  1. Priority Weight    (40%) — critical=4, high=3, medium=2, low=1
 *  2. Deadline Urgency   (40%) — exponential decay based on time until deadline
 *  3. Age Penalty        (20%) — older tasks get a slight boost to avoid starvation
 *
 * Final score is in [0..10]. Higher = more urgent = sorts first.
 *
 * Completed tasks receive score = -1 so they sink to the bottom.
 */

import { Task, Priority, SortOrder } from '../types';
import { differenceInHours, isPast } from 'date-fns';

// ─────────────────────────────────────────────
//  Priority weights
// ─────────────────────────────────────────────
const PRIORITY_WEIGHTS: Record<Priority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Calculates the deadline urgency component [0..1].
 * Uses a logistic/exponential curve:
 *   - overdue tasks  → 1.0 (maximum urgency)
 *   - due in 1h      → ~0.98
 *   - due in 24h     → ~0.85
 *   - due in 72h     → ~0.55
 *   - due in 1 week  → ~0.20
 *   - due in 30 days → ~0.03
 */
function deadlineUrgency(deadlineISO: string): number {
  const now = new Date();
  const deadline = new Date(deadlineISO);
  const hoursLeft = differenceInHours(deadline, now);

  if (hoursLeft <= 0) return 1.0; // overdue — maximum urgency

  // Exponential decay: urgency = e^(-k * hoursLeft)
  // k = 0.007 produces the curve described above
  const k = 0.007;
  return Math.exp(-k * hoursLeft);
}

/**
 * Normalised age component [0..1].
 * Tasks created more than 30 days ago get full boost.
 */
function ageBoost(createdAtISO: string): number {
  const now = new Date();
  const created = new Date(createdAtISO);
  const ageHours = differenceInHours(now, created);
  const maxAgeHours = 30 * 24; // 30 days cap
  return Math.min(ageHours / maxAgeHours, 1.0);
}

/**
 * Main scoring function.
 * Returns a score in [0..10]. Higher = should appear earlier in the list.
 */
export function calculateSmartScore(task: Task): number {
  if (task.completed) return -1; // completed tasks sorted to the bottom

  const priorityNorm = PRIORITY_WEIGHTS[task.priority] / 4; // → [0.25..1]
  const dlUrgency = deadlineUrgency(task.deadline);
  const age = ageBoost(task.createdAt);

  // Weighted sum
  const raw = priorityNorm * 0.40 + dlUrgency * 0.40 + age * 0.20;
  return parseFloat((raw * 10).toFixed(4)); // scale to [0..10]
}

// ─────────────────────────────────────────────
//  Sort Comparators
// ─────────────────────────────────────────────

/** Comparator factory — returns a compare fn for Array.sort */
export function getComparator(order: SortOrder) {
  return (a: Task, b: Task): number => {
    // Always float active tasks above completed ones
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    switch (order) {
      case 'smart':
        return (b.sortScore ?? 0) - (a.sortScore ?? 0);

      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();

      case 'priority': {
        const diff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
        if (diff !== 0) return diff;
        // tie-break by deadline
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }

      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

      case 'alpha':
        return a.title.localeCompare(b.title);

      default:
        return 0;
    }
  };
}

/**
 * Sorts and filters a task list according to the active filter and sort order.
 *
 * @param tasks   - full list of tasks
 * @param filter  - active filter state from the store
 * @param order   - requested sort order
 * @returns       - filtered & sorted copy of the list
 */
export function sortAndFilterTasks(
  tasks: Task[],
  filter: {
    status: 'all' | 'active' | 'completed';
    priority: string;
    category: string;
    searchQuery: string;
    tag: string | null;
  },
  order: SortOrder,
): Task[] {
  let result = [...tasks];

  // 1. Status filter
  if (filter.status === 'active') {
    result = result.filter(t => !t.completed);
  } else if (filter.status === 'completed') {
    result = result.filter(t => t.completed);
  }

  // 2. Priority filter
  if (filter.priority !== 'all') {
    result = result.filter(t => t.priority === filter.priority);
  }

  // 3. Category filter
  if (filter.category !== 'all') {
    result = result.filter(t => t.category === filter.category);
  }

  // 4. Tag filter
  if (filter.tag) {
    result = result.filter(t => t.tags.includes(filter.tag!));
  }

  // 5. Text search (title + description)
  if (filter.searchQuery.trim()) {
    const q = filter.searchQuery.toLowerCase().trim();
    result = result.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q)),
    );
  }

  // 6. Sort
  result.sort(getComparator(order));

  return result;
}

/** Returns true if a task is overdue and not yet completed. */
export function isOverdue(task: Task): boolean {
  return !task.completed && isPast(new Date(task.deadline));
}

/** Returns true if deadline is within the next N hours. */
export function isDueSoon(task: Task, withinHours = 24): boolean {
  if (task.completed) return false;
  const hoursLeft = differenceInHours(new Date(task.deadline), new Date());
  return hoursLeft >= 0 && hoursLeft <= withinHours;
}
