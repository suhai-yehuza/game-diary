#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const SRC_DIR = join(process.cwd(), 'src');
const TSCONFIG_PATH = join(process.cwd(), 'tsconfig.json');

if (!existsSync(SRC_DIR)) {
  console.error('❌ src directory not found');
  process.exit(1);
}

if (!existsSync(TSCONFIG_PATH)) {
  console.error('❌ tsconfig.json not found');
  process.exit(1);
}

try {
  console.log('🔍 Checking for circular dependencies...');

  const command = `madge --circular --extensions ts,tsx --ts-config tsconfig.json src/`;
  const result = execSync(command, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  // Always print the full output
  console.log(result);

  // If the output only contains the processed files line and no cycles, treat as success
  const lines = result
    .split('\n')
    .map((l: string) => l.trim())
    .filter((l: string) => Boolean(l));
  const processedLine = lines.find((l: string) => l.startsWith('Processed'));
  const hasCycles = lines.some(
    (l: string) =>
      l &&
      l !== processedLine &&
      !l.startsWith('✔') &&
      !l.startsWith('⚠') &&
      !l.startsWith('No circular') &&
      !l.startsWith('Processed') &&
      !l.startsWith('(')
  );

  if (!hasCycles) {
    console.log('✅ No circular dependencies found!');
    // Check for warnings about skipped files
    const warningMatch = result.match(/\((\d+) warning\)/);
    if (warningMatch) {
      const warningCount = parseInt(warningMatch[1]);
      if (warningCount > 0) {
        console.log(
          `⚠️  ${warningCount} file(s) were skipped (likely config files or external imports)`
        );
        console.log("   This is normal and doesn't affect the circular dependency analysis.");
      }
    }
    process.exit(0);
  } else {
    console.log('❌ Circular dependencies found!');
    process.exit(1);
  }
} catch (error: any) {
  if (error.stdout) {
    const output = error.stdout.toString();
    console.log(output);
    // If the output only contains the processed files line and no cycles, treat as success
    const lines = output
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => Boolean(l));
    const processedLine = lines.find((l: string) => l.startsWith('Processed'));
    const hasCycles = lines.some(
      (l: string) =>
        l &&
        l !== processedLine &&
        !l.startsWith('✔') &&
        !l.startsWith('⚠') &&
        !l.startsWith('No circular') &&
        !l.startsWith('Processed') &&
        !l.startsWith('(')
    );
    if (!hasCycles) {
      console.log('✅ No circular dependencies found!');
      // Check for warnings about skipped files
      const warningMatch = output.match(/\((\d+) warning\)/);
      if (warningMatch) {
        const warningCount = parseInt(warningMatch[1]);
        if (warningCount > 0) {
          console.log(
            `⚠️  ${warningCount} file(s) were skipped (likely config files or external imports)`
          );
          console.log("   This is normal and doesn't affect the circular dependency analysis.");
        }
      }
      process.exit(0);
    } else {
      console.log('❌ Circular dependencies found!');
      process.exit(1);
    }
  } else {
    console.error('❌ Error running madge:', error.message);
    process.exit(1);
  }
}
