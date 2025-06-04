import { useMutation } from '@apollo/client';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
  const { toast } = useToast();
  const { user } = useAuthContext();
  const isOwner = user?.id === gameLog.userId;

  const [deleteGameLog] = useMutation(DELETE_GAME_LOG, {
    onCompleted: () => {
      toast({
        title: 'Game log deleted',
        description: 'Your game log has been successfully deleted.',
      });
      onSuccess?.();
    },
    onError: error => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
    update: (cache, { data }) => {
      if (data?.deleteGameLog?.success) {
        cache.evict({ id: cache.identify(gameLog) });
        cache.gc();
      }
    },
  });

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this game log?')) {
      await deleteGameLog({
        variables: { id: gameLog.id },
      });
    }
  };

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
              handleDelete();
            }}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
