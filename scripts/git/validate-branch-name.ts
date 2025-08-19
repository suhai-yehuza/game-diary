#!/usr/bin/env tsx

/**
 * Branch Name Validator
 *
 * Validates that branch names follow the project's naming conventions:
 * <type>/<ticket>-<description>
 *
 * Types: feature, bugfix, hotfix, chore, docs, refactor, test, perf, ci, security
 */

import { execSync } from 'child_process';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const VALID_TYPES = [
  'feature',
  'bugfix',
  'hotfix',
  'chore',
  'docs',
  'refactor',
  'test',
  'perf',
  'ci',
  'security',
];

const BRANCH_NAME_REGEX = /^([a-zA-Z0-9_-]+)\/([A-Z]+-\d+)-([a-z0-9-]+)$/;

function getCurrentBranch(): string {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error('❌ Error getting current branch:', error);
    process.exit(1);
  }
}

function validateBranchName(branchName: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Skip validation for main branches
  if (['main', 'master', 'develop', 'staging', 'deployment'].includes(branchName)) {
    return result;
  }

  // Check if branch name matches the required pattern
  const match = branchName.match(BRANCH_NAME_REGEX);

  if (!match) {
    result.isValid = false;
    result.errors.push(
      `Branch name "${branchName}" does not follow the required pattern: <username>/<PROJECT-123>-<description>`
    );
    result.errors.push(`Example: syehuza/DYL-1234-feature-do-xyz`);
    result.errors.push(`Example: syehuza/DYL-025-bug-fix-xyz`);
    return result;
  }

  const [, username, ticket, description] = match;

  // Validate username
  if (username.length < 2) {
    result.isValid = false;
    result.errors.push(`Username must be at least 2 characters long, got "${username}"`);
  }

  // Validate ticket format
  if (!/^[A-Z]+-\d+$/.test(ticket)) {
    result.isValid = false;
    result.errors.push(`Ticket must be in format PROJECT-123, got "${ticket}"`);
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
    result.isValid = false;
    result.errors.push('Description should not contain spaces. Use hyphens instead.');
  }

  return result;
}

function displayResult(branchName: string, result: ValidationResult): void {
  console.log(`🔍 Validating branch name: "${branchName}"`);
  console.log('');

  if (result.isValid && result.warnings.length === 0) {
    console.log('✅ Branch name is valid!');
    return;
  }

  if (!result.isValid) {
    console.log('❌ Branch name validation failed:');
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
    console.log('💡 Examples of valid branch names:');
    console.log('   • syehuza/DYL-1234-feature-do-xyz');
    console.log('   • syehuza/DYL-025-bug-fix-xyz');
    console.log('   • john.doe/DYL-789-hotfix-critical-issue');
    console.log('   • jane.smith/DYL-101-chore-update-deps');
    console.log('   • dev.team/DYL-202-docs-update-readme');
    console.log('');

    process.exit(1);
  }
}

function main(): void {
  const args = process.argv.slice(2);

  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Branch Name Validator

Validates that branch names follow the project's naming conventions:
<username>/<PROJECT-123>-<description>

Usage:
  tsx scripts/git/validate-branch-name.ts [branch-name]
  tsx scripts/git/validate-branch-name.ts --current

Options:
  --current, -c    Validate the current branch (default)
  --help, -h       Show this help message

Examples:
  tsx scripts/git/validate-branch-name.ts syehuza/DYL-1234-feature-do-xyz
  tsx scripts/git/validate-branch-name.ts --current

Format: username/PROJECT-123-description
    `);
    process.exit(0);
  }

  let branchName: string;

  if (args.length === 0 || args.includes('--current') || args.includes('-c')) {
    branchName = getCurrentBranch();
  } else {
    branchName = args[0];
  }

  const result = validateBranchName(branchName);
  displayResult(branchName, result);
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateBranchName, VALID_TYPES, BRANCH_NAME_REGEX };
export type { ValidationResult };
