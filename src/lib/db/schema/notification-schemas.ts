import { pgTable, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';

import { users } from './user-schemas';

export const notifications = pgTable('notifications', {
  id: varchar('id', { length: 255 }).primaryKey(),
  user_id: varchar('user_id', { length: 255 }).references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  target_id: varchar('target_id', { length: 255 }),
  target_type: varchar('target_type', { length: 50 }),
  read: boolean('read').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
});
