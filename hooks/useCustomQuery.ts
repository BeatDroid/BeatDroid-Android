import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';

export interface CustomQueryOptions<TData, TError> extends Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryFn'> {
  queryFn: () => Promise<TData>;
}

export function useCustomQuery<TData, TError = unknown>(
  options: CustomQueryOptions<TData, TError>
) {
  return useQuery<TData, TError>({
    ...options,
    queryKey: options.queryKey,
    queryFn: options.queryFn,
  });
}
