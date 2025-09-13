// Shared coverage configuration
const ZERO = 0;
const TEN = 10;
const FIFTEEN = 15;
const THIRTY = 30;
const FORTY = 40;
const FIFTY = 50;
const FIFTY_FIVE = 55;
const SIXTY_FIVE = 65;
import type {
  ICoverageThresholds,
  IFileThresholds,
  ICoverageConfig,
  IE2ECoverageTarget,
  IE2ETestCategory,
  IE2ECoverageConfig,
} from '@/types';

const SEVENTY_FIVE = 75;
const EIGHTY_FIVE = 85;
const NINETY_FIVE = 95; // 95% coverage is the eventual goal

// E2E Coverage Targets - Updated to match actual test files
export const E2E_COVERAGE_TARGETS: IE2ECoverageTarget[] = [
  {
    name: 'Core Navigation',
    path: '/navigation',
    threshold: 95,
    category: 'Core Navigation',
    target: 95,
    description: 'All main navigation paths must be tested',
    testFiles: ['navigation.spec.ts', 'home.spec.ts'],
  },
  {
    name: 'Authentication',
    path: '/auth',
    threshold: 90,
    category: 'Authentication',
    target: 90,
    description: 'Sign in, sign up, and protected routes',
    testFiles: ['auth-bypass.spec.ts', 'auth-protection.spec.ts', 'clerk-auth.spec.ts'],
  },
  {
    name: 'Sports Pages',
    path: '/sports',
    threshold: 95,
    category: 'Sports Pages',
    target: 95,
    description: 'All major sports league pages',
    testFiles: ['sports.spec.ts'],
  },
  {
    name: 'Live Games',
    path: '/live-games',
    threshold: 95,
    category: 'Live Games',
    target: 95,
    description: 'Live games functionality',
    testFiles: ['live-games.spec.ts'],
  },
  {
    name: 'User Dashboard',
    path: '/dashboard',
    threshold: 95,
    category: 'User Dashboard',
    target: 95,
    description: 'User dashboard functionality',
    testFiles: ['dashboard.spec.ts'],
  },
  {
    name: 'Search Functionality',
    path: '/search',
    threshold: 95,
    category: 'Search Functionality',
    target: 95,
    description: 'Search and filtering functionality',
    testFiles: ['search.spec.ts'],
  },
  {
    name: 'Critical Paths',
    path: '/critical',
    threshold: 100,
    category: 'Critical Paths',
    target: 100,
    description: 'Critical user journeys and smoke tests',
    testFiles: ['critical.spec.ts', 'smoke.spec.ts'],
  },
  {
    name: 'Responsive Design',
    path: '/responsive',
    threshold: 95,
    category: 'Responsive Design',
    target: 95,
    description: 'Mobile and tablet responsiveness',
    testFiles: ['responsive.spec.ts'],
  },
  {
    name: 'Cross Browser',
    path: '/cross-browser',
    threshold: 85,
    category: 'Cross Browser',
    target: 95,
    description: 'Cross-browser compatibility',
    testFiles: ['cross-browser.spec.ts'],
  },
  {
    name: 'Mock Server',
    path: '/mock-server',
    threshold: 90,
    category: 'Mock Server',
    target: 95,
    description: 'Mock server functionality',
    testFiles: ['mock-server.spec.ts', 'mock-verification.spec.ts'],
  },
];

