# Archived Workflows

This directory contains workflows that were part of the previous deployment system and are no longer used in the new simplified deployment lifecycle.

## Archived Workflows

### `cherry-pick-commits.yml`

- **Archived Date**: August 18, 2025
- **Previous Purpose**: Cherry-picking commits between branches (master → staging → deployment)
- **Reason for Archiving**: Replaced by simplified master → staging → production workflow
- **Replacement**: Direct staging branch synchronization via `sync-staging.yml`

## New Deployment System

The new deployment system uses:

- `sync-staging.yml` - Synchronizes staging with master
- `staging.yml` - Deploys to staging environment
- `production.yml` - Deploys to production with 24h soak period
- `emergency-rollback.yml` - Emergency rollback capabilities

## Migration Notes

- The old cherry-picking system was complex and error-prone
- The new system provides direct deployment from master → staging → production
- All functionality has been preserved with improved reliability
- See `DEPLOYMENT_LIFECYCLE.md` for complete documentation

## Recovery

If you need to reference the old workflow logic, the archived files are preserved here. However, the new system is recommended for all deployments.
