'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';

import { useToast } from '@/components/ui/use-toast';
import { CREATE_GAME_LOG } from '@/lib/graphql/mutations';
import { GET_GAMES } from '@/lib/graphql/queries';
import type {
  CreateGameLogInput,
  ValidationError as GQLValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  BusinessLogicError,
} from '@/lib/types/generated/graphql';

interface UseCreateGameLogProps {
  onSuccess?: () => void;
}

export function useCreateGameLog({ onSuccess }: UseCreateGameLogProps = {}) {
  const { toast } = useToast();
  const { user } = useUser();

  const { data: gamesData, loading: gamesLoading } = useQuery(GET_GAMES, {
    variables: {
      filters: {
        date: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        },
      },
    },
  });

  const handleError = (
    error:
      | GQLValidationError
      | NotFoundError
      | AuthenticationError
      | AuthorizationError
      | RateLimitError
      | BusinessLogicError
  ) => {
    if (error.__typename === 'ValidationError') {
      toast({
        title: 'Validation Error',
        description: `${error.field}: ${error.message}`,
      });
      return;
    }

    switch (error.__typename) {
      case 'NotFoundError':
        toast({
          title: 'Not Found',
          description: error.message,
        });
        break;
      case 'AuthenticationError':
      case 'AuthorizationError':
      case 'BusinessLogicError':
        toast({
          title: error.__typename,
          description: error.message,
        });
        break;
      case 'RateLimitError':
        toast({
          title: 'Rate Limit Exceeded',
          description: `Please try again in ${error.retryAfter} seconds`,
        });
        break;
    }
  };

  const [createGameLog, { loading }] = useMutation(CREATE_GAME_LOG, {
    onCompleted: data => {
      if (data.createGameLog.__typename === 'GameLog') {
        toast({
          title: 'Success',
          description: 'Game log created successfully',
        });
        onSuccess?.();
      } else {
        handleError(data.createGameLog);
      }
    },
    onError: error => {
      toast({
        title: 'Error',
        description: error.message,
      });
    },
  });

  const submitGameLog = async (data: CreateGameLogInput) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a game log',
      });
      return;
    }

    try {
      await createGameLog({
        variables: {
          input: {
            ...data,
            userId: user.id,
          },
        },
      });
    } catch (error) {
      console.error('Error creating game log:', error);
    }
  };

  return {
    user,
    gamesData,
    gamesLoading,
    loading,
    submitGameLog,
  };
}
