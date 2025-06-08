# Comments System

## Overview

The comments system in Game Diary supports nested comments, collapsible threads, and real-time updates.

## Nested Comments

Nested comments allow for threaded discussions with unlimited nesting levels. Each comment can have multiple replies, creating a tree-like structure.

### Implementation

- Uses a recursive component structure
- Implements efficient data loading
- Supports real-time updates
- Handles deep nesting gracefully

### Key Features

- Unlimited nesting depth
- Collapsible threads
- Real-time updates
- Performance optimized

## Collapsible Comments

Comments can be collapsed to improve readability and performance.

### Implementation

- Uses React state for collapse status
- Persists collapse state
- Optimizes rendering for collapsed threads
- Smooth animations

### Key Features

- Smooth collapse/expand animations
- State persistence
- Performance optimizations
- Accessibility support

## Performance Considerations

- Lazy loading of nested comments
- Virtual scrolling for long threads
- Optimized re-renders
- Efficient state management

## Usage Examples

\`\`\`tsx
// Example of a nested comment component
<Comment
id="123"
content="This is a comment"
replies={[
{
id: "456",
content: "This is a reply",
replies: []
}
]}
/>
\`\`\`

## Best Practices

1. Keep nesting depth reasonable
2. Use collapsible threads for long discussions
3. Implement proper loading states
4. Handle errors gracefully
5. Maintain accessibility
