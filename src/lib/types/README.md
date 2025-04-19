# Types

This directory contains all the type definitions used throughout the application.

## Structure

- `index.ts`: Main exports file. All type imports should come from this file.
- `generated/`: Contains auto-generated types from GraphQL schema
- `common.types.ts`: Common utility types
- `constants.types.ts`: Type definitions for constants
- `game.types.ts`: Game-related types
- `team.types.ts`: Team-related types
- `user.types.ts`: User-related types
- `gamelog.types.ts`: Game log related types
- `friendship.types.ts`: Friendship related types
- `notification.types.ts`: Notification related types
- `toast.types.ts`: Toast notification related types
- `component.types.ts`: Component prop types

## Usage

Always import types from the index file:

```typescript
import { User } from '@/lib/types';
```

This ensures type consistency and prevents import conflicts.

## Usage Guidelines

1. **Always import from index.ts**:

   ```typescript
   // ✅ Correct
   import { User, Game, GameLogResponse } from '@/lib/types';

   // ❌ Incorrect - don't import directly from individual files
   import { User } from '@/lib/types/user.types';
   ```

2. **File Structure**:

   - Each domain has its own types file (e.g., `user.types.ts`, `game.types.ts`, etc.)
   - `index.ts` re-exports all types from these files
   - `common.types.ts` contains types that span multiple domains or depend on multiple type files

3. **Adding New Types**:
   - Add domain-specific types to the appropriate .types.ts file
   - Add cross-domain types to `common.types.ts`
   - Export all types through `index.ts`

## Known Issues

There are currently some duplicate type exports in the barrel file. These will need to be resolved by:

1. Explicitly re-exporting types with aliases
2. Refactoring the type structure to avoid duplicates
3. Using namespaces to avoid collisions

The current implementation allows the code to compile but has lint warnings.

## Troubleshooting

If you see TypeScript errors about ambiguous exports, you may need to:

1. Import the type directly from its source file (within the types directory only)
2. Update the index.ts file to resolve the ambiguity
3. Refactor the types to have unique names
