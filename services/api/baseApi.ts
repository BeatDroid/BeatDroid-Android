import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/config/constants';

/**
 * Base API configuration for RTK Query
 * Includes common configuration like base URL, headers, and error handling
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      // Add common headers here
      headers.set('Content-Type', 'application/json');
      // Add authentication token if available
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: ['Auth', 'User', 'Profile'], // Add your cache tag types here
});

// Export common hooks for reuse
export const {
  middleware: apiMiddleware,
  reducer: apiReducer,
  reducerPath: apiReducerPath,
} = baseApi;
