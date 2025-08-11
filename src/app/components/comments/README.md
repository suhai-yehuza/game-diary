# Comments Feature

This directory contains the implementation of CRUD comments and nested/child comments for game logs with lazy loading functionality.

## Features

- **CRUD Operations**: Create, Read, Update, Delete comments
- **Nested Comments**: Support for up to 10 levels of nested replies
- **Lazy Loading**: Load comments on demand with pagination
- **Reactions**: Users can react to comments and game logs with emojis
- **Modern UI/UX**: Clean, responsive design with dark mode support
- **Real-time Updates**: Comments update immediately after creation/editing
- **User Authentication**: Only authenticated users can comment
- **Permission-based Actions**: Users can only edit/delete their own comments

## Components

### Core Components

- **`Comment.tsx`**: Individual comment component with edit/reply/delete functionality
- **`CommentForm.tsx`**: Form for creating and editing comments
- **`CommentList.tsx`**: List of comments with lazy loading
- **`CommentReplies.tsx`**: Nested comment replies component
- **`GameLogComments.tsx`**: Integration component for game logs

### Hooks

- **`useComments.ts`**: Main hook for comment operations
- **`useGameLogComments()`**: Hook for game log comments
- **`useCommentReplies()`**: Hook for comment replies
- **`useCreateComment()`**: Hook for creating comments
- **`useUpdateComment()`**: Hook for updating comments
- **`useDeleteComment()`**: Hook for deleting comments

### Reaction Components

- **`ReactionPicker.tsx`**: Component for picking and displaying reactions
- **`ReactionButton.tsx`**: Individual reaction button component
- **`ReactionDisplay.tsx`**: Component for displaying reactions with user info
- **`useReactions.ts`**: Hook for managing reaction data and mutations

## Usage

### Basic Integration

```tsx
import { GameLogComments } from '@/app/components/comments/GameLogComments';

function GameLogCard({ gameLog }) {
  return (
    <div>
      {/* Game log content */}
      <GameLogComments gameLog={gameLog} />
    </div>
  );
}
```

### Custom Comment List

```tsx
import { CommentList } from '@/app/components/comments/CommentList';

function CustomComments({ comments, onLoadMore, hasNextPage }) {
  return (
    <CommentList
      comments={comments}
      onLoadMore={onLoadMore}
      hasNextPage={hasNextPage}
      loading={false}
    />
  );
}
```

### Individual Comment

```tsx
import { Comment } from '@/app/components/comments/Comment';

function CommentItem({ comment }) {
  return (
    <Comment
      comment={comment}
      onReply={commentId => console.log('Reply to:', commentId)}
      onEdit={commentId => console.log('Edit:', commentId)}
      onDelete={commentId => console.log('Delete:', commentId)}
    />
  );
}
```

### Reactions

```tsx
import { ReactionPicker } from '@/app/components/reactions';

function GameLogWithReactions({ gameLog }) {
  return (
    <div>
      {/* Game log content */}
      <ReactionPicker targetId={gameLog.id} targetType="GAME_LOG" size="md" showCount={true} />
    </div>
  );
}
```

## Database Schema

### Comments Table

The comments feature uses the existing `comments` table with the following structure:

```sql
CREATE TABLE "comments" (
  "id" varchar(255) PRIMARY KEY NOT NULL,
  "user_id" varchar(255),
  "parent_id" varchar(255) NOT NULL,
  "parent_type" varchar(50) NOT NULL,
  "content" text NOT NULL,
  "depth" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp (6) with time zone
);
```

### Reactions Table

The reactions feature uses the existing `reactions` table with the following structure:

```sql
CREATE TABLE "reactions" (
  "id" varchar(255) PRIMARY KEY NOT NULL,
  "user_id" varchar(255),
  "target_type" varchar(50) NOT NULL,
  "target_id" varchar(255) NOT NULL,
  "emoji" varchar(10) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp (6) with time zone,
  CONSTRAINT "reactions_user_id_target_type_target_id_emoji_unique"
    UNIQUE("user_id","target_type","target_id","emoji")
);
```

## API Endpoints

The feature uses GraphQL mutations and queries:

- **`GET_COMMENTS`**: Query for fetching comments with filters and pagination
- **`CREATE_COMMENT`**: Mutation for creating new comments
- **`UPDATE_COMMENT`**: Mutation for updating existing comments
- **`DELETE_COMMENT`**: Mutation for deleting comments

## Configuration

The feature uses the following configuration from `app.config.ts`:

```typescript
pagination: {
  DEFAULT_COMMENT_PAGE_SIZE: 10,
  MAX_CHILD_COMMENT_DEPTH: 10,
}
```

## Lazy Loading Strategy

1. **Initial Load**: Load first 3 comments for game logs, 2 replies for comments
2. **Expand on Demand**: Load more comments when user clicks "Load more"
3. **Nested Loading**: Load replies only when comment is expanded
4. **Pagination**: Support for cursor-based pagination

## UI/UX Features

- **Responsive Design**: Works on desktop and mobile
- **Dark Mode Support**: Consistent with app theme
- **Loading States**: Clear feedback during operations
- **Error Handling**: Graceful error display
- **Keyboard Shortcuts**: Cmd+Enter to submit, Esc to cancel
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Security

- **Authentication Required**: Only authenticated users can comment
- **Ownership Validation**: Users can only edit/delete their own comments
- **Input Validation**: Content is validated before submission
- **XSS Protection**: Content is properly escaped

## Performance

- **Lazy Loading**: Comments load only when needed
- **Pagination**: Efficient data fetching with limits
- **Caching**: Apollo Client handles caching automatically
- **Optimistic Updates**: UI updates immediately for better UX

## Future Enhancements

- **Reactions**: Like/dislike comments
- **Mentions**: @username mentions in comments
- **Rich Text**: Markdown support for formatting
- **Moderation**: Admin tools for comment moderation
- **Notifications**: Notify users of replies
- **Search**: Search within comments
