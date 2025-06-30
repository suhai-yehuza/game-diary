/**
 * E2E Test Coverage Configuration
 *
 * This file defines coverage targets and test categories for end-to-end testing.
 * Coverage is measured by the number of user journeys and critical paths tested.
 */

import { CoverageTarget, TestCategory } from '@src/lib/types/e2e-test-types';

export const COVERAGE_TARGETS: CoverageTarget[] = [
  {
    category: 'Core Navigation',
    target: 100,
    description: 'All main navigation paths must be tested',
    testFiles: ['navigation.spec.ts', 'home.spec.ts'],
  },
  {
    category: 'Authentication',
    target: 90,
    description: 'Sign in, sign up, and protected routes',
    testFiles: ['auth.spec.ts', 'protected-routes.spec.ts'],
  },
  {
    category: 'Sports Pages',
    target: 95,
    description: 'All major sports league pages',
    testFiles: ['sports.spec.ts', 'live-games.spec.ts'],
  },
  {
    category: 'User Dashboard',
    target: 95,
    description: 'User dashboard functionality',
    testFiles: ['dashboard.spec.ts', 'user-profile.spec.ts'],
  },
  {
    category: 'Admin Features',
    target: 95,
    description: 'Admin panel and database management',
    testFiles: ['admin.spec.ts', 'database-management.spec.ts'],
  },
  {
    category: 'Responsive Design',
    target: 95,
    description: 'Mobile and tablet responsiveness',
    testFiles: ['responsive.spec.ts', 'mobile.spec.ts'],
  },
  {
    category: 'Error Handling',
    target: 95,
    description: '404, 500, and other error pages',
    testFiles: ['error-handling.spec.ts', 'not-found.spec.ts'],
  },
  {
    category: 'Performance',
    target: 95,
    description: 'Page load times and performance metrics',
    testFiles: ['performance.spec.ts', 'lighthouse.spec.ts'],
  },
  {
    category: 'Accessibility',
    target: 95,
    description: 'WCAG compliance and accessibility features',
    testFiles: ['accessibility.spec.ts', 'a11y.spec.ts'],
  },
  {
    category: 'Cross Browser',
    target: 95,
    description: 'Cross-browser compatibility',
    testFiles: ['cross-browser.spec.ts', 'browser-compatibility.spec.ts'],
  },
];

export const TEST_CATEGORIES: TestCategory[] = [
  {
    name: 'Core Navigation',
    description: 'Basic navigation and routing functionality',
    priority: 'critical',
    userJourneys: [
      'Navigate to home page',
      'Navigate between sports pages',
      'Navigate to dashboard',
      'Navigate to sign in/sign up',
      'Browser back/forward functionality',
    ],
    testFiles: ['navigation.spec.ts', 'home.spec.ts'],
  },
  {
    name: 'Authentication & Authorization',
    description: 'User authentication and protected routes',
    priority: 'critical',
    userJourneys: [
      'Sign up new user',
      'Sign in existing user',
      'Sign out user',
      'Access protected routes',
      'Redirect unauthenticated users',
    ],
    testFiles: ['auth.spec.ts', 'protected-routes.spec.ts'],
  },
  {
    name: 'Sports Content',
    description: 'Sports pages and live game functionality',
    priority: 'high',
    userJourneys: [
      'View NBA games',
      'View NFL games',
      'View MLB games',
      'View NHL games',
      'View MLS games',
      'View live games',
      'View all sports',
    ],
    testFiles: ['sports.spec.ts', 'live-games.spec.ts'],
  },
  {
    name: 'User Dashboard',
    description: 'User dashboard and profile management',
    priority: 'high',
    userJourneys: [
      'View user dashboard',
      'Update user profile',
      'View user preferences',
      'Manage user settings',
    ],
    testFiles: ['dashboard.spec.ts', 'user-profile.spec.ts'],
  },
  {
    name: 'Admin Panel',
    description: 'Admin functionality and database management',
    priority: 'medium',
    userJourneys: [
      'Access admin panel',
      'View database tables',
      'Manage database records',
      'View system logs',
    ],
    testFiles: ['admin.spec.ts', 'database-management.spec.ts'],
  },
  {
    name: 'Responsive Design',
    description: 'Mobile and tablet responsiveness',
    priority: 'high',
    userJourneys: [
      'Mobile navigation',
      'Tablet navigation',
      'Responsive layouts',
      'Touch interactions',
    ],
    testFiles: ['responsive.spec.ts', 'mobile.spec.ts'],
  },
  {
    name: 'Error Handling',
    description: 'Error pages and error handling',
    priority: 'medium',
    userJourneys: [
      '404 page not found',
      '500 server error',
      'Network error handling',
      'Invalid route handling',
    ],
    testFiles: ['error-handling.spec.ts', 'not-found.spec.ts'],
  },
  {
    name: 'Performance',
    description: 'Page load performance and metrics',
    priority: 'medium',
    userJourneys: ['Page load times', 'Lighthouse scores', 'Core Web Vitals', 'Resource loading'],
    testFiles: ['performance.spec.ts', 'lighthouse.spec.ts'],
  },
  {
    name: 'Accessibility',
    description: 'WCAG compliance and accessibility',
    priority: 'high',
    userJourneys: [
      'Keyboard navigation',
      'Screen reader compatibility',
      'Color contrast',
      'Focus management',
    ],
    testFiles: ['accessibility.spec.ts', 'a11y.spec.ts'],
  },
  {
    name: 'Cross Browser',
    description: 'Cross-browser compatibility',
    priority: 'high',
    userJourneys: [
      'Chrome compatibility',
      'Firefox compatibility',
      'Safari compatibility',
      'Mobile browser compatibility',
    ],
    testFiles: ['cross-browser.spec.ts'],
  },
];

export const COVERAGE_REPORT_CONFIG = {
  outputDir: 'coverage/e2e',
  thresholds: {
    global: {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
    },
  },
  categories: COVERAGE_TARGETS,
  testCategories: TEST_CATEGORIES,
};

export function calculateCoverageScore(testResults: any[]): number {
  const totalTests = testResults.length;
  const passedTests = testResults.filter(result => result.status === 'passed').length;
  return totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
}

export function generateCoverageReport(testResults: any[]): any {
  const coverage = COVERAGE_TARGETS.map(target => {
    const categoryTests = testResults.filter(result =>
      target.testFiles.some(file => result.testFile?.includes(file))
    );
    const score = calculateCoverageScore(categoryTests);

    return {
      category: target.category,
      target: target.target,
      actual: score,
      met: score >= target.target,
      description: target.description,
      testCount: categoryTests.length,
    };
  });

  const overallScore = coverage.reduce((sum, cat) => sum + cat.actual, 0) / coverage.length;

  return {
    overallScore,
    categories: coverage,
    summary: {
      totalCategories: coverage.length,
      metTargets: coverage.filter(cat => cat.met).length,
      failedTargets: coverage.filter(cat => !cat.met).length,
    },
  };
}
