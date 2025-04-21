import { useMutation, UseMutationOptions } from '@tanstack/react-query';

export interface CustomMutationOptions<TData, TVariables, TError, TContext>
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> {
  mutationFn: (variables: TVariables) => Promise<TData>;
}

export function useCustomMutation<TData, TVariables = void, TError = unknown, TContext = unknown>(
  options: CustomMutationOptions<TData, TVariables, TError, TContext>
) {
  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    mutationFn: options.mutationFn,
  });
}
