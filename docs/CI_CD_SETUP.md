# CI/CD Setup with E2E Testing

> **Note:** E2E and workflow scripts are now consolidated. Use `pnpm e2e:*` and `pnpm workflow:*` for all test and workflow operations.

This document describes the CI/CD pipeline setup with comprehensive E2E testing integration.

## Overview

The CI/CD pipeline includes multiple workflows designed to ensure code quality and reliability through automated testing at different stages of the development lifecycle.

## Workflows

### 1. Main CI/CD Pipeline (`ci.yml`)

**Triggers:**

- Push to `master` or `staging` branches
- Pull requests to `master` or `staging` branches
- Manual workflow dispatch

**Jobs:**

- **Lint & Type Check**: Code quality validation
- **Unit Tests**: Fast unit test execution with coverage
- **Fast E2E Tests**: Quick E2E tests for PRs (Chromium only)
- **Full E2E Tests**: Comprehensive E2E tests for master branch (sharded)
- **Performance Tests**: Performance-focused testing
- **Build & Deploy**: Production deployment to Vercel
- **Test Summary**: Consolidated test results

### 2. Pre-Production Deployment (`pre-prod.yml`)

**Triggers:**

- Push to `staging` branch
- Manual workflow dispatch with environment selection

**Jobs:**

- **Pre-deployment E2E Tests**: Comprehensive testing before deployment
- **Cross-browser Tests**: Full browser compatibility testing
- **Load Testing**: Performance under load simulation
- **Deploy**: Deployment to staging/pre-prod environment
- **Post-deployment Smoke Tests**: Quick validation after deployment
- **Deployment Summary**: Complete deployment status

## Test Configurations

### Popular Browsers Config (`playwright.popular.config.ts`)

- **Browsers**: Chromium, WebKit, Mobile Chrome
- **Workers**: 4 (local), 2 (CI)
- **Use Case**: Main E2E testing, CI/CD pipeline

### Fast Config (`playwright.fast.config.ts`)

- **Browsers**: Chromium only
- **Workers**: 1
- **Use Case**: Development, quick feedback, PR validation

### Smoke Config (`playwright.smoke.config.ts`)

- **Browsers**: Chromium only
- **Workers**: 1
- **Use Case**: Post-deployment validation, quick health checks

## Environment Variables

### Required Secrets

```bash
# Vercel Deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# Optional: Code Coverage
CODECOV_TOKEN=your_codecov_token
```

### Environment Variables

```bash
# Test Configuration
NODE_VERSION=22
PNPM_VERSION=8
DEPLOYMENT_URL=https://your-app.vercel.app

# Test Sharding
SHARD=1
SHARD_TOTAL=2
```

## Available Scripts

### 🚀 **Development Scripts**

```bash
# Fast development testing
pnpm e2e:run sanity              # Fast tests (Chromium only)
pnpm e2e:run sanity:watch        # Watch mode for development
pnpm e2e:run dev               # Alias for fast tests
pnpm e2e:run dev:watch         # Alias for fast watch mode
```

### 🌐 **Browser-Specific Testing**

```bash
# Individual browsers
pnpm test:e2e:chromium          # Chromium only
pnpm test:e2e:firefox           # Firefox only
pnpm test:e2e:safari            # Safari/WebKit only

# Device categories
pnpm test:e2e:desktop           # All desktop browsers
pnpm test:e2e:mobile            # Mobile Chrome + iPhone
pnpm test:e2e:tablet            # Tablet devices
pnpm test:e2e:all-browsers      # All browsers (desktop + mobile + tablet)
```

### 📱 **Feature-Specific Testing**

```bash
# Core features
pnpm e2e:responsive        # Responsive design tests
pnpm e2e:responsive        # Popular browsers only
pnpm e2e:run cross-browser     # Cross-browser compatibility

# Performance and optimization
pnpm test:e2e:performance       # Performance-focused tests
pnpm test:e2e:load              # Load testing simulation
```

### 🔧 **CI/CD Integration Scripts**

