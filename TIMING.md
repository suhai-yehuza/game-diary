# Script Timing Guide

This document provides timing capabilities for all scripts in the project. The primary method is **automatic timing** which times all `pnpm` commands when enabled.

## 🚀 Automatic Timing (Recommended)

### Setup

```bash
# Install timing functions to your shell profile
./scripts/setup-timing.sh

# Restart terminal or source profile
source ~/.zshrc  # or ~/.bashrc

# Enable timing for current session
enable_timing
```

### Usage

Once enabled, all `pnpm` commands are automatically timed and logged:

```bash
pnpm test:e2e:fast    # Automatically timed and logged
pnpm validate         # Automatically timed and logged
pnpm build           # Automatically timed and logged
pnpm lint            # Automatically timed and logged
```

### Control

```bash
enable_timing         # Enable automatic timing
disable_timing        # Disable automatic timing
show_timing_log       # View recent timing data
clear_timing_log      # Clear timing log
```

## 📊 Manual Timing Scripts

For CI/CD and explicit timing, these wrapper scripts are available:

### `pnpm time:validate`

- **What it does**: Full production validation with timing
- **Use case**: CI/CD pipelines, explicit timing
- **Expected time**: 5-15 minutes

### `pnpm time:test:all`

- **What it does**: All tests with timing
- **Use case**: Release validation, comprehensive testing
- **Expected time**: 5-15 minutes

### `pnpm time:clean:build:prod`

- **What it does**: Full production build cycle with timing
- **Use case**: Deployment pipelines, production builds
- **Expected time**: 3-8 minutes

## 🎯 Usage Recommendations

### Development Workflow

```bash
enable_timing
pnpm test:e2e:fast    # Quick development testing
pnpm validate:soft    # Quick validation
pnpm lint            # Code quality check
```

### Pre-Commit Workflow

```bash
enable_timing
pnpm lint            # ~5-15s
pnpm typecheck       # ~5-20s
pnpm test            # ~5-30s
```

### Pre-Release Workflow

```bash
# Use manual timing scripts for explicit control
pnpm time:validate         # ~5-15 minutes
pnpm time:test:all         # ~5-15 minutes
pnpm time:clean:build:prod # ~3-8 minutes
```

### CI/CD Pipeline

```bash
# Use manual timing scripts for guaranteed timing
pnpm time:clean:build:prod
pnpm time:test:all
pnpm time:validate
```

## 📈 Performance Monitoring

### View Timing Data

```bash
show_timing_log          # Recent entries
cat .timing.log          # Full log
grep "test:e2e" .timing.log  # Filter by command
```

### Environment Variables

```bash
TIMING_ENABLED=1 pnpm <command>  # Enable timing for single command
TIMING_QUIET=1 pnpm <command>    # Silent timing (no output)
TIMING_LOG=1 pnpm <command>      # Force logging
```

## 🔧 Custom Timing

You can also time any custom command:

```bash
./scripts/time-script.sh your-custom-command
```

## 📊 Timing Log Management

### Helper Functions

After running `./scripts/setup-timing.sh`, you'll have these helper functions available:

#### `show_timing_log`

- **What it does**: Shows the last 20 entries from your timing log
- **Use case**: Quick review of recent script performance
- **Example**: `show_timing_log`

#### `clear_timing_log`

- **What it does**: Deletes the `.timing.log` file
- **Use case**: Clean up old timing data
- **Example**: `clear_timing_log`

#### `enable_timing`

- **What it does**: Enables automatic timing and logging for all `pnpm` commands
- **Use case**: Start timing your workflow
- **Example**: `enable_timing`

#### `disable_timing`

- **What it does**: Disables automatic timing
- **Use case**: Stop timing when not needed
- **Example**: `disable_timing`

### Manual Log Management

You can also manage the log file directly:

```bash
# View full log
cat .timing.log

# View last 10 entries
tail -10 .timing.log

# Search for specific commands
grep "test:e2e" .timing.log

# Clear log manually
rm .timing.log
```

## 🎯 Best Practices

1. **Use automatic timing for development** - `enable_timing` then use `pnpm` normally
2. **Use manual timing scripts for CI/CD** - Explicit timing for pipelines
3. **Monitor performance trends** - Check timing log regularly
4. **Set realistic expectations** - Share timing data with your team

This gives you complete visibility into your development workflow performance with minimal friction! 🚀
