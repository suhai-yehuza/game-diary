import path from 'path';

import { analyzeTsConfig } from 'ts-unused-exports';

import { logger } from '@lib/core/logger';

import { parseScriptArgs } from '../shared/script-utils';

// Types
type ArgType = string;
type ExportNameAndLocation = {
  exportName: string;
  location?: {
    line: number;
  };
};

// Configuration
const CONFIG = {
  tsConfigPath: path.resolve(process.cwd(), 'tsconfig.json'),
  defaultArgs: ['--allowUnusedTypes', '--ignoreLocallyUsed', '--showLineNumber'] as const,
  ignoreFiles: [
    // Configuration files
    'codegen.ts',
    'vitest.config.ts',
    'drizzle.config.ts',
    'playwright.config.ts',
    'tailwind.config.ts',

    // Scripts
    '@lib/core/logger.ts',
    'scripts/db/drizzle-migrate.ts',
    'scripts/performance/performance-measure.ts',
    'scripts/shared/script-utils.ts',
    'tests/e2e/utils/test-utils.ts',

    // App root and middleware
    'src/middleware.ts',
    'src/app/api/graphql/route.ts',
    'src/app/layout.tsx',
    'src/app/not-found.tsx',
    'src/app/page.tsx',
    'src/app/dashboard/page.tsx',

    // Auth pages
    'src/app/sign-in/[[...sign-in]]/page.tsx',
    'src/app/sign-up/[[...sign-up]]/page.tsx',

    // Protected routes
    'src/app/protected/admin/user/[id]/page.tsx',
    'src/app/protected/admin/users/page.tsx',
    'src/app/protected/admin/users/users-table.tsx',
    'src/app/protected/client/page.tsx',
    'src/app/protected/server/page.tsx',
    'src/app/protected/user/components/search/index.ts',
    'src/app/protected/user/page.tsx',
    'src/app/protected/user/[id]/page.tsx',
    'src/app/protected/user/game-logs/[id]/page.tsx',
    'src/app/protected/user/user-profile.tsx',
    'src/app/protected/user/user-profile-layout.tsx',

    // Sports pages
    'src/app/sports/all-sports/page.tsx',
    'src/app/sports/mlb/page.tsx',
    'src/app/sports/mls/page.tsx',
    'src/app/sports/nba/page.tsx',
    'src/app/sports/nba/games/[id]/page.tsx',
    'src/app/sports/nba/teams/[id]/page.tsx',
    'src/app/sports/nfl/page.tsx',
    'src/app/sports/nhl/page.tsx',
    'src/app/sports/nba/live/page.tsx',
    'src/app/search/page.tsx',

    // Component index files
    'src/components/index.ts',
    'src/components/auth/index.ts',
    'src/components/common/index.ts',
    'src/components/features/user-profile/index.ts',
    'src/components/features/users/index.ts',
    'src/components/features/friends/index.ts',
    'src/components/features/game-logs/index.ts',
    'src/components/features/games/index.ts',
    'src/components/layout/index.ts',
    'src/components/ui/index.ts',

    // Component files
    'src/components/features/game-logs/game-log.tsx',
    'src/components/layout/footer.tsx',
    'src/components/layout/header.tsx',
    'src/components/ui/toast.tsx',
    'src/app/components/index.ts',

    // Hooks and utilities
    'src/hooks/index.ts',
    'src/lib/external-apis.ts',
    'src/lib/utils/index.ts',
    'src/lib/env.ts',

    // Database related
    'src/lib/db/index.ts',
    'src/lib/db/schema/enums.ts',
    'src/lib/db/schema/enum-values.ts',
    'src/lib/db/seed/fetch-external-api-games.ts',
    'src/lib/db/seed/fetch-external-api-players.ts',
    'src/lib/db/seed/index.ts',
    'src/lib/db/seed/schema.ts',

    // GraphQL and types
    'src/lib/graphql/resolvers/schema.ts',
    'src/lib/types/generated/index.ts',
    'src/lib/types/scalars/index.ts',
  ],
} as const;

// Utility functions
const utils = {
  escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  buildArgs(): ArgType[] {
    const args = [...CONFIG.defaultArgs] as ArgType[];
    if (CONFIG.ignoreFiles.length > 0) {
      CONFIG.ignoreFiles.forEach(file => {
        args.push(`--ignoreFiles=${utils.escapeRegex(file)}` as ArgType);
      });
    }
    return args;
  },
};

// Output formatting
const formatter = {
  formatExportInfo(exportInfo: ExportNameAndLocation): string {
    const { exportName, location } = exportInfo;
    return location ? `   - ${exportName} (line ${location.line})` : `   - ${exportName}`;
  },

  printUnusedExports(result: unknown): number {
    if (!result || typeof result !== 'object') {
      logger.info('✅ No unused exports found!');
      return 0;
    }

    let totalUnusedFiles = 0;

    for (const [filePath, exports] of Object.entries(result)) {
      if (Array.isArray(exports) && exports.length > 0) {
        totalUnusedFiles++;
        logger.info(`📁 ${filePath}`);
        exports.forEach(exportInfo => {
          if (typeof exportInfo === 'object' && exportInfo !== null && 'exportName' in exportInfo) {
            logger.info(formatter.formatExportInfo(exportInfo as ExportNameAndLocation));
          }
        });
        logger.info(''); // Add empty line between files
      }
    }

    logger.info(`Total files with unused exports: ${totalUnusedFiles}`);
    return totalUnusedFiles;
  },
};

// Main functionality
async function checkUnusedExports(): Promise<void> {
  try {
    const options = parseScriptArgs();
    logger.info(`🔍 Checking unused exports in ${options.environment} environment...`);

    const args = utils.buildArgs();
    logger.info('Arguments:', args);

    const result = await analyzeTsConfig(CONFIG.tsConfigPath, args);
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid result from analyzeTsConfig');
    }

    logger.info('Raw result from analyzeTsConfig:', JSON.stringify(result, null, 2));

    if (Object.keys(result).length === 0) {
      logger.info('✅ No unused exports found!');
      process.exit(0);
    }

    logger.info('\n🔍 Unused exports found:\n');
    const totalUnusedFiles = formatter.printUnusedExports(result);
    process.exit(totalUnusedFiles > 0 ? 1 : 0);
  } catch (error) {
    if (error instanceof Error) {
      logger.error('❌ Error checking unused exports:', error.message);
      if (error.stack) {
        logger.error(error.stack);
      }
    } else {
      logger.error('❌ Error checking unused exports:', String(error));
    }
    process.exit(1);
  }
}

// Execute the script
checkUnusedExports();
