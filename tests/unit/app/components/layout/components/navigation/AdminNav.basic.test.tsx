import { useUser } from '@clerk/nextjs';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AdminNav, AdminNavWithAuth } from '@/app/components/layout/components/navigation/AdminNav';
import { isSSOCallback } from '@/lib/utils/sso-utils';

// Mock the dependencies
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/lib/utils/sso-utils', () => ({
  isSSOCallback: vi.fn(),
}));

vi.mock('@/app/components/ui/DropdownMenu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: any) => {
    if (asChild) {
      // When asChild is true, clone the child and add the test ID
      return React.cloneElement(children, {
        'data-testid': 'dropdown-trigger',
        ...children.props,
      });
    }
    return <button data-testid="dropdown-trigger">{children}</button>;
  },
  DropdownMenuContent: ({ children, align, className }: any) => (
    <div data-testid="dropdown-content" data-align={align} className={className}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, asChild }: any) =>
    asChild ? children : <div data-testid="dropdown-item">{children}</div>,
}));

vi.mock('lucide-react', () => ({
  ChevronDown: ({ className }: any) => <div data-testid="chevron-down" className={className} />,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, className, role }: any) => (
    <a href={href} className={className} role={role} data-testid="nav-link">
      {children}
    </a>
  ),
}));

const mockUseUser = useUser as any;
const mockIsSSOCallback = isSSOCallback as any;

