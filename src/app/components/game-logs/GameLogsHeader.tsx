'use client';

import { Plus } from 'lucide-react';

import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { Button } from '@/app/components/ui/button';
import type { IGameLogsHeaderProps } from '@/lib/types';

export const GameLogsHeader = ({ onCreateClick }: IGameLogsHeaderProps) => {
  const isMobile = useMobileDetection();

  return (
    <div className="mb-8">
      {/* Page Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h2
            className={`font-bold text-neutral-900 dark:text-neutral-100 ${
              isMobile ? 'text-xl' : 'text-2xl'
            }`}
          >
            Game Logs
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Track and share your sports viewing experiences
          </p>
        </div>

        <Button
          onClick={onCreateClick}
          className={`flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200 ${
            isMobile ? 'px-4 py-2.5 text-sm w-full sm:w-auto' : 'px-6 py-2.5'
          }`}
        >
          <Plus className="w-4 h-4" />
          {isMobile ? 'New' : 'Create New Log'}
        </Button>
      </div>
    </div>
  );
};
