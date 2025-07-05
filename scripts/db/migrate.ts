#!/usr/bin/env tsx
/**
 * @fileoverview Migration wrapper - uses the unified database manager
 * Maintains backward compatibility with existing scripts
 */

import { applyAllMigrations } from './database-manager';

const environment = process.argv[2] || 'development';
const dryRun = process.argv.includes('--dry-run');

applyAllMigrations(environment, dryRun)
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
