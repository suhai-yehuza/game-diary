#!/usr/bin/env tsx

/**
 * Commit Message Validator
 *
 * Validates that commit messages follow the Conventional Commits format:
 * <type>[optional scope]: <description>
 *
 * [optional body]
 * [optional footer(s)]
 *
 * In CI/PR environments, validation is relaxed since commits will be squashed later.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const VALID_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'chore',
  'ci',
  'revert',
  'security',
];

const VALID_SCOPES = ['api', 'ui', 'db', 'auth', 'test', 'deps', 'config', 'build', 'deploy'];

// Conventional Commits regex pattern with ticket number and username (strict)
const COMMIT_MESSAGE_REGEX =
  /^(feat|fix|docs|style|refactor|perf|test|chore|ci|revert|security)(\([a-z-]+\))?(!)?: \[([A-Z]+-\d+)\] \[(@[a-zA-Z0-9_-]+)\] (.+)$/;

// Relaxed regex for CI/PR environments (no ticket/username requirement)
const RELAXED_COMMIT_MESSAGE_REGEX =
  /^(feat|fix|docs|style|refactor|perf|test|chore|ci|revert|security)(\([a-z-]+\))?(!)?: (.+)$/;

// Breaking change pattern
const BREAKING_CHANGE_REGEX = /^BREAKING CHANGE: .+$/;

// Check if we're in a CI/PR environment
function isCIEnvironment(): boolean {
  return !!(
    process.env.CI === 'true' ||
    process.env.GITHUB_ACTIONS === 'true' ||
    process.env.VERCEL === '1' ||
    process.env.GITHUB_EVENT_NAME === 'pull_request' ||
    process.env.GITHUB_EVENT_NAME === 'push' ||
    process.env.GITHUB_REF?.startsWith('refs/pull/') ||
    process.env.GITHUB_REF?.startsWith('refs/heads/gh-readonly-queue/')
  );
}

function getCommitMessage(): string {
  // Husky v6+ passes the commit message file path as the first argument
  const commitMsgFile = process.argv[2] || process.env.HUSKY_GIT_PARAMS || '.git/COMMIT_EDITMSG';

  try {
    return readFileSync(commitMsgFile, 'utf8').trim();
  } catch (error) {
    console.error('❌ Error reading commit message file:', error);
    process.exit(1);
  }
}

function validateCommitMessage(message: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  const isCI = isCIEnvironment();

  // Skip validation entirely in CI environments
  if (isCI) {
    result.warnings.push('CI environment detected - skipping commit message validation');
    return result;
  }

  const lines = message.split('\n');
  const subject = lines[0];
  let breaking: string | undefined;

  // Check if subject line exists
  if (!subject || subject.trim() === '') {
    result.isValid = false;
    result.errors.push('Commit message cannot be empty');
    return result;
  }

  // Check subject line length (relaxed in CI environments)
  if (subject.length > 100) {
    result.isValid = false;
    result.errors.push(
      `Subject line is too long (${subject.length} chars). Maximum is 100 characters.`
    );
  }

  // Check for breaking change indicator in subject
  if (subject.includes('!:')) {
    result.warnings.push('Breaking change indicator detected in subject line');
  }

  // Validate subject line format
  const match = subject.match(COMMIT_MESSAGE_REGEX);

  if (!match) {
    result.isValid = false;
    result.errors.push(
      `Subject line does not follow the required format: <type>[optional scope]: [TICKET-NUMBER] [@username] <description>`
    );
    result.errors.push(`Example: feat: [DYL-1234] [@syehuza] add user profile page`);
    result.errors.push(`Example: fix(api): [DYL-025] [@syehuza] resolve login validation issue`);
    return result;
  }

  const [, type, scope, breakingIndicator, ticket, username, description] = match;

  // Validate type
  if (!VALID_TYPES.includes(type)) {
    result.isValid = false;
    result.errors.push(`Invalid type "${type}". Valid types: ${VALID_TYPES.join(', ')}`);
  }

  // Validate scope (if provided)
  if (scope) {
    const scopeName = scope.slice(1, -1); // Remove parentheses
    if (!VALID_SCOPES.includes(scopeName)) {
      result.warnings.push(
        `Scope "${scopeName}" is not in the standard list. Valid scopes: ${VALID_SCOPES.join(', ')}`
      );
    }
  }

  // Validate ticket format
  if (!/^[A-Z]+-\d+$/.test(ticket)) {
    result.isValid = false;
    result.errors.push(`Ticket must be in format PROJECT-123, got "${ticket}"`);
  }

  // Validate username format
  if (!username.startsWith('@')) {
    result.isValid = false;
    result.errors.push(`Username must start with @, got "${username}"`);
  }

  // Validate description
  if (description.length < 3) {
    result.isValid = false;
    result.errors.push(`Description must be at least 3 characters long, got "${description}"`);
  }

  if (description.length > 50) {
    result.warnings.push(
      `Description is quite long (${description.length} chars). Consider making it more concise.`
    );
  }

  // Check for common issues
  if (description.includes('_')) {
    result.warnings.push('Consider using hyphens instead of underscores in description');
  }

  if (description.includes(' ')) {
    result.warnings.push('Consider using hyphens instead of spaces in description');
  }

  // Check body lines (if any)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === '') {
      continue;
    }

    // Check for breaking change footer
    if (line.match(BREAKING_CHANGE_REGEX)) {
      breaking = line;
      continue;
    }

    // Check line length
    if (line.length > 100) {
      result.warnings.push(`Body line ${i + 1} is quite long (${line.length} chars)`);
    }
  }

  return result;
}

function displayResult(message: string, result: ValidationResult): void {
  const isCI = isCIEnvironment();

  console.log('🔍 Validating commit message:');
  console.log('─'.repeat(50));
  console.log(message);
  console.log('─'.repeat(50));
  console.log('');

  if (result.isValid && result.warnings.length === 0) {
    console.log('✅ Commit message is valid!');
    return;
  }

  if (!result.isValid) {
    console.log('❌ Commit message validation failed:');
    result.errors.forEach(error => {
      console.log(`   • ${error}`);
    });
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    result.warnings.forEach(warning => {
      console.log(`   • ${warning}`);
    });
    console.log('');
  }

  if (!result.isValid) {
    if (isCI) {
      console.log('💡 Examples of valid commit messages for CI/PR environments:');
      console.log('   • feat: add user profile page');
      console.log('   • fix(api): resolve login validation issue');
      console.log('   • docs: update README with setup instructions');
      console.log('   • refactor(ui): simplify component structure');
      console.log('   • feat(api)!: change user endpoint response format');
      console.log('');
      console.log('💡 For breaking changes, include a BREAKING CHANGE: footer:');
      console.log('   feat(api)!: change user endpoint response format');
      console.log('');
      console.log(
        'ℹ️  Note: In CI/PR environments, ticket numbers and usernames are optional since commits will be squashed.'
      );
    } else {
      console.log('💡 Examples of valid commit messages:');
      console.log('   • feat: [DYL-1234] [@syehuza] add user profile page');
      console.log('   • fix(api): [DYL-025] [@syehuza] resolve login validation issue');
      console.log('   • docs: [DYL-789] [@syehuza] update README with setup instructions');
      console.log('   • refactor(ui): [DYL-101] [@syehuza] simplify component structure');
      console.log('   • feat(api)!: [DYL-202] [@syehuza] change user endpoint response format');
      console.log('');
      console.log('💡 For breaking changes, include a BREAKING CHANGE: footer:');
      console.log('   feat(api)!: [DYL-202] [@syehuza] change user endpoint response format');
      console.log('');
      console.log('   BREAKING CHANGE: The user endpoint now returns a different JSON structure.');
      console.log('');
    }

    process.exit(1);
  }
}

function main(): void {
  const args = process.argv.slice(2);

  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Commit Message Validator

Validates that commit messages follow the Conventional Commits format.
In CI/PR environments, validation is relaxed since commits will be squashed later.

Local Development Format:
<type>[optional scope]: [TICKET-NUMBER] [@username] <description>

CI/PR Environment Format:
<type>[optional scope]: <description>

Usage:
  tsx scripts/git/validate-commit-message.ts [message]
  tsx scripts/git/validate-commit-message.ts --file <file>

Options:
  --file <file>    Validate commit message from file
  --help, -h       Show this help message

Examples (Local Development):
  tsx scripts/git/validate-commit-message.ts "feat: [DYL-1234] [@syehuza] add user profile"
  tsx scripts/git/validate-commit-message.ts --file .git/COMMIT_EDITMSG

Examples (CI/PR Environment):
  tsx scripts/git/validate-commit-message.ts "feat: add user profile"
  tsx scripts/git/validate-commit-message.ts "fix(api): resolve login issue"

Valid types: ${VALID_TYPES.join(', ')}
Valid scopes: ${VALID_SCOPES.join(', ')}
    `);
    process.exit(0);
  }

  // Skip validation entirely in CI environments
  if (isCIEnvironment()) {
    console.log('ℹ️  CI environment detected - skipping commit message validation');
    console.log('✅ Commit message validation skipped (CI environment)');
    return;
  }

  let message: string;

  if (args.includes('--file')) {
    const fileIndex = args.indexOf('--file');
    const filePath = args[fileIndex + 1];
    if (!filePath) {
      console.error('❌ File path required after --file');
      process.exit(1);
    }
    try {
      message = readFileSync(filePath, 'utf8').trim();
    } catch (error) {
      console.error('❌ Error reading file:', error);
      process.exit(1);
    }
  } else if (args.length > 0) {
    message = args.join(' ');
  } else {
    message = getCommitMessage();
  }

  const result = validateCommitMessage(message);
  displayResult(message, result);
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateCommitMessage, VALID_TYPES, VALID_SCOPES, COMMIT_MESSAGE_REGEX };
export type { ValidationResult };
