import { type InferModel } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Base table configuration
export const baseTableConfig = {
  id: 'id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
} as const;

// Base table type
export type BaseTable = {
  id: string;
  created_at: Date;
  updated_at: Date;
};

// Base table with columns type
export type BaseTableWithColumns = {
  id: string;
  created_at: Date;
  updated_at: Date;
  [key: string]: string | number | boolean | Date | null | undefined;
};

// Base table definition
export const baseTable = pgTable('base_table', {
  id: text('id').primaryKey(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Base model type
export type BaseModel = InferModel<typeof baseTable>;
