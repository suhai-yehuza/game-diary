'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';

import { logger } from '@lib/core/logger';
import { useToast } from '@src/app/components/ui/use-toast';
import { CREATE_GAME_LOG } from '@src/lib/graphql/mutations';
import { GET_GAMES } from '@src/lib/graphql/queries';
import type { IGameLogInput } from '@src/lib/types/game-log.types';
import type { IUseCreateGameLogProps } from '@src/lib/types/misc.types';

export function useCreateGameLog({ onSuccess }: IUseCreateGameLogProps = {}) {
  const { toast } = useToast();
  const { user } = useUser();

  // Memoize variables to prevent infinite re-renders
  const gamesQueryVariables = useMemo(() => {
    if (!user?.id) return undefined;
    return {
      filters: {
        dateRange: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        },
      },
    };
  }, [user?.id]);

  const { data: gamesData, loading: gamesLoading } = useQuery(GET_GAMES, {
    variables: gamesQueryVariables,
    skip: !gamesQueryVariables,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-only',
  });

  const handleError = (error: Error | unknown) => {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'An error occurred',
    });
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

  const submitGameLog = async (data: IGameLogInput) => {
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
      logger.error('Error creating game log:', error);
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
