#!/usr/bin/env node

/**
 * Utility script to check which environment variables are being loaded
 * and verify the priority order
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Environment Loading Check');
console.log('============================\n');

// Check which environment files exist
const envFiles = ['.env', '.env.local', '.env.development', '.env.staging', '.env.production'];

console.log('📁 Environment Files:');
envFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', '..', file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n🔧 Current Environment:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);

console.log('\n🔑 Clerk Environment Variables:');
const clerkVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
];

clerkVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = value ? `${value.substring(0, 20)}...` : 'not set';
  console.log(`  ${status} ${varName}: ${displayValue}`);
});

console.log('\n📊 Environment Loading Order:');
if (process.env.NODE_ENV === 'development') {
  console.log('  1. .env');
  console.log('  2. .env.development (prioritized)');
  console.log('  3. .env.local (override)');
} else {
  console.log('  1. .env');
  console.log('  2. .env.local');
  console.log('  3. .env.development');
}

console.log('\n✨ Environment check complete!');
