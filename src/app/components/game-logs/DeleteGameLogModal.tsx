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
      <Card className="w-full max-w-md mx-4 rounded-xl shadow-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900">
        <div className="p-8 text-gray-900 dark:text-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-7 h-7 text-red-600" />
              Delete Game Log
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Are you sure?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              This action cannot be undone. This will{' '}
              <span className="font-bold text-red-600">permanently delete</span> your game log for
              game <span className="font-semibold">{gameLog.game_id}</span>.
            </p>
          </div>

          <div className="flex justify-between pt-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-6 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium w-1/2 mr-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={loading}
              className="h-10 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed w-1/2 ml-2"
            >
              {loading ? 'Deleting...' : 'Delete Game Log'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