```bash
# CI pipeline scripts
pnpm ci:e2e-tests                # Main CI test (popular browsers)
pnpm ci:e2e-tests sanity           # Fast CI test (Chromium only)
pnpm ci:e2e-tests full           # Full CI test (sharded)
pnpm ci:e2e-tests performance    # Performance CI test

# Deployment scripts
pnpm workflow:soak pre-deploy        # Pre-deployment validation
pnpm workflow:soak post-deploy       # Post-deployment smoke tests
```

### 🧪 **Test Sharding and Parallelization**

```bash
# Sharded testing for parallel execution
pnpm test:e2e:sharded           # Run tests in 2 shards
```

### 📊 **Coverage and Reporting**

```bash
# Coverage testing
pnpm test:e2e:coverage          # All browsers with coverage
pnpm test:e2e:coverage:sanity     # Chromium with coverage
pnpm test:e2e:coverage:html     # Generate HTML coverage report
pnpm test:e2e:coverage:report   # Generate coverage report only
```

### 🚨 **Smoke Testing**

```bash
# Smoke tests for quick validation
pnpm test:e2e:smoke             # Smoke tests against localhost
pnpm test:e2e:smoke:deployed    # Smoke tests against deployed URL
```

### 🐛 **Debug and Troubleshooting**

```bash
# Debug scripts
pnpm e2e:debug             # Debug E2E tests
pnpm e2e:debug --headed    # Headed browser mode
pnpm e2e:debug --ui        # Playwright UI mode
pnpm e2e:debug --trace     # Headed debug mode
pnpm e2e:coverage --html   # Show test reports
```

### ⚡ **Optimization and Maintenance**

```bash
# Environment optimization
pnpm test:e2e:optimize          # Setup optimized environment
pnpm test:e2e:clean             # Clean test artifacts
pnpm test:e2e:monitor           # Monitor system resources
pnpm test:e2e:analyze           # Analyze test performance

# Browser management
pnpm test:e2e:install-browsers  # Install Playwright browsers
pnpm test:e2e:update-browsers   # Update Playwright browsers
```

### 🛠️ **Utilities**

```bash
# Development utilities
pnpm test:e2e:server            # Start dev server on port 3000
pnpm test:e2e:wait              # Wait for server to be ready
pnpm test:e2e:ui                # Launch Playwright UI mode
```

## Usage Examples

### **Local Development Workflow**

```bash
# Quick development cycle
pnpm test:e2e:sanity              # Fast feedback
pnpm test:e2e:sanity:watch        # Continuous testing

# Debug issues
pnpm test:e2e:debug:headed      # Visual debugging
pnpm test:e2e:debug:ui          # Interactive debugging

# Development server setup
pnpm test:e2e:server            # Start dev server on port 3000
pnpm test:e2e:wait              # Wait for server to be ready
```

### **Pre-commit Testing**

```bash
# Quick validation before committing
pnpm test:e2e:ci:sanity           # Simulate PR testing
pnpm test:e2e:lint              # Code quality checks

# Responsive design validation
pnpm test:e2e:responsive        # Test all viewports
pnpm test:e2e:responsive # Test popular browsers only
```

### **CI/CD Simulation**

```bash
# Simulate full CI pipeline locally
pnpm test:e2e:ci                # Popular browsers
pnpm test:e2e:ci:performance    # Performance tests
pnpm test:e2e:ci:full           # Full test suite (sharded)

# Coverage testing
pnpm test:e2e:coverage          # All browsers with coverage
pnpm test:e2e:coverage:sanity     # Chromium with coverage
```

### **Deployment Validation**

```bash
# Pre-deployment testing
pnpm test:e2e:pre-deploy        # Comprehensive validation

# Post-deployment verification
pnpm test:e2e:post-deploy       # Quick health check
pnpm test:e2e:smoke:deployed    # Smoke tests against deployed URL
```

### **Performance Testing**

```bash
# Performance validation
pnpm test:e2e:performance       # Performance-focused tests
pnpm test:e2e:load              # Load simulation

# Performance analysis
pnpm test:e2e:analyze           # Analyze test performance
pnpm test:e2e:monitor           # Monitor system resources
```

