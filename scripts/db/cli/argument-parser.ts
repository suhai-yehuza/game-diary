/**
 * @fileoverview Command line argument parsing utilities
 */

export interface DatabaseManagerOptions {
  environment: string;
  dryRun: boolean;
  skipSchemaCheck: boolean;
  test: boolean;
}

/**
 * Parse command line arguments
 */
export function parseScriptArgs(): DatabaseManagerOptions {
  const args = process.argv.slice(2);

  const options: DatabaseManagerOptions = {
    environment: 'development',
    dryRun: false,
    skipSchemaCheck: false,
    test: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--env=')) {
      options.environment = arg.split('=')[1];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--skip-schema-check') {
      options.skipSchemaCheck = true;
    } else if (arg === '--test') {
      options.test = true;
    }
  }

  return options;
}

/**
 * Parse reset command arguments
 */
export function parseResetArgs(args: string[]): {
  mode: 'canonical' | 'drizzle';
  environment: string;
} {
  let mode: 'canonical' | 'drizzle' = 'canonical';
  let environment = 'dev';

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--mode=')) {
      mode = arg.split('=')[1] as 'canonical' | 'drizzle';
    } else if (arg.startsWith('--env=')) {
      environment = arg.split('=')[1];
    } else if (arg === 'canonical' || arg === 'drizzle') {
      mode = arg as 'canonical' | 'drizzle';
    } else if (['dev', 'development', 'staging', 'prod', 'production'].includes(arg)) {
      environment = arg;
    }
  }

  return { mode, environment };
}
