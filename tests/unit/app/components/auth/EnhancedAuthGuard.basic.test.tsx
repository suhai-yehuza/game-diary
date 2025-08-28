import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import EnhancedAuthGuard from '@/app/components/auth/EnhancedAuthGuard';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertTriangle: ({ className }: any) => (
    <div data-testid="alert-triangle" className={className}>
      AlertTriangle
    </div>
  ),
  RefreshCw: ({ className }: any) => (
    <div data-testid="refresh-cw" className={className}>
      RefreshCw
    </div>
  ),
  Shield: ({ className }: any) => (
    <div data-testid="shield" className={className}>
      Shield
    </div>
  ),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, className }: any) => (
    <a href={href} className={className} data-testid="next-link">
      {children}
    </a>
  ),
}));

// Mock UI components
vi.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className }: any) => (
    <button onClick={onClick} data-variant={variant} className={className} data-testid="button">
      {children}
    </button>
  ),
}));

vi.mock('@/app/components/ui/Card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h2 data-testid="card-title" className={className}>
      {children}
    </h2>
  ),
}));

// Mock the auth hook
const mockUseAuthState = vi.fn();
vi.mock('@/lib/hooks/useAuthState', () => ({
  useAuthState: () => mockUseAuthState(),
}));

describe('EnhancedAuthGuard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user is authenticated and auth is stable', () => {
    mockUseAuthState.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      isAuthStable: true,
      authError: null,
      retryAuth: vi.fn(),
    });

    render(
      <EnhancedAuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </EnhancedAuthGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('shows loading state when auth is not loaded', () => {
    mockUseAuthState.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
      isAuthStable: false,
      authError: null,
      retryAuth: vi.fn(),
    });

    render(
      <EnhancedAuthGuard>
        <div>Protected Content</div>
      </EnhancedAuthGuard>
    );

    expect(screen.getByText('Loading authentication...')).toBeInTheDocument();
  });

  it('shows stabilizing message when auth is not stable', () => {
    mockUseAuthState.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      isAuthStable: false,
      authError: null,
      retryAuth: vi.fn(),
    });

    render(
      <EnhancedAuthGuard>
        <div>Protected Content</div>
      </EnhancedAuthGuard>
    );

    expect(screen.getByText('Stabilizing auth state...')).toBeInTheDocument();
  });

  it('shows auth error state with retry button', () => {
    const mockRetryAuth = vi.fn();
    mockUseAuthState.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      isAuthStable: true,
      authError: 'Token expired',
      retryAuth: mockRetryAuth,
    });

    render(
      <EnhancedAuthGuard>
        <div>Protected Content</div>
      </EnhancedAuthGuard>
    );

    expect(screen.getByText('Authentication Issue')).toBeInTheDocument();
    expect(screen.getByText('Token expired')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();

    // Test retry button
    fireEvent.click(screen.getByText('Retry'));
    expect(mockRetryAuth).toHaveBeenCalled();
  });

  it('shows sign in required when user is not authenticated', () => {
    mockUseAuthState.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      isAuthStable: true,
      authError: null,
      retryAuth: vi.fn(),
    });

    render(
      <EnhancedAuthGuard>
        <div>Protected Content</div>
      </EnhancedAuthGuard>
    );

    expect(screen.getByText('Sign In Required')).toBeInTheDocument();
    expect(screen.getByText('You must be signed in to view this page')).toBeInTheDocument();
    expect(screen.getByText('Sign In to Continue')).toBeInTheDocument();
  });

  it('allows access when requireAuth is false and user is not authenticated', () => {
    mockUseAuthState.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      isAuthStable: true,
      authError: null,
      retryAuth: vi.fn(),
    });

    render(
      <EnhancedAuthGuard requireAuth={false}>
        <div data-testid="public-content">Public Content</div>
      </EnhancedAuthGuard>
    );

    expect(screen.getByTestId('public-content')).toBeInTheDocument();
  });

  it('uses custom fallback URL', () => {
    mockUseAuthState.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      isAuthStable: true,
      authError: null,
      retryAuth: vi.fn(),
    });

    render(
      <EnhancedAuthGuard fallbackUrl="/custom-signin">
        <div>Protected Content</div>
      </EnhancedAuthGuard>
    );

    const signInLinks = screen.getAllByTestId('next-link');
    expect(signInLinks[0]).toHaveAttribute('href', '/custom-signin');
  });

  it('hides retry button when showRetryButton is false', () => {
    mockUseAuthState.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      isAuthStable: true,
      authError: 'Token expired',
      retryAuth: vi.fn(),
    });

    render(
      <EnhancedAuthGuard showRetryButton={false}>
        <div>Protected Content</div>
      </EnhancedAuthGuard>
    );

    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    expect(screen.getByText('Sign In to Continue')).toBeInTheDocument();
  });

  it('shows auth error in loading state when present', () => {
    mockUseAuthState.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
      isAuthStable: false,
      authError: 'Network error',
      retryAuth: vi.fn(),
    });

    render(
      <EnhancedAuthGuard>
        <div>Protected Content</div>
      </EnhancedAuthGuard>
    );

    expect(screen.getByText('Loading authentication...')).toBeInTheDocument();
    expect(screen.getByText('Detected: Network error')).toBeInTheDocument();
  });

  it('renders with default props correctly', () => {
    mockUseAuthState.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      isAuthStable: true,
      authError: null,
      retryAuth: vi.fn(),
    });

    render(
      <EnhancedAuthGuard>
        <div data-testid="default-content">Default Content</div>
      </EnhancedAuthGuard>
    );

    expect(screen.getByTestId('default-content')).toBeInTheDocument();
  });
});
