import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

import { users } from './user-schemas';

export const reactions = pgTable('reactions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  user_id: varchar('user_id', { length: 255 }).references(() => users.id),
  target_id: varchar('target_id', { length: 255 }).notNull(),
  target_type: varchar('target_type', { length: 50 }).notNull(),
  emoji: varchar('emoji', { length: 50 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
});
