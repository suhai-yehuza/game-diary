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

// Mock environment variables
process.env.NEXT_PUBLIC_RAPID_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_RAPID_API_HOST = 'test-host';
process.env.NEXT_PUBLIC_RAPID_API_BASE_URL = 'https://test-api.com';

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

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
