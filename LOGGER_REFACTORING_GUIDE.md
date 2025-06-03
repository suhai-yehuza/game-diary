# Logger Refactoring Guide

## Overview

This guide explains how to systematically replace all `console.*` statements with our custom logger throughout the codebase. We've implemented a sophisticated logging system with multiple specialized loggers for different parts of the application.

## ✅ Logger System Features

Our custom logger system in `src/lib/logger.ts` provides:

- **Multiple log levels**: DEBUG, INFO, WARN, ERROR
- **Environment-aware**: Different behavior in development vs production
- **Timestamping**: Automatic timestamps on all log messages  
- **Color coding**: Colored output in development for better visibility
- **File location**: Shows source file and line number in development
- **Specialized loggers**: Different loggers for different modules
- **Performance tracking**: Built-in performance monitoring utilities

## 📋 Available Loggers

```typescript
import { 
  logger,           // Generic logger
  dbLogger,         // Database operations
  apiLogger,        // API routes and external APIs
  cacheLogger,      // Cache operations
  seedLogger,       // Database seeding
  webhookLogger     // Webhook handling
} from '@/lib/logger';
```

## 🎯 Refactoring Pattern

### 1. Add Import

```typescript
// Choose the appropriate logger for your file
import { dbLogger } from '@/lib/logger';
```

### 2. Replace Console Statements

```typescript
// Before
console.log('Database connection established');
console.error('Failed to connect:', error);
console.warn('Slow query detected');
console.debug('Query details:', query);

// After
dbLogger.info('Database connection established');
dbLogger.error('Failed to connect:', error);
dbLogger.warn('Slow query detected');
dbLogger.debug('Query details:', query);
```

## 📁 Logger Assignment by File Type

| File Pattern | Logger to Use | Example |
|-------------|---------------|---------|
| `src/lib/db/**` | `dbLogger` | Database operations |
| `src/lib/cache/**` | `cacheLogger` | Cache operations |
| `src/app/api/**` | `apiLogger` | API routes |
| `src/lib/external-apis.ts` | `apiLogger` | External API calls |
| `src/lib/apollo-client.ts` | `apiLogger` | GraphQL client |
| `src/lib/middleware/**` | `apiLogger` | Middleware |
| `src/lib/db/seed/**` | `seedLogger` | Database seeding |
| `src/app/api/webhooks/**` | `webhookLogger` | Webhooks |
| Everything else | `logger` | Generic logging |

## ✅ Already Completed Files

The following files have already been refactored:

- ✅ `src/lib/db/index.ts` - Uses `dbLogger`
- ✅ `src/lib/cache/index.ts` - Uses `cacheLogger`  
- ✅ `src/lib/external-apis.ts` - Uses `apiLogger`
- ✅ `src/lib/logger.ts` - Logger implementation

## 🔄 Remaining Files to Refactor

### High Priority (Core Infrastructure)
- `src/lib/apollo-client.ts` → `apiLogger`
- `src/lib/middleware/optimization.ts` → `apiLogger`
- `src/app/api/graphql/route.ts` → `apiLogger`
- `src/app/api/webhooks/route.ts` → `webhookLogger`

### Database & Seeding Files
- `src/lib/db/reset.ts` → `dbLogger`
- `src/lib/db/seed/*.ts` → `seedLogger`

### API Routes
- `src/app/api/**/*.ts` → `apiLogger`

### Components & Pages
- `src/components/**/*.tsx` → `logger`
- `src/app/**/*.tsx` → `logger`

### Scripts
- `scripts/*.ts` → `logger`

## 🛠 Manual Refactoring Steps

For each file:

1. **Identify the appropriate logger** using the table above
2. **Add the import** at the top of the file:
   ```typescript
   import { dbLogger } from '@/lib/logger';
   ```
3. **Replace console statements**:
   ```bash
   # Find and replace patterns
   console.log( → dbLogger.info(
   console.error( → dbLogger.error(
   console.warn( → dbLogger.warn(
   console.debug( → dbLogger.debug(
   console.info( → dbLogger.info(
   ```

## 🔧 Automated Refactoring Script

For bulk refactoring, you can use this bash one-liner per directory:

```bash
# Example for database files
find src/lib/db -name "*.ts" -exec sed -i '' 's/console\.log(/dbLogger.info(/g; s/console\.error(/dbLogger.error(/g; s/console\.warn(/dbLogger.warn(/g; s/console\.debug(/dbLogger.debug(/g' {} \;

# Add imports (do this first)
find src/lib/db -name "*.ts" -exec sed -i '' '1i\
import { dbLogger } from "@/lib/logger";
' {} \;
```

## 📊 Progress Tracking

Use this command to check remaining console statements:

```bash
# Count remaining console statements
grep -r "console\." src/ | grep -v "node_modules" | wc -l

# List files with console statements
grep -r "console\." src/ | cut -d: -f1 | sort -u
```

## 🧪 Testing

After refactoring:

1. **Build test**: `pnpm build`
2. **Type check**: `pnpm typecheck`
3. **Lint check**: `pnpm lint`
4. **Runtime test**: Start the application and verify logging works

## 🎯 Benefits After Completion

- **Consistent logging** across the entire application
- **Environment-aware** logging (less verbose in production)
- **Better debugging** with timestamps and source locations
- **Centralized control** of log levels and formatting
- **Performance monitoring** built into the logging system
- **Professional logging** suitable for production deployment

## 📝 Example: Typical File Refactoring

```typescript
// Before
import { someModule } from './some-module';

export function myFunction() {
  console.log('Starting operation');
  try {
    // some operation
    console.log('Operation successful');
  } catch (error) {
    console.error('Operation failed:', error);
  }
}

// After  
import { someModule } from './some-module';
import { logger } from '@/lib/logger';

export function myFunction() {
  logger.info('Starting operation');
  try {
    // some operation
    logger.info('Operation successful');
  } catch (error) {
    logger.error('Operation failed:', error);
  }
}
```

## 🚀 Next Steps

1. Review this guide
2. Choose a file or directory to refactor
3. Follow the refactoring pattern
4. Test the changes
5. Commit and move to the next file
6. Repeat until all console statements are replaced

This systematic approach will result in a professional, maintainable logging system throughout the entire application! 