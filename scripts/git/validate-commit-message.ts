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

  const lines = message.split('\n');
  const subject = lines[0];
  const isCI = isCIEnvironment();
  let breaking: string | undefined;

  // Check if subject line exists
  if (!subject || subject.trim() === '') {
    result.isValid = false;
    result.errors.push('Commit message cannot be empty');
    return result;
  }

  // Check subject line length (relaxed in CI environments)
  if (isCI) {
    if (subject.length > 200) {
      result.isValid = false;
      result.errors.push(
        `Subject line is too long (${subject.length} chars). Maximum is 100 characters in CI environments.`
      );
    }
  } else {
    if (subject.length > 72) {
      result.isValid = false;
      result.errors.push(
        `Subject line is too long (${subject.length} chars). Maximum is 72 characters.`
      );
    }
  }

  // Use different validation based on environment
  if (isCI) {
    // Relaxed validation for CI/PR environments
    const relaxedMatch = subject.match(RELAXED_COMMIT_MESSAGE_REGEX);
    if (!relaxedMatch) {
      result.isValid = false;
      result.errors.push('Subject line does not follow conventional commits format');
      result.errors.push('Expected format: <type>[optional scope]: <description>');
      result.errors.push(`Valid types: ${VALID_TYPES.join(', ')}`);
      result.errors.push('Example: feat(ui): add user profile component');
      result.errors.push('');
      result.errors.push(
        'Note: In CI/PR environments, ticket numbers and usernames are optional since commits will be squashed.'
      );
      return result;
    }

    const [, type, scope, breakingIndicator, description] = relaxedMatch;
    breaking = breakingIndicator;

    // Validate type
    if (!VALID_TYPES.includes(type)) {
      result.isValid = false;
      result.errors.push(`Invalid type "${type}". Valid types: ${VALID_TYPES.join(', ')}`);
    }

    // Validate scope if present
    if (scope) {
      const scopeName = scope.slice(1, -1); // Remove parentheses
      if (!VALID_SCOPES.includes(scopeName)) {
        result.warnings.push(
          `Scope "${scopeName}" is not in the standard list. Valid scopes: ${VALID_SCOPES.join(', ')}`
        );
      }
    }

    // Check for breaking change indicator
    if (breaking && !message.includes('BREAKING CHANGE:')) {
      result.warnings.push(
        'Breaking change indicator (!) used but no BREAKING CHANGE: footer found'
      );
    }

    // Add a note about relaxed validation
    result.warnings.push(
      'CI/PR environment detected - using relaxed validation (ticket numbers and usernames optional)'
    );
  } else {
    // Strict validation for local development
    const match = subject.match(COMMIT_MESSAGE_REGEX);
    if (!match) {
      result.isValid = false;
      result.errors.push('Subject line does not follow required format');
      result.errors.push(
        'Expected format: <type>[optional scope]: [TICKET-NUMBER] [@username] <description>'
      );
      result.errors.push(`Valid types: ${VALID_TYPES.join(', ')}`);
      result.errors.push('Example: feat(ui): [DYL-1234] [@syehuza] add user profile component');
      result.errors.push('Ticket format: [DYL-1234] or [PROJ-456]');
      result.errors.push('Username format: [@username] (must start with @)');
      return result;
    }

    const [, type, scope, breakingIndicator, ticketNumber, username, description] = match;
    breaking = breakingIndicator;

    // Validate type
    if (!VALID_TYPES.includes(type)) {
      result.isValid = false;
      result.errors.push(`Invalid type "${type}". Valid types: ${VALID_TYPES.join(', ')}`);
    }

    // Validate scope if present
    if (scope) {
      const scopeName = scope.slice(1, -1); // Remove parentheses
      if (!VALID_SCOPES.includes(scopeName)) {
        result.warnings.push(
          `Scope "${scopeName}" is not in the standard list. Valid scopes: ${VALID_SCOPES.join(', ')}`
        );
      }
    }

    // Validate ticket number format
    if (ticketNumber) {
      const ticketRegex = /^[A-Z]+-\d+$/;
      if (!ticketRegex.test(ticketNumber)) {
        result.isValid = false;
        result.errors.push(
          `Invalid ticket format "${ticketNumber}". Expected format: PROJ-123 or JIRA-456`
        );
      }
    }

    // Validate username format
    if (username) {
      const usernameRegex = /^@[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(username)) {
        result.isValid = false;
        result.errors.push(
          `Invalid username format "${username}". Must be in format @username with only letters, numbers, hyphens, and underscores`
        );
      }
    }

    // Check for breaking change indicator
    if (breaking && !message.includes('BREAKING CHANGE:')) {
      result.warnings.push(
        'Breaking change indicator (!) used but no BREAKING CHANGE: footer found'
      );
    }
  }

  // Validate body (if present) - same for both environments
  if (lines.length > 1) {
    const body = lines.slice(1);

    // Check for blank line after subject
    if (body[0] !== '') {
      result.isValid = false;
      result.errors.push('Subject and body must be separated by a blank line');
    }

    // Check body lines length
    body.forEach((line, index) => {
      if (line.length > 72) {
        result.warnings.push(
          `Body line ${index + 1} is quite long (${line.length} chars). Consider wrapping at 72 characters.`
        );
      }
    });

    // Check for breaking change footer
    const hasBreakingChange = body.some(line => BREAKING_CHANGE_REGEX.test(line));
    if (breaking && !hasBreakingChange) {
      result.warnings.push(
        'Breaking change indicator (!) used but no BREAKING CHANGE: footer found'
      );
    }
  }

  // Check for imperative mood
  const imperativeWords = [
    'add',
    'fix',
    'update',
    'remove',
    'change',
    'refactor',
    'improve',
    'optimize',
    'implement',
  ];
  let subjectWords: string | undefined;
  const subjectParts = subject.split(':');
  if (subjectParts.length > 1 && subjectParts[1]) {
    subjectWords = subjectParts[1].trim().split(' ')[0]?.toLowerCase();
  }
  if (subjectWords && !imperativeWords.some(word => subjectWords.startsWith(word))) {
    result.warnings.push(
      `Consider using imperative mood in commit message. Example: "add" instead of "added"`
    );
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
      console.log('   BREAKING CHANGE: The user endpoint now returns a different JSON structure.');
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
