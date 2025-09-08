import { pgTable, serial, varchar, timestamp, integer, text, boolean } from 'drizzle-orm/pg-core';

// import { baseTableConfig } from '@/lib/db/schema/base-schemas'; // Currently unused

// Migration versions table for tracking executed migrations
export const migrationVersions = pgTable('migration_versions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  checksum: varchar('checksum', { length: 64 }).notNull(),
  executed_at: timestamp('executed_at', { withTimezone: true }).defaultNow(),
  execution_time_ms: integer('execution_time_ms'),
  status: varchar('status', { length: 20 }).notNull().default('success'),
  error_message: text('error_message'),
  rollback_script: text('rollback_script'),
  rollback_executed: boolean('rollback_executed').default(false),
  // Note: Not using baseTableConfig here as this table has its own timestamp strategy
});
