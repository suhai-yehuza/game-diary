'use client';

import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/Card';
import { useOptimizedMutation } from '@/hooks/use-optimized-mutation';
import { DELETE_GAME_LOG } from '@/lib/graphql/mutations';
import { errorHandlers } from '@/lib/utils/error-handler';
import { ErrorCategory, ErrorSeverity } from '@/types';
import type { IDeleteGameLogModalProps, GameLogEdge } from '@/types';

// Helper function to generate optimistic response for delete mutation
function generateDeleteOptimisticResponse(_gameLog: Record<string, unknown>) {
  return {
    deleteGameLog: {
      success: true,
      errors: [],
      __typename: 'DeleteGameLogResponse',
    },
  };
}

export function DeleteGameLogModal({
  gameLog,
  isOpen,
  onClose,
  onSuccess,
}: IDeleteGameLogModalProps) {
  const [deleteGameLog, { loading, error: deleteError }] = useOptimizedMutation(DELETE_GAME_LOG, {
    context: {
      component: 'DeleteGameLogModal',
      action: 'Delete game log',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
    // Enable optimistic updates
    enableOptimisticUpdates: true,
    onCompleted: (data: {
      deleteGameLog?: { success?: boolean; errors?: Array<{ message?: string }> };
    }) => {
      if (data?.deleteGameLog?.success) {
        toast.success('Game log deleted');
        onSuccess?.();
        onClose();
      } else {
        // Rollback optimistic update on error
        const errors = data?.deleteGameLog?.errors ?? [];
        const message = errors[0]?.message ?? 'Failed to delete game log';
        toast.error(message);
        // The optimistic update will be automatically rolled back by Apollo
      }
    },
    onError: (error: unknown) => {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'React Component',
        action: 'Delete game log',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
      toast.error('Failed to delete game log');
      // The optimistic update will be automatically rolled back by Apollo
    },
  });

  const handleDelete = async () => {
    try {
      // Generate optimistic response
      const optimisticResponse = generateDeleteOptimisticResponse(gameLog);
      // Execute mutation with optimistic response and cache update
      /* eslint-disable @typescript-eslint/no-explicit-any */
      await deleteGameLog({
        variables: {
          id: gameLog.id,
        },
        optimisticResponse,
        update: (cache: any, { data }: any) => {
          // Apollo will automatically handle the optimistic update
          // This update function runs after the real mutation completes
          if (data?.deleteGameLog?.success) {
            // Remove the deleted game log from all gameLogs queries
            cache.modify({
              fields: {
                gameLogs(existingConnection: any, { readField }: any) {
                  if (!existingConnection) return existingConnection;

                  const edges = existingConnection.edges || [];
                  const filteredEdges = edges.filter((edge: GameLogEdge) => {
                    const nodeId = readField('id', edge.node);
                    return nodeId !== gameLog.id;
                  });

                  return {
                    ...existingConnection,
                    edges: filteredEdges,
                    totalCount: Math.max(0, existingConnection.totalCount - 1),
                  };
                },
              },
            });
          }
        },
      });
    } catch (error) {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'React Component',
        action: 'Delete game log',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 transition-all">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <Card className="relative w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Delete Game Log
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to{' '}
            <span className="font-semibold text-semantic-error">permanently delete</span> this game
            log? This action cannot be undone.
          </p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Game:</strong>{' '}
              {gameLog.game?.home_team?.name && gameLog.game?.away_team?.name
                ? `${gameLog.game.home_team.name} vs ${gameLog.game.away_team.name}`
                : `Game ID: ${gameLog.game_id || 'Unknown'}`}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Rating:</strong> {gameLog.rating_for_game}/5
            </p>
            {gameLog.notes && (
              <p className="text-sm text-gray-600">
                <strong>Notes:</strong> {gameLog.notes}
              </p>
            )}
            <p className="text-sm text-gray-600 mt-2">
              <em>This action cannot be undone.</em>
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleDelete()}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Deleting...' : 'Delete Game Log'}
          </Button>
        </div>

        {/* Display mutation errors */}
        {deleteError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              Error: {deleteError.message || 'Failed to delete game log'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
