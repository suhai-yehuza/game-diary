import { useUser } from '@clerk/nextjs';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, type MockedFunction } from 'vitest';

import { AdminNav, AdminNavWithAuth } from '@/app/components/layout/components/navigation/AdminNav';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

// Mock the sso-utils
vi.mock('@/lib/utils/sso-utils', () => ({
  isSSOCallback: vi.fn(() => false),
}));

// Mock the DropdownMenu components
vi.mock('@/app/components/ui/DropdownMenu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild: _asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({
    children,
    align,
    className,
  }: {
    children: React.ReactNode;
    align?: string;
    className?: string;
  }) => (
    <div data-testid="dropdown-content" data-align={align} className={className}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({
    children,
    asChild: _asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="dropdown-item">{children}</div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down">▼</div>,
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

const mockUseUser = useUser as MockedFunction<typeof useUser>;

describe('AdminNav', () => {
  const defaultProps = {
    isActive: vi.fn((path: string) => path === '/protected/admin/database'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location for E2E test detection
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
      writable: true,
    });
  });

  describe('AdminNav Component', () => {
    it('renders admin dropdown with trigger', () => {
      render(<AdminNav {...defaultProps} />);

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
    });

    it('renders admin menu items', () => {
      render(<AdminNav {...defaultProps} />);

      expect(screen.getByText('Database Management')).toBeInTheDocument();
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
      expect(screen.getByText('Experimental')).toBeInTheDocument();
    });

    it('applies active styling when admin route is active', () => {
      const isActive = vi.fn((path: string) => path === '/protected/admin/database');
      render(<AdminNav isActive={isActive} />);

      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger.querySelector('button')).toHaveClass('text-blue-600', 'font-semibold');
    });

    it('calls closeMenu when admin links are clicked', () => {
      const closeMenu = vi.fn();
      render(<AdminNav {...defaultProps} closeMenu={closeMenu} />);

      const databaseLink = screen.getByText('Database Management');
      const auditLogsLink = screen.getByText('Audit Logs');
      const experimentalLink = screen.getByText('Experimental');

      fireEvent.click(databaseLink);
      expect(closeMenu).toHaveBeenCalledTimes(1);

      fireEvent.click(auditLogsLink);
      expect(closeMenu).toHaveBeenCalledTimes(2);

      fireEvent.click(experimentalLink);
      expect(closeMenu).toHaveBeenCalledTimes(3);
    });

    it('does not call closeMenu when closeMenu is not provided', () => {
      render(<AdminNav {...defaultProps} />);

      const databaseLink = screen.getByText('Database Management');
      fireEvent.click(databaseLink);

      // Should not throw error when closeMenu is undefined
      expect(databaseLink).toBeInTheDocument();
    });

    it('has correct href attributes for admin links', () => {
      render(<AdminNav {...defaultProps} />);

      const databaseLink = screen.getByText('Database Management');
      const auditLogsLink = screen.getByText('Audit Logs');
      const experimentalLink = screen.getByText('Experimental');

      expect(databaseLink.closest('a')).toHaveAttribute('href', '/protected/admin/database');
      expect(auditLogsLink.closest('a')).toHaveAttribute('href', '/protected/admin/audit-logs');
      expect(experimentalLink.closest('a')).toHaveAttribute(
        'href',
        '/protected/admin/experimental'
      );
    });

    it('has proper accessibility attributes', () => {
      render(<AdminNav {...defaultProps} />);

      const trigger = screen.getByTestId('dropdown-trigger').querySelector('button');
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'true'); // Should be true when admin route is active
    });
  });

  describe('AdminNavWithAuth Component', () => {
    beforeEach(() => {
      // Mock process.env for E2E test detection
      vi.stubEnv('MOCK_MODE', 'false');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('renders nothing when user is not admin', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          publicMetadata: { role: ['user'] },
        },
      } as any);

      const { container } = render(<AdminNavWithAuth {...defaultProps} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders admin nav when user has admin role', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          publicMetadata: { role: ['admin'] },
        },
      } as any);

      render(<AdminNavWithAuth {...defaultProps} />);

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Database Management')).toBeInTheDocument();
    });

    it('renders admin nav when user has Admin role (case sensitive)', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          publicMetadata: { role: ['Admin'] },
        },
      } as any);

      render(<AdminNavWithAuth {...defaultProps} />);

      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('renders nothing when user is not signed in', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        user: null,
      } as any);

      const { container } = render(<AdminNavWithAuth {...defaultProps} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when user data is not loaded', () => {
      mockUseUser.mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
        user: null,
      } as any);

      const { container } = render(<AdminNavWithAuth {...defaultProps} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when user has no role metadata', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          publicMetadata: {},
        },
      } as any);

      const { container } = render(<AdminNavWithAuth {...defaultProps} />);
      expect(container.firstChild).toBeNull();
    });

    it('passes closeMenu function to admin nav when provided', () => {
      const closeMenu = vi.fn();
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          publicMetadata: { role: ['admin'] },
        },
      } as any);

      render(<AdminNavWithAuth {...defaultProps} closeMenu={closeMenu} />);

      const databaseLink = screen.getByText('Database Management');
      fireEvent.click(databaseLink);

      expect(closeMenu).toHaveBeenCalledTimes(1);
    });

    it('renders stacked version when isStacked is true', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          publicMetadata: { role: ['admin'] },
        },
      } as any);

      render(<AdminNavWithAuth {...defaultProps} isStacked={true} />);

      // Should render the stacked version with different styling
      const adminButton = screen.getByText('Admin');
      expect(adminButton.closest('button')).toHaveClass('bg-blue-500', 'text-white');
    });

    it('calls closeMenu in stacked version when admin links are clicked', () => {
      const closeMenu = vi.fn();
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          publicMetadata: { role: ['admin'] },
        },
      } as any);

      render(<AdminNavWithAuth {...defaultProps} isStacked={true} closeMenu={closeMenu} />);

      const databaseLink = screen.getByText('Database Management');
      fireEvent.click(databaseLink);

      expect(closeMenu).toHaveBeenCalledTimes(1);
    });
  });

  describe('E2E Test Mode', () => {
    beforeEach(() => {
      vi.stubEnv('MOCK_MODE', 'true');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('uses E2E version when in test mode', () => {
      render(<AdminNav {...defaultProps} />);

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Database Management')).toBeInTheDocument();
    });

    it('E2E version calls closeMenu when admin links are clicked', () => {
      const closeMenu = vi.fn();
      render(<AdminNav {...defaultProps} closeMenu={closeMenu} />);

      const databaseLink = screen.getByText('Database Management');
      fireEvent.click(databaseLink);

      expect(closeMenu).toHaveBeenCalledTimes(1);
    });
  });

  describe('isAdminRouteActive function', () => {
    it('returns true for admin routes', () => {
      const isActive = vi.fn((path: string) =>
        [
          '/protected/admin/database',
          '/protected/admin/audit-logs',
          '/protected/admin/experimental',
        ].includes(path)
      );

      render(<AdminNav isActive={isActive} />);

      const trigger = screen.getByTestId('dropdown-trigger').querySelector('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('returns false for non-admin routes', () => {
      const isActive = vi.fn((path: string) => path === '/protected/user');

      render(<AdminNav isActive={isActive} />);

      const trigger = screen.getByTestId('dropdown-trigger').querySelector('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
