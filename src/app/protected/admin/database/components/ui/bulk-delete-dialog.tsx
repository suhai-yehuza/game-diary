'use client';

import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import React from 'react';

import { Button } from '@/app/protected/admin/database/components/ui/button';
import type { BulkDeleteDialogProps } from '@/types';

export function BulkDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  itemLabel,
  isDeleting,
}: BulkDeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-surface-modal rounded-lg shadow-xl border border-theme-primary max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-semantic-error/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-semantic-error" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-primary">
                Delete {selectedCount} {itemLabel}
              </h3>
              <p className="text-sm text-theme-muted">This action cannot be undone</p>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-theme-primary">
              Are you sure you want to delete <span className="font-semibold">{selectedCount}</span>{' '}
              {itemLabel}? This action will permanently remove the selected records from the
              database.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isDeleting} className="px-4 py-2">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {selectedCount} {itemLabel}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
