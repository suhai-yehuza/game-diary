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

export function CreateGameLogModal({ game_id, onSuccess }: CreateGameLogModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { user, gamesData, gamesLoading, loading, submitGameLog } = useCreateGameLog({
    onSuccess: () => {
      setIsOpen(false);
      onSuccess?.();
    },
  });

  const defaultValues = {
    watched_setting: WATCHED_SETTINGS.TV,
    watched_count: 1,
    classification: CLASSIFICATIONS.PROTECTED,
    game_id: game_id,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Game Log</DialogTitle>
          <DialogDescription>Record your game watching experience</DialogDescription>
        </DialogHeader>
        <GameLogForm
          onSubmit={submitGameLog}
          loading={loading}
          gamesData={gamesData}
          gamesLoading={gamesLoading}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  );
}
