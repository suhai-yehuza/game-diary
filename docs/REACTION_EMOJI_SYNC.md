# Reaction Emoji Synchronization Guide

This document explains how to maintain synchronization between reaction emojis across different parts of the codebase.

## Overview

Reaction emojis are defined in multiple locations and must be kept in sync:

1. **Source of Truth**: `src/lib/constants/index.ts` - `REACTION_EMOJIS` constant
2. **Database Migration**: `src/lib/db/migrations/data/001_reaction_emojis.sql` - `reaction_emojis` table
3. **Setup Script**: `scripts/db/setup-complete-database.ts` - emoji population

## Current Emojis

The following emojis are currently supported (in order):

1. 👍 (THUMBS_UP)
2. 👎 (THUMBS_DOWN)
3. ❤️ (LOVE)
4. 😂 (LAUGH)
5. 😮 (WOW)
6. 😢 (SAD)
7. 😠 (ANGRY)
8. 🔥 (FIRE)
9. 👏 (CLAP)
10. 👀 (EYES)
11. 🚀 (ROCKET)
12. 💪 (MUSCLE)
13. 🐐 (GOAT)
14. 🎯 (BULLSEYE)
15. 🏀 (BASKETBALL)
16. ⚽ (SOCCER)
17. 🏈 (FOOTBALL)
18. 💯 (PERFECT)
19. ⭐ (STAR)
20. 🎉 (CELEBRATE)

## How to Add/Remove/Modify Emojis

### 1. Update the Source of Truth

Always start by modifying `src/lib/constants/index.ts`:

```typescript
export const REACTION_EMOJIS = {
  // ... existing emojis ...
  NEW_EMOJI: '🆕', // Add new emoji here
} as const;
```

### 2. Update Database Migration

Add the new emoji to `src/lib/db/migrations/data/001_reaction_emojis.sql`:

```sql
-- Populate allowed emojis (keep in sync with REACTION_EMOJIS in src/lib/constants/index.ts)
INSERT INTO "reaction_emojis" ("emoji") VALUES
    ('👍'), ('👎'), ('❤️'), ('😂'), ('😮'), ('😢'), ('😠'), ('🔥'), ('👏'), ('👀'),
    ('🚀'), ('💪'), ('🐐'), ('🎯'), ('🏀'), ('⚽'), ('🏈'), ('💯'), ('⭐'), ('🎉'), ('🆕');
```

### 3. Update Setup Script

Add the new emoji to `scripts/db/setup-complete-database.ts`:

```typescript
// Keep in sync with REACTION_EMOJIS in src/lib/constants/index.ts
const emojis = [
  '👍',
  '👎',
  '❤️',
  '😂',
  '😮',
  '😢',
  '😠',
  '🔥',
  '👏',
  '👀',
  '🚀',
  '💪',
  '🐐',
  '🎯',
  '🏀',
  '⚽',
  '🏈',
  '💯',
  '⭐',
  '🎉',
  '🆕',
];
```

### 4. Run Validation

After making changes, validate synchronization:

```bash
pnpm validate:emoji-sync
```

## Validation

### Manual Validation

Run the validation script to check synchronization:

```bash
pnpm validate:emoji-sync
```

This will:

- Extract emojis from all three locations
- Compare them for exact matches
- Report any mismatches with details
- Exit with code 1 if out of sync

### Automated Validation

Emoji synchronization is automatically validated:

- **Pre-commit**: Git hook runs validation before each commit
- **CI/CD**: GitHub Actions run validation on every PR
- **Validation Pipeline**: Included in core validation tasks

### What Happens If Out of Sync

If emojis are out of sync:

1. **Pre-commit hook fails** - prevents committing
2. **CI validation fails** - prevents merging
3. **Validation pipeline fails** - prevents deployment

## Troubleshooting

### Common Issues

1. **Missing emoji in migration**: Add to INSERT statement
2. **Wrong emoji order**: Ensure order matches constants file
3. **Missing emoji in setup script**: Add to emojis array
4. **Unicode issues**: Ensure emoji characters are copied correctly

### Fixing Out-of-Sync Issues

1. Identify which files are out of sync using `pnpm validate:emoji-sync`
2. Update the missing/incorrect files
3. Run validation again to confirm fix
4. Commit the changes

### Database Schema Updates

If you need to add emojis to an existing database:

1. Create a new migration file
2. Add the new emojis to the `reaction_emojis` table
3. Update the constants and setup script
4. Run validation

## Best Practices

1. **Always start with constants**: Modify `REACTION_EMOJIS` first
2. **Keep order consistent**: Maintain the same order across all files
3. **Test validation**: Run `pnpm validate:emoji-sync` after changes
4. **Use meaningful names**: Choose descriptive constant names
5. **Document changes**: Update this guide when adding new emojis

## Integration Points

The `REACTION_EMOJIS` constant is used throughout the codebase:

- **Types**: `src/lib/types/reaction.types.ts`
- **GraphQL**: `src/lib/graphql/resolvers/mutations.ts`
- **Hooks**: `src/hooks/use-reactions.ts`
- **Utils**: `src/lib/utils/formatReactionCount.ts`
- **Tests**: Various test files
- **Seeding**: Database seeding scripts

## Monitoring

- **Pre-commit hooks** catch issues before they're committed
- **CI validation** prevents merging out-of-sync code
- **Validation pipeline** ensures deployment safety
- **Regular audits** can be run with `pnpm validate:emoji-sync`

## Support

If you encounter issues with emoji synchronization:

1. Run `pnpm validate:emoji-sync` for detailed error information
2. Check this guide for common solutions
3. Ensure all three locations are updated consistently
4. Verify emoji characters are copied correctly
