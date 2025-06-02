# Reactions Preloading and Scaling

This document describes how reactions are preloaded with game logs and comments to reduce API calls while handling scenarios with thousands of reactions.

## Overview

Instead of making separate API calls for each reaction display, reactions are loaded together with their parent entities (game logs and comments) in a single query. To handle cases where content has thousands of reactions, we implement a progressive loading strategy.

## Implementation Details

### 1. Updated GraphQL Queries

The `GET_GAME_LOGS` query now fetches:

- First 20 reactions for each game log (with total count)
- First 20 comments (with their first 10 reactions each)

```graphql
gameLogs {
  # ... other fields
  reactions(first: 20) {  # Limited initial fetch
    edges {
      node {
        id
        emoji
        userId
        targetId
        targetType
        user {
          id
          username
          emailAddress
          imageUrl
        }
      }
    }
    totalCount  # Always includes accurate total
  }
  comments(first: 20) {
    edges {
      node {
        # ... comment fields
        reactions {  # Limited to 10 per comment
          id
          emoji
          userId
          targetId
          targetType
          user {
            id
            username
            emailAddress
            imageUrl
          }
        }
      }
    }
  }
}
```

### 2. Updated Resolvers

Both GameLog and Comment resolvers now implement smart fetching:

**GameLog Resolver:**

```typescript
reactions: async (parent: any, args: any, { db }: Context) => {
  const limit = args.first || 20;

  // Get total count separately for accurate display
  const [countResult] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.reactions)
    .where(eq(schema.reactions.targetId, parent.id));

  const totalCount = countResult?.count || 0;

  // Fetch limited reactions
  const reactions = await db
    .select()
    .from(schema.reactions)
    .where(eq(schema.reactions.targetId, parent.id))
    .orderBy(schema.reactions.createdAt)
    .limit(limit);

  // Returns connection with accurate totalCount
};
```

**Comment Resolver:**

```typescript
reactions: async (parent: any, _args: any, { db }: Context) => {
  // Comments get fewer reactions initially (10)
  const reactions = await db
    .select()
    .from(schema.reactions)
    .where(eq(schema.reactions.targetId, parent.id))
    .orderBy(schema.reactions.createdAt)
    .limit(10);
  // Returns array of reactions
};
```

### 3. Updated Components

**ReactionDisplay Component:**

- Now accepts `totalReactionCount` prop for accurate counts
- Shows reaction counts grouped by emoji
- Displays "+X more" button when there are more reactions than loaded
- Provides tooltips showing usernames on hover
- Loads all reactions on demand when needed

```typescript
interface ExtendedReactionDisplayProps extends ReactionDisplayProps {
  reactions?: Reaction[];
  totalReactionCount?: number;
}

// Shows accurate counts even with partial data
const totalCount = providedTotalCount || data?.reactions?.totalCount || reactions.length;

// Groups reactions by emoji with user tracking
const reactionGroups = reactions.reduce((acc, reaction) => {
  if (!acc[reaction.emoji]) {
    acc[reaction.emoji] = { count: 0, users: [], hasCurrentUser: false };
  }
  acc[reaction.emoji].count++;
  acc[reaction.emoji].users.push(reaction.user?.username);
  if (reaction.userId === user?.id) {
    acc[reaction.emoji].hasCurrentUser = true;
  }
  return acc;
}, {});
```

**GameLogsSection Component:**

- Extracts reactions from the connection structure
- Passes them to ReactionsSection

```typescript
<ReactionsSection
  targetId={log.id}
  targetType="game_log"
  reactions={log.reactions?.edges?.map(edge => edge.node) || []}
/>
```

**CommentsSection Component:**

- Passes reactions to ReactionDisplay for each comment

```typescript
<ReactionDisplay
  targetId={comment.id}
  targetType="comment"
  reactions={comment.reactions}
/>
```

**ReactionsSection Component:**

- Simplified to just pass through reactions to ReactionDisplay
- No longer makes its own query

## Scaling Strategy

### For Game Logs (Primary Content)

- Initial load: 20 reactions
- Always show accurate total count
- "Load more" button when count exceeds loaded reactions
- Full data loads only when user explicitly requests

### For Comments (Secondary Content)

- Initial load: 10 reactions per comment
- Lighter weight since there can be many comments
- Users can click to see all reactions if needed

## Benefits

1. **Reduced Initial Payload**: Only loads necessary reactions for display
2. **Accurate Counts**: Always shows correct reaction totals
3. **Progressive Enhancement**: Users can load more when needed
4. **Better Performance**: Handles thousands of reactions without overwhelming the initial query
5. **Rate Limit Friendly**: Significantly reduces API calls while maintaining functionality

## Trade-offs

1. **Additional Queries**: May need extra queries for heavily reacted content
2. **Count Query Overhead**: Separate count queries add minimal overhead
3. **UI Complexity**: Need to handle "load more" states

## Future Improvements

1. Implement reaction pagination with cursor-based loading
2. Add reaction caching to avoid re-fetching
3. Consider WebSocket subscriptions for real-time reaction updates
4. Implement smart pre-loading based on user interaction patterns
