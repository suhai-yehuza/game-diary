import { useMutation } from '@apollo/client';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { DELETE_GAME_LOG } from '@/lib/graphql/mutations';
import type { GameLog } from '@/lib/types/generated/graphql';

import { GameLogModal } from './game-log-modal';

interface GameLogActionsProps {
  gameLog: GameLog;
  onSuccess?: () => void;
}

export function GameLogActions({ gameLog, onSuccess }: GameLogActionsProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthContext();
  const isOwner = user?.id === gameLog.userId;

  const [deleteGameLog, { loading: isDeleting }] = useMutation(DELETE_GAME_LOG, {
    onCompleted: data => {
      if (data?.deleteGameLog?.success) {
        toast({
          title: '🗑️ Deleted!',
          description: 'Your game log has been permanently deleted.',
        });
        setIsDeleteDialogOpen(false);
        onSuccess?.();
      } else {
        toast({
          title: '❌ Delete Failed',
          description: 'Something went wrong while deleting your game log. Please try again.',
          variant: 'destructive',
        });
        setIsDeleteDialogOpen(false);
      }
    },
    onError: error => {
      toast({
        title: '❌ Delete Failed',
        description:
          error.message || 'Failed to delete game log. Please check your connection and try again.',
        variant: 'destructive',
      });
      setIsDeleteDialogOpen(false);
    },
    update: (cache, { data }) => {
      if (data?.deleteGameLog?.success) {
        cache.evict({ id: cache.identify(gameLog) });
        cache.gc();
      }
    },
  });

  const handleDelete = async () => {
    await deleteGameLog({
      variables: { id: gameLog.id },
    });
  };

  const gameTitle = gameLog.game?.teams
    ? `${gameLog.game.teams.visitors?.name} vs ${gameLog.game.teams.home?.name}`
    : 'this game log';

  if (!isOwner) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-muted/50"
            onClick={e => e.stopPropagation()}
          >
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={e => {
              e.stopPropagation();
              setIsUpdateModalOpen(true);
            }}
            className="cursor-pointer"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={e => {
              e.stopPropagation();
              setIsDeleteDialogOpen(true);
            }}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Game Log</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your game log for{' '}
              <span className="font-semibold">{gameTitle}</span>?
              <br />
              <br />
              This action cannot be undone and will permanently remove the game log from your
              account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Game Log'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      <GameLogModal
        gameId={gameLog.gameId}
        mode="update"
        gameLog={gameLog}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={() => {
          setIsUpdateModalOpen(false);
          onSuccess?.();
        }}
      />
    </>
  );
}
