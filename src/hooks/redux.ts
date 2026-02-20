/**
 * hooks/redux.ts
 * Typed wrappers for useDispatch and useSelector so all hooks
 * throughout the app get proper type inference without boilerplate.
 */
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

/** Typed dispatch hook — aware of all async thunks. */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Typed selector hook — full RootState autocomplete. */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
