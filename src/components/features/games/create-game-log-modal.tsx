'use client';

import { SignInButton } from '@clerk/nextjs';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { CLASSIFICATIONS, WATCHED_SETTINGS } from '@/lib/types/config.types';
import type { CreateGameLogModalProps } from '@/lib/types/consolidated.types';

import { GameLogForm } from './GameLogForm';
import { useCreateGameLog } from './hooks/useCreateGameLog';

export function CreateGameLogModal({ gameId, onSuccess }: CreateGameLogModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { user, gamesData, gamesLoading, loading, submitGameLog } = useCreateGameLog({
    onSuccess: () => {
      setIsOpen(false);
      onSuccess?.();
    },
  });

  const defaultValues = {
    watchedSetting: WATCHED_SETTINGS.TV,
    watchedCount: 1,
    classification: CLASSIFICATIONS.PROTECTED,
    gameId: gameId,
    ratingForGame: 3,
  };

  if (!user?.id) {
    return (
      <SignInButton mode="modal">
        <Button
          variant="outline"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
        >
          Sign in to Create Game Log
        </Button>
      </SignInButton>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
        >
          Create a Game Log
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl border border-neutral-800 bg-[#181C23] p-6 shadow-2xl dark:bg-[#181C23] dark:border-neutral-800 dark:shadow-[0_0_24px_rgba(0,0,0,0.7)]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-bold text-white">Create a Game Log</DialogTitle>
          <DialogDescription className="text-xs text-neutral-400">
            Fill in the details about where and when you watched the game, along with your rating.
          </DialogDescription>
        </DialogHeader>
        <div className="relative mt-2">
          <GameLogForm
            onSubmit={submitGameLog}
            loading={loading}
            gamesData={gamesData}
            gamesLoading={gamesLoading}
            defaultValues={defaultValues}
            hideGameSelect={!!gameId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
