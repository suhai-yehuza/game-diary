# Styles Directory

This directory contains global styles and shared styling utilities for the application.

## Structure

- `globals.css` - Global styles, CSS variables, and theme configuration
  - Tailwind CSS configuration
  - CSS custom properties (variables)
  - Dark mode configuration
  - Mobile optimizations
  - Animation utilities
  - Responsive design utilities
  - Component-specific styles

## Usage

Import the global styles in your root layout file:

```typescript
import '@/styles/globals.css';
```

## Best Practices

1. **Global Styles**

   - Use CSS variables for theme values
   - Keep global styles minimal
   - Use Tailwind classes when possible

2. **Mobile First**

   - Write mobile styles first
   - Use media queries for larger screens
   - Consider touch targets and interactions

3. **Performance**

   - Minimize CSS bundle size
   - Use efficient selectors
   - Leverage CSS containment when possible

4. **Maintainability**
   - Use consistent naming conventions
   - Document complex styles
   - Keep related styles together

## Adding New Styles

1. For global styles, add them to `globals.css`
2. For component-specific styles, consider using:
   - Tailwind classes
   - CSS modules
   - Styled components
   - CSS-in-JS solutions
