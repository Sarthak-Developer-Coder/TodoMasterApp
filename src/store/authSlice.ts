/**
 * store/authSlice.ts
 * Redux slice for user authentication state.
 * Handles register, login, logout, and error clearing.
 * Uses local AsyncStorage for persistence (swappable with Firebase).
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, RegisterPayload, LoginPayload, User } from '../types';
import { authService } from '../services/authService';

// ─────────────────────────────────────────────
//  Initial State
// ─────────────────────────────────────────────
const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// ─────────────────────────────────────────────
//  Async Thunks
// ─────────────────────────────────────────────

/**
 * Registers a new user account.
 * Validates uniqueness of email before creating the account.
 */
export const registerUser = createAsyncThunk<User, RegisterPayload, { rejectValue: string }>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const user = await authService.register(payload);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  },
);

/**
 * Logs in an existing user with email and password.
 */
export const loginUser = createAsyncThunk<User, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const user = await authService.login(payload);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  },
);

/**
 * Restores the authenticated session from local storage on app start.
 */
export const restoreSession = createAsyncThunk<User | null, void, { rejectValue: string }>(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Session restore failed');
    }
  },
);

// ─────────────────────────────────────────────
//  Slice
// ─────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Clears the current user session (logout). */
    logout(state) {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
      authService.logout(); // clear persisted session
    },
    /** Resets any auth error message. */
    clearError(state) {
      state.error = null;
    },
    /** Updates the current user's profile info. */
    updateUserProfile(state, action: PayloadAction<Partial<User>>) {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
  },
  extraReducers: builder => {
    // ── Register ────────────────────────────────
    builder
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });

    // ── Login ────────────────────────────────────
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });

    // ── Restore Session ──────────────────────────
    builder
      .addCase(restoreSession.pending, state => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentUser = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(restoreSession.rejected, state => {
        state.loading = false;
      });
  },
});

export const { logout, clearError, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
