import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { apiMiddleware, apiReducer, apiReducerPath } from '@/services/api/baseApi';
import authReducer from '@/features/auth/slice';

/**
 * Redux store configuration
 * Combines reducers, middleware, and enables RTK Query features
 */
export const store = configureStore({
  reducer: {
    [apiReducerPath]: apiReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiMiddleware),
});

// Enable refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch);

// Typed versions of useDispatch and useSelector for better TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
