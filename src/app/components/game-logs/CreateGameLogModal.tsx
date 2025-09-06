'use client';

import { GameLogModal } from '@/app/components/game-logs/GameLogModal';
import type { ICreateGameLogModalProps } from '@/types';

export function CreateGameLogModal(props: ICreateGameLogModalProps) {
  return <GameLogModal {...props} mode="create" preSelectedGame={props.preSelectedGame} />;
}
