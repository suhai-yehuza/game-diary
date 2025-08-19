# Git Best Practices Guide

This document outlines the best practices for branch naming, commit messaging, and PR structure for the Game Diary project.

## Table of Contents

1. [Branch Naming Conventions](#branch-naming-conventions)
2. [Commit Message Standards](#commit-message-standards)
3. [Pull Request Guidelines](#pull-request-guidelines)
4. [Automated Tools](#automated-tools)
5. [Examples](#examples)

## Branch Naming Conventions

### Format

```
<username>/<PROJECT-123>-<description>
```

### Components

- `username` - Your username (e.g., syehuza, john.doe)
- `PROJECT-123` - Project ticket number in format PROJECT-123 (e.g., DYL-1234)
- `description` - Brief description of the change using hyphens

### Examples

```
syehuza/DYL-1234-feature-do-xyz
syehuza/DYL-025-bug-fix-xyz
john.doe/DYL-789-hotfix-critical-issue
jane.smith/DYL-101-chore-update-deps
dev.team/DYL-202-docs-update-readme
alice/DYL-303-refactor-optimize-queries
bob/DYL-404-test-add-e2e-tests
charlie/DYL-505-perf-optimize-loading
diana/DYL-606-ci-add-github-actions
eve/DYL-707-security-fix-sql-injection
```

### Rules

- Use lowercase letters for username and description
- Use hyphens to separate words in description
- Keep descriptions concise but descriptive
- Include project ticket number in format PROJECT-123
- Avoid special characters except hyphens and underscores in username
- Username must be at least 2 characters long

## Commit Message Standards

### Conventional Commits Format

```
<type>[optional scope]: [TICKET-NUMBER] [@username] <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes
- `revert` - Reverting previous commits
- `security` - Security-related changes

### Scopes (Optional)

- `api` - API changes
- `ui` - User interface changes
- `db` - Database changes
- `auth` - Authentication changes
- `test` - Testing changes
- `deps` - Dependency changes

### Examples

#### Simple Commit

```
feat: [DYL-1234] [@syehuza] add user profile page
```

#### Commit with Scope

```
feat(api): [DYL-025] [@syehuza] add user profile endpoint
```

#### Commit with Body

```
feat: [DYL-1234] [@syehuza] add user profile page

- Add profile component with avatar upload
- Implement profile editing functionality
- Add profile validation
- Update user schema to include profile fields

Closes #1234
```

#### Breaking Change

```
feat(api)!: [DYL-202] [@syehuza] change user endpoint response format

BREAKING CHANGE: The user endpoint now returns a different JSON structure.
The `profile` field is now nested under `user.profile` instead of being at the root level.

Migration guide:
- Update frontend to access profile data at `user.profile`
- Update any API consumers to handle the new structure
```

### Rules

- Use imperative mood ("add" not "added")
- Keep the first line under 72 characters
- Separate subject from body with a blank line
- Use the body to explain what and why, not how
- Reference issues and pull requests in the footer
- **Required**: Include ticket/JIRA number in format `[DYL-1234]` or `[PROJ-456]`
- **Required**: Include username in format `[@username]` (must start with @)
- Ticket format: `[PROJECT-123]` where PROJECT is uppercase letters and 123 is a number
- Username format: `[@username]` where username contains only letters, numbers, hyphens, and underscores

### Auto-Injection Feature

The prepare-commit-msg hook automatically extracts ticket number and username from your branch name and injects them into your commit message. This means you can write simple commit messages like:

```bash
git commit -m "feat: add user profile page"
```

And it will automatically become:

```bash
feat: [DYL-1234] [@syehuza] add user profile page
```

**Requirements for auto-injection:**

- Branch name must follow the pattern: `username/PROJECT-123-description`
- Commit message must follow conventional commits format: `type: description`

### Branch Creation Prevention

To prevent invalid branch names from being created, use the provided branch creation tools:

```bash
# Using npm script
pnpm run create-branch <branch-name> [base-branch]

# Using git alias (after setup)
git cb <branch-name> [base-branch]

# Using the script directly
./scripts/git/create-branch.sh <branch-name> [base-branch]
```

**Examples:**

```bash
# Valid branch creation
pnpm run create-branch syehuza/DYL-1234-feature-add-user-profile

# Invalid branch creation (will be rejected)
pnpm run create-branch feature/add-user-profile  # Missing username/ticket
pnpm run create-branch syehuza/feature-add-user  # Missing ticket
pnpm run create-branch syehuza/dyl-1234-feature  # Lowercase project name
```

## Pull Request Guidelines

### PR Title Format

```
<type>(<scope>): <description>

[optional: Closes #issue]
```

### PR Description Template

```markdown
## Description

Brief description of the changes made.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Corresponding changes to documentation made
- [ ] No new warnings generated
- [ ] Added tests that prove the fix is effective or feature works
- [ ] New and existing unit tests pass locally

## Screenshots (if applicable)

Add screenshots to help explain your changes.

## Additional Notes

Any additional information or context.
```

### PR Labels

- `bug` - Bug fixes
- `enhancement` - New features
- `documentation` - Documentation changes
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - High priority
- `priority: low` - Low priority
- `breaking` - Breaking changes
- `security` - Security-related changes

### Branch Protection Rules

- Require pull request reviews before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Require linear history
- Restrict pushes that create files larger than 100MB

## Automated Tools

### Git Hooks

The project uses Husky git hooks to enforce these standards:

1. **Prepare-commit-msg Hook** - Runs before commit message is finalized:
   - Automatically extracts ticket number and username from branch name
   - Injects `[TICKET-NUMBER] [@username]` into commit messages
   - Only works with properly named branches following convention

2. **Pre-commit Hook** - Runs before each commit:
   - Branch naming validation
   - Code formatting and linting
   - Type checking
   - Full validation pipeline

3. **Commit-msg Hook** - Validates commit message format:
   - Ensures proper format with ticket number and username
   - Validates Conventional Commits structure

4. **Pre-push Hook** - Runs before each push:
   - Branch naming validation
   - All commit message validation for pushed commits
   - Comprehensive validation pipeline
   - Tests and build checks

### Installation

```bash
# Install dependencies
pnpm install

# Set up git validation hooks
pnpm run setup:git-validation

# Set up git aliases for branch creation
pnpm run setup:git-aliases

# Or run the setup scripts directly
./scripts/git/setup-git-validation.sh
./scripts/git/setup-git-aliases.sh
```

### Manual Validation

```bash
# Validate branch name
pnpm run validate:git

# Comprehensive git validation (branch + commits)
pnpm run validate:git:comprehensive

# Validate commit message
tsx scripts/git/validate-commit-message.ts "your commit message"

# Create a new branch with validation
pnpm run create-branch <branch-name> [base-branch]

# Set up and validate git hooks
pnpm run setup:git-validation
```

### CI-Aware Validation

The git validation system automatically detects CI/PR environments and uses relaxed validation rules:

**Local Development (Strict):**

- Branch names must follow: `username/PROJECT-123-description`
- Commit messages must include: `[TICKET-NUMBER] [@username]`
- Example: `feat: [DYL-1234] [@syehuza] add user profile component`

**CI/PR Environments (Relaxed):**

- Branch names can be: `username/description` (no ticket required)
- Commit messages can be: `type: description` (no ticket/username required)
- Example: `feat: add user profile component`

**Environment Detection:**
The system detects CI environments through these environment variables:

- `CI=true`
- `GITHUB_ACTIONS=true`
- `VERCEL=1`
- `GITHUB_EVENT_NAME=pull_request` or `push`
- `GITHUB_REF` starting with `refs/pull/` or `refs/heads/gh-readonly-queue/`

This relaxed validation is appropriate since commits in PRs will be squashed later, and branch names may be auto-generated by bots.

## Examples

### Complete Workflow Example

1. **Create Feature Branch**

   ```bash
   # Using the validated branch creation script
   pnpm run create-branch syehuza/DYL-1234-feature-add-user-profile

   # Or using git alias (after setup)
   git cb syehuza/DYL-1234-feature-add-user-profile

   # Or using the script directly
   ./scripts/git/create-branch.sh syehuza/DYL-1234-feature-add-user-profile
   ```

2. **Make Changes and Commit**

   ```bash
   git add .
   git commit -m "feat: add user profile component"

   # The prepare-commit-msg hook will automatically add:
   # [DYL-1234] [@syehuza] to your commit message
   ```

3. **Push and Create PR**

   ```bash
   git push -u origin syehuza/DYL-1234-feature-add-user-profile
   ```

4. **PR Title**

   ```
   feat(ui): [DYL-1234] [@syehuza] add user profile component
   ```

5. **PR Description**

   ```markdown
   ## Description

   Adds a new user profile component that allows users to view and edit their profile information.

   ## Type of Change

   - [x] New feature (non-breaking change which adds functionality)

   ## Testing

   - [x] Unit tests pass
   - [x] Integration tests pass
   - [x] Manual testing completed

   ## Checklist

   - [x] Code follows the style guidelines
   - [x] Self-review completed
   - [x] Code is commented, particularly in hard-to-understand areas
   - [x] Corresponding changes to documentation made
   - [x] No new warnings generated
   - [x] Added tests that prove the fix is effective or feature works
   - [x] New and existing unit tests pass locally

   ## Screenshots

   ![Profile Component](screenshot-url)

   Closes #123
   ```

## Enforcement

These standards are enforced through:

1. **Pre-commit hooks** - Automatic validation before commits
2. **CI/CD pipelines** - Automated checks in pull requests
3. **Code review** - Manual review by team members
4. **Branch protection** - GitHub branch protection rules

## Getting Help

If you have questions about these standards:

1. Check this documentation
2. Review existing commits and PRs for examples
3. Ask in team discussions
4. Use the validation scripts for guidance
