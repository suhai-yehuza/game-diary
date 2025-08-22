'use client';

import { useMutation } from '@apollo/client';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/Card';
import { DELETE_GAME_LOG } from '@/lib/graphql/mutations';
import type { IDeleteGameLogModalProps } from '@/lib/types';

export function DeleteGameLogModal({
  gameLog,
  isOpen,
  onClose,
  onSuccess,
}: IDeleteGameLogModalProps) {
  const [deleteGameLog, { loading }] = useMutation(DELETE_GAME_LOG, {
    onCompleted: (data: { deleteGameLog: { success: boolean; errors: unknown[] } }) => {
      if (data?.deleteGameLog?.success) {
        toast.success('Game log deleted');
        onSuccess();
      } else {
        const errors = (data?.deleteGameLog?.errors as Array<{ message?: string }>) ?? [];
        const message = errors[0]?.message ?? 'Failed to delete game log';
        toast.error(message);
      }
    },
    onError: (error: Error) => {
      console.error('Error deleting game log:', error);
      toast.error('Failed to delete game log');
    },
  });

  const handleDelete = async () => {
    try {
      await deleteGameLog({
        variables: {
          id: gameLog.id,
        },
      });
    } catch (error) {
      console.error('Error deleting game log:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 transition-all">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <Card className="relative w-full max-w-md mx-4 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="p-6 text-neutral-900 dark:text-neutral-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-semantic-error/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-semantic-error" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Delete Game Log
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="mb-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">
              You&apos;re about to{' '}
              <span className="font-semibold text-semantic-error">permanently delete</span> your
              game log for{' '}
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                game {gameLog.game_id}
              </span>
              .
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-2">
              This action cannot be undone and will remove all associated data including comments
              and reactions.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 font-medium transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleDelete()}
              disabled={loading}
              className="flex-1 h-11 bg-semantic-error hover:bg-semantic-error/90 text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </div>
              ) : (
                'Delete Game Log'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
