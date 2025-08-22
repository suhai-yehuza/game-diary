# Test File Naming Convention

## Overview

This document establishes consistent naming patterns for test files across the project to improve maintainability and discoverability.

## Naming Format

**Format**: `{ComponentName}.{TestType}.test.{ext}`

### Rules

1. **Component/Hook names**: Use PascalCase (e.g., `LoadingSpinner`, `UseReactions`)
2. **Test types**: Use descriptive suffixes (e.g., `basic`, `enhanced`, `skeleton`, `integration`)
3. **File extension**: `.test.tsx` for React components, `.test.ts` for utilities
4. **Separator**: Use dot (`.`) between component name and test type

## Test Type Suffixes

| Suffix        | Description                  | Example                                |
| ------------- | ---------------------------- | -------------------------------------- |
| `basic`       | Standard functionality tests | `LoadingSpinner.basic.test.tsx`        |
| `enhanced`    | Extended functionality tests | `ReactionPicker.enhanced.test.tsx`     |
| `extended`    | Additional edge cases        | `GameLogsTable.extended.test.tsx`      |
| `skeleton`    | Loading state tests          | `LoadingSpinner.skeleton.test.tsx`     |
| `integration` | Integration tests            | `UserAuth.integration.test.tsx`        |
| `unit`        | Pure unit tests              | `ValidationUtils.unit.test.ts`         |
| `branches`    | Branch coverage tests        | `IntegratedGameLogs.branches.test.tsx` |
| `actions`     | User interaction tests       | `ReactionPicker.actions.test.tsx`      |
| `simple`      | Simplified test cases        | `EmptyState.simple.test.tsx`           |
| `handlers`    | Event handler tests          | `GameLogsTable.handlers.test.tsx`      |

## Examples

### Before (Inconsistent)

```
use-reactions.test.tsx
loading-spinner.test.tsx
LoadingSpinner.test.tsx
ReactionPicker.enhanced.test.tsx
apollo-client.enhanced.test.ts
utils.test.ts
```

### After (Consistent)

```
UseReactions.basic.test.tsx
LoadingSpinner.basic.test.tsx
LoadingSpinner.basic.test.tsx
ReactionPicker.enhanced.test.tsx
ApolloClient.enhanced.test.ts
Utils.basic.test.ts
```

## Directory Structure

```
tests/unit/
├── hooks/
│   ├── UseReactions.basic.test.tsx
│   ├── UseLatestGames.basic.test.tsx
│   └── UseGameLogs.basic.test.tsx
├── components/
│   ├── common/
│   │   ├── LoadingSpinner.basic.test.tsx
│   │   ├── LoadingSpinner.skeleton.test.tsx
│   │   └── EmptyState.basic.test.tsx
│   ├── reactions/
│   │   ├── ReactionPicker.basic.test.tsx
│   │   ├── ReactionPicker.enhanced.test.tsx
│   │   └── ReactionButton.basic.test.tsx
│   └── landing/
│       ├── ContentPreviewBanner.basic.test.tsx
│       └── IntegratedGameLogs.branches.test.tsx
├── lib/
│   ├── Utils.basic.test.ts
│   ├── ApolloClient.enhanced.test.ts
│   └── Validation.basic.test.ts
└── app/
    ├── page.basic.test.tsx
    └── layout.basic.test.tsx
```

## Implementation

### For New Test Files

When creating new test files, follow this convention manually:

1. **Component/Hook name**: Use PascalCase
2. **Test type**: Choose appropriate suffix (usually `basic` for standard tests)
3. **File extension**: `.test.tsx` for React components, `.test.ts` for utilities

### Examples

```bash
# For a new LoadingSpinner component test
LoadingSpinner.basic.test.tsx

# For a new useAuth hook test
UseAuth.basic.test.tsx

# For extended functionality tests
UserProfile.enhanced.test.tsx

# For loading state tests
DataTable.skeleton.test.tsx
```

## Benefits

- **Consistency**: All test files follow the same naming pattern
- **Discoverability**: Easy to find specific test types
- **Maintainability**: Clear organization and structure
- **Scalability**: Easy to add new test types
- **IDE Support**: Better autocomplete and search functionality

## Maintenance

- New test files should follow this convention from the start
- When adding new test types, update this document
- Regular audits to ensure compliance
- Update CI/CD scripts if they reference specific file patterns
