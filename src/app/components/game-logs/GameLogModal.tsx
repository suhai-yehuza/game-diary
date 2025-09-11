'use client';

import { GameLogModal } from '@/app/components/game-logs/BaseGameLogModal';
import type {
  IGameLogModalProps,
  ICreateGameLogModalProps,
  IEditGameLogModalProps,
  UnifiedGameLogModalProps,
} from '@/types';

/**
 * Unified Game Log Modal Component
 *
 * This component provides a single interface for both creating and editing game logs.
 * It automatically handles the mode-specific logic and provides better type safety.
 *
 * @param props - The modal props (mode-specific)
 * @returns JSX.Element
 */
export function UnifiedGameLogModal(props: UnifiedGameLogModalProps) {
  // Type-safe props based on mode
  const modalProps: IGameLogModalProps = {
    isOpen: props.isOpen,
    onClose: props.onClose,
    mode: props.mode || 'create',
    onSuccess: props.onSuccess,
    ...(props.mode === 'create'
      ? { preSelectedGame: props.preSelectedGame }
      : { gameLog: props.gameLog }),
  };

  return <GameLogModal {...modalProps} />;
}

// Convenience components for backward compatibility and cleaner usage
export function CreateGameLogModal(props: Omit<ICreateGameLogModalProps, 'mode'>) {
  return <UnifiedGameLogModal {...props} mode="create" />;
}

export function EditGameLogModal(props: Omit<IEditGameLogModalProps, 'mode'>) {
  return <UnifiedGameLogModal {...props} mode="edit" />;
}

// Export the main unified component as default
export default UnifiedGameLogModal;
