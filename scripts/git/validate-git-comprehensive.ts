#!/usr/bin/env tsx

/**
 * Comprehensive Git Validation Script
 *
 * Validates both branch names and commit messages with CI-aware relaxed validation.
 * In CI/PR environments, validation is relaxed since commits will be squashed later.
 */

import { execSync } from 'child_process';
import { validateBranchName } from './validate-branch-name.js';
import { validateCommitMessage } from './validate-commit-message.js';

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
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error('❌ Error getting current branch:', error);
    process.exit(1);
  }
}

function getRecentCommits(count: number = 5): string[] {
  try {
    const output = execSync(`git log --oneline -${count}`, { encoding: 'utf8' });
    return output
      .trim()
      .split('\n')
      .filter(line => line.trim());
  } catch (error) {
    console.error('❌ Error getting recent commits:', error);
    return [];
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const isCI = isCIEnvironment();

  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Comprehensive Git Validation Script

Validates both branch names and commit messages with CI-aware relaxed validation.
In CI/PR environments, validation is relaxed since commits will be squashed later.

Usage:
  tsx scripts/git/validate-git-comprehensive.ts [options]

Options:
  --commits=N        Number of recent commits to validate (default: 5)
  --skip-commits     Skip commit message validation
  --skip-branch      Skip branch name validation
  --help, -h         Show this help message

Examples:
  tsx scripts/git/validate-git-comprehensive.ts
  tsx scripts/git/validate-git-comprehensive.ts --commits=10
  tsx scripts/git/validate-git-comprehensive.ts --skip-commits
    `);
    process.exit(0);
  }

  // Parse options
  const skipCommits = args.includes('--skip-commits');
  const skipBranch = args.includes('--skip-branch');
  const commitsArg = args.find(arg => arg.startsWith('--commits='));
  const commitCount = commitsArg ? parseInt(commitsArg.split('=')[1]) : 5;

  console.log('🔍 Running comprehensive git validation...');
  console.log('─'.repeat(60));

  if (isCI) {
    console.log('ℹ️  CI/PR environment detected - using relaxed validation');
  }
  console.log('');

  let hasErrors = false;

  // 1. Validate branch name
  if (!skipBranch) {
    console.log('📋 Validating branch name...');
    const branchName = getCurrentBranch();
    const branchResult = validateBranchName(branchName);

    if (!branchResult.isValid) {
      console.log('❌ Branch name validation failed:');
      branchResult.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
      hasErrors = true;
    } else {
      console.log('✅ Branch name validation passed');
    }

    if (branchResult.warnings.length > 0) {
      console.log('⚠️  Branch warnings:');
      branchResult.warnings.forEach(warning => {
        console.log(`   • ${warning}`);
      });
    }
    console.log('');
  }

  // 2. Validate recent commits
  if (!skipCommits) {
    console.log(`📝 Validating ${commitCount} recent commit(s)...`);
    const commits = getRecentCommits(commitCount);

    if (commits.length === 0) {
      console.log('ℹ️  No commits found to validate');
    } else {
      for (const commit of commits) {
        const [hash, ...messageParts] = commit.split(' ');
        const message = messageParts.join(' ');

        console.log(`   Validating: ${hash} - ${message}`);
        const commitResult = validateCommitMessage(message);

        if (!commitResult.isValid) {
          console.log('   ❌ Commit validation failed:');
          commitResult.errors.forEach(error => {
            console.log(`      • ${error}`);
          });
          hasErrors = true;
        } else {
          console.log('   ✅ Commit validation passed');
        }

        if (commitResult.warnings.length > 0) {
          console.log('   ⚠️  Commit warnings:');
          commitResult.warnings.forEach(warning => {
            console.log(`      • ${warning}`);
          });
        }
      }
    }
    console.log('');
  }

  // Summary
  console.log('─'.repeat(60));
  if (hasErrors) {
    console.log('❌ Git validation failed');
    process.exit(1);
  } else {
    console.log('✅ All git validation checks passed!');
  }
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as validateGitComprehensive };
