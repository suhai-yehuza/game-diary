# Nested Comments

This document describes the implementation of nested/threaded comments with reply functionality.

## Overview

Users can now reply to comments creating a threaded discussion. The nesting is limited to a maximum depth of 3 levels (configurable via `MAX_CHILD_COMMENT_DEPTH`).

## Features

### 1. Reply to Comments
- Each comment has a "Reply" button (only visible to authenticated users)
- Replies are indented and show the depth level
- Reply form appears inline below the comment

### 2. Depth Limitation
- Comments can be nested up to `MAX_CHILD_COMMENT_DEPTH` levels (default: 3)
- The "Reply" button is hidden when max depth is reached
- Server-side validation prevents creating comments beyond max depth

### 3. Collapsible Thread View
- Comments with replies show "Show X replies" / "Hide X replies" button
- Threads can be expanded/collapsed independently
- Reply count is displayed

### 4. Visual Hierarchy
- Child comments are indented with left margin
- Depth level is shown in the timestamp area
- Smaller font sizes for nested comments

## Implementation Details

### GraphQL Schema Updates

```graphql
type Comment {
  # ... existing fields
  childComments(first: Int, after: String): CommentConnection!
  depth: Int!
}
```

### Database Schema
The existing comments table already supports nesting:
- `parentId`: ID of the parent entity (game_log or comment)
- `parentType`: Type of parent ('game_log' or 'comment')

### Depth Calculation
The `getCommentDepth` function recursively calculates comment depth by traversing up the parent chain.

### Components

#### CommentItem Component
A recursive component that renders a comment and its children:
- Handles reply form state
- Shows/hides child comments
- Enforces depth restrictions
- Manages reactions

#### CommentsSection Component
Updated to:
- Filter top-level comments only (parentType !== 'comment')
- Pass depth and childComments data to CommentItem
- Handle edit/delete callbacks

### Mutations

#### createComment
Enhanced with depth validation:
```typescript
if (validatedInput.parentType === 'comment') {
  const parentDepth = await getDepth(validatedInput.parentId);
  if (parentDepth >= MAX_CHILD_COMMENT_DEPTH) {
    throw new ValidationError(`Comments can only be nested up to ${MAX_CHILD_COMMENT_DEPTH} levels deep`);
  }
}
```

### Query Updates

The `GET_COMMENTS_WITH_FILTERS` query now fetches:
- Comment depth
- Child comments (up to 10 per level)
- Nested structure up to 3 levels deep

## Configuration

In `src/lib/config/api.config.ts`:
```typescript
pagination: {
  // ... other settings
  MAX_CHILD_COMMENT_DEPTH: 3,
}
```

## Usage Example

1. User writes a comment on a game log
2. Another user can click "Reply" on that comment
3. A reply form appears below the comment
4. After submission, the reply appears indented under the parent
5. The parent comment shows "1 reply" which can be toggled
6. Replies can have their own replies (up to max depth)

## Limitations

- Maximum nesting depth is 3 levels
- Only 10 child comments are initially loaded per parent
- Child comments don't support pagination yet
- Edit/delete operations don't update nested comment cache

## Future Enhancements

- Pagination for child comments
- Real-time updates for nested comments
- Mention/notification system for replies
- Thread permalinks
- Sort options for replies 