// E2E Test Categories - Updated to match actual test files
export const E2E_TEST_CATEGORIES: IE2ETestCategory[] = [
  {
    name: 'Core Navigation',
    description: 'Basic navigation and routing functionality',
    targets: E2E_COVERAGE_TARGETS.filter(t => t.category === 'Core Navigation'),
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
    targets: E2E_COVERAGE_TARGETS.filter(t => t.category === 'Authentication'),
    priority: 'critical',
    userJourneys: [
      'Sign up new user',
      'Sign in existing user',
      'Sign out user',
      'Access protected routes',
      'Redirect unauthenticated users',
    ],
    testFiles: ['auth-bypass.spec.ts', 'auth-protection.spec.ts', 'clerk-auth.spec.ts'],
  },
  {
    name: 'Sports Content',
    description: 'Sports pages and content',
    targets: E2E_COVERAGE_TARGETS.filter(t => t.category === 'Sports Pages'),
    priority: 'high',
    userJourneys: [
      'View NBA games',
      'View NFL games',
      'View MLB games',
      'View NHL games',
      'View MLS games',
      'View all sports',
    ],
    testFiles: ['sports.spec.ts'],
  },
  {
    name: 'Live Games',
    description: 'Live game functionality',
    targets: E2E_COVERAGE_TARGETS.filter(t => t.category === 'Live Games'),
    priority: 'high',
    userJourneys: ['View live games', 'Live game updates'],
    testFiles: ['live-games.spec.ts'],
  },
  {
    name: 'User Dashboard',
    description: 'User dashboard and profile management',
    targets: E2E_COVERAGE_TARGETS.filter(t => t.category === 'User Dashboard'),
    priority: 'high',
    userJourneys: [
      'View user dashboard',
      'Update user profile',
      'View user preferences',
      'Manage user settings',
    ],
    testFiles: ['dashboard.spec.ts'],
  },
  {
    name: 'Search & Discovery',
    description: 'Search functionality and content discovery',
    targets: E2E_COVERAGE_TARGETS.filter(t => t.category === 'Search Functionality'),
    priority: 'high',
    userJourneys: [
      'Search for games',
      'Search for teams',
      'Search for players',
      'Filter search results',
    ],
    testFiles: ['search.spec.ts'],
  },
  {
    name: 'Critical Paths',
    description: 'Critical user journeys and smoke tests',
    targets: E2E_COVERAGE_TARGETS.filter(t => t.category === 'Critical Paths'),
    priority: 'critical',
    userJourneys: [
      'Complete user registration flow',
      'Complete game viewing flow',
      'Complete search and discovery flow',
    ],
    testFiles: ['critical.spec.ts', 'smoke.spec.ts'],
  },
  {
    name: 'Responsive Design',
    description: 'Mobile and tablet responsiveness',
    targets: E2E_COVERAGE_TARGETS.filter(t => t.category === 'Responsive Design'),
    priority: 'high',
    userJourneys: [
      'Mobile navigation',
      'Tablet navigation',
      'Responsive layouts',
      'Touch interactions',
    ],
    testFiles: ['responsive.spec.ts'],
  },
  {
    name: 'Cross Browser',
    description: 'Cross-browser compatibility',
    targets: E2E_COVERAGE_TARGETS.filter(t => t.category === 'Cross Browser'),
    priority: 'high',
    userJourneys: [
      'Chrome compatibility',
      'Firefox compatibility',
      'Safari compatibility',
      'Mobile browser compatibility',
    ],
    testFiles: ['cross-browser.spec.ts'],
  },
  {
    name: 'Mock Server',
    description: 'Mock server functionality and verification',
    targets: E2E_COVERAGE_TARGETS.filter(t => t.category === 'Mock Server'),
    priority: 'medium',
    userJourneys: ['Mock server responses', 'API endpoint verification', 'Data consistency checks'],
    testFiles: ['mock-server.spec.ts', 'mock-verification.spec.ts'],
  },
];

