import { z } from 'zod';

export const sendFriendRequestSchema = z.object({
  subscriberId: z.string().min(1, 'Subscriber ID is required'),
});

export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;
