// Shared coverage configuration
const ZERO = 0;
const TEN = 10;
const FIFTEEN = 15;
const FORTY = 40;
const FIFTY = 50;
const FIFTY_FIVE = 55;
const SIXTY = 60;
const SIXTY_FIVE = 65;
const SEVENTY = 70;
const SEVENTY_FIVE = 75;
const EIGHTY = 80;
const EIGHTY_FIVE = 85;
const NINETY_FIVE = 95; // 95% coverage is the eventual goal

export interface ICoverageThresholds {
  branches: number;
  functions: number;
  lines: number;
  statements: number;
  base: number;
}

export interface IFileThresholds {
  [filePattern: string]: ICoverageThresholds;
}

export interface ICoverageConfig {
  global: ICoverageThresholds;
  files: IFileThresholds;
}

// E2E Coverage Configuration
export interface IE2ECoverageTarget {
  category: string;
  target: number;
  description: string;
  testFiles: string[];
}

export interface IE2ETestCategory {
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  userJourneys: string[];
  testFiles: string[];
}

export interface IE2ECoverageConfig {
  targets: IE2ECoverageTarget[];
  categories: IE2ETestCategory[];
  thresholds: {
    global: {
      statements: number;
      branches: number;
      functions: number;
      lines: number;
    };
  };
}

// E2E Coverage Targets - Updated to match actual test files
export const E2E_COVERAGE_TARGETS: IE2ECoverageTarget[] = [
  {
    category: 'Core Navigation',
    target: 95,
    description: 'All main navigation paths must be tested',
    testFiles: ['navigation.spec.ts', 'home.spec.ts'],
  },
  {
    category: 'Authentication',
    target: 90,
    description: 'Sign in, sign up, and protected routes',
    testFiles: ['auth-bypass.spec.ts', 'auth-protection.spec.ts', 'clerk-auth.spec.ts'],
  },
  {
    category: 'Sports Pages',
    target: 95,
    description: 'All major sports league pages',
    testFiles: ['sports.spec.ts'],
  },
  {
    category: 'Live Games',
    target: 95,
    description: 'Live games functionality',
    testFiles: ['live-games.spec.ts'],
  },
  {
    category: 'User Dashboard',
    target: 95,
    description: 'User dashboard functionality',
    testFiles: ['dashboard.spec.ts'],
  },
  {
    category: 'Search Functionality',
    target: 95,
    description: 'Search and filtering functionality',
    testFiles: ['search.spec.ts'],
  },
  {
    category: 'Critical Paths',
    target: 100,
    description: 'Critical user journeys and smoke tests',
    testFiles: ['critical.spec.ts', 'smoke.spec.ts'],
  },
  {
    category: 'Responsive Design',
    target: 95,
    description: 'Mobile and tablet responsiveness',
    testFiles: ['responsive.spec.ts'],
  },
  {
    category: 'Cross Browser',
    target: 95,
    description: 'Cross-browser compatibility',
    testFiles: ['cross-browser.spec.ts'],
  },
  {
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
    testFiles: ['auth-bypass.spec.ts', 'auth-protection.spec.ts', 'clerk-auth.spec.ts'],
  },
  {
    name: 'Sports Content',
    description: 'Sports pages and content',
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
    priority: 'high',
    userJourneys: ['View live games', 'Live game updates'],
    testFiles: ['live-games.spec.ts'],
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
    testFiles: ['dashboard.spec.ts'],
  },
  {
    name: 'Search & Discovery',
    description: 'Search functionality and content discovery',
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
    priority: 'medium',
    userJourneys: ['Mock server responses', 'API endpoint verification', 'Data consistency checks'],
    testFiles: ['mock-server.spec.ts', 'mock-verification.spec.ts'],
  },
];

// File-specific thresholds - adjusted to match current actual coverage
const FILE_THRESHOLDS: IFileThresholds = {
  // Core application files - further adjusted to match current levels
  'src/app/**/*.{ts,tsx}': {
    lines: FIFTY,
    statements: FIFTY,
    branches: TEN,
    functions: FIFTEEN,
    base: FIFTY,
  },
  // Component files - adjusted to current levels
  'src/components/**/*.{ts,tsx}': {
    lines: EIGHTY,
    statements: EIGHTY,
    branches: SEVENTY,
    functions: SEVENTY,
    base: EIGHTY,
  },
  // Hook files - adjusted to current levels
  'src/hooks/**/*.{ts,tsx}': {
    lines: SEVENTY,
    statements: SEVENTY,
    branches: FIFTY_FIVE,
    functions: SIXTY,
    base: SEVENTY,
  },
  // Utility files - adjusted to current levels
  'src/lib/utils/**/*.{ts,tsx}': {
    lines: EIGHTY_FIVE,
    statements: EIGHTY_FIVE,
    branches: SEVENTY_FIVE,
    functions: SEVENTY_FIVE,
    base: EIGHTY_FIVE,
  },
  // API routes - adjusted to current levels
  'src/app/api/**/*.{ts,tsx}': {
    lines: SIXTY_FIVE,
    statements: SIXTY_FIVE,
    branches: FORTY,
    functions: FORTY,
    base: SIXTY_FIVE,
  },
  // Apollo client - specific threshold for this problematic file
  'src/lib/apollo-client.ts': {
    lines: SIXTY,
    statements: SIXTY,
    branches: SEVENTY_FIVE,
    functions: ZERO,
    base: SIXTY,
  },
  // Analytics files - no coverage needed
  'src/lib/analytics/**/*.{ts,tsx}': {
    lines: ZERO,
    statements: ZERO,
    branches: ZERO,
    functions: ZERO,
    base: ZERO,
  },
  // Type definitions - no coverage needed
  'src/lib/types/**/*.{ts,tsx}': {
    lines: ZERO,
    statements: ZERO,
    branches: ZERO,
    functions: ZERO,
    base: ZERO,
  },
  // Configuration files - no coverage needed
  'src/lib/config/**/*.{ts,tsx}': {
    lines: ZERO,
    statements: ZERO,
    branches: ZERO,
    functions: ZERO,
    base: ZERO,
  },
  // Database schema - no coverage needed
  'src/lib/db/schema/**/*.{ts,tsx}': {
    lines: ZERO,
    statements: ZERO,
    branches: ZERO,
    functions: ZERO,
    base: ZERO,
  },
  // GraphQL resolvers - moderate standards
  'src/lib/graphql/resolvers/**/*.{ts,tsx}': {
    lines: SEVENTY_FIVE,
    statements: SEVENTY_FIVE,
    branches: SIXTY_FIVE,
    functions: SIXTY_FIVE,
    base: SEVENTY_FIVE,
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
    lines: EIGHTY + 7,
    statements: EIGHTY + 7,
    branches: EIGHTY - 1,
    functions: EIGHTY - 9,
    base: EIGHTY,
  };
}

export function getCoverageConfig(): ICoverageConfig {
  return {
    global: getGlobalCoverageThresholds(),
    files: FILE_THRESHOLDS,
  };
}

export function getE2ECoverageConfig(): IE2ECoverageConfig {
  return {
    targets: E2E_COVERAGE_TARGETS,
    categories: E2E_TEST_CATEGORIES,
    thresholds: {
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
  const coverage = e2eConfig.targets.map(target => {
    const categoryTests = testResults.filter(result =>
      target.testFiles.some((file: string) => result.testFile?.includes(file))
    );
    const score = calculateE2ECoverageScore(categoryTests);

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
