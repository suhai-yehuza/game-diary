/**
 * Configuration for type violation fixes
 * This makes the fixer script extensible for future violations
 */

export interface IFixRule {
  name: string;
  description: string;
  filePattern: RegExp | string;
  strategy: 'remove-and-import' | 'move-to-types' | 'rewrite-file' | 'custom';
  targetTypesFile?: string;
  importPath?: string;
  customHandler?: string; // Function name for custom handling
}

export interface ITypeMovementRule {
  sourcePattern: RegExp;
  targetFile: string;
  importPath: string;
}

/**
 * Rules for handling different types of violations
 * Add new rules here to handle future violation patterns
 */
export const TYPE_FIX_RULES: IFixRule[] = [
  {
    name: 'seeder-duplicates',
    description: 'Remove duplicate type definitions in seeder files and add proper imports',
    filePattern: /^src\/lib\/db\/seed\/.*\.ts$/,
    strategy: 'remove-and-import',
    targetTypesFile: 'seeding.types.ts',
    importPath: '@src/lib/types/seeding.types',
  },
  {
    name: 'schema-types-cleanup',
    description: 'Clean up schema types file with re-exports',
    filePattern: 'src/lib/db/schema/types.ts',
    strategy: 'rewrite-file',
    customHandler: 'fixSchemaTypesViolations',
  },
  {
    name: 'db-component-types',
    description: 'Move database component types to appropriate types files',
    filePattern: /^src\/lib\/db\/.*\.ts$/,
    strategy: 'move-to-types',
    targetTypesFile: 'database.types.ts',
    importPath: '@src/lib/types/database.types',
  },
  {
    name: 'api-route-types',
    description: 'Move API route types to api.types.ts',
    filePattern: /^src\/app\/api\/.*\.ts$/,
    strategy: 'move-to-types',
    targetTypesFile: 'api.types.ts',
    importPath: '@src/lib/types/api.types',
  },
  {
    name: 'component-types',
    description: 'Move component types to component.types.ts',
    filePattern: /^src\/(app\/components|components)\/.*\.tsx?$/,
    strategy: 'move-to-types',
    targetTypesFile: 'component.types.ts',
    importPath: '@src/lib/types/component.types',
  },
  {
    name: 'hook-types',
    description: 'Move hook types to hooks.types.ts',
    filePattern: /^src\/hooks\/.*\.ts$/,
    strategy: 'move-to-types',
    targetTypesFile: 'hooks.types.ts',
    importPath: '@src/lib/types/hooks.types',
  },
  {
    name: 'util-types',
    description: 'Move utility types to misc.types.ts',
    filePattern: /^src\/lib\/utils\/.*\.ts$/,
    strategy: 'move-to-types',
    targetTypesFile: 'misc.types.ts',
    importPath: '@src/lib/types/misc.types',
  },
];

/**
 * Mapping of file patterns to their appropriate types files
 */
export const TYPE_MOVEMENT_RULES: ITypeMovementRule[] = [
  {
    sourcePattern: /^src\/lib\/db\/seed\//,
    targetFile: 'seeding.types.ts',
    importPath: '@src/lib/types/seeding.types',
  },
  {
    sourcePattern: /^src\/lib\/db\//,
    targetFile: 'database.types.ts',
    importPath: '@src/lib/types/database.types',
  },
  {
    sourcePattern: /^src\/app\/api\//,
    targetFile: 'api.types.ts',
    importPath: '@src/lib/types/api.types',
  },
  {
    sourcePattern: /^src\/(app\/components|components)\//,
    targetFile: 'component.types.ts',
    importPath: '@src/lib/types/component.types',
  },
  {
    sourcePattern: /^src\/hooks\//,
    targetFile: 'hooks.types.ts',
    importPath: '@src/lib/types/hooks.types',
  },
  {
    sourcePattern: /^src\/lib\/utils\//,
    targetFile: 'misc.types.ts',
    importPath: '@src/lib/types/misc.types',
  },
];

/**
 * Common type imports that should be added when types are moved
 */
export const COMMON_TYPE_IMPORTS = {
  'seeding.types.ts': [
    "import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';",
    "import type * as schema from '@src/lib/db/schema';",
  ],
  'database.types.ts': [
    "import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';",
    "import type * as schema from '@src/lib/db/schema';",
  ],
  'api.types.ts': ["import type { NextRequest, NextResponse } from 'next/server';"],
  'component.types.ts': ["import type { ReactNode, ComponentProps } from 'react';"],
};

/**
 * Patterns for detecting different types of violations
 */
export const VIOLATION_PATTERNS = {
  // Skip re-exports (including multiline variants)
  RE_EXPORT:
    /export\s+type\s+\{[^}]+\}\s+from\s+['"][^'"]+['"]|^export\s+type\s+\{\s*$|^export\s+type\s+\{[^}]*$/,

  // Detect drizzle infer types (these are usually okay to keep local)
  DRIZZLE_INFER: /InferInsertModel|InferSelectModel/,

  // Detect utility types that might be okay to keep local
  UTILITY_TYPES: /Pick<|Omit<|Partial<|Required</,

  // Detect interface/type declarations
  TYPE_DECLARATION: /^(?:export\s+)?(?:type|interface)\s+(\w+)/,
};

/**
 * Configuration for the types directory and organization
 */
export const TYPES_CONFIG = {
  typesDir: 'src/lib/types',
  excludedDirs: ['node_modules', '.next', 'dist', 'build', 'scripts'],

  // Files that should be checked for violations
  includePatterns: ['*.ts', '*.tsx'],

  // Maximum number of types to move in a single operation (safety limit)
  maxTypesPerOperation: 50,

  // Whether to create backup files before making changes
  createBackups: false,

  // Whether to run validation after fixes
  verifyAfterFix: true,
};

export default {
  TYPE_FIX_RULES,
  TYPE_MOVEMENT_RULES,
  COMMON_TYPE_IMPORTS,
  VIOLATION_PATTERNS,
  TYPES_CONFIG,
};
