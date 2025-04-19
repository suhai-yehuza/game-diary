import { pgTable, text, varchar, timestamp } from 'drizzle-orm/pg-core';

import { users } from './user-schemas';

export const comments = pgTable('comments', {
  id: varchar('id', { length: 255 }).primaryKey(),
  user_id: varchar('user_id', { length: 255 }).references(() => users.id),
  content: text('content').notNull(),
  target_id: varchar('target_id', { length: 255 }).notNull(),
  target_type: varchar('target_type', { length: 50 }).notNull(),
  parent_id: varchar('parent_id', { length: 255 }),
  parent_type: varchar('parent_type', { length: 50 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
});
