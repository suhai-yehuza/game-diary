# Auto-Deployment System

> **Note:** All deployment management operations are now managed via the consolidated workflow script: `./scripts/workflow.sh deploy ...` or `pnpm workflow:deploy ...`.

This document describes the automated production deployment system with 48-hour soaking periods and manual controls.

## 🎯 Overview

The auto-deployment system provides:

1. **48-Hour Soak Period**: Automatic production deployment 48 hours after successful staging soak
2. **Manual Controls**: Immediate deployment or rollback capabilities
3. **Safety Checks**: Comprehensive validation before production deployment
4. **Monitoring**: Continuous health and performance monitoring
5. **Rollback**: Quick rollback mechanisms for issues

## 🔄 Deployment Flow

```
Staging Branch Push
        ↓
   Quality Gate Tests
        ↓
   Unit & E2E Tests
        ↓
   Deploy to Staging
        ↓
   30min Soak Period
        ↓
   Schedule Auto-Deploy
        ↓
   48hr Wait Period
        ↓
   Auto-Deploy to Prod
        ↓
   30min Prod Soak
        ↓
   Post-Deployment Tests
```

## 🛠️ Components

### 1. Deployment Manager Script

**File**: `scripts/workflow.sh`

**Commands**:

```bash
# Schedule auto-deployment (after staging soak)
./scripts/workflow.sh deploy auto-deploy

# Check if auto-deployment is due
./scripts/workflow.sh deploy auto-deploy check

# Manual deployment to production
./scripts/workflow.sh deploy manual-deploy "Hotfix deployment"

# Rollback production
./scripts/workflow.sh deploy rollback production "Bug fix"

# Check deployment status
./scripts/workflow.sh deploy status

# View deployment history
./scripts/workflow.sh deploy history
```

### 2. Package.json Scripts

```bash
# Auto-deployment
pnpm workflow:deploy auto-deploy              # Schedule auto-deployment
pnpm workflow:deploy auto-deploy check        # Check if due

# Manual controls
pnpm workflow:deploy manual-deploy            # Deploy immediately
pnpm workflow:deploy rollback                 # Rollback production

# Status and history
pnpm workflow:deploy status                   # Current status
pnpm workflow:deploy history                  # Deployment history
pnpm workflow:deploy list                     # Status + history
```

### 3. GitHub Workflows

#### Staging Workflow (`.github/workflows/staging.yml`)

- Triggers on push to `staging` branch
- Runs quality gate, tests, deployment
- 30-minute soak period
- **Automatically schedules production deployment**

#### Production Workflow (`.github/workflows/production.yml`)

- **Push to master**: Direct deployment (bypasses staging soak)
- **Manual trigger**: With reason input
- **Auto-trigger**: Via repository dispatch (after staging soak)
- **Staging validation**: Only for manual/auto deployments (skipped for push to master)
- Deploys to production
- 30-minute production soak

#### Auto-Deploy Check (`.github/workflows/auto-deploy-check.yml`)

- Cron job (runs every hour)
- Checks if auto-deployment is due
- Triggers production workflow when ready

## 🚀 Usage Examples

### 1. Automatic Deployment (Default)

1. **Push to staging branch**
2. **Wait for staging soak** (30 minutes)
3. **Auto-schedule production** (48 hours later)
4. **Production deploys automatically**

### 2. Direct Push to Master (Fast Track)

1. **Push directly to master branch**
2. **Production deploys immediately**
3. **Bypasses staging soak and validation**
4. **Use for hotfixes or urgent deployments**

### 3. Manual Deployment (Controlled)

1. **Trigger via GitHub Actions UI**
2. **Provide deployment reason**
3. **Validates staging readiness**
4. **Deploys to production**

### Manual Deployment (Immediate)

```bash
# Deploy immediately with reason
pnpm workflow:deploy manual-deploy "Critical hotfix"

# Or via GitHub Actions UI
# Go to Actions → Production → Run workflow
```

### Manual Rollback

```bash
# Rollback production
pnpm workflow:deploy rollback production "Critical bug found"

# Check rollback status
pnpm workflow:deploy status
```

### Check Deployment Status

```bash
# Current status
pnpm workflow:deploy status

# Deployment history
pnpm workflow:deploy history

# Both status and history
pnpm workflow:deploy list
```

## ⚙️ Configuration

### Environment Variables

```bash
# Required
VERCEL_STAGING_URL=https://your-staging-app.vercel.app
VERCEL_PRODUCTION_URL=https://your-production-app.vercel.app

# Optional (with defaults)
SOAK_DURATION=1800                    # 30 minutes
AUTO_DEPLOY_DELAY=172800              # 48 hours
HEALTH_CHECK_INTERVAL=30              # 30 seconds
PERFORMANCE_CHECK_INTERVAL=300        # 5 minutes
MAX_ERROR_RATE=0.05                   # 5%
MAX_RESPONSE_TIME=5000                # 5 seconds
```

