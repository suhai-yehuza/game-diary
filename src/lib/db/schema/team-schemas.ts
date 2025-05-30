import { pgTable, text, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const teams = pgTable('teams', {
  id: text('id').primaryKey(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  name: varchar('name', { length: 255 }).notNull(),
  abbreviation: varchar('abbreviation', { length: 10 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  state: varchar('state', { length: 255 }).notNull(),
  country: varchar('country', { length: 255 }).notNull(),
  conference: varchar('conference', { length: 255 }),
  division: varchar('division', { length: 255 }),
  logoUrl: varchar('logoUrl', { length: 255 }),
  primaryColor: varchar('primaryColor', { length: 7 }),
  secondaryColor: varchar('secondaryColor', { length: 7 }),
  isActive: boolean('isActive').notNull().default(true),
});
