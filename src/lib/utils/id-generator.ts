import { createId } from '@paralleldrive/cuid2';
import { nanoid } from 'nanoid';
import { ulid } from 'ulid';
import { uuidv7 } from 'uuidv7';

import type { IdGeneratorType } from '@src/lib/types';

/**
 * ID Generator Utility
 *
 * RECOMMENDATION: Use UUID v7 for all new IDs in this application
 * - Time-ordered (first 48 bits are timestamp) - great for sorting/indexing
 * - RFC 4122 compliant - widely supported
 * - 128-bit entropy for collision resistance
 * - Monotonic (can generate multiple in same millisecond)
 * - Standard UUID format (36 characters)
 *
 * Provides multiple options for generating strong, collision-resistant identifiers:
 * - UUID v7: Time-ordered, RFC 4122 compliant, 128-bit entropy (RECOMMENDED)
 * - ULID: Time-ordered, URL-safe, 128-bit entropy
 * - Nano ID: Configurable length, URL-safe, fast
 * - CUID2: Maximum collision resistance, time-ordered
 * - UUID v4: Standard UUID (fallback)
 */

/**
 * Generate a UUID v7 (Time-ordered UUID) - RECOMMENDED DEFAULT
 *
 * Features:
 * - Time-ordered (first 48 bits are timestamp)
 * - RFC 4122 compliant
 * - 128-bit entropy for collision resistance
 * - Standard UUID format with time-ordering
 * - Monotonic (can generate multiple in same millisecond)
 *
 * @returns UUID v7 string (36 characters)
 */
export function generateUUIDv7(): string {
  return uuidv7();
}

/**
 * Generate a ULID (Universally Unique Lexicographically Sortable Identifier)
 *
 * Features:
 * - Time-ordered (first 48 bits are timestamp)
 * - URL-safe base32 encoding
 * - 128-bit entropy for collision resistance
 * - Monotonic (can generate multiple in same millisecond)
 *
 * @returns ULID string (26 characters)
 */
export function generateULID(): string {
  return (ulid as unknown as () => string)();
}

/**
 * Generate a Nano ID with custom length
 *
 * Features:
 * - Configurable length
 * - URL-safe characters
 * - Cryptographically secure
 * - Fast generation
 *
 * @param length - Length of the ID (default: 21)
 * @returns Nano ID string
 */
export function generateNanoID(length = 21): string {
  return (nanoid as unknown as (len?: number) => string)(length);
}

/**
 * Generate a CUID2 (Collision-resistant Unique IDentifier v2)
 *
 * Features:
 * - Maximum collision resistance (128-bit entropy)
 * - Time-ordered
 * - Performance optimized
 * - Cryptographically secure
 *
 * @returns CUID2 string (24 characters)
 */
export function generateCUID2(): string {
  return (createId as unknown as () => string)();
}

/**
 * Generate a standard UUID v4
 *
 * Features:
 * - RFC 4122 compliant
 * - Widely supported
 * - 128-bit random
 *
 * @returns UUID v4 string
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Generate an ID using the specified method
 *
 * RECOMMENDATION: Use 'uuidv7' as the default for all new IDs
 *
 * @param type - ID generation method (default: 'uuidv7')
 * @param options - Additional options (e.g., length for nanoid)
 * @returns Generated ID string
 */
export function generateId(
  type: IdGeneratorType = 'uuidv7',
  options?: { length?: number }
): string {
  switch (type) {
    case 'uuidv7':
      return generateUUIDv7();
    case 'ulid':
      return generateULID();
    case 'nanoid':
      return generateNanoID(options?.length);
    case 'cuid2':
      return generateCUID2();
    case 'uuid':
      return generateUUID();
    default:
      return generateUUIDv7();
  }
}

/**
 * Generate a database-friendly ID
 *
 * RECOMMENDATION: Use UUID v7 for all database IDs
 *
 * This function generates an ID optimized for database storage:
 * - Uses UUID v7 for time-ordered records (notifications, comments, reactions)
 * - Falls back to UUID v4 for compatibility
 *
 * @param useUUIDv7 - Whether to use UUID v7 (default: true)
 * @returns Database-friendly ID string
 */
export function generateDatabaseId(useUUIDv7 = true): string {
  return useUUIDv7 ? generateUUIDv7() : generateUUID();
}

/**
 * Generate a short ID for URLs or user-facing content
 *
 * Uses Nano ID with shorter length for better UX
 *
 * @param length - Length of the short ID (default: 12)
 * @returns Short ID string
 */
export function generateShortId(length = 12): string {
  return generateNanoID(length);
}

/**
 * Generate a secure ID for sensitive operations
 *
 * Uses CUID2 for maximum collision resistance
 *
 * @returns Secure ID string
 */
export function generateSecureId(): string {
  return generateCUID2();
}
