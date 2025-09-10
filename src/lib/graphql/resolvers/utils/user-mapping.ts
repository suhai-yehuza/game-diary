// Utility functions for user data mapping in GraphQL resolvers

import type { UserData } from '@/types';

/**
 * Safely extracts user data from a user object that might be an array or single object
 * This handles the inconsistency in Drizzle ORM query results
 */
export function mapUserData(user: unknown): UserData | null {
  if (!user || typeof user !== 'object') return null;

  // Handle array case (from Drizzle relations)
  if (Array.isArray(user)) {
    const userData = user[0];
    if (!userData || typeof userData !== 'object') return null;

    const data = userData as Record<string, unknown>;
    return {
      id: typeof data.id === 'string' ? data.id : '',
      username: typeof data.username === 'string' ? data.username : '',
      first_name: typeof data.first_name === 'string' ? data.first_name : '',
      last_name: typeof data.last_name === 'string' ? data.last_name : '',
      image_url: typeof data.image_url === 'string' ? data.image_url : null,
    };
  }

  // Handle single object case
  const data = user as Record<string, unknown>;
  return {
    id: typeof data.id === 'string' ? data.id : '',
    username: typeof data.username === 'string' ? data.username : '',
    first_name: typeof data.first_name === 'string' ? data.first_name : '',
    last_name: typeof data.last_name === 'string' ? data.last_name : '',
    image_url: typeof data.image_url === 'string' ? data.image_url : null,
  };
}

/**
 * Maps user data for GraphQL responses with consistent structure
 */
export function mapUserForGraphQL(user: unknown): UserData | null {
  return mapUserData(user);
}
