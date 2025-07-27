# ID Generation Standardization

## Overview

This document outlines the standardized approach to ID generation across the Placeholder application.

## Recommended ID Format: UUID v7

**UUID v7 is the recommended and standardized ID format for all new IDs in this application.**

### Why UUID v7?

1. **Time-ordered**: First 48 bits contain timestamp, enabling efficient sorting and indexing
2. **RFC 4122 compliant**: Widely supported standard
3. **128-bit entropy**: Strong collision resistance
4. **Monotonic**: Can generate multiple IDs in the same millisecond
5. **Standard format**: 36-character string (e.g., `01890dd5-ecc3-7d66-8b9b-32a3e4c5d6f7`)

## Implementation

### Application Level

All application code uses the centralized ID generator utility:

```typescript
import { generateUUIDv7 } from '@/lib/utils/id-generator';

// Generate a new ID
const newId = generateUUIDv7();
```

**Location**: `src/lib/utils/id-generator.ts`

### Database Level

Database functions and triggers use the PostgreSQL `generate_uuid_v7()` function:

```sql
-- Example usage in database functions
INSERT INTO notifications (id, user_id, type, title, message)
VALUES (generate_uuid_v7(), user_id, 'notification', 'Title', 'Message');
```

**Location**: `src/lib/db/migrations/000_full_schema_reset.sql`

## Current Usage

### Application Code

- ✅ GraphQL resolvers (games, comments, reactions, friendships)
- ✅ Audit logging
- ✅ User data seeding
- ✅ All new entity creation

### Database Functions

- ✅ Game ratings triggers
- ✅ Notification creation triggers
- ✅ Friendship management triggers
- ✅ All database-level ID generation

## Migration from Other Formats

### Previously Used Formats

1. **NanoID**: Used for shorter, URL-friendly IDs
   - Still available for specific use cases (URLs, user-facing content)
   - Use `generateShortId()` for these cases

2. **UUID v4**: Standard random UUIDs
   - Available as fallback
   - Use `generateUUID()` for compatibility

3. **CUID2**: Maximum collision resistance
   - Available for sensitive operations
   - Use `generateSecureId()` for these cases

### Migration Strategy

1. **New code**: Always use `generateUUIDv7()`
2. **Existing code**: Gradually migrate to UUID v7 when touching files
3. **Database**: Already standardized on `generate_uuid_v7()`

## Benefits of Standardization

1. **Consistency**: All IDs follow the same format and generation method
2. **Performance**: Time-ordered IDs improve database indexing and sorting
3. **Debugging**: Timestamp information helps with debugging and auditing
4. **Scalability**: UUID v7 handles high-frequency ID generation efficiently
5. **Standards compliance**: RFC 4122 compliance ensures wide tool support

## Best Practices

1. **Always use `generateUUIDv7()` for new entities**
2. **Don't hardcode UUIDs in migrations or seed data**
3. **Let the application generate IDs, not the database**
4. **Use the centralized ID generator utility**
5. **Document any exceptions to this standard**

## Testing

The ID generator includes comprehensive tests:

```bash
# Run ID generator tests
pnpm test src/lib/utils/id-generator.test.ts
```

Tests verify:

- UUID v7 generation and format
- NanoID generation with different lengths
- All ID generation methods
- Default behavior

## Future Considerations

1. **Monitoring**: Consider adding metrics for ID generation performance
2. **Caching**: For high-frequency operations, consider ID pre-generation
3. **Sharding**: UUID v7 supports future database sharding strategies
4. **Backward compatibility**: Maintain support for existing ID formats

## References

- [UUID v7 RFC Draft](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04)
- [RFC 4122 - UUID](https://tools.ietf.org/html/rfc4122)
- [UUID v7 Implementation](https://github.com/LiosK/uuidv7)
