# Notification System Documentation

## Overview

The notification system is designed to automatically notify users about relevant social interactions and activities within the game diary application. Notifications are triggered by user operations such as friend requests, comments, and reactions.

## Notification Types

### 1. Friend Request Notifications

**Triggered by:** Friendship status changes in the `friendships` table

**Types:**

- `friend_request` - When someone sends you a friend request
- `friend_request_accepted` - When someone accepts your friend request
- `friend_request_rejected` - When someone declines your friend request

**Example Messages:**

- "John Doe sent you a friend request"
- "Jane Smith accepted your friend request"
- "Bob Wilson declined your friend request"

### 2. Comment Notifications

**Triggered by:** New comments in the `comments` table

**Types:**

- `comment_added` - When someone comments on your game log
- `comment_reply` - When someone replies to your comment

**Example Messages:**

- "John Doe commented on your game log"
- "Jane Smith replied to your comment"

### 3. Reaction Notifications

**Triggered by:** New reactions in the `reactions` table

**Types:**

- `reaction_added` - When someone reacts to your content

**Example Messages:**

- "John Doe reacted with 👍 to your game log"
- "Jane Smith reacted with ❤️ to your comment"

## Database Schema

### Notifications Table

```sql
CREATE TABLE notifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target_id VARCHAR(255),
  target_type VARCHAR(50),
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP,
  read BOOLEAN DEFAULT false
);
```

**Fields:**

- `id` - Unique notification identifier
- `user_id` - User receiving the notification
- `type` - Notification type (e.g., 'friend_request', 'comment_added')
- `title` - Short notification title
- `message` - Detailed notification message
- `target_id` - ID of the related content (friendship, comment, reaction)
- `target_type` - Type of related content ('friendship', 'comment', 'reaction')
- `resolved` - Whether the notification has been resolved
- `read` - Whether the notification has been read
- `created_at` - When the notification was created
- `updated_at` - When the notification was last updated
- `deleted_at` - Soft delete timestamp

## Database Triggers

### 1. Friendship Notification Trigger

**Function:** `create_friend_request_notification()`
**Trigger:** `friendship_notification_trigger`
**Table:** `friendships`

**Logic:**

- Creates notifications when friendship status changes
- Handles friend request sent, accepted, and rejected scenarios
- Skips notifications for self-interactions

### 2. Comment Notification Trigger

**Function:** `create_comment_notification()`
**Trigger:** `comment_notification_trigger`
**Table:** `comments`

**Logic:**

- Creates notifications when new comments are added
- Handles both game log comments and comment replies
- Skips notifications when users comment on their own content
- Differentiates between direct comments and replies

### 3. Reaction Notification Trigger

**Function:** `create_reaction_notification()`
**Trigger:** `reaction_notification_trigger`
**Table:** `reactions`

**Logic:**

- Creates notifications when new reactions are added
- Handles reactions on both game logs and comments
- Skips notifications when users react to their own content
- Includes the emoji in the notification message

## Performance Optimizations

### Indexes

```sql
-- Notification query optimization
CREATE INDEX idx_notifications_user_id_resolved ON notifications(user_id, resolved);
CREATE INDEX idx_notifications_target_id_target_type ON notifications(target_id, target_type);
```

### Best Practices

1. **Self-Interaction Prevention:** All triggers check if the user is interacting with their own content and skip notification creation
2. **Efficient Queries:** Triggers use optimized queries to fetch user information and target content
3. **Batch Processing:** Notifications are created individually but can be processed in batches for display

## Frontend Integration

### Notification Types (TypeScript)

```typescript
export type INotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'reaction_added'
  | 'reaction_removed'
  | 'reaction_updated'
  | 'comment_added'
  | 'comment_updated'
  | 'comment_deleted'
  | 'friend_request'
  | 'friend_accepted'
  | 'friend_rejected'
  | 'friend_removed';
```

### Notification Interface

```typescript
export interface IAppNotification {
  id: string;
  userId: string;
  type: INotificationType;
  title: string;
  message: string;
  data?: INotificationData;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  expiresAt?: Date | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  actionUrl?: string;
  image_url?: string;
  metadata?: Record<string, unknown>;
}
```

## Usage Examples

### 1. Friend Request Flow

1. User A sends friend request to User B
2. Trigger creates notification for User B: "User A sent you a friend request"
3. User B accepts/rejects the request
4. Trigger creates notification for User A: "User B accepted/declined your friend request"

### 2. Comment Flow

1. User A creates a game log
2. User B comments on User A's game log
3. Trigger creates notification for User A: "User B commented on your game log"
4. User C replies to User B's comment
5. Trigger creates notification for User B: "User C replied to your comment"

### 3. Reaction Flow

1. User A creates a game log
2. User B reacts with 👍 to User A's game log
3. Trigger creates notification for User A: "User B reacted with 👍 to your game log"

## Future Enhancements

### Potential Additions

1. **Mention Notifications:** Notify users when they're mentioned in comments
2. **Game Log Sharing:** Notifications when someone shares your game log
3. **Achievement Notifications:** Notifications for milestones and achievements
4. **Batch Notifications:** Group similar notifications (e.g., "3 people reacted to your game log")
5. **Push Notifications:** Real-time notifications via WebSocket or push services

### Configuration Options

1. **Notification Preferences:** Allow users to customize which notifications they receive
2. **Frequency Controls:** Limit notification frequency to prevent spam
3. **Quiet Hours:** Allow users to set quiet hours when notifications are muted

## Testing

### Manual Testing

1. **Friend Requests:**
   - Send friend request → Check recipient gets notification
   - Accept friend request → Check sender gets notification
   - Reject friend request → Check sender gets notification

2. **Comments:**
   - Comment on game log → Check game log owner gets notification
   - Reply to comment → Check comment owner gets notification
   - Comment on own content → Verify no notification created

3. **Reactions:**
   - React to game log → Check game log owner gets notification
   - React to comment → Check comment owner gets notification
   - React to own content → Verify no notification created

### Automated Testing

```sql
-- Test notification creation
SELECT * FROM notifications
WHERE user_id = 'target_user_id'
ORDER BY created_at DESC
LIMIT 5;

-- Test trigger functionality
INSERT INTO comments (user_id, parent_id, parent_type, content)
VALUES ('user_id', 'target_id', 'GAME_LOG', 'Test comment');
```

## Troubleshooting

### Common Issues

1. **Duplicate Notifications:** Check for multiple triggers or application-level duplicate creation
2. **Missing Notifications:** Verify trigger functions are properly installed and enabled
3. **Performance Issues:** Monitor notification table size and consider archiving old notifications
4. **Incorrect Content:** Verify target_id and target_type are correctly set

### Debug Queries

```sql
-- Check trigger status
SELECT * FROM information_schema.triggers
WHERE trigger_name LIKE '%notification%';

-- Check recent notifications
SELECT n.*, u.username
FROM notifications n
JOIN users u ON n.user_id = u.id
ORDER BY n.created_at DESC
LIMIT 10;

-- Check trigger function errors
SELECT * FROM pg_stat_activity
WHERE query LIKE '%notification%';
```
