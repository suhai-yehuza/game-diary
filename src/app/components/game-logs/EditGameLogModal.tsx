'use client';

import { GameLogModal } from '@/app/components/game-logs/GameLogModal';
import type { IEditGameLogModalProps } from '@/lib/types';

export function EditGameLogModal(props: IEditGameLogModalProps) {
  return <GameLogModal {...props} mode="edit" />;
}
