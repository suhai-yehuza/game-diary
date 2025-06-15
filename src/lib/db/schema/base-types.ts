import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Base table configuration
export const baseTableConfig = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
} as const;

// Base table definition
export const baseTable = pgTable('base_table', {
  id: text('id').primaryKey(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});