### **Browser Compatibility**

```bash
# Cross-browser testing
pnpm test:e2e:cross-browser     # Browser compatibility
pnpm test:e2e:all-browsers      # All browsers

# Individual browser testing
pnpm test:e2e:chromium          # Chromium only
pnpm test:e2e:firefox           # Firefox only
pnpm test:e2e:safari            # Safari/WebKit only

# Device-specific testing
pnpm test:e2e:desktop           # All desktop browsers
pnpm test:e2e:mobile            # Mobile Chrome + iPhone
pnpm test:e2e:tablet            # Tablet devices
```

### **Advanced Testing Scenarios**

#### **Parallel Testing with Sharding**

```bash
# Run tests in parallel shards
pnpm test:e2e:sharded           # Run tests in 2 shards

# Manual sharding for CI
SHARD=1 SHARD_TOTAL=2 pnpm test:e2e:ci:full
SHARD=2 SHARD_TOTAL=2 pnpm test:e2e:ci:full
```

#### **Coverage Testing**

```bash
# Generate coverage reports
pnpm test:e2e:coverage          # All browsers with coverage
pnpm test:e2e:coverage:html     # Generate HTML coverage report
pnpm test:e2e:coverage:report   # Generate coverage report only
```

#### **Load Testing Simulation**

```bash
# Simulate load conditions
pnpm test:e2e:load              # Load testing simulation
pnpm test:e2e:performance       # Performance-focused tests
```

### **Team Collaboration Examples**

#### **Code Review Process**

```bash
# Before submitting PR
pnpm test:e2e:ci:sanity           # Quick validation
pnpm test:e2e:responsive        # Responsive design check
pnpm test:e2e:lint              # Code quality

# After PR feedback
pnpm test:e2e:debug:headed      # Debug specific issues
pnpm test:e2e:sanity:watch        # Continuous testing during fixes
```

#### **Release Preparation**

```bash
# Pre-release validation
pnpm test:e2e:pre-deploy        # Full test suite
pnpm test:e2e:cross-browser     # Browser compatibility
pnpm test:e2e:performance       # Performance validation

# Post-release verification
pnpm test:e2e:post-deploy       # Quick health check
pnpm test:e2e:smoke:deployed    # Smoke tests on live site
```

### **Development Environment Examples**

#### **New Feature Development**

```bash
# Start development
pnpm test:e2e:server            # Start dev server
pnpm test:e2e:sanity:watch        # Continuous testing

# Feature testing
pnpm test:e2e:responsive        # Test responsive behavior
pnpm test:e2e:cross-browser     # Test browser compatibility

# Debug issues
pnpm test:e2e:debug:ui          # Interactive debugging
pnpm open:test:report       # View test results
```

#### **Bug Fixing Workflow**

```bash
# Reproduce issue
pnpm test:e2e:debug:headed      # Visual debugging
pnpm test:e2e:debug:ui          # Interactive debugging

# Test fix
pnpm test:e2e:sanity              # Quick validation
pnpm test:e2e:responsive        # Ensure no regressions

# Final validation
pnpm test:e2e:ci:sanity           # Simulate CI environment
```

### **CI/CD Pipeline Examples**

#### **Pull Request Workflow**

```bash
# Local PR validation
pnpm test:e2e:ci:sanity           # Fast CI simulation
pnpm test:e2e:lint              # Code quality

# Full validation (if needed)
pnpm test:e2e:ci                # Popular browsers
pnpm test:e2e:ci:performance    # Performance tests
```

#### **Master Branch Deployment**

```bash
# Pre-deployment
pnpm test:e2e:ci:full           # Full test suite (sharded)
pnpm test:e2e:pre-deploy        # Comprehensive validation

# Post-deployment
pnpm test:e2e:post-deploy       # Health check
pnpm test:e2e:smoke:deployed    # Smoke tests
```

### **Performance Optimization Examples**

#### **Performance Investigation**

