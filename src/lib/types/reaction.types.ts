import type { Reaction } from './generated/graphql';

export type { Reaction };

export interface ReactionPickerProps {
  targetId: string;
  targetType: string;
  existingReactions?: Reaction[];
  onReactionChanged?: () => void;
}
