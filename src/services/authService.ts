/**
 * services/authService.ts
 * ─────────────────────────────────────────────
 * Local authentication service backed by AsyncStorage.
 *
 * Provides register / login / logout / getCurrentUser.
 * Passwords are hashed with a simple SHA-256-like deterministic function
 * (suitable for a demo; swap the hashPassword helper with bcrypt or
 * Firebase Auth in a production build).
 *
 * All user records are stored under STORAGE_KEYS.USERS as a JSON array.
 * The currently logged-in user's id is kept under STORAGE_KEYS.CURRENT_USER_ID.
 */

import { User, RegisterPayload, LoginPayload } from '../types';
import { getItem, setItem, removeItem, STORAGE_KEYS } from '../utils/storage';
import uuid from 'react-native-uuid';

// ─────────────────────────────────────────────
//  Password hashing (deterministic, demo-grade)
// ─────────────────────────────────────────────

/**
 * Very lightweight deterministic hash for demo purposes.
 * In production, use a proper password hashing library.
 */
function hashPassword(password: string): string {
  let hash = 0;
  const salt = 'TODOMASTER_SALT_2025';
  const salted = password + salt;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// ─────────────────────────────────────────────
//  Auth Service
// ─────────────────────────────────────────────
export const authService = {
  /**
   * Creates a new user account.
   * Throws if the email is already registered.
   */
  async register(payload: RegisterPayload): Promise<User> {
    const { name, email, password } = payload;

    // Validate inputs
    if (!name.trim()) throw new Error('Name is required');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Please enter a valid email address');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const users = (await getItem<User[]>(STORAGE_KEYS.USERS)) ?? [];

    // Check uniqueness
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error('An account with this email already exists');

    const newUser: User = {
      id: uuid.v4() as string,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await setItem(STORAGE_KEYS.USERS, users);
    await setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);

    // Return user without password hash exposed to the store
    return { ...newUser };
  },

  /**
   * Authenticates a user with email + password.
   * Throws with descriptive messages on failure.
   */
  async login(payload: LoginPayload): Promise<User> {
    const { email, password } = payload;

    const users = (await getItem<User[]>(STORAGE_KEYS.USERS)) ?? [];
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) throw new Error('No account found with this email');

    if (user.passwordHash !== hashPassword(password)) {
      throw new Error('Incorrect password');
    }

    await setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    return { ...user };
  },

  /**
   * Returns the currently persisted user, or null if not logged in.
   */
  async getCurrentUser(): Promise<User | null> {
    const userId = await getItem<string>(STORAGE_KEYS.CURRENT_USER_ID);
    if (!userId) return null;

    const users = (await getItem<User[]>(STORAGE_KEYS.USERS)) ?? [];
    const user = users.find(u => u.id === userId);
    return user ? { ...user } : null;
  },

  /**
   * Clears the current session (does not delete the account).
   */
  async logout(): Promise<void> {
    await removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  },

  /**
   * Updates a user's profile fields and writes back to storage.
   */
  async updateProfile(userId: string, updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> {
    const users = (await getItem<User[]>(STORAGE_KEYS.USERS)) ?? [];
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');

    users[index] = { ...users[index], ...updates };
    await setItem(STORAGE_KEYS.USERS, users);
    return { ...users[index] };
  },
};
