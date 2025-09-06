# Deployment Flow Documentation

This document outlines the complete deployment flow from a new Pull Request to Production deployment.

## Overview

The deployment pipeline follows a staged approach with multiple environments and safety checks:

1. **Preview Environment** - For PR validation and testing
2. **Staging Environment** - For integration testing and soak period
3. **Production Environment** - For live users

## Detailed Flow

### 1. Pull Request Creation

**Trigger**: New PR to `master` or `staging` branch
**Workflow**: `preview.yml`

**What happens**:

- Runs comprehensive validation (tests, linting, type checking)
- Deploys to Vercel preview environment
- Comments on PR with preview URL
- Runs quick health checks on preview deployment

**Success Criteria**:

- All tests pass
- Preview deployment is accessible
- Code quality checks pass

### 2. PR Review and Merge

**Manual Process**:

- Code review by team members
- Approval required (configured via branch protection)
- Merge to `master` branch

### 3. Master to Staging Sync

**Trigger**: `push` to `master` branch
**Workflow**: `sync-staging.yml`

**What happens**:

- Automatically syncs `staging` branch with `master`
- Forces staging branch to match master exactly
- Triggers staging deployment

### 4. Staging Deployment

**Trigger**: `push` to `staging` branch (from sync workflow)
**Workflow**: `staging.yml`

**What happens**:

- **Commit Check**: Verifies there are new commits since last staging deployment
- **Pre-deployment Validation**: Runs tests, linting, and E2E tests
- **Deployment**: Deploys to staging environment (`staging.game-diary.io`)
- **Post-deployment Verification**: Runs comprehensive E2E tests
- **Domain Update**: Updates staging domain to point to new deployment

**Skip Conditions**:

- No new commits since last staging deployment (unless force-deploy is enabled)
- Previous deployment failed

**Success Criteria**:

- All validation passes
- Staging deployment is accessible
- E2E tests pass
- Domain is updated successfully

### 5. Soak Period

**Duration**: 3 business days
**Purpose**: Allow time for testing and monitoring in staging environment

**What happens during soak period**:

- Team tests new features in staging
- Monitor for any issues or regressions
- Automated nightly tests run (weekdays at 2 AM UTC)

### 6. Production Deployment

**Trigger**:

- Manual (with options to bypass checks)
- Scheduled (MTWTh at 10am Pacific)

**Workflow**: `production.yml`

**What happens**:

- **Soak Period Check**: Verifies 2 business days have passed since staging deployment
- **Commit Check**: Verifies there are new commits since staging deployment
- **Pre-deployment Validation**: Runs tests and validation
- **Deployment**: Deploys to production environment
- **Post-deployment Verification**: Runs comprehensive E2E tests
- **Domain Update**: Updates production domain (`www.game-diary.io`)

**Skip Conditions**:

- Soak period not completed (unless skip-soak-check is enabled)
- No new commits since staging deployment (unless force-deploy is enabled)
- Previous deployment failed

**Success Criteria**:

- All validation passes
- Production deployment is accessible
- E2E tests pass
- Domain is updated successfully

## Workflow Files

### Core Workflows

- **`preview.yml`** - PR validation and preview deployment
- **`sync-staging.yml`** - Sync staging branch with master
- **`staging.yml`** - Staging deployment with commit checking
- **`production.yml`** - Production deployment with soak period and commit checking

### Reusable Workflows

- **`pre-deployment.yml`** - Comprehensive validation and testing
- **`base-deployment.yml`** - Core deployment logic
- **`deploy-and-verify.yml`** - Streamlined deployment and verification

### Supporting Workflows

- **`nightly.yml`** - Automated nightly testing
- **`emergency-rollback.yml`** - Emergency rollback procedures
- **`dependency-updates.yml`** - Automated dependency updates

## Environment Configuration

### Preview Environment

- **Domain**: Vercel preview URLs
- **Purpose**: PR testing and validation
- **Lifetime**: Until PR is closed

### Staging Environment

- **Domain**: `staging.game-diary.io`
- **Purpose**: Integration testing and soak period
- **Lifetime**: Permanent (updated with each deployment)

### Production Environment

- **Domain**: `www.game-diary.io`
- **Purpose**: Live user traffic
- **Lifetime**: Permanent (updated with each deployment)
- **Schedule**: MTWTh at 10am Pacific

## Safety Mechanisms

### 1. Commit Checking

- Staging deployment skips if no new commits (unless forced)
- Production deployment skips if no new commits since staging (unless forced)

### 2. Soak Period

- 2 business days required between staging and production (Pacific time)
- Allows time for testing and monitoring
- Can be bypassed in emergencies

### 3. Comprehensive Testing

- Unit tests, integration tests, and E2E tests at each stage
- Health checks and validation scripts
- Post-deployment verification

### 4. Rollback Capability

- Emergency rollback workflow available
- Previous deployments remain accessible
- Quick domain switching capability

## Manual Overrides

### Force Deploy Options

**Staging Force Deploy**:

- Bypasses commit checking
- Useful for redeploying same commit
- Available via workflow dispatch

**Production Force Deploy**:

- Bypasses soak period check
- Bypasses commit checking
- Available via workflow dispatch

### Emergency Options

**Skip Soak Check**:

- Bypasses 24-hour soak period requirement
- Available for emergency deployments
- Should be used sparingly

## Monitoring and Alerts

### Automated Monitoring

- Health checks on all environments
- E2E test results
- Deployment status notifications

### Manual Monitoring

- Review deployment summaries
- Check application logs
- Monitor user feedback

## Best Practices

### For Developers

1. Always test changes in preview before merging
2. Review staging deployment thoroughly during soak period
3. Monitor production after deployment
4. Use force deploy options sparingly

### For Operations

1. Monitor deployment pipelines regularly
2. Review skipped deployments to understand why
3. Maintain deployment documentation
4. Test rollback procedures periodically

### For Emergency Situations

1. Use force deploy options when necessary
2. Document the reason for bypassing checks
3. Monitor closely after emergency deployments
4. Plan follow-up actions

## Troubleshooting

### Common Issues

**Deployment Skipped - No New Commits**:

- This is expected behavior when no changes have been made
- Use force deploy if redeployment is needed

**Soak Period Not Complete**:

- Wait for 2 business days to pass (Pacific time)
- Use skip-soak-check for emergencies

**Deployment Failures**:

- Check logs for specific error messages
- Verify environment variables and secrets
- Review pre-deployment validation results

### Getting Help

1. Check workflow run logs for detailed error information
2. Review deployment summaries for status updates
3. Consult team documentation for specific procedures
4. Use emergency rollback if needed

## Future Improvements

### Planned Enhancements

- Automated performance testing
- Enhanced monitoring and alerting
- Improved rollback procedures
- Better documentation and runbooks

### Potential Optimizations

- Parallel deployment strategies
- Blue-green deployments
- Canary deployments
- Enhanced security scanning
