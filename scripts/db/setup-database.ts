import { setupAllTriggers } from '../shared/database-triggers';
import {
  parseScriptArgs,
  initDatabase,
  logScriptHeader,
  logScriptFooter,
  handleScriptError,
} from '../shared/script-utils';

async function setupTriggers() {
  const options = parseScriptArgs();
  const env = options.environment ?? 'development';
  logScriptHeader('Database Triggers Setup', env);

  try {
    const db = initDatabase(env);
    await setupAllTriggers(db);

    logScriptFooter('Database Triggers Setup', true, [
      'Run "npx tsx src/lib/db/seed/test-trigger.ts" to test the triggers',
      'Use your application - triggers will automatically update ratings',
    ]);

    process.exit(0);
  } catch (error) {
    handleScriptError(error, 'Database trigger setup');
  }
}

// Run the setup
setupTriggers();