### GitHub Secrets

Set these in your repository settings:

- `VERCEL_STAGING_URL`
- `VERCEL_PRODUCTION_URL`
- `VERCEL_TOKEN`
- `DATABASE_URL`

## 🔍 Monitoring & Logs

### Deployment Status

```bash
# Check current status
./scripts/workflow.sh deploy status

# Output includes:
# - Current deployment status
# - Auto-deploy schedule
# - Time remaining until deployment
# - Staging readiness status
```

### Logs Location

- **Deployment logs**: `./.deployments/deploy.log`
- **Soak logs**: `./.soak/soak.log`
- **GitHub Actions**: Check workflow runs for detailed logs

### GitHub Actions Artifacts

- `soak-period-logs`: Staging soak monitoring
- `production-soak-logs`: Production soak monitoring
- `auto-deploy-check-logs`: Auto-deployment checks

## 🛡️ Safety Features

### Pre-Deployment Validation

1. **Staging readiness check**: Ensures staging passed soak period
2. **Quality gate**: Lint, typecheck, build validation
3. **Unit tests**: All unit tests must pass
4. **Critical E2E tests**: Essential functionality tests

### During Deployment

1. **Health monitoring**: Continuous health checks
2. **Performance monitoring**: Response time tracking
3. **E2E testing**: Automated user journey tests
4. **Error rate monitoring**: Automatic rollback on high error rates

### Post-Deployment

1. **Production soak**: 30-minute monitoring period
2. **Post-deployment tests**: Smoke tests after deployment
3. **Rollback capability**: Quick rollback if issues detected

## 🔧 Troubleshooting

### Common Issues

**Issue**: Auto-deployment not triggering
**Solution**:

```bash
# Check if scheduled
pnpm workflow:deploy status

# Manually trigger check
pnpm workflow:deploy auto-deploy check

# Check cron job logs in GitHub Actions
```

**Issue**: Staging not ready for production
**Solution**:

```bash
# Check staging soak status
./scripts/soak-monitor.sh status

# Check staging metrics
cat ./.soak/metrics.json
```

**Issue**: Manual deployment failing
**Solution**:

```bash
# Check deployment status
pnpm workflow:deploy status

# Check logs
cat ./.deployments/deploy.log

# Verify environment variables
echo $VERCEL_PRODUCTION_URL
```

### Debug Commands

```bash
# Check all deployment files
ls -la ./.deployments/
ls -la ./.soak/

# View recent logs
tail -f ./.deployments/deploy.log
tail -f ./.soak/soak.log

# Check GitHub Actions status
# Go to Actions tab in repository
```

## 📊 Metrics & Reporting

### Deployment Metrics

- **Deployment frequency**: How often deployments occur
- **Success rate**: Percentage of successful deployments
- **Rollback rate**: How often rollbacks are needed
- **Time to production**: From staging to production

### Performance Metrics

- **Error rates**: During soak periods
- **Response times**: Average and p95
- **E2E test results**: Pass/fail rates
- **Health check status**: Uptime and availability

## 🔄 Customization

### Adjust Timing

```bash
# Modify auto-deploy delay (in seconds)
AUTO_DEPLOY_DELAY=86400  # 24 hours instead of 48

# Modify soak duration
SOAK_DURATION=3600       # 1 hour instead of 30 minutes
```

### Adjust Thresholds

```bash
# Modify error rate threshold
MAX_ERROR_RATE=0.01      # 1% instead of 5%

# Modify response time threshold
MAX_RESPONSE_TIME=3000   # 3 seconds instead of 5
```

### Custom Validation

Add custom validation steps in the production workflow:

```yaml
- name: Custom Validation
  run: |
    # Your custom validation logic
    ./scripts/custom-validation.sh
```

## 🎯 Best Practices

1. **Always test in staging first**: Never deploy directly to production
2. **Monitor during soak periods**: Watch for any issues
3. **Use meaningful deployment reasons**: Helps with tracking and debugging
4. **Keep deployment history**: Review patterns and issues
5. **Set up alerts**: Get notified of deployment status changes
6. **Regular rollback testing**: Ensure rollback procedures work
7. **Document deployment reasons**: Track why deployments were made

## 📞 Support

For issues with the auto-deployment system:

1. **Check logs**: Review deployment and soak logs
2. **Verify configuration**: Ensure environment variables are set
3. **Test manually**: Try manual deployment to isolate issues
4. **Review GitHub Actions**: Check workflow run logs
5. **Check staging readiness**: Ensure staging passed all checks

The auto-deployment system provides a safe, automated path to production while maintaining full manual control when needed.
