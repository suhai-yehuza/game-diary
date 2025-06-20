// Types and interfaces for GraphQL mutations

import type { CLASSIFICATION } from '@src/lib/types';
import type { IGameLogInput } from '@src/lib/types/consolidated.types';

export type Classification = keyof typeof CLASSIFICATION;
export type ParentType = 'game_log' | 'comment';
export const ParentTypeValue = { GameLog: 'game_log' as const, Comment: 'comment' as const };

export type MutationCreateGameLogArgs = { input: IGameLogInput };
export type MutationUpdateGameLogArgs = { id: string; input: Partial<IGameLogInput> };
export type MutationDeleteGameLogArgs = { id: string };
export type MutationCreateCommentArgs = {
  input: { content: string; parentId: string; parentType: ParentType };
};
export type MutationUpdateCommentArgs = { id: string; input: { content: string } };
export type MutationDeleteCommentArgs = { id: string };
export type MutationDeleteReactionArgs = { id: string };
export type CreateReactionInput = { emoji: string; targetId: string; targetType: string };
export type CreateReactionResponse = {
  reaction?: {
    id: string;
    emoji: string;
    userId: string;
    targetId: string;
    targetType: string;
    createdAt: Date;
    updatedAt: Date;
  };
  errors?: Array<{
    message: string;
    code: string;
  }>;
};
