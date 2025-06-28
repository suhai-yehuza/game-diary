#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';

import { logger } from '@lib/core/logger';

import { parseScriptArgs } from '@shared/script-utils';

import {
  TYPE_FIX_RULES,
  COMMON_TYPE_IMPORTS,
  VIOLATION_PATTERNS,
  TYPES_CONFIG,
  type IFixRule,
} from './fix-type-violations.config';

interface ITypeViolation {
  filePath: string;
  lineNumber: number;
  typeDefinition: string;
  typeName: string;
}

interface IFixResult {
  fixedFiles: string[];
  errors: string[];
  skippedFiles: string[];
}

/**
 * EXTENSIBLE TYPE VIOLATIONS FIXER
 *
 * This version uses configuration-driven fixes that make it easy to handle
 * future violations by simply adding new rules to the config file.
 */

/**
 * Find type definitions outside the types directory
 */
function findTypeViolations(): ITypeViolation[] {
  const violations: ITypeViolation[] = [];

  try {
    const includePatterns = TYPES_CONFIG.includePatterns.map(p => `--include="${p}"`).join(' ');
    const excludeDirs = TYPES_CONFIG.excludedDirs.map(d => `--exclude-dir=${d}`).join(' ');

    const grepCommand = `grep -rn ${excludeDirs} ${includePatterns} -E "^(export )?(type|interface) " . | grep -v "z.infer<"`;
    const output = execSync(grepCommand, { encoding: 'utf-8' });
    const lines = output.split('\n').filter(Boolean);

    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length < 3) continue;

      const filePath = parts[0].startsWith('./') ? parts[0].slice(2) : parts[0];
      const lineNumber = parseInt(parts[1], 10);
      const typeDefinition = parts.slice(2).join(':').trim();

      // Skip if file is in excluded directories or already in types directory
      if (
        TYPES_CONFIG.excludedDirs.some(dir => filePath.startsWith(dir)) ||
        filePath.startsWith(TYPES_CONFIG.typesDir)
      ) {
        continue;
      }

      // Skip re-exports using pattern from config
      if (VIOLATION_PATTERNS.RE_EXPORT.test(typeDefinition)) {
        continue;
      }

      // Skip utility types that are okay to keep local
      if (VIOLATION_PATTERNS.UTILITY_TYPES.test(typeDefinition)) {
        continue;
      }

      // Extract type name
      const typeMatch = typeDefinition.match(VIOLATION_PATTERNS.TYPE_DECLARATION);
      if (!typeMatch) continue;

      violations.push({
        filePath,
        lineNumber,
        typeDefinition,
        typeName: typeMatch[1],
      });
    }
  } catch (err) {
    if (err instanceof Error && 'status' in err && err.status === 1) {
      return [];
    }
    logger.error('Error finding type violations:', err);
  }

  return violations;
}

/**
 * Apply fix strategies based on configuration rules
 */
function applyConfiguredFixes(violations: ITypeViolation[]): string[] {
  const fixedFiles: string[] = [];
  const processedViolations = new Set<ITypeViolation>();

  // Group violations by file for efficient processing
  const violationsByFile = violations.reduce(
    (acc, violation) => {
      if (!acc[violation.filePath]) {
        acc[violation.filePath] = [];
      }
      acc[violation.filePath].push(violation);
      return acc;
    },
    {} as Record<string, ITypeViolation[]>
  );

  // Apply each fix rule
  for (const rule of TYPE_FIX_RULES) {
    const matchingFiles = Object.keys(violationsByFile).filter(filePath => {
      if (rule.filePattern instanceof RegExp) {
        return rule.filePattern.test(filePath);
      }
      return filePath.includes(rule.filePattern);
    });

    for (const filePath of matchingFiles) {
      const fileViolations = violationsByFile[filePath].filter(v => !processedViolations.has(v));

      if (fileViolations.length === 0) continue;

      logger.info(`🔧 Applying rule "${rule.name}": ${rule.description}`);

      try {
        const fixed = applyFixStrategy(rule, filePath, fileViolations);
        if (fixed) {
          fixedFiles.push(filePath);
          fileViolations.forEach(v => processedViolations.add(v));
        }
      } catch (err) {
        logger.error(`❌ Failed to apply rule "${rule.name}" to ${filePath}:`, err);
      }
    }
  }

  return [...new Set(fixedFiles)];
}

/**
 * Apply a specific fix strategy
 */
function applyFixStrategy(rule: IFixRule, filePath: string, violations: ITypeViolation[]): boolean {
  switch (rule.strategy) {
    case 'remove-and-import':
      return removeTypesAndAddImport(filePath, violations, rule.importPath!, rule.targetTypesFile!);

    case 'move-to-types':
      return moveTypesToTypesFile(filePath, violations, rule.targetTypesFile!, rule.importPath!);

    case 'rewrite-file':
      return rewriteFileWithReexports(filePath, violations);

    case 'custom':
      // For custom handlers, you could dynamically import and call them
      logger.warn(`Custom handler "${rule.customHandler}" not implemented yet`);
      return false;

    default:
      logger.warn(`Unknown strategy: ${rule.strategy}`);
      return false;
  }
}

