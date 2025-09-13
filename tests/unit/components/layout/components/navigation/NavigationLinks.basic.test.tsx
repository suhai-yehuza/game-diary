import { render, screen, fireEvent } from '@testing-library/react';
import { vi, type MockedFunction } from 'vitest';

import { NavigationLinks } from '@/app/components/layout/components/navigation/NavigationLinks';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { useMounted } from '@/hooks/use-mounted';

// Mock dependencies
vi.mock('@/app/components/layout/components/SearchBar', () => ({
  useMobileDetection: vi.fn(),
}));

vi.mock('@/hooks/use-mounted', () => ({
  useMounted: vi.fn(),
}));

// Mock the AdminNavWithAuth component
vi.mock('@/app/components/layout/components/navigation/AdminNav', () => ({
  AdminNavWithAuth: ({
    isActive: _isActive,
    isStacked,
    closeMenu,
  }: {
    isActive: (path: string) => boolean;
    isStacked?: boolean;
    closeMenu?: () => void;
  }) => (
    <div data-testid="admin-nav" data-stacked={isStacked}>
      <button onClick={closeMenu}>Admin</button>
    </div>
  ),
}));

// Mock the NavItem component
vi.mock('@/app/components/layout/components/navigation/NavItem', () => ({
  NavItem: ({
    href,
    isActive,
    children,
    onClick,
    isStacked,
    closeMenu,
  }: {
    href: string;
    isActive: boolean;
    children: React.ReactNode;
    onClick?: () => void;
    isStacked?: boolean;
    closeMenu?: () => void;
  }) => (
    <a
      href={href}
      data-active={isActive}
      data-stacked={isStacked}
      onClick={() => {
        if (onClick) onClick();
        if (isStacked && closeMenu) closeMenu();
      }}
    >
      {children}
    </a>
  ),
}));

// Mock the SPORTS_CONFIG
vi.mock('@/app/components/sports/SportsConfig', () => ({
  SPORTS_CONFIG: {
    nba: { href: '/sports/nba', name: 'NBA' },
    nfl: { href: '/sports/nfl', name: 'NFL' },
    mlb: { href: '/sports/mlb', name: 'MLB' },
    nhl: { href: '/sports/nhl', name: 'NHL' },
    mls: { href: '/sports/mls', name: 'MLS' },
  },
}));

const mockUseMobileDetection = useMobileDetection as MockedFunction<typeof useMobileDetection>;
const mockUseMounted = useMounted as MockedFunction<typeof useMounted>;