```bash
# Monitor performance
pnpm test:e2e:monitor           # System resources
pnpm test:e2e:analyze           # Test performance analysis

# Performance testing
pnpm test:e2e:performance       # Performance-focused tests
pnpm test:e2e:load              # Load simulation
```

#### **Environment Optimization**

```bash
# Optimize environment
pnpm test:e2e:optimize          # Setup optimized environment
pnpm test:e2e:clean             # Clean artifacts

# Browser management
pnpm test:e2e:install-browsers  # Install browsers
pnpm test:e2e:update-browsers   # Update browsers
```

## Test Optimization

### Browser Launch Optimizations

- Disabled background throttling
- Disabled GPU acceleration
- Disabled security features for testing
- Optimized memory usage

### Performance Improvements

- Test sharding for parallel execution
- Reduced timeouts for faster feedback
- Minimal browser coverage for development
- Optimized worker configuration

### Resource Management

- Automatic cleanup of test artifacts
- Browser cache management
- Process cleanup utilities
- System resource monitoring

## Deployment Strategy

### Pull Requests

1. **Fast E2E Tests**: Quick validation with Chromium only
2. **Unit Tests**: Comprehensive unit test coverage
3. **Linting & Type Checking**: Code quality validation

### Master Branch

1. **Full E2E Tests**: Comprehensive testing across popular browsers
2. **Performance Tests**: Performance validation
3. **Production Deployment**: Automatic deployment to Vercel

### Staging Branch

1. **Pre-deployment E2E Tests**: Full test suite validation
2. **Cross-browser Tests**: Browser compatibility testing
3. **Load Testing**: Performance under load
4. **Deployment**: Staging environment deployment
5. **Post-deployment Smoke Tests**: Quick health validation

### Development Branches (syehuza/\*)

- **Fast E2E Tests**: Quick validation for development
- **Unit Tests**: Code quality and functionality validation
- **No Deployment**: Development branches don't trigger deployments

## Monitoring and Reporting

### Test Artifacts

- HTML reports for detailed analysis
- JSON results for programmatic access
- JUnit reports for CI integration
- Screenshots and videos on failure

### Performance Metrics

- Test execution time tracking
- Browser performance metrics
- Load testing results
- Resource usage monitoring

### Failure Analysis

- Detailed error reporting
- Screenshot capture on failure
- Video recording for debugging
- Console error logging

## Troubleshooting

### Common Issues

1. **Test Timeouts**
   - Increase timeout values in config
   - Check system resources
   - Optimize test execution

2. **Browser Launch Failures**
   - Clear browser cache: `pnpm test:e2e:clean`
   - Reinstall browsers: `pnpm test:e2e:install-browsers`
   - Check system dependencies

3. **Flaky Tests**
   - Use optimized configurations
   - Increase retry attempts
   - Add proper wait conditions

4. **Performance Issues**
   - Monitor system resources: `pnpm test:e2e:monitor`
   - Analyze test performance: `pnpm test:e2e:analyze`
   - Optimize test environment: `pnpm test:e2e:optimize`

### Debug Commands

```bash
# Debug mode with headed browser
pnpm test:e2e:debug:headed

# Interactive debugging
pnpm test:e2e:debug:ui

# Run specific test file
pnpm playwright test tests/e2e/responsive.spec.ts

# Run with specific browser
pnpm playwright test --project=chromium

# Generate test report
pnpm open:test:report
```

## Best Practices

1. **Test Organization**
   - Use descriptive test names
   - Group related tests logically
   - Keep tests independent

2. **Performance**
   - Use appropriate timeouts
   - Minimize browser instances
   - Optimize test data setup

3. **Reliability**
   - Add proper wait conditions
   - Handle async operations correctly
   - Use stable selectors

4. **Maintenance**
   - Regular test updates
   - Monitor test performance
   - Clean up test artifacts

## Support

For issues with the CI/CD pipeline or E2E testing setup:

1. Check the workflow logs in GitHub Actions
2. Review test artifacts for detailed error information
3. Use the optimization scripts for troubleshooting
4. Consult the Playwright documentation for advanced configuration
