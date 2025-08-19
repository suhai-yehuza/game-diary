# Preview Deployments

## Overview

To save resources and reduce costs, **automatic preview deployments have been disabled**. Preview deployments now only run validation checks by default, without creating actual Vercel preview environments.

## What Changed

### Before

- Every PR automatically created a Vercel preview deployment
- Expensive compute resources used for every PR
- Preview URLs were automatically commented on PRs

### After

- PRs only run validation checks (linting, tests, type checking)
- No automatic Vercel preview deployments
- Manual preview deployments available when needed
- Significant cost savings on compute resources

## Validation vs Deployment

### What Still Runs (Validation)

- ✅ Code quality checks (linting, formatting)
- ✅ Type checking
- ✅ Unit tests
- ✅ Integration tests
- ✅ Database validation
- ✅ Build process validation
- ✅ E2E test validation

### What's Disabled (Deployment)

- 🚫 Automatic Vercel preview deployments
- 🚫 Preview URL generation
- 🚫 Preview environment creation

## Manual Preview Deployments

When you need a preview deployment (e.g., for UI testing, stakeholder review, or complex feature validation), you can trigger one manually.

### Option 1: Using the Script (Recommended)

```bash
# Run the manual preview deployment script
pnpm preview:deploy
```

This script will:

- Check your current branch
- Verify you have GitHub CLI installed and authenticated
- Trigger a preview deployment with all validation checks
- Provide monitoring links

### Option 2: Using GitHub CLI Directly

```bash
# Trigger preview deployment manually
gh workflow run preview.yml --field deploy-to-vercel=true
```

### Option 3: GitHub Actions UI

1. Go to the **Actions** tab in your repository
2. Select **Vercel Preview Deployment** workflow
3. Click **Run workflow**
4. Set **deploy-to-vercel** to `true`
5. Click **Run workflow**

## When to Use Manual Preview Deployments

### Recommended Use Cases

- 🎨 UI/UX changes that need visual review
- 🔗 Integration testing with external services
- 👥 Stakeholder demos or reviews
- 🐛 Complex bug fixes that need environment testing
- 📱 Mobile/responsive design validation

### Not Needed For

- ✅ Simple code changes
- ✅ Backend-only changes
- ✅ Documentation updates
- ✅ Test-only changes
- ✅ Configuration updates

## Cost Impact

### Estimated Savings

- **Before**: ~$50-100/month in Vercel compute costs
- **After**: ~$5-10/month in Vercel compute costs
- **Savings**: 80-90% reduction in preview deployment costs

### Resource Usage

- **Validation only**: ~2-5 minutes of GitHub Actions runtime
- **Full deployment**: ~10-15 minutes of GitHub Actions + Vercel compute

## Monitoring and Troubleshooting

### Check Workflow Status

```bash
# View recent workflow runs
gh run list --workflow=preview.yml

# View specific run details
gh run view <run-id>
```

### Common Issues

#### Script Fails with "Not authenticated"

```bash
# Authenticate with GitHub
gh auth login
```

#### Script Fails with "GitHub CLI not installed"

```bash
# Install GitHub CLI
# macOS
brew install gh

# Ubuntu/Debian
sudo apt install gh

# Windows
winget install GitHub.cli
```

#### Preview Deployment Fails

- Check the GitHub Actions logs for specific errors
- Verify all secrets are properly configured
- Ensure the branch has valid code that passes validation

## Reverting Changes

If you need to re-enable automatic preview deployments:

1. Edit `.github/workflows/preview.yml`
2. Remove the `if: false` condition from the `deploy` job
3. Change the default value of `deploy-to-vercel` back to `true`
4. Update the workflow comment to reflect the change

## Best Practices

### For Developers

1. **Default to validation only** - Most changes don't need preview deployments
2. **Use manual deployments sparingly** - Only when visual testing is required
3. **Test locally first** - Use `pnpm dev` for most development work
4. **Communicate with team** - Let others know when you're using manual deployments

### For Code Reviewers

1. **Focus on code quality** - Validation results are sufficient for most reviews
2. **Request preview deployments** - When UI changes need visual review
3. **Consider the cost** - Only request deployments when necessary

### For Team Leads

1. **Monitor usage** - Track manual deployment frequency
2. **Set guidelines** - Establish team standards for when previews are needed
3. **Review costs** - Periodically assess if the savings are worth the trade-offs

## Migration Notes

### Existing PRs

- PRs created before this change will continue to work normally
- New commits to existing PRs will use the new validation-only approach
- Manual deployments can be triggered for existing PRs if needed

### Team Communication

- Inform team members about the change
- Update any documentation that references automatic preview deployments
- Consider adding this information to your PR template

## Support

If you encounter issues with manual preview deployments:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review the [Vercel documentation](https://vercel.com/docs)
3. Contact the team lead or DevOps engineer
4. Create an issue in the repository with details about the problem
