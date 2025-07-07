# Consolidated Workflow Architecture

## Overview

This document describes the new consolidated workflow architecture that implements the following flow:

1. **Push to `staging`** → Deploy to staging environment with full validation
2. **Hourly** → Check for successful staging commits (24+ hours old) and merge to master
3. **Production** → Manual, scheduled, or push-to-master deployments from `master`

## Workflow Components

### 1. `staging.yml`

**Trigger:** Push to `staging` branch
**Purpose:** Deploy staging branch to staging environment with full validation

```yaml
on:
  push:
    branches: [staging]
```

**Process:**

- Comprehensive testing (quality gate, unit tests, E2E tests)
- Deploy to Vercel staging environment
- 30-minute soak period with health monitoring
- Post-deployment validation
- Does NOT merge to master (that happens via hourly workflow)

### 2. `deploy-staging-hourly.yml`

**Trigger:** Hourly cron (`0 * * * *`)
**Purpose:** Check for successful staging commits and merge to master

**Process:**

- Checks for staging commits that are 24+ hours old
- Only processes commits that have passed staging validation
- Merges eligible commits to master (fast-forward or merge commits)
- Skips commits that are too new or already in master

### 3. `auto-merge-staging.yml` (Backup)

**Trigger:** Hourly cron (`0 * * * *`)
**Purpose:** Backup mechanism for staging→master merges

**Note:** This is now a backup since the main hourly workflow handles merges.

### 4. `production.yml`

**Trigger:** Scheduled (M-Th 9AM PT), Manual, Push to master
**Purpose:** Deploy master to production environment

**Key Features:**

- Comprehensive testing (quality gate, unit tests, E2E tests)
- Post-deployment validation (soak period handled in staging)
- 24-hour commit age requirement
- **Direct Push Validation:** When pushing directly to master, runs validation but skips soak period
- **Staging Readiness Validation:** For scheduled/manual deployments, validates staging readiness

## Deployment Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Push to       │    │   Hourly         │    │   Production    │
│   Staging       │    │   Merge Check    │    │   Deployment    │
└─────────┬───────┘    └────────┬─────────┘    └────────┬────────┘
          │                      │                       │
          ▼                      ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Deploy to       │    │ Check for 24+    │    │ Manual or       │
│ staging with    │    │ hour old commits │    │ scheduled       │
│ full validation │    │ in staging and   │    │ deployment      │
│ + 24hr soak     │    │ merge to master  │    │ (with staging   │
└─────────────────┘    │                   │    │  validation)    │
                       └──────────────────┘    └─────────────────┘
                                                │
                                                ▼
                                       ┌─────────────────┐
                                       │ Direct Push     │
                                       │ to Master       │
                                       │ (validation     │
                                       │  but no soak)   │
                                       └─────────────────┘
```

## Benefits

1. **Thorough Validation:** All changes are fully tested and soaked in staging
2. **Time-Based Promotion:** Only proven commits (24+ hours old) reach master
3. **Clear Separation:** Staging deployment separate from master promotion
4. **Backup Mechanisms:** Multiple ways to handle staging→master merges
5. **Safety:** Production only gets thoroughly validated code
6. **Flexibility:** Direct pushes to master have validation but skip soak period
7. **Faster Feedback:** Reduced soak period from 48 to 24 hours for faster deployments

## Configuration

### Environment Variables

All workflows use the same environment variables:

- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `DATABASE_URL`
- `VERCEL_STAGING_URL`
- `VERCEL_PRODUCTION_URL`
- `VERCEL_TOKEN`
- Clerk authentication keys

### Secrets Required

- `VERCEL_TOKEN`
- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_WEBHOOK_SIGNING_SECRET`

## Monitoring

### Staging Soak Period

- 24-hour monitoring period after staging deployment (reduced from 48 hours)
- Health checks every 30 seconds
- Performance monitoring every 5 minutes
- Automatic rollback on critical issues

### Production Post-Deployment Validation

- Smoke tests against deployed production environment
- Critical path E2E tests
- Performance validation
- No soak period (already validated in staging)
- Direct push validation (no soak, but full test suite)

## Troubleshooting

### Staging Deployment Failures

If staging deployment fails:

1. Check test results and soak period metrics
2. Review error rates and response times
3. Fix issues before pushing new commits

### Hourly Merge Issues

If hourly merge fails:

1. Check if commits are 24+ hours old
2. Verify staging validation passed
3. Check for merge conflicts

### Staging Soak Period Failures

If staging soak period fails:

1. Check health metrics in `.soak/status.json`
2. Review error rates and response times
3. Consider rollback if metrics are poor
4. Production deployment will be blocked until staging is healthy

### Direct Push to Master Issues

If direct push to master fails:

1. Check that all tests pass (quality gate, unit tests, E2E tests)
2. Verify commit is at least 24 hours old
3. Review validation logs for any issues
4. Consider using staging workflow for safer deployment

## Migration Notes

### From Previous Architecture

- Removed immediate merge workflow
- Staging now deploys to staging environment
- Hourly workflow handles master promotion
- Added 24-hour age requirement for master promotion

### Breaking Changes

- Staging pushes now deploy to staging (not merge to master)
- Master promotion happens via hourly workflow
- 24-hour age requirement for commits to reach master
- Auto-deployment from staging to production removed
