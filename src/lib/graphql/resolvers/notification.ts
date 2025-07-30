import { eq, and, desc, asc, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '@/lib/types';

// Notification Query Resolvers
export const notificationQueryResolvers = {
  // Get user notifications with filters
  userNotifications: async (
    _parent: unknown,
    args: {
      filters?: {
        read?: boolean;
        resolved?: boolean;
        type?: string;
        targetType?: string;
        createdAfter?: Date;
        createdBefore?: Date;
        orderBy?: string;
      };
      pagination?: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const { filters, pagination } = args;
    const limit = pagination?.first ?? 20;
    const offset = 0; // Simple pagination for now

    const whereConditions = [];

    // Always filter by current user
    whereConditions.push(eq(notifications.user_id, context.user.id));

    if (filters?.read !== undefined) {
      whereConditions.push(eq(notifications.read, filters.read));
    }

    if (filters?.resolved !== undefined) {
      whereConditions.push(eq(notifications.resolved, filters.resolved));
    }

    if (filters?.type) {
      whereConditions.push(eq(notifications.type, filters.type));
    }

    if (filters?.targetType) {
      whereConditions.push(eq(notifications.target_type, filters.targetType));
    }

    if (filters?.createdAfter) {
      whereConditions.push(sql`${notifications.created_at} >= ${filters.createdAfter}`);
    }

    if (filters?.createdBefore) {
      whereConditions.push(sql`${notifications.created_at} <= ${filters.createdBefore}`);
    }

    const orderBy =
      filters?.orderBy === 'created_at_desc'
        ? desc(notifications.created_at)
        : asc(notifications.created_at);

    try {
      const notificationsResult = await db()?.query.notifications.findMany({
        where: and(...whereConditions),
        orderBy: [orderBy],
        limit,
        offset,
      });

      const totalCount = await db()
        ?.select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(...whereConditions))
        .then(result => result[0]?.count ?? 0);

      const edges =
        notificationsResult?.map(notification => ({
          cursor: notification.id,
          node: notification,
        })) ?? [];

      return {
        edges,
        pageInfo: {
          hasNextPage: edges.length === limit,
          hasPreviousPage: false,
          startCursor: edges[0]?.cursor ?? null,
          endCursor: edges[edges.length - 1]?.cursor ?? null,
        },
        totalCount,
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  },

  // Get unread notifications count
  unreadNotificationsCount: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      const result = await db()
        ?.select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(eq(notifications.user_id, context.user.id), eq(notifications.read, false)));

      return result?.[0]?.count ?? 0;
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
      return 0;
    }
  },
};

// Notification Mutation Resolvers
export const notificationMutationResolvers = {
  // Mark notification as read
  markNotificationAsRead: async (
    _parent: unknown,
    args: { notificationId: string },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      const updatedNotification = await db()
        ?.update(notifications)
        .set({
          read: true,
          updated_at: new Date(),
        })
        .where(
          and(eq(notifications.id, args.notificationId), eq(notifications.user_id, context.user.id))
        )
        .returning();

      if (updatedNotification && updatedNotification.length > 0) {
        return {
          success: true,
          errors: [],
        };
      } else {
        return {
          success: false,
          errors: [
            { message: 'Notification not found or access denied', code: 'NOTIFICATION_NOT_FOUND' },
          ],
        };
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        errors: [{ message: 'Failed to mark notification as read', code: 'MARK_READ_ERROR' }],
      };
    }
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      await db()
        ?.update(notifications)
        .set({
          read: true,
          updated_at: new Date(),
        })
        .where(and(eq(notifications.user_id, context.user.id), eq(notifications.read, false)));

      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return {
        success: false,
        errors: [
          { message: 'Failed to mark all notifications as read', code: 'MARK_ALL_READ_ERROR' },
        ],
      };
    }
  },
};
