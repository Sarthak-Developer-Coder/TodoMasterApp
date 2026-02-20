/**
 * utils/dateUtils.ts
 * Utility functions for date formatting, relative display, and validation.
 */

import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  differenceInHours,
  differenceInMinutes,
  parseISO,
  isValid,
} from 'date-fns';

// ─────────────────────────────────────────────
//  Formatting
// ─────────────────────────────────────────────

/** "Mon, Jan 15" */
export const formatDate = (iso: string): string => {
  const d = parseISO(iso);
  if (!isValid(d)) return '—';
  return format(d, 'EEE, MMM d');
};

/** "Jan 15, 2025" */
export const formatDateLong = (iso: string): string => {
  const d = parseISO(iso);
  if (!isValid(d)) return '—';
  return format(d, 'MMM d, yyyy');
};

/** "3:45 PM" */
export const formatTime = (iso: string): string => {
  const d = parseISO(iso);
  if (!isValid(d)) return '—';
  return format(d, 'h:mm a');
};

/** "Jan 15 · 3:45 PM" */
export const formatDateTime = (iso: string): string => {
  const d = parseISO(iso);
  if (!isValid(d)) return '—';
  return format(d, 'MMM d · h:mm a');
};

/** "Jan 15, 2025 at 3:45 PM" */
export const formatDateTimeLong = (iso: string): string => {
  const d = parseISO(iso);
  if (!isValid(d)) return '—';
  return format(d, "MMM d, yyyy 'at' h:mm a");
};

// ─────────────────────────────────────────────
//  Relative / Smart labels
// ─────────────────────────────────────────────

/**
 * Returns a human-friendly label for a deadline:
 *   "Overdue 2h ago", "Due in 45 min", "Today 3:45 PM", "Tomorrow 9:00 AM", "Jan 15"
 */
export const getDeadlineLabel = (iso: string): string => {
  const d = parseISO(iso);
  if (!isValid(d)) return '—';

  const now = new Date();

  if (isPast(d)) {
    const minutesAgo = differenceInMinutes(now, d);
    if (minutesAgo < 60) return `Overdue ${minutesAgo}m ago`;
    const hoursAgo = differenceInHours(now, d);
    if (hoursAgo < 24) return `Overdue ${hoursAgo}h ago`;
    return `Overdue · ${formatDate(iso)}`;
  }

  const minsLeft = differenceInMinutes(d, now);
  if (minsLeft < 60) return `Due in ${minsLeft}m`;

  const hoursLeft = differenceInHours(d, now);
  if (hoursLeft < 24) return `Due in ${hoursLeft}h`;

  if (isToday(d)) return `Today · ${formatTime(iso)}`;
  if (isTomorrow(d)) return `Tomorrow · ${formatTime(iso)}`;

  return formatDate(iso);
};

/** "2 hours ago", "in 3 days", etc. */
export const fromNow = (iso: string): string => {
  const d = parseISO(iso);
  if (!isValid(d)) return '—';
  return formatDistanceToNow(d, { addSuffix: true });
};

// ─────────────────────────────────────────────
//  Deadline urgency color
// ─────────────────────────────────────────────
export const getDeadlineColor = (iso: string, completed: boolean): string => {
  if (completed) return '#10B981'; // green
  const d = parseISO(iso);
  if (!isValid(d)) return '#9CA3AF';
  const hours = differenceInHours(d, new Date());
  if (hours < 0) return '#EF4444';   // overdue
  if (hours < 3) return '#FF3366';   // critical
  if (hours < 24) return '#F59E0B';  // warning
  return '#9CA3AF';                   // normal
};

// ─────────────────────────────────────────────
//  Validation
// ─────────────────────────────────────────────

/** True when the ISO string is a valid future (or present) datetime. */
export const isFutureDate = (iso: string): boolean => {
  const d = parseISO(iso);
  return isValid(d) && !isPast(d);
};

/** True when the deadline is after the start dateTime. */
export const isDeadlineAfterStart = (dateTimeISO: string, deadlineISO: string): boolean => {
  const start = parseISO(dateTimeISO);
  const end = parseISO(deadlineISO);
  return isValid(start) && isValid(end) && end > start;
};

/** Returns today's date at midnight as ISO string. */
export const todayISO = (): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

/** Returns a date N hours from now as ISO string. */
export const hoursFromNowISO = (hours: number): string => {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
};

export const nowISO = (): string => new Date().toISOString();
