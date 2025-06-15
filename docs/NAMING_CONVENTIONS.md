# Naming Conventions

This document outlines the naming conventions used throughout the project to maintain consistency and clarity.

## Directory Structure

### Root Level Directories

- `src/` - Main source code directory
- `public/` - Static assets
- `docs/` - Project documentation
- `tests/` - Test files
- `scripts/` - Build and utility scripts
- `lib/` - Shared utilities and libraries
- `.github/` - GitHub-specific configurations
- `.storybook/` - Storybook configuration and stories

### Source Code Directories (`src/`)

- `app/` - Next.js app directory (pages and layouts)
- `components/` - Reusable React components
- `contexts/` - React context providers
- `hooks/` - Custom React hooks
- `lib/` - Shared utilities and helpers
- `styles/` - Global styles and theme configurations

## File Naming Conventions

### React Components

- Use PascalCase for component files
- Suffix with `.tsx` for TypeScript React components
- Example: `Button.tsx`, `UserProfile.tsx`

### Hooks

- Prefix with `use` and use camelCase
- Suffix with `.ts` or `.tsx`
- Example: `useAuth.ts`, `useLocalStorage.ts`

### Context Files

- Suffix with `Context`
- Example: `AuthContext.tsx`, `ThemeContext.tsx`

### Utility Files

- Use camelCase
- Suffix with `.ts`
- Example: `formatDate.ts`, `validationUtils.ts`

### Test Files

- Match the name of the file being tested
- Suffix with `.test.ts` or `.test.tsx`
- Example: `Button.test.tsx`, `useAuth.test.ts`

### Style Files

- Match the name of the component
- Use `.module.css` or `.module.scss` for CSS modules
- Example: `Button.module.css`, `UserProfile.module.scss`

### Configuration Files

- Use lowercase with hyphens
- Example: `next.config.js`, `tailwind.config.ts`

### Type Definition Files

- Use `.d.ts` suffix
- Example: `types.d.ts`, `api.d.ts`

## Component File Structure

Each component file should follow this structure:

```
ComponentName/
├── index.tsx           # Main component file
├── ComponentName.tsx   # Component implementation
├── ComponentName.test.tsx  # Tests
└── ComponentName.module.css # Styles
```

## Best Practices

1. **Be Descriptive**: Names should clearly indicate the purpose of the file or directory
2. **Be Consistent**: Follow the established patterns throughout the project
3. **Keep it Short**: Avoid unnecessarily long names while maintaining clarity
4. **Use Abbreviations Carefully**: Only use well-known abbreviations
5. **Avoid Special Characters**: Use only letters, numbers, hyphens, and underscores
6. **Group Related Files**: Keep related files together in appropriately named directories

## Examples

### Good Examples

- `src/components/Button/Button.tsx`
- `src/hooks/useLocalStorage.ts`
- `src/contexts/AuthContext.tsx`
- `src/lib/formatDate.ts`
- `src/styles/theme.ts`

### Bad Examples

- `src/components/btn.tsx` (too abbreviated)
- `src/hooks/localStorage.ts` (missing 'use' prefix)
- `src/contexts/auth.tsx` (missing 'Context' suffix)
- `src/lib/FormatDate.ts` (incorrect casing for utility)
- `src/styles/Theme.ts` (incorrect casing for utility)

## TypeScript Naming Conventions

### Interfaces

- Prefix with 'I' and use PascalCase
- Example: `IUserProfile`, `IGameLog`

### Type Aliases

- Use PascalCase without 'I' prefix
- Example: `UserProfileProps`, `GameLogData`

### Enums

- Use PascalCase
- Example: `LogLevel`, `UserRole`
