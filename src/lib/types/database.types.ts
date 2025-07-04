// Types file: database.types.ts

import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type * as schema from '@src/lib/db/schema';

// Re-export types from schema-types.ts
export type {
  IBaseTableFields,
  IBaseGameFields,
  BaseTableConfig,
  BaseGameFields,
} from '@src/lib/types/schema-types';
