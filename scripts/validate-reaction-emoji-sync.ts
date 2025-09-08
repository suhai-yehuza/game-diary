#!/usr/bin/env tsx

/**
 * Validation script to ensure reaction emojis are in sync across:
 * 1. src/lib/constants/index.ts (REACTION_EMOJIS)
 * 2. src/lib/db/migrations/data/001_reaction_emojis.sql
 * 3. scripts/db/setup-complete-database.ts
 *
 * Run with: pnpm tsx scripts/validate-reaction-emoji-sync.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  constants: string[];
  migration: string[];
  setupScript: string[];
  mismatches: string[];
  isInSync: boolean;
}

function extractEmojisFromConstants(filePath: string): string[] {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const match = content.match(/export const REACTION_EMOJIS = \{[\s\S]*?\}/);
    if (!match) return [];

    const emojiMatches = match[0].match(/'([^']+)'/g);
    return emojiMatches ? emojiMatches.map(m => m.slice(1, -1)) : [];
  } catch (error) {
    console.error('Error reading constants file:', error);
    return [];
  }
}

function extractEmojisFromMigration(filePath: string): string[] {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const match = content.match(/INSERT INTO "reaction_emojis" \("emoji"\) VALUES[\s\S]*?;/);
    if (!match) return [];

    const emojiMatches = match[0].match(/\('([^']+)'\)/g);
    return emojiMatches ? emojiMatches.map(m => m.slice(2, -2)) : [];
  } catch (error) {
    console.error('Error reading migration file:', error);
    return [];
  }
}

function extractEmojisFromSetupScript(filePath: string): string[] {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const match = content.match(/const emojis = \[[\s\S]*?\];/);
    if (!match) return [];

    const emojiMatches = match[0].match(/'([^']+)'/g);
    return emojiMatches ? emojiMatches.map(m => m.slice(1, -1)) : [];
  } catch (error) {
    console.error('Error reading setup script:', error);
    return [];
  }
}

function validateReactionEmojiSync(): ValidationResult {
  const projectRoot = process.cwd();

  const constantsPath = join(projectRoot, 'src/lib/constants/index.ts');
  const migrationPath = join(projectRoot, 'src/lib/db/migrations/data/001_reaction_emojis.sql');
  const setupScriptPath = join(projectRoot, 'scripts/db/setup-complete-database.ts');

  const constants = extractEmojisFromConstants(constantsPath);
  const migration = extractEmojisFromMigration(migrationPath);
  const setupScript = extractEmojisFromSetupScript(setupScriptPath);

  const mismatches: string[] = [];

  // Check if all arrays have the same length
  if (constants.length !== migration.length) {
    mismatches.push(`Constants has ${constants.length} emojis, migration has ${migration.length}`);
  }

  if (constants.length !== setupScript.length) {
    mismatches.push(
      `Constants has ${constants.length} emojis, setup script has ${setupScript.length}`
    );
  }

  // Check if all emojis match exactly
  for (let i = 0; i < Math.max(constants.length, migration.length, setupScript.length); i++) {
    const c = constants[i];
    const m = migration[i];
    const s = setupScript[i];

    if (c !== m) {
      mismatches.push(`Position ${i}: Constants "${c}" vs Migration "${m}"`);
    }
    if (c !== s) {
      mismatches.push(`Position ${i}: Constants "${c}" vs Setup Script "${s}"`);
    }
  }

  return {
    constants,
    migration,
    setupScript,
    mismatches,
    isInSync: mismatches.length === 0,
  };
}

function main() {
  console.log('🔍 Validating reaction emoji synchronization...\n');

  const result = validateReactionEmojiSync();

  console.log('📊 Results:');
  console.log(`Constants: ${result.constants.length} emojis`);
  console.log(`Migration: ${result.migration.length} emojis`);
  console.log(`Setup Script: ${result.setupScript.length} emojis\n`);

  if (result.isInSync) {
    console.log('✅ All reaction emojis are in sync!');
    console.log('\nEmojis in order:');
    result.constants.forEach((emoji, index) => {
      console.log(`${index + 1}. ${emoji}`);
    });
  } else {
    console.log('❌ Reaction emojis are NOT in sync!');
    console.log('\nMismatches found:');
    result.mismatches.forEach(mismatch => {
      console.log(`  - ${mismatch}`);
    });

    console.log('\nConstants emojis:', result.constants.join(' '));
    console.log('Migration emojis:', result.migration.join(' '));
    console.log('Setup script emojis:', result.setupScript.join(' '));

    process.exit(1);
  }
}

// ES module equivalent
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
