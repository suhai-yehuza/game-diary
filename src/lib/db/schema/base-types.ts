import { type InferModel } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Base table configuration
export const baseTableConfig = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
} as const;

// Base table type
export type BaseTable = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// Base table with columns type
export type BaseTableWithColumns = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: string | number | boolean | Date | null | undefined;
};

// Base table definition
export const baseTable = pgTable('base_table', {
  id: text('id').primaryKey(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

// Base model type
export type BaseModel = InferModel<typeof baseTable>;
