# 🎨 Game Diary Color System Guide

## Overview

This document outlines the comprehensive color system for Game Diary, designed following industry best practices for sports applications, accessibility, and modern UI/UX design.

## 🎯 Design Principles

### 1. **Sports-First Branding**

- **Primary Blue**: Represents trust, reliability, and professional sports
- **Secondary Green**: Symbolizes success, growth, and positive outcomes
- **Accent Orange**: Highlights live content and urgent information

### 2. **Accessibility First**

- All color combinations meet WCAG 2.1 AA standards
- Minimum contrast ratio of 4.5:1 for normal text
- Minimum contrast ratio of 3:1 for large text

### 3. **Consistent Hierarchy**

- Clear visual hierarchy through consistent color usage
- Semantic meaning attached to each color
- Predictable user experience across all components

## 🎨 Color Palette

### Primary Brand Colors

#### Blue (Primary)

```css
--primary-blue: 221 83% 53%; /* Blue-600 - Primary brand color */
--primary-blue-dark: 221 83% 43%; /* Blue-700 - Primary hover */
--primary-blue-light: 221 83% 63%; /* Blue-500 - Primary light */
```

**Usage:**

- Primary buttons and CTAs
- Navigation elements
- Brand identity elements
- Links and interactive elements

#### Green (Secondary)

```css
--secondary-green: 142 76% 36%; /* Green-600 - Success, positive actions */
--secondary-green-dark: 142 76% 26%; /* Green-700 - Success hover */
--secondary-green-light: 142 76% 46%; /* Green-500 - Success light */
```

**Usage:**

- Success states and confirmations
- Positive actions (add, create, save)
- Status indicators (active, completed)
- Secondary CTAs

### Semantic Colors

#### Success

```css
--success: 142 76% 36%; /* Green-600 */
```

**Usage:**

- Success messages
- Completed actions
- Positive feedback
- Status indicators

#### Warning

```css
--warning: 38 92% 50%; /* Amber-500 */
```

**Usage:**

- Warning messages
- Caution states
- Pending actions
- Attention-grabbing elements

#### Error

```css
--error: 0 84% 60%; /* Red-500 */
```

**Usage:**

- Error messages
- Destructive actions
- Critical alerts
- Live indicators (red dot)

#### Info

```css
--info: 221 83% 53%; /* Blue-600 */
```

**Usage:**

- Information messages
- Help text
- Tooltips
- Informational alerts

### Accent Colors

#### Orange

```css
--accent-orange: 25 95% 53%; /* Orange-500 */
```

**Usage:**

- Live game indicators
- Urgent notifications
- Highlight important content
- Premium features

#### Purple

```css
--accent-purple: 262 83% 58%; /* Purple-500 */
```

**Usage:**

- Premium features
- Special content
- VIP indicators
- Exclusive elements

### Neutral Scale

```css
--neutral-50: 0 0% 98%; /* Lightest background */
--neutral-100: 0 0% 96%; /* Light background */
--neutral-200: 0 0% 90%; /* Border, divider */
--neutral-300: 0 0% 83%; /* Disabled text */
--neutral-400: 0 0% 64%; /* Placeholder text */
--neutral-500: 0 0% 45%; /* Secondary text */
--neutral-600: 0 0% 32%; /* Primary text */
--neutral-700: 0 0% 25%; /* Strong text */
--neutral-800: 0 0% 15%; /* Headings */
--neutral-900: 0 0% 9%; /* Strongest text */
```

## 🎯 Usage Guidelines

### Component-Specific Guidelines

#### Buttons

- **Primary Actions**: `bg-brand-primary` with `text-white`
- **Secondary Actions**: `bg-brand-secondary` with `text-white`
- **Destructive Actions**: `bg-semantic-error` with `text-white`
- **Ghost Buttons**: `text-brand-primary` with transparent background

#### Cards & Containers

- **Background**: `bg-neutral-50` (light) / `bg-neutral-900` (dark)
- **Borders**: `border-neutral-200` (light) / `border-neutral-700` (dark)
- **Shadows**: Use consistent shadow system

