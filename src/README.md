# Source Code Documentation

## Overview

This directory contains the main application source code, organized by feature and functionality.

## Directory Structure

### App (`app/`)

- Next.js app router pages and layouts
- API routes and handlers
- Route groups and segments
- Page-specific components

### Components (`components/`)

- Reusable UI components
- Feature-specific components
- Layout components
- Provider components

### Hooks (`hooks/`)

- Custom React hooks
- Data fetching hooks
- State management hooks
- Utility hooks

### Contexts (`contexts/`)

- React context providers
- State management contexts
- Theme contexts
- Authentication contexts

### Library (`lib/`)

- Core utilities
- Database operations
- API clients
- Type definitions
- Constants and configs

## Code Organization

### Component Structure

```
components/
├── ui/           # Base UI components
├── layout/       # Layout components
├── features/     # Feature-specific components
├── providers/    # Context providers
└── common/       # Shared components
```

### Library Structure

```
lib/
├── core/         # Core utilities
├── db/          # Database operations
├── api/         # API clients
├── types/       # Type definitions
└── config/      # Configuration
```

### App Structure

```
app/
├── (auth)/      # Authentication routes
├── (dashboard)/ # Dashboard routes
├── api/         # API routes
└── layout.tsx   # Root layout
```

## Best Practices

### Component Development

1. Use TypeScript for type safety
2. Follow atomic design principles
3. Implement proper error boundaries
4. Use proper prop types
5. Include component documentation

### State Management

1. Use React Context for global state
2. Implement proper loading states
3. Handle errors gracefully
4. Use proper data fetching patterns
5. Implement proper caching

### Code Style

1. Follow ESLint rules
2. Use Prettier for formatting
3. Follow naming conventions
4. Write meaningful comments
5. Keep functions pure when possible

### Performance

1. Implement proper code splitting
2. Use proper image optimization
3. Implement proper caching
4. Use proper lazy loading
5. Monitor bundle size

## Usage Examples

### Component Example

```tsx
// components/ui/button.tsx
import { ButtonProps } from '@/lib/types';

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <button className="btn" {...props}>
      {children}
    </button>
  );
};
```

### Hook Example

```tsx
// hooks/use-auth.ts
import { useAuth } from '@/contexts/auth';

export const useAuth = () => {
  const { user, login, logout } = useAuth();
  return { user, login, logout };
};
```

### Context Example

```tsx
// contexts/theme.tsx
import { createContext, useContext } from 'react';

export const ThemeContext = createContext<ThemeContextType>(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
```

## Contributing

When adding new code:

1. Follow the established directory structure
2. Use proper TypeScript types
3. Include proper documentation
4. Follow code style guidelines
5. Add proper tests
6. Update this README if needed
