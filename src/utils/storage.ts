/**
 * utils/storage.ts
 * Thin wrapper around AsyncStorage with typed helpers.
 * Centralises all key names to prevent typos across the codebase.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────
//  Storage Keys
// ─────────────────────────────────────────────
export const STORAGE_KEYS = {
  USERS: '@todomaster:users',
  CURRENT_USER_ID: '@todomaster:currentUserId',
  TASKS: '@todomaster:tasks',
} as const;

// ─────────────────────────────────────────────
//  Generic Helpers
// ─────────────────────────────────────────────

/**
 * Reads and JSON-parses a value from AsyncStorage.
 * Returns null if the key doesn't exist or parsing fails.
 */
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * JSON-serialises and stores a value in AsyncStorage.
 */
export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[Storage] setItem failed for key "${key}":`, err);
  }
}

/**
 * Removes an item from AsyncStorage.
 */
export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.error(`[Storage] removeItem failed for key "${key}":`, err);
  }
}

/**
 * Removes multiple keys at once.
 */
export async function multiRemove(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (err) {
    console.error('[Storage] multiRemove failed:', err);
  }
}

/**
 * Clears ALL app storage (use only on account deletion / debug reset).
 */
export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (err) {
    console.error('[Storage] clearAll failed:', err);
  }
}
