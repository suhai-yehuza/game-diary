import { pgTable, text, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const teams = pgTable('teams', {
  id: text('id').primaryKey(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  name: varchar('name', { length: 255 }).notNull(),
  abbreviation: varchar('abbreviation', { length: 10 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  state: varchar('state', { length: 255 }).notNull(),
  country: varchar('country', { length: 255 }).notNull(),
  conference: varchar('conference', { length: 255 }),
  division: varchar('division', { length: 255 }),
  logo_url: varchar('logo_url', { length: 255 }),
  primary_color: varchar('primary_color', { length: 7 }),
  secondary_color: varchar('secondary_color', { length: 7 }),
  is_active: boolean('is_active').notNull().default(true),
});
