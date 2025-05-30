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
      <DialogContent className="fixed left-[50%] top-[50%] z-50 w-[90%] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-2 shadow-2xl backdrop-blur-md supports-[backdrop-filter]:bg-background/95 my-1 mx-auto">
        <DialogHeader className="space-y-0.5">
          <DialogTitle className="text-base font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
            Create Game Log
          </DialogTitle>
          <DialogDescription className="text-[10px] text-muted-foreground">
            Record your game watching experience
          </DialogDescription>
        </DialogHeader>
        <div className="relative mt-0.5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-purple-600/40 rounded-lg" />
          <div className="relative p-1.5">
            <GameLogForm
              onSubmit={submitGameLog}
              loading={loading}
              gamesData={gamesData}
              gamesLoading={gamesLoading}
              defaultValues={defaultValues}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
