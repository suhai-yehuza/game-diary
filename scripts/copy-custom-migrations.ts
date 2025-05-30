import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const sourceDir = join(process.cwd(), 'src/lib/db/migrations');
const targetDir = join(process.cwd(), 'drizzle');

// Ensure target directory exists
mkdirSync(targetDir, { recursive: true });

// Get all SQL files from source directory
const files = readdirSync(sourceDir).filter(file => file.endsWith('.sql'));

// Copy each file to target directory
files.forEach(file => {
  const sourcePath = join(sourceDir, file);
  const targetPath = join(targetDir, file);
  copyFileSync(sourcePath, targetPath);
  console.log(`Copied ${file} to drizzle directory`);
});
