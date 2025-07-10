# CI/CD Environment Variables Setup

> **Note:** Soak period operations are now managed via the consolidated workflow script: `./scripts/workflow.sh soak ...` or `pnpm workflow:soak ...`.

This guide shows you exactly where to set environment variables for soaking periods in your CI/CD pipeline.

## 🎯 Quick Setup Steps

### 1. GitHub Repository Secrets (Required)

**Navigate to:** `https://github.com/[your-username]/game-diary/settings/secrets/actions`

**Add these secrets:**

| Secret Name             | Value                                    | Description                    |
| ----------------------- | ---------------------------------------- | ------------------------------ |
| `VERCEL_STAGING_URL`    | `https://your-staging-app.vercel.app`    | Your staging deployment URL    |
| `VERCEL_PRODUCTION_URL` | `https://your-production-app.vercel.app` | Your production deployment URL |
| `VERCEL_PREVIEW_URL`    | `https://your-preview-app.vercel.app`    | Your preview deployment URL    |

### 2. GitHub Environment Variables (Optional)

**Navigate to:** `https://github.com/[your-username]/game-diary/settings/environments`

**For each environment (Staging, Production), add the same variables as above.**

## 🔧 How to Find Your Vercel URLs

### Method 1: Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Deployments" tab
4. Copy the URL from your latest deployment

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link your project
vercel login
vercel link

# Get deployment URLs
vercel ls
```

### Method 3: From GitHub Actions Output

After a deployment, check the GitHub Actions logs for the deployment URL.

## 📋 Environment Variables Reference

### Required for Soaking Periods

```bash
VERCEL_STAGING_URL=https://your-staging-app.vercel.app
VERCEL_PRODUCTION_URL=https://your-production-app.vercel.app
VERCEL_PREVIEW_URL=https://your-preview-app.vercel.app
```

### Optional Configuration

```bash
SOAK_DURATION=1800                    # 30 minutes (default)
HEALTH_CHECK_INTERVAL=30              # 30 seconds (default)
PERFORMANCE_CHECK_INTERVAL=300        # 5 minutes (default)
MAX_ERROR_RATE=0.05                   # 5% (default)
MAX_RESPONSE_TIME=5000                # 5 seconds (default)
```

## 🚀 Workflow Integration

Your staging workflow (`.github/workflows/staging.yml`) now includes:

1. **Soak Period Job**: Runs after deployment
2. **Health Monitoring**: Checks `/api/health` endpoint
3. **Performance Testing**: Runs E2E tests during soak
4. **Automated Rollback**: Triggers on health failures
5. **Log Artifacts**: Uploads logs on failure

## 🔍 Testing Your Setup

### Local Testing

```bash
# Test with local development server
VERCEL_STAGING_URL="${VERCEL_STAGING_URL:-http://localhost:3000}" ./scripts/workflow.sh soak start staging 60

# Check status
./scripts/workflow.sh soak status
```

### CI/CD Testing

1. Push to `staging` branch
2. Monitor the GitHub Actions workflow
3. Check the "Soak Period Monitoring" job
4. Review logs and artifacts

## 🛠️ Troubleshooting

### Common Issues

**Issue**: `URL: ` (empty in status)
**Solution**: Set `VERCEL_STAGING_URL` secret in GitHub

**Issue**: Health checks failing
**Solution**: Ensure your app has `/api/health` endpoint

**Issue**: E2E tests skipped
**Solution**: Verify Playwright is installed in CI

**Issue**: Rollback triggered immediately
**Solution**: Check deployment URL and health endpoint

### Debug Commands

```bash
# Check environment variables
echo $VERCEL_STAGING_URL

# Test health endpoint manually
curl https://your-staging-app.vercel.app/api/health

# Check soak logs
cat ./.soak/soak.log
```

## 📊 Monitoring Dashboard

After setup, you can monitor soaking periods through:

1. **GitHub Actions**: View job logs and artifacts
2. **Vercel Dashboard**: Monitor deployment health
3. **Application Logs**: Check `/api/health` endpoint
4. **Soak Logs**: Review `.soak/` directory contents

## 🔄 Next Steps

1. **Set the secrets** in GitHub repository settings
2. **Test locally** with your development server
3. **Deploy to staging** to test the full pipeline
4. **Monitor results** and adjust thresholds as needed
5. **Deploy to production** with confidence!

## 📞 Support

If you encounter issues:

1. Check the soak logs in `.soak/soak.log`
2. Review GitHub Actions artifacts
3. Verify environment variables are set correctly
4. Test the health endpoint manually
