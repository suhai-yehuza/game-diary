#!/usr/bin/env tsx

/**
 * Branch Name Validator
 *
 * Validates that branch names follow the project's naming conventions:
 * <type>/<ticket>-<description>
 *
 * Types: feature, bugfix, hotfix, chore, docs, refactor, test, perf, ci, security
 *
 * In CI/PR environments, validation is relaxed since branch names may be auto-generated.
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

/**
 * Regex to validate branch names.
 * Named capture groups:
 *   username:   [a-zA-Z0-9_-]+
 *   ticket:     [A-Z]+-\d+
 *   description:[a-z0-9-]+
 * Example: username/PROJECT-123-description
 */
const BRANCH_NAME_REGEX =
  /^(?<username>[a-zA-Z0-9_-]+)\/(?<ticket>[A-Z]+-\d+)-(?<description>[a-z0-9-]+)$/;

// Relaxed regex for CI/PR environments (allows more flexible naming)
const RELAXED_BRANCH_NAME_REGEX = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;

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

function getCurrentBranch(): string {
  try {
    // In CI environments, try to get branch from GITHUB_REF first
    if (process.env.GITHUB_REF) {
      const ref = process.env.GITHUB_REF;
      // Extract branch name from refs/heads/branch-name or refs/pull/123/head
      if (ref.startsWith('refs/heads/')) {
        return ref.replace('refs/heads/', '');
      } else if (ref.startsWith('refs/pull/')) {
        // For pull requests, use the PR number as branch identifier
        const prMatch = ref.match(/refs\/pull\/(\d+)\/head/);
        if (prMatch) {
          return `pr-${prMatch[1]}`;
        }
      }
    }

    // Fallback to git command
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    // In CI environments, if git command fails, try alternative approaches
    if (isCIEnvironment()) {
      // Try to get branch from git rev-parse
      try {
        const ref = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
        if (ref && ref !== 'HEAD') {
          return ref;
        }
      } catch (revParseError) {
        // If all else fails in CI, return a default branch name
        console.log('ℹ️  Could not determine branch name in CI environment, using default');
        return 'ci-branch';
      }
    }

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

  const isCI = isCIEnvironment();

  // Skip validation for main branches and CI-specific branches
  if (['main', 'master', 'develop', 'staging', 'deployment'].includes(branchName)) {
    return result;
  }

  // Skip validation for CI-generated branch names
  if (isCI && (branchName.startsWith('pr-') || branchName === 'ci-branch')) {
    result.warnings.push(
      `CI environment detected - skipping validation for auto-generated branch: ${branchName}`
    );
    return result;
  }

  // Use different validation based on environment
  if (isCI) {
    // Relaxed validation for CI/PR environments
    const relaxedMatch = branchName.match(RELAXED_BRANCH_NAME_REGEX);
    if (!relaxedMatch) {
      result.isValid = false;
      result.errors.push(
        `Branch name "${branchName}" does not follow basic pattern: <username>/<description>`
      );
      result.errors.push(`Example: syehuza/feature-name`);
      result.errors.push(`Example: github-actions/dependency-update`);
      result.errors.push('');
      result.errors.push(
        'Note: In CI/PR environments, branch naming is more flexible since branches may be auto-generated.'
      );
      return result;
    }

    // Add a note about relaxed validation
    result.warnings.push('CI/PR environment detected - using relaxed branch name validation');
  } else {
    // Strict validation for local development
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
  }

  return result;
}

function displayResult(branchName: string, result: ValidationResult): void {
  const isCI = isCIEnvironment();

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
    if (isCI) {
      console.log('💡 Examples of valid branch names for CI/PR environments:');
      console.log('   • syehuza/feature-name');
      console.log('   • github-actions/dependency-update');
      console.log('   • dependabot/npm-and-yarn');
      console.log('   • renovate/configure');
      console.log('   • bot/auto-merge');
      console.log('');
      console.log(
        'ℹ️  Note: In CI/PR environments, branch naming is more flexible since branches may be auto-generated.'
      );
    } else {
      console.log('💡 Examples of valid branch names:');
      console.log('   • syehuza/DYL-1234-feature-do-xyz');
      console.log('   • syehuza/DYL-025-bug-fix-xyz');
      console.log('   • john.doe/DYL-789-hotfix-critical-issue');
      console.log('   • jane.smith/DYL-101-chore-update-deps');
      console.log('   • dev.team/DYL-202-docs-update-readme');
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
Branch Name Validator

Validates that branch names follow the project's naming conventions.
In CI/PR environments, validation is relaxed since branch names may be auto-generated.

Local Development Format:
<username>/<PROJECT-123>-<description>

CI/PR Environment Format:
<username>/<description>

Usage:
  tsx scripts/git/validate-branch-name.ts [branch-name]
  tsx scripts/git/validate-branch-name.ts --current

Options:
  --current, -c    Validate the current branch (default)
  --help, -h       Show this help message

Examples (Local Development):
  tsx scripts/git/validate-branch-name.ts syehuza/DYL-1234-feature-do-xyz
  tsx scripts/git/validate-branch-name.ts --current

Examples (CI/PR Environment):
  tsx scripts/git/validate-branch-name.ts syehuza/feature-name
  tsx scripts/git/validate-branch-name.ts github-actions/dependency-update

Format: username/PROJECT-123-description (local) or username/description (CI/PR)
    `);
    process.exit(0);
  }

  // Skip validation entirely in CI environments
  if (isCIEnvironment()) {
    console.log('ℹ️  CI environment detected - skipping branch name validation');
    console.log('✅ Branch name validation skipped (CI environment)');
    return;
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
