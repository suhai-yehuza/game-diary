'use client';

import { useMutation } from '@apollo/client';
import { X, AlertTriangle } from 'lucide-react';

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
        onSuccess();
      }
    },
    onError: (error: Error) => {
      console.error('Error deleting game log:', error);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Delete Game Log</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
            </div>
            <p className="text-gray-600">
              This action cannot be undone. This will permanently delete your game log for game{' '}
              <span className="font-medium">{gameLog.game_id}</span>.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Game Log'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
