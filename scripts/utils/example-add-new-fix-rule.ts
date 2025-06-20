/**
 * EXAMPLE: How to Add New Fix Rules for Future Type Violations
 *
 * This demonstrates how the configuration-driven approach makes it
 * easy to handle new violation patterns without modifying the core script.
 */

import type { IFixRule } from './fix-type-violations.config';

/**
 * Example: Adding a new rule to handle React component prop types
 *
 * Scenario: You have component files with type definitions that should
 * be moved to component.types.ts
 */
const NEW_COMPONENT_RULE: IFixRule = {
  name: 'react-component-props',
  description: 'Move React component prop types to component.types.ts',
  filePattern: /^src\/app\/components\/.*\.tsx$/,
  strategy: 'move-to-types',
  targetTypesFile: 'component.types.ts',
  importPath: '@src/lib/types/component.types',
};

/**
 * Example: Adding a rule for API middleware types
 */
const NEW_MIDDLEWARE_RULE: IFixRule = {
  name: 'api-middleware-types',
  description: 'Move API middleware types to api.types.ts',
  filePattern: /^src\/middleware\/.*\.ts$/,
  strategy: 'move-to-types',
  targetTypesFile: 'api.types.ts',
  importPath: '@src/lib/types/api.types',
};

/**
 * Example: Adding a rule for test utility types
 */
const NEW_TEST_RULE: IFixRule = {
  name: 'test-utility-types',
  description: 'Move test utility types to test.types.ts',
  filePattern: /^(tests?|__tests__|.*\.test\.ts|.*\.spec\.ts)$/,
  strategy: 'move-to-types',
  targetTypesFile: 'test.types.ts',
  importPath: '@src/lib/types/test.types',
};

/**
 * Example: Adding a custom handler for complex scenarios
 */
const NEW_CUSTOM_RULE: IFixRule = {
  name: 'graphql-schema-types',
  description: 'Custom handling for GraphQL schema type violations',
  filePattern: /^src\/lib\/graphql\/.*\.ts$/,
  strategy: 'custom',
  customHandler: 'fixGraphQLSchemaViolations',
};

/**
 * To add these rules, simply add them to the TYPE_FIX_RULES array
 * in fix-type-violations.config.ts:
 *
 * export const TYPE_FIX_RULES: IFixRule[] = [
 *   // ... existing rules ...
 *   NEW_COMPONENT_RULE,
 *   NEW_MIDDLEWARE_RULE,
 *   NEW_TEST_RULE,
 *   NEW_CUSTOM_RULE,
 * ];
 */

/**
 * REAL WORLD EXAMPLES of violations this would handle:
 */

// ❌ BEFORE: Type definition in component file
// src/app/components/UserProfile.tsx
/*
interface UserProfileProps {
  userId: string;
  showStats: boolean;
}

export function UserProfile({ userId, showStats }: UserProfileProps) {
  // component implementation
}
*/

// ✅ AFTER: Automatically fixed
// src/app/components/UserProfile.tsx
/*
import type { UserProfileProps } from '@src/lib/types/component.types';

export function UserProfile({ userId, showStats }: UserProfileProps) {
  // component implementation  
}
*/

// src/lib/types/component.types.ts
/*
// Types moved from src/app/components/UserProfile.tsx
interface UserProfileProps {
  userId: string;
  showStats: boolean;
}
*/

/**
 * BENEFITS OF THIS APPROACH:
 *
 * 1. 🎯 **Zero Code Changes**: Add rules without touching the main script
 * 2. 🔄 **Reusable Patterns**: Same strategies work for different file types
 * 3. 🛡️ **Type Safe**: Full TypeScript support for rule configuration
 * 4. 📈 **Scalable**: Handle new violation patterns as your codebase grows
 * 5. 🧪 **Testable**: Each rule can be tested independently
 * 6. 📋 **Configurable**: Turn rules on/off, adjust patterns per environment
 */

export { NEW_COMPONENT_RULE, NEW_MIDDLEWARE_RULE, NEW_TEST_RULE, NEW_CUSTOM_RULE };
