import { sql } from 'drizzle-orm';
import { pgTable, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';

import { users } from './user-schemas';

export const notifications = pgTable('notifications', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('userId', { length: 255 }).references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  targetId: varchar('targetId', { length: 255 }),
  targetType: varchar('targetType', { length: 50 }),
  resolved: boolean('resolved').notNull().default(false),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  deletedAt: timestamp('deletedAt').default(sql`null`),
});
