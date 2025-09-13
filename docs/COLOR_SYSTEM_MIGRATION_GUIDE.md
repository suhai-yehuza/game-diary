# Color System Migration Guide

## Overview

This guide outlines the new centralized color system implemented to improve UI/UX consistency and accessibility across both light and dark themes.

## Key Improvements

### 1. **WCAG AA Compliance**

- All color combinations now meet WCAG AA contrast requirements (4.5:1 ratio)
- Proper contrast ratios for text on backgrounds in both themes
- Accessible color choices for users with visual impairments

### 2. **Consistent Theme Switching**

- Centralized CSS variables that automatically adapt to theme changes
- No more hardcoded colors or inconsistent `dark:` prefixes
- Seamless switching between light, dark, and system themes

### 3. **Semantic Color Naming**

- Colors are named by purpose, not appearance
- Easy to understand and maintain
- Future-proof design system

## New Color System

### CSS Variables

The new system uses CSS custom properties that automatically adapt to the current theme:

```css
/* Text Colors */
--color-text-primary      /* Main text color */
--color-text-secondary    /* Secondary text color */
--color-text-tertiary     /* Tertiary text color */
--color-text-muted        /* Muted/placeholder text */
--color-text-disabled     /* Disabled text */
--color-text-inverse      /* Text on dark backgrounds */

/* Background Colors */
--color-background-primary    /* Main background */
--color-background-secondary  /* Card backgrounds */
--color-background-tertiary   /* Subtle backgrounds */
--color-background-elevated   /* Elevated surfaces */

/* Surface Colors */
--color-surface-card      /* Card backgrounds */
--color-surface-modal     /* Modal backgrounds */
--color-surface-popover   /* Popover backgrounds */
--color-surface-tooltip   /* Tooltip backgrounds */

/* Border Colors */
--color-border-primary    /* Main borders */
--color-border-secondary  /* Subtle borders */
--color-border-focus      /* Focus borders */

/* Brand Colors */
--color-brand-primary         /* Primary brand color */
--color-brand-primary-hover   /* Primary hover state */
--color-brand-secondary       /* Secondary brand color */
--color-brand-secondary-hover /* Secondary hover state */

/* Semantic Colors */
--color-semantic-success  /* Success states */
--color-semantic-warning  /* Warning states */
--color-semantic-error    /* Error states */
--color-semantic-info     /* Info states */
```

### Tailwind Classes

Use these new Tailwind classes instead of hardcoded colors:

```tsx
// Text Colors
<div className="text-theme-primary">Primary text</div>
<div className="text-theme-secondary">Secondary text</div>
<div className="text-theme-muted">Muted text</div>

// Background Colors
<div className="bg-theme-primary">Main background</div>
<div className="bg-theme-secondary">Card background</div>
<div className="bg-surface-card">Card surface</div>

// Brand Colors
<button className="bg-brand-primary text-theme-inverse">Primary button</button>
<button className="bg-brand-secondary text-theme-inverse">Secondary button</button>

// Semantic Colors
<div className="text-semantic-success">Success message</div>
<div className="text-semantic-error">Error message</div>
```

## Migration Steps

### 1. Replace Hardcoded Colors

**Before:**

```tsx
<div className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">Content</div>
```

**After:**

```tsx
<div className="bg-bg-theme-secondary text-theme-primary">Content</div>
```

### 2. Update Component Classes

**Before:**

```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white">Button</button>
```

**After:**

```tsx
<button className="bg-brand-primary hover:bg-brand-primary-hover text-theme-inverse">Button</button>
```

### 3. Replace Dark Mode Prefixes

**Before:**

```tsx
<div className="text-gray-600 dark:text-gray-300">Text</div>
```

**After:**

```tsx
<div className="text-theme-secondary">Text</div>
```

### 4. Update Card Components

**Before:**

```tsx
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
  Card content
</div>
```

**After:**

```tsx
<div className="bg-surface-card border border-theme-primary">Card content</div>
```

## Component-Specific Updates

### Buttons

- Use `bg-brand-primary` for primary buttons
- Use `bg-brand-secondary` for secondary buttons
- Use `text-theme-inverse` for button text

### Cards

- Use `bg-surface-card` for card backgrounds
- Use `border-theme-primary` for card borders
- Use `text-theme-primary` for card text

### Forms

- Use `border-theme-primary` for input borders
- Use `bg-surface-card` for input backgrounds
- Use `text-theme-primary` for input text

### Navigation

- Use `bg-bg-theme-secondary` for navigation backgrounds
- Use `text-theme-primary` for navigation text
- Use `border-theme-primary` for navigation borders

## Accessibility Guidelines

### 1. **Always Use Semantic Colors**

- Use `text-theme-primary` for main content
- Use `text-theme-secondary` for supporting content
- Use `text-theme-muted` for less important content

### 2. **Maintain Proper Contrast**

- The new system ensures WCAG AA compliance
- Don't override colors unless absolutely necessary
- Test with accessibility tools if making custom changes

### 3. **Focus States**

- Use `focus:ring-brand-primary` for focus rings
- Ensure focus indicators are visible in both themes

## Testing

### 1. **Theme Switching**

- Test all components in light, dark, and system themes
- Verify colors adapt correctly
- Check for any hardcoded colors that don't change

### 2. **Accessibility**

- Use browser dev tools to check contrast ratios
- Test with screen readers
- Verify keyboard navigation works properly

### 3. **Cross-Browser**

- Test in Chrome, Firefox, Safari, and Edge
- Verify CSS custom properties work correctly
- Check for any rendering differences

## Common Patterns

### Card Component

```tsx
<div className="bg-surface-card border border-theme-primary rounded-lg p-4">
  <h3 className="text-theme-primary font-semibold">Card Title</h3>
  <p className="text-theme-secondary">Card description</p>
  <button className="bg-brand-primary text-theme-inverse px-4 py-2 rounded">Action</button>
</div>
```

### Form Input

```tsx
<input
  className="border border-theme-primary bg-surface-card text-theme-primary px-3 py-2 rounded focus:ring-brand-primary"
  placeholder="Enter text..."
/>
```

### Navigation Item

```tsx
<button className="text-theme-primary hover:text-theme-secondary hover:bg-bg-theme-tertiary px-3 py-2 rounded">
  Navigation Item
</button>
```

## Troubleshooting

### 1. **Colors Not Changing**

- Ensure you're using the new CSS variables
- Check that Tailwind is configured correctly
- Verify the theme provider is working

### 2. **Poor Contrast**

- Use the semantic color classes
- Avoid overriding with custom colors
- Test with accessibility tools

### 3. **Inconsistent Styling**

- Use the centralized color system
- Avoid mixing old and new color approaches
- Follow the component patterns above

## Future Maintenance

### 1. **Adding New Colors**

- Add new colors to the CSS variables
- Update the Tailwind config
- Document new colors in this guide

### 2. **Theme Updates**

- Modify colors in the CSS variables
- Test across all themes
- Update documentation

### 3. **Component Updates**

- Follow the established patterns
- Use semantic naming
- Maintain accessibility standards

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Custom Properties](https://tailwindcss.com/docs/customizing-colors#using-css-variables)
- [CSS Custom Properties MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

---

This migration guide ensures a smooth transition to the new color system while maintaining accessibility and consistency across your application.
