import React from 'react';
import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, priority, sizes, ...props }: any) =>
    React.createElement('img', {
      src,
      alt,
      width,
      height,
      'data-priority': priority,
      'data-sizes': sizes,
      ...props,
    }),
}));

// Mock Clerk components
vi.mock('@clerk/nextjs', () => ({
  SignIn: vi.fn(({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'clerk-sign-in', ...props }, children)
  ),
  SignUp: vi.fn(({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'clerk-sign-up', ...props }, children)
  ),
  useUser: () => ({
    isSignedIn: false,
    isLoaded: true,
    user: null,
  }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: false,
    userId: null,
  }),
  ClerkProvider: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'clerk-provider' }, children),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    themes: ['light', 'dark', 'system'],
  }),
  ThemeProvider: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'theme-provider' }, children),
}));

// Mock lucide-react icons globally with better isolation
vi.mock('lucide-react', () => {
  const createMockIcon = (name: string) => {
    const MockIcon = ({ className, ...props }: any) =>
      React.createElement(
        'div',
        { 'data-testid': `${name.toLowerCase()}-icon`, className, ...props },
        name
      );

    // Ensure the component has a display name for debugging
    MockIcon.displayName = name;
    return MockIcon;
  };

  const mockIcons = {
    Calendar: createMockIcon('Calendar'),
    GraduationCap: createMockIcon('GraduationCap'),
    MapPin: createMockIcon('MapPin'),
    User: createMockIcon('User'),
    Building2: createMockIcon('Building2'),
    Search: createMockIcon('Search'),
    ChevronsLeft: createMockIcon('ChevronsLeft'),
    ChevronLeft: createMockIcon('ChevronLeft'),
    ChevronRight: createMockIcon('ChevronRight'),
    ChevronDown: createMockIcon('ChevronDown'),
    ChevronsRight: createMockIcon('ChevronsRight'),
    ArrowUpDown: createMockIcon('ArrowUpDown'),
    ArrowUp: createMockIcon('ArrowUp'),
    ArrowDown: createMockIcon('ArrowDown'),
    X: createMockIcon('X'),
    MoreHorizontal: createMockIcon('MoreHorizontal'),
    Reply: createMockIcon('Reply'),
    AlertTriangle: createMockIcon('AlertTriangle'),
    Bell: createMockIcon('Bell'),
    AlertCircle: createMockIcon('AlertCircle'),
    Smile: createMockIcon('Smile'),
    Gamepad2: createMockIcon('Gamepad2'),
    Trophy: createMockIcon('Trophy'),
    Eye: createMockIcon('Eye'),
    Users: createMockIcon('Users'),
    Lock: createMockIcon('Lock'),
    EyeOff: createMockIcon('EyeOff'),
    Plus: createMockIcon('Plus'),
    Star: createMockIcon('Star'),
    Menu: createMockIcon('Menu'),
    Send: createMockIcon('Send'),
    MessageCircle: createMockIcon('MessageCircle'),
    Edit: createMockIcon('Edit'),
    Check: createMockIcon('Check'),
    Trash2: createMockIcon('Trash2'),
    Moon: createMockIcon('Moon'),
    MessageSquare: createMockIcon('MessageSquare'),
    Globe: createMockIcon('Globe'),
    Sun: createMockIcon('Sun'),
    File: createMockIcon('File'),
    Database: createMockIcon('Database'),
    Settings: createMockIcon('Settings'),
    BarChart3: createMockIcon('BarChart3'),
    Activity: createMockIcon('Activity'),
    Shield: createMockIcon('Shield'),
    Key: createMockIcon('Key'),
    RotateCcw: createMockIcon('RotateCcw'),
    RefreshCw: createMockIcon('RefreshCw'),
    Download: createMockIcon('Download'),
    Upload: createMockIcon('Upload'),
    Filter: createMockIcon('Filter'),
    SortAsc: createMockIcon('SortAsc'),
    SortDesc: createMockIcon('SortDesc'),
    ChevronUp: createMockIcon('ChevronUp'),
    ChevronUpDown: createMockIcon('ChevronUpDown'),
    MoreVertical: createMockIcon('MoreVertical'),
    Ellipsis: createMockIcon('Ellipsis'),
    EllipsisVertical: createMockIcon('EllipsisVertical'),
    EllipsisHorizontal: createMockIcon('EllipsisHorizontal'),
    Monitor: createMockIcon('Monitor'),
    Heart: createMockIcon('Heart'),
    UserPlus: createMockIcon('UserPlus'),
    Home: createMockIcon('Home'),
  };

  return {
    ...mockIcons,
    default: mockIcons,
  };
});

// Mock environment variables
process.env.NEXT_PUBLIC_RAPID_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_RAPID_API_HOST = 'test-host';
process.env.NEXT_PUBLIC_RAPID_API_BASE_URL = 'https://test-api.com';
process.env.API_MOCK_MODE = 'true'; // Enable mock mode for tests

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Ensure proper cleanup between tests
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Set up test environment variables for client-side detection
Object.defineProperty(window, '__API_MOCK_MODE__', {
  writable: true,
  value: true,
});

// Mock fetch
(globalThis as any).fetch = vi.fn();

// Mock console methods in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: React.act is not a function') ||
        args[0].includes(
          'Warning: An invalid value was passed to the second argument of ReactDOM.createRoot'
        ))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: componentWillReceiveProps') ||
        args[0].includes('Warning: componentWillUpdate'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock React.act to prevent errors
(globalThis as any).React = {
  ...(globalThis as any).React,
  act: vi.fn(fn => fn()),
  createElement: React.createElement,
};
