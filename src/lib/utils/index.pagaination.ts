import { PaginationInput, InputMaybe } from '@/lib/types/generated/graphql';

export function paginateResults<T extends { id: string }>(
  results: T[] | null | undefined,
  pagination?: InputMaybe<PaginationInput>
) {
  // Ensure results is always an array
  const safeResults = Array.isArray(results) ? results : [];

  let startIndex = 0;
  let endIndex = safeResults.length;

  if (pagination?.after) {
    const afterIndex = safeResults.findIndex(result => result.id === pagination.after);
    if (afterIndex !== -1) startIndex = afterIndex + 1;
  }

  if (pagination?.before) {
    const beforeIndex = safeResults.findIndex(result => result.id === pagination.before);
    if (beforeIndex !== -1) endIndex = beforeIndex;
  }

  if (pagination?.first) endIndex = Math.min(startIndex + pagination.first, endIndex);
  if (pagination?.last) startIndex = Math.max(endIndex - pagination.last, startIndex);

  // Ensure we have valid indices
  startIndex = Math.max(0, Math.min(startIndex, safeResults.length));
  endIndex = Math.max(0, Math.min(endIndex, safeResults.length));

  // Ensure we always have a valid array for items
  const paginatedResults = safeResults.slice(startIndex, endIndex) || [];

  // Ensure the response matches the GraphQL schema exactly
  return {
    __typename: 'PaginatedResponse' as const,
    items: paginatedResults, // This will always be an array, never null
    total: safeResults.length,
    hasMore: endIndex < safeResults.length,
    nextCursor: paginatedResults[paginatedResults.length - 1]?.id || null,
  };
}
