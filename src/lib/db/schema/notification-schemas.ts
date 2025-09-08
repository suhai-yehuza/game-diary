import { pgTable, varchar, text, boolean } from 'drizzle-orm/pg-core';

import { baseTableConfig } from '@/lib/db/schema/base-schemas';
import { users } from '@/lib/db/schema/user-schemas';

export const notifications = pgTable('notifications', {
  user_id: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  target_id: varchar('target_id', { length: 255 }),
  target_type: varchar('target_type', { length: 50 }),
  resolved: boolean('resolved').notNull().default(false),
  read: boolean('read').default(false),
  ...baseTableConfig,
});
