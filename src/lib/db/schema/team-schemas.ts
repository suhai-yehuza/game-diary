import { sql } from 'drizzle-orm';
import { pgTable, text, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const teams = pgTable('teams', {
  id: text('id').primaryKey(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  deletedAt: timestamp('deletedAt').default(sql`null`),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 10 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  state: varchar('state', { length: 255 }).notNull(),
  country: varchar('country', { length: 255 }).notNull(),
  conference: varchar('conference', { length: 255 }),
  division: varchar('division', { length: 255 }),
  logoUrl: varchar('logoUrl', { length: 255 }),
  isActive: boolean('isActive').notNull().default(true),
});
