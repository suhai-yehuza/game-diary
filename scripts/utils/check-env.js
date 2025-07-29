#!/usr/bin/env node

/**
 * Utility script to check which environment variables are being loaded
 * and verify the priority order
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment files in the correct order
const projectRoot = path.join(__dirname, '..', '..');
const nodeEnv = process.env.NODE_ENV || 'development';

// Load .env.development first (or appropriate env file)
const envFile = `.env.${nodeEnv}`;
const envPath = path.join(projectRoot, envFile);
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Then load .env.local as override
const localEnvPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath, override: true });
}

console.log('🔍 Environment Loading Check');
console.log('============================\n');

// Check which environment files exist
const envFiles = ['.env.local', '.env.development', '.env.staging', '.env.production'];

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
  console.log('  1. .env.development (prioritized)');
  console.log('  2. .env.local (override)');
} else {
  console.log('  1. .env.local');
  console.log('  2. .env.development');
}

console.log('\n✨ Environment check complete!');
