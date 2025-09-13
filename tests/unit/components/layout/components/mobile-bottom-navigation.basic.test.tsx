import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { vi, type MockedFunction } from 'vitest';

import { MobileBottomNavigation } from '@/app/components/layout/components/MobileBottomNavigation';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { useMenuContext } from '@/app/components/providers';

// Mock the dependencies
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

vi.mock('@/app/components/layout/components/SearchBar', () => ({
  useMobileDetection: vi.fn(),
}));

vi.mock('@/app/components/providers', () => ({
  useMenuContext: vi.fn(),
}));

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  Home: () => <div data-testid="home-icon">Home</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Menu: () => <div data-testid="menu-icon">Menu</div>,
}));

// Mock window.scrollY and navigator.vibrate
Object.defineProperty(window, 'scrollY', {
  value: 0,
  writable: true,
});

Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true,
});

const mockUsePathname = usePathname as MockedFunction<typeof usePathname>;
const mockUseMobileDetection = useMobileDetection as MockedFunction<typeof useMobileDetection>;
const mockUseMenuContext = useMenuContext as MockedFunction<typeof useMenuContext>;

describe.skip('MobileBottomNavigation', () => {
  const defaultProps = {
    pathname: '/',
    isMobile: true,
    isMenuExpanded: false,
    setIsMenuExpanded: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue(defaultProps.pathname);
    mockUseMobileDetection.mockReturnValue(defaultProps.isMobile);
    mockUseMenuContext.mockReturnValue({
      isMenuExpanded: defaultProps.isMenuExpanded,
      setIsMenuExpanded: defaultProps.setIsMenuExpanded,
    });
  });

  it('renders nothing when not on mobile', () => {
    mockUseMobileDetection.mockReturnValue(false);

    const { container } = render(<MobileBottomNavigation />);

    expect(container.firstChild).toBeNull();
  });

  it('renders navigation items when on mobile', () => {
    render(<MobileBottomNavigation />);

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
  });

  it('shows active state for current page', () => {
    mockUsePathname.mockReturnValue('/search');

    render(<MobileBottomNavigation />);

    const searchButton = screen.getByTestId('search-icon').closest('a');
    expect(searchButton).toHaveClass('text-brand-primary');
  });

  it('handles menu button click', () => {
    const setIsMenuExpanded = vi.fn();
    mockUseMenuContext.mockReturnValue({
      isMenuExpanded: false,
      setIsMenuExpanded,
    });

    render(<MobileBottomNavigation />);

    const menuButton = screen.getByTestId('menu-icon').closest('button');
    fireEvent.click(menuButton!);

    expect(setIsMenuExpanded).toHaveBeenCalledWith(true);
  });

  it('shows menu active state when menu is expanded', () => {
    mockUseMenuContext.mockReturnValue({
      isMenuExpanded: true,
      setIsMenuExpanded: vi.fn(),
    });

    render(<MobileBottomNavigation />);

    const menuButton = screen.getByTestId('menu-icon').closest('button');
    expect(menuButton).toHaveClass('text-brand-primary');
  });

  it('provides haptic feedback on touch', () => {
    const vibrateSpy = vi.spyOn(navigator, 'vibrate');

    render(<MobileBottomNavigation />);

    const homeButton = screen.getByTestId('home-icon').closest('a');
    fireEvent.click(homeButton!);

    expect(vibrateSpy).toHaveBeenCalledWith(10);
  });

  it('hides navigation when scrolling down', () => {
    // Mock scroll event
    Object.defineProperty(window, 'scrollY', {
      value: 200,
      writable: true,
    });

    render(<MobileBottomNavigation />);

    // Trigger scroll event
    fireEvent.scroll(window);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('translate-y-full');
  });

  it('shows navigation when scrolling up', () => {
    // Mock scroll event
    Object.defineProperty(window, 'scrollY', {
      value: 50,
      writable: true,
    });

    render(<MobileBottomNavigation />);

    // Trigger scroll event
    fireEvent.scroll(window);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('translate-y-0');
  });

  it('has proper accessibility attributes', () => {
    render(<MobileBottomNavigation />);

    const homeLink = screen.getByTestId('home-icon').closest('a');
    expect(homeLink).toHaveAttribute('aria-label', 'Home');
    expect(homeLink).toHaveAttribute('aria-current', 'page');

    const menuButton = screen.getByTestId('menu-icon').closest('button');
    expect(menuButton).toHaveAttribute('aria-label', 'Menu');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('has proper touch targets', () => {
    render(<MobileBottomNavigation />);

    const navItems = screen.getAllByRole('link').concat(screen.getAllByRole('button'));

    navItems.forEach(item => {
      expect(item).toHaveClass('min-h-[56px]');
      expect(item).toHaveClass('min-w-[56px]');
    });
  });

  it('applies safe area padding', () => {
    render(<MobileBottomNavigation />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveStyle({ paddingBottom: 'env(safe-area-inset-bottom)' });
  });

  it('handles different pathname patterns correctly', () => {
    mockUsePathname.mockReturnValue('/protected/dashboard');

    render(<MobileBottomNavigation />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('text-brand-primary');
  });

  it('handles root path correctly', () => {
    mockUsePathname.mockReturnValue('/');

    render(<MobileBottomNavigation />);

    const homeLink = screen.getByTestId('home-icon').closest('a');
    expect(homeLink).toHaveClass('text-brand-primary');
  });
});