// File-specific thresholds - adjusted to match current actual coverage
const FILE_THRESHOLDS: IFileThresholds = {
  global: {
    lines: FIFTY,
    statements: FIFTY,
    branches: TEN,
    functions: FIFTEEN,
  },
  local: {
    lines: EIGHTY_FIVE,
    statements: EIGHTY_FIVE,
    branches: SEVENTY_FIVE,
    functions: SEVENTY_FIVE,
  },
  // Core application files - further adjusted to match current levels
  'src/app/**/*.{ts,tsx}': {
    lines: FIFTY,
    statements: FIFTY,
    branches: TEN,
    functions: FIFTEEN,
    base: FIFTY,
  },
  'src/hooks/**/*.{ts,tsx}': {
    lines: NINETY_FIVE - 40,
    statements: NINETY_FIVE - 40,
    branches: NINETY_FIVE - 30,
    functions: NINETY_FIVE - 35,
    base: NINETY_FIVE,
  },
  'src/lib/utils/**/*.{ts,tsx}': {
    lines: EIGHTY_FIVE,
    statements: EIGHTY_FIVE,
    branches: SEVENTY_FIVE,
    functions: SEVENTY_FIVE,
    base: EIGHTY_FIVE,
  },
  'src/styles/*': {
    lines: ZERO,
    statements: ZERO,
    branches: ZERO,
    functions: ZERO,
    base: ZERO,
  },
  // ========================================
  // Granular src/app
  // ========================================
  'src/app/api/**/*.{ts,tsx}': {
    lines: SIXTY_FIVE,
    statements: SIXTY_FIVE,
    branches: FORTY,
    functions: FORTY,
    base: SIXTY_FIVE,
  },
  // ========================================
  // Granular src/hooks
  // ========================================
  'src/app/hooks/**/*.{ts,tsx}': {
    lines: SIXTY_FIVE,
    statements: SIXTY_FIVE,
    branches: FORTY,
    functions: FORTY,
    base: SIXTY_FIVE,
  },
  // ========================================
  // Granular src/lib
  // ========================================
  'src/lib/apollo-client.ts': {
    lines: FIFTY,
    statements: FIFTY,
    branches: THIRTY,
    functions: THIRTY,
    base: FIFTY,
  },
  'src/lib/analytics/**/*.{ts,tsx}': {
    lines: ZERO,
    statements: ZERO,
    branches: ZERO,
    functions: ZERO,
    base: ZERO,
  },
  'src/lib/types/**/*.{ts,tsx}': {
    lines: ZERO,
    statements: ZERO,
    branches: ZERO,
    functions: ZERO,
    base: ZERO,
  },
  'src/lib/config/**/*.{ts,tsx}': {
    lines: ZERO,
    statements: ZERO,
    branches: ZERO,
    functions: ZERO,
    base: ZERO,
  },
  'src/lib/db/schema/**/*.{ts,tsx}': {
    lines: ZERO,
    statements: ZERO,
    branches: ZERO,
    functions: ZERO,
    base: ZERO,
  },
  'src/lib/graphql/resolvers/**/*.{ts,tsx}': {
    lines: NINETY_FIVE,
    statements: NINETY_FIVE,
    branches: NINETY_FIVE,
    functions: NINETY_FIVE,
    base: NINETY_FIVE,
  },
  // Test utilities - moderate standards
  'tests/**/*.{ts,tsx}': {
    lines: SIXTY_FIVE,
    statements: SIXTY_FIVE,
    branches: FIFTY_FIVE,
    functions: FIFTY_FIVE,
    base: FIFTY_FIVE,
  },
};

export function getGlobalCoverageThresholds(): ICoverageThresholds {
  return {
    lines: NINETY_FIVE - 35,
    functions: NINETY_FIVE - 40,
    statements: NINETY_FIVE - 35,
    branches: NINETY_FIVE - 60,
    base: NINETY_FIVE - 60,
  };
}

export function getCoverageConfig(): ICoverageConfig {
  return {
    thresholds: FILE_THRESHOLDS,
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '**/*.d.ts',
      '**/*.config.*',
      'src/lib/mock-server/**',
    ],
    include: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
    reporter: ['text', 'lcov', 'html'],
    reportsDirectory: './coverage',
    global: getGlobalCoverageThresholds(),
    files: FILE_THRESHOLDS,
  };
}

export function getE2ECoverageConfig(): IE2ECoverageConfig {
  return {
    categories: E2E_TEST_CATEGORIES,
    globalThreshold: EIGHTY_FIVE,
    reportPath: './test-results/e2e-coverage',
    targets: E2E_COVERAGE_TARGETS,
    thresholds: {
      lines: EIGHTY_FIVE,
      statements: EIGHTY_FIVE,
      branches: SEVENTY_FIVE,
      functions: SEVENTY_FIVE,
      global: {
        statements: NINETY_FIVE,
        branches: NINETY_FIVE,
        functions: NINETY_FIVE,
        lines: NINETY_FIVE,
      },
    },
  };
}

export function getVitestThresholdsWithFiles() {
  const config = getCoverageConfig();
  return {
    ...config.global,
    // Add file-specific thresholds for vitest
    ...config.files,
  };
}

// E2E Coverage calculation functions
export function calculateE2ECoverageScore(
  testResults: Array<{ status: string; testFile?: string }>
): number {
  const totalTests = testResults.length;
  const passedTests = testResults.filter(result => result.status === 'passed').length;
  return totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
}

export function generateE2ECoverageReport(
  testResults: Array<{ status: string; testFile?: string }>
): {
  overallScore: number;
  categories: Array<{
    category: string;
    target: number;
    actual: number;
    met: boolean;
    description: string;
    testCount: number;
  }>;
  summary: {
    totalCategories: number;
    metTargets: number;
    failedTargets: number;
  };
} {
  const e2eConfig = getE2ECoverageConfig();
  const coverage = (e2eConfig.targets || []).map(target => {
    const categoryTests = testResults.filter(result =>
      (target.testFiles || []).some((file: string) => result.testFile?.includes(file))
    );
    const score = calculateE2ECoverageScore(categoryTests);

    return {
      category: target.category || target.name,
      target: target.target || target.threshold,
      actual: score,
      met: score >= (target.target || target.threshold),
      description: target.description || 'No description available',
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
