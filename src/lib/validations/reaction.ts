import { z } from 'zod';

export const createReactionSchema = z.object({
  emoji: z.enum([
    '👍',
    '❤️',
    '😂',
    '😮',
    '😢',
    '😠',
    '🔥',
    '👏',
    '👀',
    '🚀',
    '💪',
    '🐐',
    '🎯',
    '👎',
    '🏀',
    '⚽',
    '🏈',
    '⚾',
    '🎾',
    '⛳',
  ]),
  targetId: z.string(),
  targetType: z.enum(['game_log', 'comment']),
});
