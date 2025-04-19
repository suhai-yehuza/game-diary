import {
  useMutation,
  MutationFunctionOptions,
  NoInfer,
  Unmasked,
  ApolloError,
  FetchResult,
  OperationVariables,
} from '@apollo/client';
import { useState, useCallback } from 'react';

import {
  UseMutationWithOptimisticUpdateOptions,
  GQLValidationError,
} from '@/lib/types/consolidated.types';

export function useMutationWithOptimisticUpdate<TData, TVariables extends OperationVariables>({
  mutation,
  update,
  optimisticResponse,
  validate,
  onSuccess,
  onError,
}: UseMutationWithOptimisticUpdateOptions<TData, TVariables>) {
  const [validationErrors, setValidationErrors] = useState<GQLValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [mutate] = useMutation<TData, TVariables>(mutation, {
    update: (cache, result) => {
      if (update) {
        update(cache, result as FetchResult<TData>);
      }
    },
    onCompleted: data => {
      setIsLoading(false);
      setValidationErrors([]);
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: error => {
      setIsLoading(false);
      setValidationErrors([]);
      if (onError) {
        onError(error);
      }
    },
  });

  const execute = useCallback(
    async (variables: TVariables) => {
      try {
        setIsLoading(true);
        setValidationErrors([]);

        if (validate) {
          const errors = validate(variables);
          if (errors.length > 0) {
            setValidationErrors(errors);
            setIsLoading(false);
            return;
          }
        }

        const options: MutationFunctionOptions<TData, TVariables> = {
          variables,
          optimisticResponse: optimisticResponse
            ? (optimisticResponse(variables) as Unmasked<NoInfer<TData>>)
            : undefined,
        };

        await mutate(options);
      } catch (error) {
        if (error instanceof ApolloError) {
          const { graphQLErrors, networkError } = error;

          if (graphQLErrors?.length) {
            const validationErrors = graphQLErrors
              .filter(err => err.extensions?.code === 'BAD_USER_INPUT')
              .map(err => ({
                field: String(err.extensions?.field || 'unknown'),
                message: err.message,
              }));

            if (validationErrors.length > 0) {
              setValidationErrors(validationErrors);
            }
          }

          if (networkError) {
            console.error('Network error:', networkError);
          }
        }

        setIsLoading(false);
      }
    },
    [mutate, validate, optimisticResponse]
  );

  return {
    execute,
    isLoading,
    validationErrors,
    clearValidationErrors: () => setValidationErrors([]),
  };
}
