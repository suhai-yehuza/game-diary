#!/usr/bin/env tsx

import { sql } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join } from 'path';

import { logger } from '@src/lib/utils/logger';
import { createDatabaseClient } from '@src/lib/db';

export interface ITriggerSetupOptions {
  dropExisting?: boolean;
  skipVerification?: boolean;
}

/**
 * Parse SQL file and extract function and trigger blocks
 */
function parseSqlBlocks(sqlContent: string): { functions: string[]; triggers: string[] } {
  const functions: string[] = [];
  const triggers: string[] = [];
  let currentBlock = '';
  let inFunction = false;
  let inTrigger = false;

  const lines = sqlContent.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('--') || line === '') continue;

    // Function start
    if (
      line.toUpperCase().startsWith('CREATE OR REPLACE FUNCTION') ||
      line.toUpperCase().startsWith('CREATE FUNCTION')
    ) {
      if (currentBlock.trim()) {
        if (inFunction) functions.push(currentBlock.trim());
        else if (inTrigger) triggers.push(currentBlock.trim());
      }
      currentBlock = line;
      inFunction = true;
      inTrigger = false;
      continue;
    }
    // Trigger start
    if (line.toUpperCase().startsWith('CREATE TRIGGER')) {
      if (currentBlock.trim()) {
        if (inFunction) functions.push(currentBlock.trim());
        else if (inTrigger) triggers.push(currentBlock.trim());
      }
      currentBlock = line;
      inFunction = false;
      inTrigger = true;
      continue;
    }
    // End of function block
    if (inFunction && line.match(/\$\$;?\s*LANGUAGE\s+plpgsql;?/i)) {
      currentBlock += '\n' + line;
      functions.push(currentBlock.trim());
      currentBlock = '';
      inFunction = false;
      continue;
    }
    // End of trigger block
    if (inTrigger && line.endsWith(';')) {
      currentBlock += '\n' + line;
      triggers.push(currentBlock.trim());
      currentBlock = '';
      inTrigger = false;
      continue;
    }
    if (inFunction || inTrigger) {
      currentBlock += '\n' + line;
    }
  }
  if (currentBlock.trim()) {
    if (inFunction) functions.push(currentBlock.trim());
    else if (inTrigger) triggers.push(currentBlock.trim());
  }
  return { functions, triggers };
}

async function dropAllTriggersAndFunctions(db: ReturnType<typeof createDatabaseClient>) {
  logger.info('🗑️  Dropping all triggers and functions...');
  // Drop triggers (ignore errors)
  const triggerNames = [
    'game_logs_ratings_trigger',
    'friendship_notification_trigger',
    'comment_notification_trigger',
    'reaction_notification_trigger',
    'update_friendship_user_arrays_insert',
    'update_friendship_user_arrays_update',
    'update_friendship_user_arrays_delete',
    'friendship_deletion_notification_trigger',
  ];
  const triggerTables: Record<string, string> = {
    game_logs_ratings_trigger: 'game_logs',
    friendship_notification_trigger: 'friendships',
    comment_notification_trigger: 'comments',
    reaction_notification_trigger: 'reactions',
    update_friendship_user_arrays_insert: 'friendships',
    update_friendship_user_arrays_update: 'friendships',
    update_friendship_user_arrays_delete: 'friendships',
    friendship_deletion_notification_trigger: 'friendships',
  };
  for (const trigger of triggerNames) {
    const table = triggerTables[trigger] || null;
    if (!table) continue;
    try {
      await db.execute(sql.raw(`DROP TRIGGER IF EXISTS ${trigger} ON ${table}`));
      logger.info(`  - Dropped trigger ${trigger} on ${table}`);
    } catch (err) {
      logger.warn(`  - Could not drop trigger ${trigger} on ${table}: ${err}`);
    }
  }
  // Drop functions (ignore errors)
  const functionNames = [
    'generate_uuid_v7',
    'update_game_ratings',
    'create_friend_request_notification',
    'create_comment_notification',
    'create_reaction_notification',
    'update_friendship_user_arrays',
    'rebuild_user_friendship_arrays',
    'create_friend_removed_notification',
  ];
  for (const fn of functionNames) {
    try {
      await db.execute(sql.raw(`DROP FUNCTION IF EXISTS ${fn} CASCADE`));
      logger.info(`  - Dropped function ${fn}`);
    } catch (err) {
      logger.warn(`  - Could not drop function ${fn}: ${err}`);
    }
  }
}

export async function setupAllTriggersFromSql(
  db: ReturnType<typeof createDatabaseClient>,
  options: ITriggerSetupOptions = {}
) {
  try {
    logger.info('📄 Loading triggers/functions from shared SQL file...');
    const sqlFilePath = join(process.cwd(), 'src', 'lib', 'db', 'triggers.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf-8');
    const { functions, triggers } = parseSqlBlocks(sqlContent);
    logger.info(`📦 Parsed ${functions.length} functions, ${triggers.length} triggers`);

    if (options.dropExisting) {
      await dropAllTriggersAndFunctions(db);
    }

    logger.info('🔧 Creating functions...');
    for (let i = 0; i < functions.length; i++) {
      try {
        await db.execute(sql.raw(functions[i]));
        logger.info(`  ✅ Created function ${i + 1}/${functions.length}`);
      } catch (err) {
        logger.error(`  ❌ Failed to create function ${i + 1}:`, err);
        throw err;
      }
    }
    logger.info('🔧 Creating triggers...');
    for (let i = 0; i < triggers.length; i++) {
      try {
        await db.execute(sql.raw(triggers[i]));
        logger.info(`  ✅ Created trigger ${i + 1}/${triggers.length}`);
      } catch (err) {
        logger.error(`  ❌ Failed to create trigger ${i + 1}:`, err);
        throw err;
      }
    }
    logger.info('✅ All triggers and functions created successfully');
  } catch (err) {
    logger.error('❌ Error setting up triggers:', err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const db = createDatabaseClient();
      await setupAllTriggersFromSql(db, { dropExisting: true });
      process.exit(0);
    } catch (error) {
      console.error('Failed to setup triggers:', error);
      process.exit(1);
    }
  })();
}
