import { useMutation } from '@apollo/client/react';
import { SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { UPDATE_GAME_LOG } from '@/lib/graphql/mutations';
import { GET_GAME_LOGS } from '@/lib/graphql/queries';
import { GameLog, UpdateGameLogModalProps, GameLogFormData } from '@/lib/types';
import { cn } from '@/lib/utils';

import { GameLogForm } from './game-log-form';

export function UpdateGameLogModal({ gameLog, isOpen, setIsOpen }: UpdateGameLogModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { userId: auth_user_id } = useAuthContext();
  const [updateGameLog, { loading }] = useMutation(UPDATE_GAME_LOG, {
    update(cache, { data: { update_game_log } }) {
      try {
        const existingGameLogs = cache.readQuery<{
          user: {
            gameLogs: GameLog[];
          };
        }>({
          query: GET_GAME_LOGS,
          variables: { user_id: auth_user_id },
        });

        if (existingGameLogs?.user?.gameLogs && Array.isArray(existingGameLogs.user.gameLogs)) {
          const updatedGameLogs = existingGameLogs.user.gameLogs.map(log =>
            log.id === update_game_log.id ? update_game_log : log
          );

          cache.writeQuery({
            query: GET_GAME_LOGS,
            variables: { user_id: auth_user_id },
            data: {
              user: {
                ...existingGameLogs.user,
                gameLogs: updatedGameLogs,
              },
            },
          });
        }
      } catch (error) {
        console.error('Error updating cache:', error);
      }
    },
  });

  const [formData, setFormData] = useState<GameLogFormData>({
    watched_setting: gameLog.watchedSetting,
    watched_date: new Date(gameLog.watchedDate || Date.now()),
    watched_location: gameLog.watchedSetting,
    rating_for_game: gameLog.rating?.toString() || '',
    rating_stars: gameLog.rating || 0,
    watched_count: 1,
    notes: gameLog.notes || '',
    classification: gameLog.classification,
    tags: gameLog.tags || [],
  });

  const handleSubmit = async () => {
    if (!auth_user_id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to update a game log',
        variant: 'destructive',
      });
      return;
    }

    if (
      !formData.watched_setting ||
      !formData.watched_date ||
      !formData.watched_location ||
      !formData.rating_for_game ||
      !formData.classification
    ) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const rating = Number(formData.rating_for_game);
      if (isNaN(rating) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        toast({
          title: 'Invalid rating',
          description: 'Rating must be a whole number between 1 and 5',
          variant: 'destructive',
        });
        return;
      }

      const payload = {
        id: gameLog.id,
        watched_setting: formData.watched_setting.toLowerCase(),
        watched_date: formData.watched_date.toISOString(),
        watched_location: formData.watched_location || 'Home',
        rating_for_game: rating,
        classification: formData.classification,
      };

      const result = await updateGameLog({
        variables: payload,
      });

      if (result.data?.update_game_log) {
        toast({
          title: '🎉 Success!',
          description: 'Game log successfully updated',
          variant: 'default',
        });
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating game log:', error);
      toast({
        title: 'Error',
        description: 'Failed to update game log. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!auth_user_id) {
    return (
      <SignInButton mode="modal">
        <Button
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
          )}
        >
          Sign in to Update Game Log
        </Button>
      </SignInButton>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-foreground">Update Game Log</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update the details about where and when you watched the game.
          </DialogDescription>
        </DialogHeader>

        <GameLogForm
          formData={formData}
          setFormData={setFormData}
          selectedGame={null}
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
          submitLabel="Update Log"
        />
      </DialogContent>
    </Dialog>
  );
}
