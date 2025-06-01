# Infinite Scroll Implementation Guide

This guide explains how to implement infinite scrolling in the Game Diary application.

## Overview

Infinite scrolling automatically loads more content as the user scrolls near the bottom of the page, providing a seamless browsing experience without manual pagination buttons.

## Using the Custom Hook

### Basic Usage

```typescript
import { useInfiniteScroll } from '@/lib/hooks/use-infinite-scroll';
import { GET_GAME_LOGS } from '@/lib/graphql/queries';

function GameLogsList() {
  const {
    data,
    loading,
    error,
    isFetchingMore,
    loadMoreRef,
    hasNextPage
  } = useInfiniteScroll({
    query: GET_GAME_LOGS,
    variables: { filters: { userId: 'user123' } },
    dataPath: 'gameLogs',
    pageSize: 20,
  });

  if (loading && !data) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const gameLogs = data?.gameLogs?.edges || [];

  return (
    <div>
      {gameLogs.map(({ node }) => (
        <GameLogItem key={node.id} gameLog={node} />
      ))}
      
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isFetchingMore && <span>Loading more...</span>}
        </div>
      )}
    </div>
  );
}
```

## Manual Implementation (Comments Example)

For more control, you can implement infinite scrolling manually:

```typescript
import { useQuery } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';

function CommentsSection({ parentId, parentType }) {
  const { data, loading, error, fetchMore } = useQuery(GET_COMMENTS, {
    variables: {
      parentId,
      first: 10,
    },
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [target] = entries;
        if (
          target.isIntersecting && 
          !loading && 
          !isFetchingMore &&
          data?.comments?.pageInfo?.hasNextPage
        ) {
          setIsFetchingMore(true);
          try {
            await fetchMore({
              variables: {
                parentId,
                first: 10,
                after: data.comments.pageInfo.endCursor,
              },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;
                
                // Create a Set of existing comment IDs for efficient lookup
                const existingIds = new Set(
                  prev.comments.edges.map((edge: any) => edge.node.id)
                );
                
                // Filter out any duplicate comments from the new results
                const newEdges = fetchMoreResult.comments.edges.filter(
                  (edge: any) => !existingIds.has(edge.node.id)
                );
                
                return {
                  comments: {
                    ...fetchMoreResult.comments,
                    edges: [
                      ...prev.comments.edges,
                      ...newEdges,
                    ],
                  },
                };
              },
            });
          } catch (error) {
            console.error('Error loading more comments:', error);
          } finally {
            setIsFetchingMore(false);
          }
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [data, loading, isFetchingMore, fetchMore, parentId]);

  // ... render logic
}
```

## Key Components

### 1. Intersection Observer
- Detects when the loading trigger element comes into view
- `threshold: 0.1` - Triggers when 10% of the element is visible
- `rootMargin: '100px'` - Start loading 100px before the element is visible

### 2. GraphQL Pagination
- Uses cursor-based pagination with `first` and `after` parameters
- `pageInfo.hasNextPage` indicates if more data is available
- `pageInfo.endCursor` is used as the `after` parameter for the next page

### 3. Cache Updates
- `updateQuery` merges new data with existing data in Apollo cache
- Preserves existing edges and appends new ones

## Best Practices

1. **Loading States**: Show a loading indicator when fetching more data
2. **Error Handling**: Handle network errors gracefully
3. **Debouncing**: The intersection observer naturally debounces scroll events
4. **Page Size**: Use reasonable page sizes (10-20 items) to balance performance
5. **Empty States**: Handle cases where there's no more data to load

## Supported Queries

Any GraphQL query that returns a connection with the following structure can use infinite scrolling:

```graphql
query {
  dataField(first: Int, after: String) {
    edges {
      cursor
      node {
        # ... fields
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

## Performance Considerations

1. **Memory**: Be mindful of keeping too many items in memory
2. **Re-renders**: Use React.memo for list items to prevent unnecessary re-renders
3. **Network**: Consider implementing a maximum number of pages to load
4. **Cleanup**: Always disconnect the intersection observer on unmount 