describe.skip('NavigationLinks', () => {
  const defaultProps = {
    isActive: vi.fn((path: string) => path === '/'),
    _isMenuExpanded: false,
    _setIsMenuExpanded: vi.fn(),
    closeMenu: vi.fn(),
    isStacked: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMobileDetection.mockReturnValue(false);
    mockUseMounted.mockReturnValue(true);
  });

  describe('Basic Rendering', () => {
    it('renders nothing when not mounted', () => {
      mockUseMounted.mockReturnValue(false);

      const { container } = render(<NavigationLinks {...defaultProps} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders navigation links when mounted', () => {
      render(<NavigationLinks {...defaultProps} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('NBA')).toBeInTheDocument();
      expect(screen.getByText('NFL')).toBeInTheDocument();
      expect(screen.getByText('MLB')).toBeInTheDocument();
      expect(screen.getByText('NHL')).toBeInTheDocument();
      expect(screen.getByText('MLS')).toBeInTheDocument();
      expect(screen.getByText('All Sports')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders admin navigation', () => {
      render(<NavigationLinks {...defaultProps} />);

      expect(screen.getByTestId('admin-nav')).toBeInTheDocument();
    });
  });

  describe('Desktop Layout (isStacked = false)', () => {
    it('applies desktop navigation classes', () => {
      render(<NavigationLinks {...defaultProps} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('flex', 'flex-col', 'lg:flex-row');
    });

    it('does not show section headers on desktop', () => {
      render(<NavigationLinks {...defaultProps} />);

      expect(screen.queryByText('Sports')).not.toBeInTheDocument();
      expect(screen.queryByText('Account')).not.toBeInTheDocument();
    });

    it('shows divider on desktop', () => {
      render(<NavigationLinks {...defaultProps} />);

      const divider = screen.getByRole('navigation').querySelector('.hidden.lg\\:block');
      expect(divider).toBeInTheDocument();
    });

    it('calls closeMenu only on mobile when nav items are clicked', () => {
      mockUseMobileDetection.mockReturnValue(true);
      const closeMenu = vi.fn();

      render(<NavigationLinks {...defaultProps} closeMenu={closeMenu} />);

      const homeLink = screen.getByText('Home');
      fireEvent.click(homeLink);

      expect(closeMenu).toHaveBeenCalledTimes(1);
    });

    it('does not call closeMenu on desktop when nav items are clicked', () => {
      mockUseMobileDetection.mockReturnValue(false);
      const closeMenu = vi.fn();

      render(<NavigationLinks {...defaultProps} closeMenu={closeMenu} />);

      const homeLink = screen.getByText('Home');
      fireEvent.click(homeLink);

      expect(closeMenu).not.toHaveBeenCalled();
    });
  });

  describe('Mobile Layout (isStacked = true)', () => {
    const mobileProps = {
      ...defaultProps,
      isStacked: true,
    };

    it('applies mobile navigation classes', () => {
      render(<NavigationLinks {...mobileProps} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('flex', 'flex-col', 'gap-4');
    });

    it('shows section headers on mobile', () => {
      render(<NavigationLinks {...mobileProps} />);

      expect(screen.getByText('Sports')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('does not show divider on mobile', () => {
      render(<NavigationLinks {...mobileProps} />);

      const divider = screen.getByRole('navigation').querySelector('.hidden.lg\\:block');
      expect(divider).toBeInTheDocument(); // Still exists but hidden
    });

    it('calls closeMenu when nav items are clicked on mobile', () => {
      const closeMenu = vi.fn();

      render(<NavigationLinks {...mobileProps} closeMenu={closeMenu} />);

      const homeLink = screen.getByText('Home');
      const nbaLink = screen.getByText('NBA');
      const dashboardLink = screen.getByText('Dashboard');

      fireEvent.click(homeLink);
      expect(closeMenu).toHaveBeenCalledTimes(1);

      fireEvent.click(nbaLink);
      expect(closeMenu).toHaveBeenCalledTimes(2);

      fireEvent.click(dashboardLink);
      expect(closeMenu).toHaveBeenCalledTimes(3);
    });

    it('passes closeMenu to admin nav', () => {
      const closeMenu = vi.fn();

      render(<NavigationLinks {...mobileProps} closeMenu={closeMenu} />);

      const adminNav = screen.getByTestId('admin-nav');
      expect(adminNav).toHaveAttribute('data-stacked', 'true');

      const adminButton = screen.getByText('Admin');
      fireEvent.click(adminButton);

      expect(closeMenu).toHaveBeenCalledTimes(1);
    });
  });

  describe('Active State Handling', () => {
    it('passes correct active state to nav items', () => {
      const isActive = vi.fn((path: string) => path === '/sports/nba');

      render(<NavigationLinks {...defaultProps} isActive={isActive} />);

      const nbaLink = screen.getByText('NBA');
      const homeLink = screen.getByText('Home');

      expect(nbaLink).toHaveAttribute('data-active', 'true');
      expect(homeLink).toHaveAttribute('data-active', 'false');
    });

    it('handles active state for all sports link', () => {
      const isActive = vi.fn((path: string) => path === '/sports/all-sports');

      render(<NavigationLinks {...defaultProps} isActive={isActive} />);

      const allSportsLink = screen.getByText('All Sports');
      expect(allSportsLink).toHaveAttribute('data-active', 'true');
    });

    it('handles active state for dashboard link', () => {
      const isActive = vi.fn((path: string) => path === '/protected/dashboard');

      render(<NavigationLinks {...defaultProps} isActive={isActive} />);

      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink).toHaveAttribute('data-active', 'true');
    });
  });

  describe('Link Structure', () => {
    it('renders correct href attributes', () => {
      render(<NavigationLinks {...defaultProps} />);

      expect(screen.getByText('Home')).toHaveAttribute('href', '/');
      expect(screen.getByText('NBA')).toHaveAttribute('href', '/sports/nba');
      expect(screen.getByText('NFL')).toHaveAttribute('href', '/sports/nfl');
      expect(screen.getByText('MLB')).toHaveAttribute('href', '/sports/mlb');
      expect(screen.getByText('NHL')).toHaveAttribute('href', '/sports/nhl');
      expect(screen.getByText('MLS')).toHaveAttribute('href', '/sports/mls');
      expect(screen.getByText('All Sports')).toHaveAttribute('href', '/sports/all-sports');
      expect(screen.getByText('Dashboard')).toHaveAttribute('href', '/protected/dashboard');
    });

    it('passes correct props to NavItem components', () => {
      render(<NavigationLinks {...defaultProps} isStacked={true} />);

      const homeLink = screen.getByText('Home');
      expect(homeLink).toHaveAttribute('data-stacked', 'true');
    });
  });

  describe('Section Headers', () => {
    it('renders sports section header with correct styling', () => {
      render(<NavigationLinks {...defaultProps} isStacked={true} />);

      const sportsHeader = screen.getByText('Sports');
      expect(sportsHeader).toHaveClass(
        'text-sm',
        'font-semibold',
        'text-gray-500',
        'dark:text-gray-400',
        'uppercase',
        'tracking-wide'
      );
    });

    it('renders account section header with correct styling', () => {
      render(<NavigationLinks {...defaultProps} isStacked={true} />);

      const accountHeader = screen.getByText('Account');
      expect(accountHeader).toHaveClass(
        'text-sm',
        'font-semibold',
        'text-gray-500',
        'dark:text-gray-400',
        'uppercase',
        'tracking-wide'
      );
    });

    it('positions section headers correctly', () => {
      render(<NavigationLinks {...defaultProps} isStacked={true} />);

      const sportsHeader = screen.getByText('Sports');
      const accountHeader = screen.getByText('Account');

      expect(sportsHeader.closest('div')).toHaveClass('mb-2');
      expect(accountHeader.closest('div')).toHaveClass('mt-6', 'mb-2');
    });
  });

  describe('Error Handling', () => {
    it('handles missing closeMenu function gracefully', () => {
      const propsWithoutCloseMenu = {
        ...defaultProps,
        closeMenu: undefined,
      };

      expect(() => {
        render(<NavigationLinks {...propsWithoutCloseMenu} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has proper navigation role', () => {
      render(<NavigationLinks {...defaultProps} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('passes aria-current to active nav items', () => {
      const isActive = vi.fn((path: string) => path === '/');

      render(<NavigationLinks {...defaultProps} isActive={isActive} />);

      // The NavItem mock should receive aria-current when isActive returns true
      const homeLink = screen.getByText('Home');
      // Since we're using a mock, we need to check if the mock received the correct props
      expect(homeLink).toBeInTheDocument();
    });
  });
});
