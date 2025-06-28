# Next.js Segment Configuration Bug Report

## Issue Description

**Error Message**: `Invalid segment configuration options detected for "/". Expected 'auto' | 'error' | 'force-static' | 'force-dynamic', received function at "dynamic"`

## Environment

- **Next.js Version**: 15.2.4 and 15.3.4 (both affected)
- **Node.js Version**: 22.x.0
- **Package Manager**: pnpm 10.x.0
- **Operating System**: macOS 24.5.0

## Investigation Summary

### Key Findings

1. **Not a Next.js Regression**: The error occurs in both Next.js 15.2.4 and 15.3.4, ruling out a version-specific regression.

2. **Not a Basic Configuration Issue**: A minimal reproduction with the same Next.js version and identical `export const dynamic = 'force-dynamic';` configuration builds successfully.

3. **Project-Specific Issue**: The error is specific to the original project's configuration and dependencies.

4. **Potential Root Cause**: The issue appears to be related to using a **named export** for the layout component instead of a **default export**.

### Evidence

#### Original Project (Failing)

```tsx
// src/app/layout.tsx
export const dynamic = 'force-dynamic';

export function AppLayout({ children }: { children: React.ReactNode }) {
  // ...
}
```

#### Minimal Reproduction (Working)

```tsx
// src/app/layout.tsx
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ...
}
```

## Steps to Reproduce

1. Create a Next.js 15.3.4 project with the following layout.tsx:

```tsx
import { type Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Test',
  description: 'Test',
};

export const dynamic = 'force-dynamic';

// This causes the error:
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// This works:
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body>{children}</body>
//     </html>
//   );
// }
```

2. Run `npx next build`
3. Observe the segment configuration error

## Expected Behavior

The build should succeed with either named or default exports for the layout component, as both are valid Next.js patterns.

## Actual Behavior

The build fails with the segment configuration error when using a named export for the layout component.

## Additional Context

- The error specifically mentions the root route "/"
- The error indicates that `dynamic` is being interpreted as a function instead of a string
- This suggests Next.js is incorrectly parsing the segment configuration when using named exports

## Impact

This issue prevents projects from building when using named exports for layout components, which is a valid and common pattern in Next.js applications.

## Workaround

Change the layout component from a named export to a default export:

```tsx
// ❌ This causes the error
export function AppLayout({ children }: { children: React.ReactNode }) {
  // ...
}

// ✅ This works
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ...
}
```

## Files Affected

- `src/app/layout.tsx` - The root layout component
- Any other layout components using named exports with `export const dynamic`

## Related Issues

- No existing GitHub issues found with this exact error message
- No known reports of segment configuration issues with named exports