#### Text Hierarchy

- **Headings**: `text-neutral-900` (light) / `text-neutral-100` (dark)
- **Body Text**: `text-neutral-700` (light) / `text-neutral-300` (dark)
- **Secondary Text**: `text-neutral-500` (light) / `text-neutral-500` (dark)
- **Placeholder**: `text-neutral-400` (light) / `text-neutral-400` (dark)

#### Status Indicators

- **Active/Live**: `bg-semantic-error` (red dot)
- **Success**: `bg-semantic-success` (green)
- **Warning**: `bg-semantic-warning` (amber)
- **Info**: `bg-semantic-info` (blue)

### Dark Theme Considerations

#### Color Adjustments

- **Primary Blue**: Lighter in dark mode for better contrast
- **Secondary Green**: Adjusted for dark theme visibility
- **Neutral Scale**: Inverted for dark theme
- **Semantic Colors**: Maintained for consistency

#### Accessibility

- **Contrast Ratios**: Maintained across themes
- **Focus States**: Enhanced visibility in dark mode
- **Hover States**: Adjusted for dark theme

## 🛠 Implementation

### CSS Custom Properties

Use the defined CSS custom properties for consistent theming:

```css
/* Brand Colors */
background-color: hsl(var(--primary-blue));
color: hsl(var(--secondary-green));

/* Semantic Colors */
background-color: hsl(var(--success));
color: hsl(var(--error));

/* Neutral Colors */
background-color: hsl(var(--neutral-100));
color: hsl(var(--neutral-700));
```

### Utility Classes

Use the provided utility classes for quick styling:

```css
/* Brand Colors */
.bg-brand-primary
.text-brand-primary
.bg-brand-secondary
.text-brand-secondary

/* Semantic Colors */
.bg-semantic-success
.text-semantic-error
.bg-semantic-warning
.text-semantic-info

/* Neutral Colors */
.bg-neutral-100
.text-neutral-700
```

### Component Examples

#### Primary Button

```tsx
<button className="bg-brand-primary hover:bg-brand-primary-dark text-white px-4 py-2 rounded-lg transition-colors">
  Primary Action
</button>
```

#### Success Card

```tsx
<div className="bg-semantic-success/10 border border-semantic-success/20 text-semantic-success p-4 rounded-lg">
  Success message content
</div>
```

#### Status Badge

```tsx
<span className="bg-semantic-error text-white px-2 py-1 rounded-full text-xs">LIVE</span>
```

## 🔍 Quality Assurance

### Accessibility Checklist

- [ ] All text meets WCAG 2.1 AA contrast requirements
- [ ] Color is not the only way to convey information
- [ ] Focus states are clearly visible
- [ ] Dark theme maintains accessibility standards

### Consistency Checklist

- [ ] Brand colors used consistently across components
- [ ] Semantic colors used for their intended purposes
- [ ] Neutral scale used for proper text hierarchy
- [ ] Dark theme colors properly implemented

### Performance Checklist

- [ ] CSS custom properties used for efficient theming
- [ ] Utility classes available for common patterns
- [ ] Color system scales with design system
- [ ] Theme switching is performant

## 📚 Resources

### Tools

- **Color Contrast Checker**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Color Palette Generator**: [Coolors](https://coolors.co/)
- **Accessibility Testing**: [axe DevTools](https://www.deque.com/axe/)

### References

- **WCAG 2.1 Guidelines**: [W3C Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- **Material Design Color System**: [Google Material Design](https://material.io/design/color/the-color-system.html)
- **Apple Human Interface Guidelines**: [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)

## 🔄 Maintenance

### Regular Reviews

- **Monthly**: Check for color consistency across new components
- **Quarterly**: Review accessibility compliance
- **Annually**: Update color system based on brand evolution

### Version Control

- Document any changes to the color system
- Maintain backward compatibility when possible
- Update this guide with new patterns and usage

---

_This color system is designed to evolve with the Game Diary application while maintaining consistency, accessibility, and brand integrity._
