/**
 * store/index.ts
 * Configures the Redux store with redux-persist for local persistence.
 * Both auth and tasks state are persisted to AsyncStorage so the user
 * stays logged in and their tasks survive app restarts.
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './authSlice';
import tasksReducer from './tasksSlice';

// ─────────────────────────────────────────────
//  Persist Configurations
// ─────────────────────────────────────────────

/** Auth persist: keep currentUser & isAuthenticated; skip transient states */
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['currentUser', 'isAuthenticated'],
};

/** Tasks persist: keep tasks array and filter; skip transient loading/error */
const tasksPersistConfig = {
  key: 'tasks',
  storage: AsyncStorage,
  whitelist: ['tasks', 'filter', 'sortOrder'],
};

// ─────────────────────────────────────────────
//  Root Reducer
// ─────────────────────────────────────────────
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  tasks: persistReducer(tasksPersistConfig, tasksReducer),
});

// ─────────────────────────────────────────────
//  Store
// ─────────────────────────────────────────────
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // Required when using redux-persist to avoid serialization warnings
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// ─────────────────────────────────────────────
//  Type Exports
// ─────────────────────────────────────────────
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
