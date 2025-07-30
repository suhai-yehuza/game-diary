#!/usr/bin/env node

/**
 * Utility script to sync .env.development to .env.local
 * This ensures that .env.development always takes priority
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');

// eslint-disable-next-line no-console
console.log('🔄 Environment Sync Utility');
// eslint-disable-next-line no-console
console.log('===========================\n');

const envDevelopmentPath = path.join(projectRoot, '.env.development');
const envLocalPath = path.join(projectRoot, '.env.local');

// Check if .env.development exists
if (!fs.existsSync(envDevelopmentPath)) {
  // eslint-disable-next-line no-console
  console.log('❌ .env.development not found');
  process.exit(1);
}

try {
  // Read .env.development
  const envDevelopmentContent = fs.readFileSync(envDevelopmentPath, 'utf8');

  // Write to .env.local (this will override .env.local with .env.development content)
  fs.writeFileSync(envLocalPath, envDevelopmentContent);

  // eslint-disable-next-line no-console
  console.log('✅ Successfully synced .env.development to .env.local');
  // eslint-disable-next-line no-console
  console.log(`📁 Source: ${envDevelopmentPath}`);
  // eslint-disable-next-line no-console
  console.log(`📁 Destination: ${envLocalPath}`);

  // Show a summary of what was copied
  const lines = envDevelopmentContent
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'));
  // eslint-disable-next-line no-console
  console.log(`\n📋 Copied ${lines.length} environment variables:`);
  lines.forEach(line => {
    const [key] = line.split('=');
    if (key) {
      // eslint-disable-next-line no-console
      console.log(`  - ${key.trim()}`);
    }
  });
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('❌ Error syncing environment files:', (error as Error).message);
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log('\n✨ Environment sync complete!');
// eslint-disable-next-line no-console
console.log('💡 Next.js will now load .env.local with .env.development content');
