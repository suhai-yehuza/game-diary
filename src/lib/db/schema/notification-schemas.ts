import { sql } from 'drizzle-orm';
import { pgTable, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';

import { users } from '@/lib/db/schema/user-schemas';

export const notifications = pgTable('notifications', {
  id: varchar('id', { length: 255 }).primaryKey(),
  user_id: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  target_id: varchar('target_id', { length: 255 }),
  target_type: varchar('target_type', { length: 50 }),
  resolved: boolean('resolved').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at').default(sql`null`),
  read: boolean('read').default(false),
});