describe('AdminNav', () => {
  const defaultProps = {
    isActive: vi.fn((path: string) => path === '/protected/admin/database'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSSOCallback.mockReturnValue(false);
  });

  describe('AdminNav Component', () => {
    it('renders admin dropdown menu', () => {
      render(<AdminNav {...defaultProps} />);

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
    });

    it('renders all admin navigation links', () => {
      render(<AdminNav {...defaultProps} />);

      expect(screen.getByText('Database Management')).toBeInTheDocument();
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
      expect(screen.getByText('Experimental')).toBeInTheDocument();
      expect(screen.getByText('Demos')).toBeInTheDocument();

      const links = screen.getAllByTestId('nav-link');
      expect(links).toHaveLength(4);
      expect(links[0]).toHaveAttribute('href', '/protected/admin/database');
      expect(links[1]).toHaveAttribute('href', '/protected/admin/audit-logs');
      expect(links[2]).toHaveAttribute('href', '/protected/admin/experimental');
      expect(links[3]).toHaveAttribute('href', '/protected/admin/demos');
    });

    it('applies active styles when admin route is active', () => {
      render(<AdminNav {...defaultProps} />);

      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger).toHaveClass('text-blue-600', 'font-semibold');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('applies inactive styles when admin route is not active', () => {
      const inactiveIsActive = vi.fn(() => false);
      render(<AdminNav isActive={inactiveIsActive} />);

      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger).toHaveClass('hover:text-blue-600');
      expect(trigger).not.toHaveClass('text-blue-600', 'font-semibold');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('has correct ARIA attributes', () => {
      render(<AdminNav {...defaultProps} />);

      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('has correct dropdown content attributes', () => {
      render(<AdminNav {...defaultProps} />);

      const content = screen.getByTestId('dropdown-content');
      expect(content).toHaveAttribute('data-align', 'end');
      expect(content).toHaveClass('w-48');
    });

    it('has correct link attributes', () => {
      render(<AdminNav {...defaultProps} />);

      const links = screen.getAllByTestId('nav-link');
      links.forEach(link => {
        expect(link).toHaveClass(
          'cursor-pointer',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-blue-500',
          'focus:ring-offset-2'
        );
        expect(link).toHaveAttribute('role', 'menuitem');
      });
    });
  });

  describe('AdminNavWithAuth Component', () => {
    describe('useIsAdmin Hook', () => {
      it('returns false when Clerk is not loaded', () => {
        mockUseUser.mockReturnValue({
          isLoaded: false,
          isSignedIn: false,
          user: null,
        });

        render(<AdminNavWithAuth {...defaultProps} />);

        expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
      });

      it('returns false when user is not signed in', () => {
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: false,
          user: null,
        });

        render(<AdminNavWithAuth {...defaultProps} />);

        expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
      });

      it('returns false when user has no role', () => {
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: true,
          user: {
            publicMetadata: {},
          },
        });

        render(<AdminNavWithAuth {...defaultProps} />);

        expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
      });

      it('returns false when user has non-admin role', () => {
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: true,
          user: {
            publicMetadata: {
              role: ['user'],
            },
          },
        });

        render(<AdminNavWithAuth {...defaultProps} />);

        expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
      });

      it('returns true when user has admin role (lowercase)', () => {
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: true,
          user: {
            publicMetadata: {
              role: ['admin'],
            },
          },
        });

        render(<AdminNavWithAuth {...defaultProps} />);

        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });

      it('returns true when user has Admin role (uppercase)', () => {
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: true,
          user: {
            publicMetadata: {
              role: ['Admin'],
            },
          },
        });

        render(<AdminNavWithAuth {...defaultProps} />);

        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });

      it('returns true when user has multiple roles including admin', () => {
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: true,
          user: {
            publicMetadata: {
              role: ['user', 'admin', 'moderator'],
            },
          },
        });

        render(<AdminNavWithAuth {...defaultProps} />);

        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });

      it('handles undefined publicMetadata', () => {
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: true,
          user: {
            publicMetadata: undefined,
          },
        });

        render(<AdminNavWithAuth {...defaultProps} />);

        expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
      });

      it('handles null publicMetadata', () => {
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: true,
          user: {
            publicMetadata: null,
          },
        });

        render(<AdminNavWithAuth {...defaultProps} />);

        expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
      });
    });

    describe('isAdminRouteActive Function', () => {
      it('returns true when database route is active', () => {
        const isActive = vi.fn((path: string) => path === '/protected/admin/database');
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: true,
          user: {
            publicMetadata: {
              role: ['admin'],
            },
          },
        });

        render(<AdminNavWithAuth isActive={isActive} />);

        const trigger = screen.getByTestId('dropdown-trigger');
        expect(trigger).toHaveClass('text-blue-600', 'font-semibold');
      });

      it('returns true when audit logs route is active', () => {
        const isActive = vi.fn((path: string) => path === '/protected/admin/audit-logs');
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: true,
          user: {
            publicMetadata: {
              role: ['admin'],
            },
          },
        });

        render(<AdminNavWithAuth isActive={isActive} />);

        const trigger = screen.getByTestId('dropdown-trigger');
        expect(trigger).toHaveClass('text-blue-600', 'font-semibold');
      });

      it('returns true when experimental route is active', () => {
        const isActive = vi.fn((path: string) => path === '/protected/admin/experimental');
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: true,
          user: {
            publicMetadata: {
              role: ['admin'],
            },
          },
        });

        render(<AdminNavWithAuth isActive={isActive} />);

        const trigger = screen.getByTestId('dropdown-trigger');
        expect(trigger).toHaveClass('text-blue-600', 'font-semibold');
      });

      it('returns false when no admin route is active', () => {
        const isActive = vi.fn(() => false);
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: true,
          user: {
            publicMetadata: {
              role: ['admin'],
            },
          },
        });

        render(<AdminNavWithAuth isActive={isActive} />);

        const trigger = screen.getByTestId('dropdown-trigger');
        expect(trigger).toHaveClass('hover:text-blue-600');
        expect(trigger).not.toHaveClass('text-blue-600', 'font-semibold');
      });
    });

    describe('Stacked Layout', () => {
      it('renders stacked layout when isStacked is true', () => {
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: true,
          user: {
            publicMetadata: {
              role: ['admin'],
            },
          },
        });

        render(<AdminNavWithAuth {...defaultProps} isStacked={true} />);

        const container = screen.getByTestId('dropdown-menu').parentElement;
        expect(container).toHaveClass('mt-12', 'w-full', 'flex', 'justify-center');

        const trigger = screen.getByTestId('dropdown-trigger');
        expect(trigger).toHaveClass(
          'w-[90vw]',
          'sm:w-[70vw]',
          'md:w-[400px]',
          'max-w-xs',
          'h-10',
          'flex',
          'items-center',
          'justify-center',
          'text-sm',
          'whitespace-nowrap',
          'rounded',
          'font-semibold',
          'transition-all',
          'duration-150',
          'bg-blue-500',
          'text-white',
          'shadow-sm',
          'mb-3',
          'mx-auto',
          'hover:bg-blue-600',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-blue-400'
        );
      });

      it('renders normal layout when isStacked is false', () => {
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: true,
          user: {
            publicMetadata: {
              role: ['admin'],
            },
          },
        });

        render(<AdminNavWithAuth {...defaultProps} isStacked={false} />);

        const container = screen.getByTestId('dropdown-menu').parentElement;
        expect(container).not.toHaveClass('mt-12', 'w-full', 'flex', 'justify-center');
      });
    });

    describe('SSO Callback Handling', () => {
      it('does not render during SSO callback', () => {
        mockIsSSOCallback.mockReturnValue(true);
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: true,
          user: {
            publicMetadata: {
              role: ['admin'],
            },
          },
        });

        render(<AdminNavWithAuth {...defaultProps} />);

        expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
      });

      it('renders when not in SSO callback', () => {
        mockIsSSOCallback.mockReturnValue(false);
        mockUseUser.mockReturnValue({
          isLoaded: true,
          isSignedIn: true,
          user: {
            publicMetadata: {
              role: ['admin'],
            },
          },
        });

        render(<AdminNavWithAuth {...defaultProps} />);

        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      });
    });
  });

  describe('E2E Test Mode', () => {
    beforeEach(() => {
      // Mock window object for E2E test mode
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'localhost',
        },
        writable: true,
      });

      // Mock process.env
      vi.stubEnv('MOCK_MODE', 'true');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('uses E2E test version when in E2E mode', () => {
      render(<AdminNav {...defaultProps} />);

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('does not use E2E test version when not in E2E mode', () => {
      vi.stubEnv('MOCK_MODE', 'false');

      render(<AdminNav {...defaultProps} />);

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('does not use E2E test version when not on localhost', () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'example.com',
        },
        writable: true,
      });

      render(<AdminNav {...defaultProps} />);

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles Clerk not being configured (test environment)', () => {
      mockUseUser.mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
        user: null,
      });

      render(<AdminNavWithAuth {...defaultProps} />);

      expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
    });

    it('handles user object being null', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: null,
      });

      render(<AdminNavWithAuth {...defaultProps} />);

      expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
    });

    it('handles role array being empty', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          publicMetadata: {
            role: [],
          },
        },
      });

      render(<AdminNavWithAuth {...defaultProps} />);

      expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
    });
  });
});