/**
 * Remove duplicate types and add proper import
 */
function removeTypesAndAddImport(
  filePath: string,
  violations: ITypeViolation[],
  importPath: string,
  _targetTypesFile: string
): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Remove violating lines (from bottom to top to preserve line numbers)
    const linesToRemove = violations.map(v => v.lineNumber - 1).sort((a, b) => b - a);

    for (const lineIndex of linesToRemove) {
      if (lineIndex >= 0 && lineIndex < lines.length) {
        lines.splice(lineIndex, 1);
      }
    }

    // Add proper import
    const typeNames = violations.map(v => v.typeName);
    addOrUpdateImport(lines, typeNames, importPath);

    fs.writeFileSync(filePath, lines.join('\n'));
    logger.info(`✅ Removed ${violations.length} duplicate types from ${filePath}`);
    return true;
  } catch (err) {
    logger.error(`Failed to fix ${filePath}:`, err);
    return false;
  }
}

/**
 * Move types to appropriate types file
 */
function moveTypesToTypesFile(
  filePath: string,
  violations: ITypeViolation[],
  targetTypesFile: string,
  _importPath: string
): boolean {
  try {
    const sourceContent = fs.readFileSync(filePath, 'utf-8');
    const sourceLines = sourceContent.split('\n');

    // Extract type definitions
    const typeDefinitions: string[] = [];
    const linesToRemove = violations.map(v => v.lineNumber - 1).sort((a, b) => b - a);

    for (const lineIndex of linesToRemove) {
      if (lineIndex >= 0 && lineIndex < sourceLines.length) {
        typeDefinitions.unshift(sourceLines[lineIndex]);
        sourceLines.splice(lineIndex, 1);
      }
    }

    // Write to target types file
    const typesFilePath = `${TYPES_CONFIG.typesDir}/${targetTypesFile}`;
    let typesContent = '';

    if (fs.existsSync(typesFilePath)) {
      typesContent = fs.readFileSync(typesFilePath, 'utf-8');
    } else {
      // Create new types file with common imports
      const commonImports =
        (COMMON_TYPE_IMPORTS as Record<string, string[]>)[targetTypesFile] || [];
      typesContent = `// Types file: ${targetTypesFile}\n\n${commonImports.join('\n')}\n\n`;
    }

    typesContent += `\n// Types moved from ${filePath}\n`;
    typesContent += typeDefinitions.join('\n') + '\n';

    // Write both files
    fs.writeFileSync(typesFilePath, typesContent);
    fs.writeFileSync(filePath, sourceLines.join('\n'));

    logger.info(`✅ Moved ${violations.length} types from ${filePath} to ${targetTypesFile}`);
    return true;
  } catch (err) {
    logger.error(`Failed to move types from ${filePath}:`, err);
    return false;
  }
}

/**
 * Rewrite file with clean re-exports (for schema/types.ts)
 */
function rewriteFileWithReexports(filePath: string, _violations: ITypeViolation[]): boolean {
  // This is the existing schema types fix logic
  if (filePath === 'src/lib/db/schema/types.ts') {
    const cleanSchemaContent = `// This file provides minimal schema type exports for internal schema use
// Main type definitions have been moved to src/lib/types/database.types.ts

// Re-export types that are needed for schema internal use only
export type { baseTableConfig } from './base-types';
export type { game_logs, game_ratings, games } from './game-schemas';
export type { nba_players, nba_player_stats, game_stats, seasons, nba_games, team_h2h } from './nba-schemas';
export type { notifications } from './notification-schemas';
export type { usersRelations, commentsRelations, reactionsRelations, gameLogsRelations } from './relations';
export type { teams } from './team-schemas';
export type { reactions, users, friendships, comments } from './user-schemas';
`;

    fs.writeFileSync(filePath, cleanSchemaContent);
    logger.info(`✅ Rewritten ${filePath} with clean re-exports`);
    return true;
  }

  return false;
}

/**
 * Add or update import statement
 */
function addOrUpdateImport(lines: string[], typeNames: string[], importPath: string): void {
  const existingImportIndex = lines.findIndex(
    line => line.includes(`from '${importPath}'`) || line.includes(`from "${importPath}"`)
  );

  if (existingImportIndex !== -1) {
    // Update existing import
    const importLine = lines[existingImportIndex];
    const existingTypes =
      importLine
        .match(/\{([^}]+)\}/)?.[1]
        ?.split(',')
        .map(t => t.trim()) || [];
    const newTypes = [...new Set([...existingTypes, ...typeNames])];
    lines[existingImportIndex] = `import type { ${newTypes.join(', ')} } from '${importPath}';`;
  } else {
    // Add new import after other type imports
    const typeImportIndex = lines.findIndex(
      line => line.includes('import type') && line.includes('from')
    );

    if (typeImportIndex !== -1) {
      const importLine = `import type { ${typeNames.join(', ')} } from '${importPath}';`;
      lines.splice(typeImportIndex + 1, 0, importLine);
    }
  }
}

