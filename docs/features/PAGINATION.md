# GraphQL Pagination System

This document explains how to use the pagination system implemented across all GraphQL schemas in the game-diary application.

## Overview

All list queries in the GraphQL API now use **Relay-style connection-based pagination**. This provides a consistent and powerful way to paginate through large datasets.

## Connection Structure

Every paginated query returns a connection object with the following structure:

```graphql
type Connection {
  edges: [Edge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type Edge {
  cursor: String!
  node: ActualDataType!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

## Pagination Arguments

All paginated queries accept these optional arguments:

- `first: Int` - Number of items to fetch (forward pagination)
- `after: String` - Cursor to start after (forward pagination)
- `last: Int` - Number of items to fetch (backward pagination)
- `before: String` - Cursor to start before (backward pagination)

## Examples

### Basic Forward Pagination

```graphql
query GetGames {
  games(first: 10) {
    edges {
      cursor
      node {
        id
        date {
          start
        }
        homeTeamId
        awayTeamId
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

### Forward Pagination with Cursor

```graphql
query GetMoreGames {
  games(first: 10, after: "eyJvZmZzZXQiOjEwfQ==") {
    edges {
      cursor
      node {
        id
        date {
          start
        }
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

### Backward Pagination

```graphql
query GetPreviousGames {
  games(last: 10, before: "eyJvZmZzZXQiOjIwfQ==") {
    edges {
      cursor
      node {
        id
        date {
          start
        }
      }
    }
    pageInfo {
      hasPreviousPage
      startCursor
    }
    totalCount
  }
}
```

### With Filters

```graphql
query GetFilteredGames {
  games(
    first: 20
    filters: { status: "FINISHED", dateRange: { start: "2024-01-01", end: "2024-12-31" } }
  ) {
    edges {
      node {
        id
        status {
          long
        }
        date {
          start
        }
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

## Available Paginated Queries

All the following queries now support connection-based pagination:

### Core Entities

- `games` - Game listings with filters
- `gameLogs` - User game logs with filters
- `players` - Player listings with filters
- `teams` - Team listings with filters
- `users` - User listings
- `seasons` - Season listings
- `leagues` - League listings

### Comments & Reactions

- `comments` - Comments for a specific parent
- `reactions` - Reactions for a specific target

### Stats & Analytics

- `allPlayerStats` - All player statistics for a season
- `allTeamStats` - All team statistics for a season
- `playerSeasonStatsList` - Player stats across seasons
- `playerStatsByTeam` - Player stats filtered by team
- `teamStats` - Team statistics with sorting
- `topPlayers` - Top performing players

### Social Features

- `friendships` - User friendships
- `liveGames` - Currently live games

## Implementation Details

### Cursor Format

Cursors are base64-encoded offset values. They are opaque to clients and should not be parsed or manipulated.

### Default Limits

- Default page size: 20 items
- Maximum page size: 100 items
- Requests exceeding the maximum are automatically capped

### Performance Considerations

- Total count is calculated efficiently using database count queries
- Cursors use offset-based pagination for simplicity
- Consider implementing cursor-based pagination for very large datasets in the future

## Client Usage Tips

1. **Always check `hasNextPage`** before requesting more data
2. **Use `totalCount`** to show progress indicators
3. **Store cursors** from `endCursor` for forward pagination
4. **Handle empty results** gracefully when `edges` is empty
5. **Implement loading states** for better UX

## Migration Notes

- Old pagination using `PaginatedResponse` has been replaced
- All resolvers now return connection objects
- Existing queries need to be updated to use the new structure
- The `pagination` input parameter has been replaced with individual `first`, `after`, `last`, `before` parameters

## Error Handling

Invalid pagination arguments will result in:

- Negative limits default to 0
- Invalid cursors default to offset 0
- Out-of-range requests return empty results gracefully

## Future Enhancements

- Cursor-based pagination for better performance on large datasets
- Sorting options for all paginated queries
- Advanced filtering capabilities
- Real-time subscriptions for paginated data
