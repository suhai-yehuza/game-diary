import fs from 'fs';
import path from 'path';

const MIGRATIONS_DIR = path.join(process.cwd(), 'src/lib/db/migrations');

interface MigrationConfig {
  name: string;
  type: 'base' | 'feature' | 'trigger';
  description: string;
}

function validateMigrationName(name: string): boolean {
  // Ensure migration name follows convention: YYYYMMDD_description
  const datePattern = /^\d{8}_/;
  return datePattern.test(name);
}

function getNextMigrationNumber(type: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const existingMigrations = fs
    .readdirSync(path.join(MIGRATIONS_DIR, type))
    .filter(file => file.endsWith('.sql'))
    .map(file => parseInt(file.split('_')[0]))
    .filter(num => !isNaN(num));

  const maxNumber = Math.max(0, ...existingMigrations);
  return `${date}_${maxNumber + 1}`;
}

function createMigration(config: MigrationConfig) {
  const { name, type, description } = config;

  if (!validateMigrationName(name)) {
    throw new Error('Migration name must start with YYYYMMDD_');
  }

  const migrationDir = path.join(MIGRATIONS_DIR, type);
  const migrationFile = path.join(migrationDir, `${name}.sql`);
  const metaFile = path.join(migrationDir, 'meta', `${name}.json`);

  // Create migration file
  fs.writeFileSync(migrationFile, `-- Migration: ${description}\n\n`);

  // Create meta file
  fs.writeFileSync(
    metaFile,
    JSON.stringify(
      {
        version: '1.0',
        type,
        description,
        createdAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  console.log(`Created migration: ${migrationFile}`);
}

function generateMigration() {
  const type = process.argv[2];
  const description = process.argv[3];

  if (!type || !description) {
    console.error('Usage: pnpm manage-migrations generate <type> <description>');
    process.exit(1);
  }

  if (!['base', 'feature', 'trigger'].includes(type)) {
    console.error('Type must be one of: base, feature, trigger');
    process.exit(1);
  }

  const name = getNextMigrationNumber(type);
  createMigration({ name, type: type as 'base' | 'feature' | 'trigger', description });
}

function validateMigrations() {
  // Check for duplicate migration numbers
  const migrations = new Map<string, string[]>();

  ['base', 'feature', 'trigger'].forEach(type => {
    const dir = path.join(MIGRATIONS_DIR, type);
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir)
        .filter(file => file.endsWith('.sql'))
        .forEach(file => {
          const number = file.split('_')[0];
          if (!migrations.has(number)) {
            migrations.set(number, []);
          }
          migrations.get(number)?.push(file);
        });
    }
  });

  // Report any duplicates
  migrations.forEach((files, number) => {
    if (files.length > 1) {
      console.error(`Warning: Duplicate migration number ${number} found in:`, files);
    }
  });
}

// Command handling
const command = process.argv[2];

switch (command) {
  case 'generate':
    generateMigration();
    break;
  case 'validate':
    validateMigrations();
    break;
  default:
    console.error('Unknown command. Available commands: generate, validate');
    process.exit(1);
}
