# Collapsible Comments Feature

This document describes the collapsible comments functionality implemented in the Game Diary application.

## Overview

The CommentsSection component now supports collapsible/expandable functionality, allowing users to hide or show comments to save screen space and improve navigation.

## Features

### 1. **Toggle Expand/Collapse**
- Click the header or the chevron icon to toggle between expanded and collapsed states
- Smooth animation transitions between states
- Visual indicators (ChevronUp/ChevronDown icons) show current state

### 2. **Comment Count Display**
- Always shows the total number of comments in the header
- Displays "(No comments yet)" when there are no comments

### 3. **New Comments Badge**
- When collapsed, shows a pulsing "X new" badge if there are unread comments
- Badge automatically appears when new comments are added while collapsed
- Badge disappears when the section is expanded (marking comments as "seen")

### 4. **Persistent State**
- The expanded/collapsed state is saved to localStorage per `parentId`
- State persists across page reloads and sessions
- Each comment section maintains its own state independently

### 5. **Last Seen Tracking**
- Tracks the number of comments last seen when the section was expanded
- Used to calculate and display the number of new comments

## Usage

### Basic Usage
```tsx
<CommentsSection 
  parentId="game-log-123" 
  parentType="game_log" 
/>
```

### With Initial State
```tsx
<CommentsSection 
  parentId="game-log-123" 
  parentType="game_log"
  initialExpanded={false} // Start collapsed
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `parentId` | `string` | Yes | - | The ID of the parent entity |
| `parentType` | `'game_log' \| 'comment'` | Yes | - | The type of parent entity |
| `initialExpanded` | `boolean` | No | `true` | Initial expanded state (if no saved state exists) |

## Local Storage Keys

The component uses the following localStorage keys:

- `comments-expanded-${parentId}`: Stores the expanded/collapsed state
- `comments-lastseen-${parentId}`: Stores the last seen comment count

## Styling

The component uses Tailwind CSS classes for styling with smooth transitions:

- `transition-all duration-300 ease-in-out`: Smooth expand/collapse animation
- `animate-pulse`: Pulsing animation for the "new" badge
- `max-h-[5000px]` / `max-h-0`: Controls the expand/collapse height
- `opacity-100` / `opacity-0`: Fades content in/out during transition

## Accessibility

- The header is clickable with appropriate cursor styling
- The chevron button can be clicked independently
- Visual feedback is provided for all interactive elements
- The component maintains keyboard navigation support

## Future Enhancements

Potential improvements that could be added:

1. **Bulk Actions**: Collapse/expand all comment sections on a page
2. **Animation Customization**: Allow customizing transition duration/easing
3. **Smart Defaults**: Auto-expand when user is mentioned or replied to
4. **Preview Mode**: Show first few comments when collapsed
5. **Notification Integration**: Browser notifications for new comments 