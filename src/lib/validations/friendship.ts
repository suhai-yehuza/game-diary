import { z } from 'zod';

import { FRIENDSHIP_STATUS } from '@src/lib/types';

export const sendFriendRequestSchema = z.object({
  userId: z.string().uuid(),
});

export const friendshipIdSchema = z.object({
  friendshipId: z.string().uuid(),
});

export const updateFriendshipStatusSchema = z.object({
  friendshipId: z.string().uuid(),
  status: z.enum([
    FRIENDSHIP_STATUS.ACCEPTED,
    FRIENDSHIP_STATUS.BLOCKED,
    FRIENDSHIP_STATUS.PENDING,
    FRIENDSHIP_STATUS.REJECTED,
  ]),
});

export default {
  sendFriendRequestSchema,
  friendshipIdSchema,
  updateFriendshipStatusSchema,
};
