# Components Directory (`src/components`)

This directory contains all reusable React components organized by purpose and domain, following modern component architecture principles.

## 📁 Directory Structure

```
src/components/
├── auth/                   # Authentication-related components
├── common/                 # Shared components used across features
├── features/               # Domain-specific feature components
│   ├── friends/           # Friend management components
│   ├── games/             # Game-related components
│   │   └── search-section/ # Modular search components
│   ├── game-logs/         # Game logging components
│   ├── notifications/     # Notification components
│   ├── user-profile/      # User profile components
│   │   └── components/    # Modular profile components
│   └── users/             # User management components
├── layout/                # Layout and page structure components
├── providers/             # React context providers
├── ui/                    # Base UI components (design system)
└── index.ts              # Centralized component exports
```

## 🏗️ **Architecture Principles**

### **1. Feature-Based Organization**

Components are organized by business domain/feature rather than technical concerns:

- ✅ `features/games/` - All game-related components
- ✅ `features/friends/` - All friend management components
- ❌ `buttons/`, `forms/`, `modals/` - Technical grouping (avoided)

### **2. Component Decomposition**

Large components are broken down into smaller, focused pieces:

#### **User Profile Decomposition**

- `UserProfileHeader` - Profile information and actions
- `FriendshipButton` - Friend request handling
- `UserGameLogsSection` - Game logs display with pagination

#### **Game Search Decomposition**

- `GameLogFilters` - Search and filter controls
- `GameLogCard` - Individual game log display
- `GameLogPagination` - Navigation controls

### **3. Co-location Strategy**

Related components and utilities are grouped together:

```
features/user-profile/
├── components/
│   ├── FriendshipButton.tsx
│   ├── UserProfileHeader.tsx
│   └── UserGameLogsSection.tsx
├── hooks/
│   └── useUserProfile.ts
├── types/
│   └── user-profile.types.ts
└── index.ts
```

## 📦 **Component Categories**

### **UI Components** (`ui/`)

Base design system components that are:

- ✅ Highly reusable
- ✅ Design-focused (not business logic)
- ✅ Prop-driven configuration
- ✅ Consistent with design tokens

**Examples:** `Button`, `Input`, `Card`, `Dialog`, `Avatar`

### **Common Components** (`common/`)

Shared business components used across multiple features:

- `ReactionPicker` - Used in game logs, comments
- `CommentsSection` - Used in multiple content types
- `ThemeToggle` - Global theme switching

### **Feature Components** (`features/`)

Domain-specific components that:

- ✅ Encapsulate business logic
- ✅ Handle specific use cases
- ✅ Compose UI components
- ✅ Manage local state

## 🔄 **Component Optimization Results**

### **Before Optimization:**

- 📊 `user-profile.tsx`: **38KB, 948 lines** (monolithic)
- 📊 `GameLogSearchSection.tsx`: **27KB, 760 lines** (complex)
- 📊 `comments-section.tsx`: **25KB, 725 lines** (large)

### **After Optimization:**

- ✅ **Modular components** with single responsibilities
- ✅ **Reusable pieces** extracted for other features
- ✅ **Easier testing** with focused units
- ✅ **Better maintainability** with clear boundaries

## 🎯 **Usage Guidelines**

### **Importing Components**

```typescript
// Preferred: Feature-based imports
import { UserProfileHeader, FriendshipButton } from '@/components/features/user-profile';
import { GameLogFilters } from '@/components/features/games/search-section';

// UI components
import { Button, Card, Avatar } from '@/components/ui';

// Common components
import { ReactionPicker, ThemeToggle } from '@/components/common';
```

### **Creating New Components**

1. **Determine Category:**

   - UI: Design system component?
   - Common: Used across multiple features?
   - Feature: Domain-specific business logic?

2. **Choose Location:**

   ```
   src/components/
   ├── ui/            # If it's a pure design component
   ├── common/        # If used across multiple features
   └── features/      # If specific to one business domain
   ```

3. **Follow Naming Conventions:**
   - `PascalCase` for component files
   - Descriptive, not generic names
   - Include domain context when needed

## 📈 **Performance Benefits**

- **Code Splitting:** Smaller components = better bundle splitting
- **Tree Shaking:** Easier elimination of unused code
- **Lazy Loading:** Granular loading of feature components
- **Memoization:** Targeted optimization of specific components

## 🧪 **Testing Strategy**

```typescript
// Unit tests for individual components
describe('FriendshipButton', () => {
  it('shows add friend button for non-friends', () => {
    // Test focused component behavior
  });
});

// Integration tests for feature compositions
describe('UserProfile', () => {
  it('handles complete user profile workflow', () => {
    // Test component interactions
  });
});
```

## 🔍 **Code Quality**

- **TypeScript:** All components fully typed
- **Props Interfaces:** Clear component contracts
- **Error Boundaries:** Graceful error handling
- **Accessibility:** ARIA labels and keyboard navigation
- **Performance:** Memo, callback, and ref optimizations