/**
 * Update import statements in files that use the moved types
 */
function updateImportStatements(movedTypes: Map<string, string>): string[] {
  const updatedFiles: string[] = [];

  try {
    for (const [typeName, newLocation] of movedTypes.entries()) {
      const grepCommand = `grep -rn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build --include="*.ts" --include="*.tsx" "import.*${typeName}" .`;

      try {
        const output = execSync(grepCommand, { encoding: 'utf-8' });
        const lines = output.split('\n').filter(Boolean);

        for (const line of lines) {
          const [filePath] = line.split(':');
          const normalizedPath = filePath.startsWith('./') ? filePath.slice(2) : filePath;

          if (!updatedFiles.includes(normalizedPath)) {
            const content = fs.readFileSync(normalizedPath, 'utf-8');
            const updatedContent = content.replace(
              new RegExp(`from ['"]@src/lib/db/schema/types['"]`, 'g'),
              `from '${newLocation}'`
            );

            if (content !== updatedContent) {
              fs.writeFileSync(normalizedPath, updatedContent);
              updatedFiles.push(normalizedPath);
            }
          }
        }
      } catch {
        // No matches found for this type, which is fine
      }
    }
  } catch (err) {
    logger.error('Error updating import statements:', err);
  }

  return updatedFiles;
}

/**
 * Main function to fix all type violations using configuration
 */
function fixTypeViolations(): IFixResult {
  const result: IFixResult = {
    fixedFiles: [],
    errors: [],
    skippedFiles: [],
  };

  try {
    logger.info('🔍 Finding type violations...');
    const violations = findTypeViolations();

    if (violations.length === 0) {
      logger.info('✅ No type violations found!');
      return result;
    }

    logger.info(
      `Found ${violations.length} type violations in ${new Set(violations.map(v => v.filePath)).size} files`
    );

    // Safety check
    if (violations.length > TYPES_CONFIG.maxTypesPerOperation) {
      logger.warn(
        `⚠️  Found ${violations.length} violations, which exceeds the safety limit of ${TYPES_CONFIG.maxTypesPerOperation}`
      );
      logger.warn('This might indicate a larger issue. Please review manually.');
      return result;
    }

    // Apply configured fixes
    const fixedFiles = applyConfiguredFixes(violations);
    result.fixedFiles.push(...fixedFiles);

    // Update import statements for moved types (legacy compatibility)
    const movedTypes = new Map<string, string>();
    violations
      .filter(v => v.filePath === 'src/lib/db/schema/types.ts')
      .forEach(v => movedTypes.set(v.typeName, '@src/lib/types/database.types'));

    const importUpdated = updateImportStatements(movedTypes);
    result.fixedFiles.push(...importUpdated);

    // Remove duplicates
    result.fixedFiles = [...new Set(result.fixedFiles)];

    logger.info(`✅ Fixed type violations in ${result.fixedFiles.length} files`);
    result.fixedFiles.forEach((file: string) => logger.info(`  - ${file}`));
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error('Error fixing type violations:', errorMsg);
    result.errors.push(errorMsg);
  }

  return result;
}

/**
 * Verify fixes if configured to do so
 */
function verifyFixes(): boolean {
  if (!TYPES_CONFIG.verifyAfterFix) {
    logger.info('⏭️  Skipping verification (disabled in config)');
    return true;
  }

  try {
    logger.info('🔍 Verifying fixes...');
    execSync('npx tsx scripts/utils/validate-types.ts', { stdio: 'pipe' });
    logger.info('✅ All type violations have been fixed!');
    return true;
  } catch {
    logger.error('❌ Some type violations remain after fixes');
    return false;
  }
}

function main() {
  try {
    const options = parseScriptArgs();
    logger.info(
      `🔧 Starting extensible type violation fixes in ${options.environment} environment...`
    );
    logger.info(`📋 Loaded ${TYPE_FIX_RULES.length} fix rules from configuration`);

    const result = fixTypeViolations();

    if (result.errors.length > 0) {
      logger.error('❌ Some fixes failed:');
      result.errors.forEach((errorMsg: string) => logger.error(`  - ${errorMsg}`));
      process.exit(1);
    }

    if (result.fixedFiles.length === 0) {
      logger.info('ℹ️  No files needed fixing');
      process.exit(0);
    }

    const verified = verifyFixes();

    if (verified) {
      logger.info('🎉 All type violations successfully fixed!');
      process.exit(0);
    } else {
      logger.error('❌ Verification failed - manual intervention may be required');
      process.exit(1);
    }
  } catch (err) {
    logger.error('Error during fix process:', err);
    process.exit(1);
  }
}

// Check if this is the main module in ES module format
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixTypeViolations, verifyFixes };
