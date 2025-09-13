'use client';

import { Minus, Trash2 } from 'lucide-react';
import React from 'react';

import { Button } from '@/app/protected/admin/database/components/ui/button';
import type { BulkActionsBarProps } from '@/types';

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  isDeleting,
  itemLabel,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount;

  return (
    <div className="bg-bg-theme-secondary border border-theme-primary rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-bg-theme-secondary rounded flex items-center justify-center">
              <Minus className="w-4 h-4 text-theme-muted" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {selectedCount} of {totalCount} {itemLabel} selected
            </span>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={allSelected ? onDeselectAll : onSelectAll}
              disabled={isDeleting}
              className="text-xs"
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            disabled={isDeleting}
            className="text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete {selectedCount} {itemLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
