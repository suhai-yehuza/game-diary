import { eq, and, desc, asc, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import { errorHandlers } from '@/lib/utils/error-handler';
import type { GraphQLContext } from '@/types';

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

    // If MOCK_MODE is enabled, return empty notification list
    if (process.env.MOCK_MODE === 'true') {
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
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
      const database = db();
      if (!database) {
        return {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        };
      }

      const notificationsResult = await database.query.notifications.findMany({
        where: and(...whereConditions),
        orderBy: [orderBy],
        limit,
        offset,
      });

      const totalCount = await database
        .select({ count: sql<number>`count(*)` })
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
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Fetch user notifications',
      });

      // Return empty result instead of throwing error to maintain GraphQL schema compliance
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
    }
  },

  // Get unread notifications count
  unreadNotificationsCount: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    // If MOCK_MODE is enabled, return 0 for unread notification count
    if (process.env.MOCK_MODE === 'true') {
      return 0;
    }

    try {
      const database = db();
      if (!database) {
        return 0;
      }

      const result = await database
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(eq(notifications.user_id, context.user.id), eq(notifications.read, false)));

      return result?.[0]?.count ?? 0;
    } catch (error) {
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Fetch unread notifications count',
      });
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
      const database = db();
      if (!database) {
        return {
          success: false,
          errors: [{ message: 'Database not available', code: 'DATABASE_UNAVAILABLE' }],
        };
      }

      const updatedNotification = await database
        .update(notifications)
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
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Mark notification as read',
      });
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
      const database = db();
      if (!database) {
        return {
          success: false,
          errors: [{ message: 'Database not available', code: 'DATABASE_UNAVAILABLE' }],
        };
      }

      await database
        .update(notifications)
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
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Mark all notifications as read',
      });
      return {
        success: false,
        errors: [
          { message: 'Failed to mark all notifications as read', code: 'MARK_ALL_READ_ERROR' },
        ],
      };
    }
  },
};
