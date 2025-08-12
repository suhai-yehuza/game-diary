'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import type { IGameLogsHeaderProps } from '@/lib/types';

export const GameLogsHeader = ({ onCreateClick }: IGameLogsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold">Game Logs</h2>
      <Button
        onClick={onCreateClick}
        className="flex items-center gap-2 bg-blue-600 text-white rounded-full px-5 py-2 font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      >
        <Plus className="w-4 h-4" />
        Create New Log
      </Button>
    </div>
  );
};
