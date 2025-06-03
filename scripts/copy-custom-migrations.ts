import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { logger } from '@/lib/logger';
const sourceDir = join(process.cwd(), 'src/lib/db/migrations');
const targetDir = join(process.cwd(), 'drizzle');

// Ensure target directory exists
mkdirSync(targetDir, { recursive: true });

// Function to recursively get all SQL files from the src/lib/db/migrations directory
function getAllSqlFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllSqlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.sql')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Get all SQL files recursively
const files = getAllSqlFiles(sourceDir);

// Copy each file to target directory
files.forEach(file => {
  const relativePath = file.replace(sourceDir, '').replace(/^\//, '');
  const targetPath = join(targetDir, relativePath);

  // Ensure the target directory exists
  mkdirSync(join(targetDir, relativePath.split('/').slice(0, -1).join('/')), { recursive: true });

  copyFileSync(file, targetPath);
  logger.info(`Copied ${relativePath} to drizzle directory`);
});
