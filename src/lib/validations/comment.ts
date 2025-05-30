import { z } from 'zod';

export const createCommentSchema = z.object({
  parentId: z.string().min(1, 'Parent ID is required'),
  parentType: z.enum(['comment', 'game_log']).transform(val => val.toLowerCase()),
  content: z.string().min(1, 'Content is required').max(1000, 'Content too long'),
});
