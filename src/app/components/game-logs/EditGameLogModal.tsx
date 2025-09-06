'use client';

import { GameLogModal } from '@/app/components/game-logs/GameLogModal';
import type { IEditGameLogModalProps } from '@/types';

export function EditGameLogModal(props: IEditGameLogModalProps) {
  return <GameLogModal {...props} mode="edit" />;
}
