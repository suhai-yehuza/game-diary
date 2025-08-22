import { render, screen, fireEvent } from '@testing-library/react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Menu, X } from 'lucide-react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TABLET_BREAKPOINT } from '@/app/components/layout/components/breakpoints';
import { NavigationContainer } from '@/app/components/layout/components/NavigationContainer';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';

// Mock the dependencies
vi.mock('@/app/components/layout/components/SearchBar', () => ({
  useMobileDetection: vi.fn(),
}));

vi.mock('@/app/components/layout/components/navigation/ClientOnlyNavigationLinks', () => ({
  ClientOnlyNavigationLinks: ({
    isActive,
    _isMenuExpanded,
    _setIsMenuExpanded,
    closeMenu,
    isStacked,
  }: any) => (
    <div data-testid="client-only-navigation-links">
      <div data-testid="is-active">{isActive('/test') ? 'active' : 'inactive'}</div>
      <div data-testid="is-menu-expanded">{_isMenuExpanded ? 'expanded' : 'collapsed'}</div>
      <div data-testid="is-stacked">{isStacked ? 'stacked' : 'not-stacked'}</div>
      {closeMenu && (
        <button onClick={closeMenu} data-testid="close-menu">
          Close
        </button>
      )}
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  Menu: ({ className, ...props }: any) => (
    <div data-testid="menu-icon" className={className} {...props} />
  ),
  X: ({ className, ...props }: any) => (
    <div data-testid="x-icon" className={className} {...props} />
  ),
}));

const mockUseMobileDetection = useMobileDetection as any;

describe('NavigationContainer', () => {
  const defaultProps = {
    isMenuExpanded: false,
    isActive: vi.fn((path: string) => path === '/test'),
    setIsMenuExpanded: vi.fn(),
    closeMenu: vi.fn(),
    isStacked: false,
    onMenuToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMobileDetection.mockReturnValue(false);
  });

  describe('Basic Rendering', () => {
    it('renders navigation container with mobile menu button', () => {
      render(<NavigationContainer {...defaultProps} />);

      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('renders desktop navigation links when not compact viewport', () => {
      mockUseMobileDetection.mockReturnValue(false);
      render(<NavigationContainer {...defaultProps} />);

      expect(screen.getByTestId('client-only-navigation-links')).toBeInTheDocument();
      expect(screen.getByTestId('is-active')).toHaveTextContent('active');
      expect(screen.getByTestId('is-menu-expanded')).toHaveTextContent('collapsed');
      expect(screen.getByTestId('is-stacked')).toHaveTextContent('not-stacked');
    });

    it('does not render mobile overlay when menu is not expanded', () => {
      render(<NavigationContainer {...defaultProps} />);

      expect(screen.queryByTestId('mobile-menu-overlay')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Menu Button', () => {
    it('shows menu icon when menu is collapsed', () => {
      render(<NavigationContainer {...defaultProps} />);

      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('shows X icon when menu is expanded', () => {
      render(<NavigationContainer {...defaultProps} isMenuExpanded={true} />);

      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('menu-icon')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
    });

    it('calls onMenuToggle when mobile menu button is clicked', () => {
      render(<NavigationContainer {...defaultProps} />);

      fireEvent.click(screen.getByTestId('mobile-menu-button'));
      expect(defaultProps.onMenuToggle).toHaveBeenCalledTimes(1);
    });

    it('applies correct styles when menu is expanded', () => {
      render(<NavigationContainer {...defaultProps} isMenuExpanded={true} />);

      const button = screen.getByTestId('mobile-menu-button');
      expect(button).toHaveClass(
        'fixed',
        'top-4',
        'left-4',
        'bg-neutral-50/90',
        'border',
        'border-neutral-200',
        'shadow-lg'
      );
    });

    it('applies correct styles when menu is collapsed', () => {
      render(<NavigationContainer {...defaultProps} />);

      const button = screen.getByTestId('mobile-menu-button');
      expect(button).toHaveClass('mr-4', 'relative');
      expect(button).not.toHaveClass('fixed', 'top-4', 'left-4');
    });
  });

  describe('Mobile Overlay', () => {
    it('renders mobile overlay when menu is expanded and not compact viewport', () => {
      mockUseMobileDetection.mockReturnValue(false);
      render(<NavigationContainer {...defaultProps} isMenuExpanded={true} />);

      expect(screen.getByTestId('mobile-menu-overlay')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('does not render mobile overlay when menu is expanded but compact viewport', () => {
      mockUseMobileDetection.mockReturnValue(true);
      render(<NavigationContainer {...defaultProps} isMenuExpanded={true} />);

      expect(screen.queryByTestId('mobile-menu-overlay')).not.toBeInTheDocument();
    });

    it('renders navigation links in overlay with correct props', () => {
      mockUseMobileDetection.mockReturnValue(false);
      render(<NavigationContainer {...defaultProps} isMenuExpanded={true} isStacked={true} />);

      const navigationLinks = screen.getAllByTestId('client-only-navigation-links');
      expect(navigationLinks).toHaveLength(2); // One for desktop, one for overlay

      // Check the overlay navigation links (second one)
      const overlayLinks = navigationLinks[1];
      expect(overlayLinks.querySelector('[data-testid="is-menu-expanded"]')).toHaveTextContent(
        'expanded'
      );
      expect(overlayLinks.querySelector('[data-testid="is-stacked"]')).toHaveTextContent('stacked');
    });

    it('includes close menu button in overlay when closeMenu is provided', () => {
      mockUseMobileDetection.mockReturnValue(false);
      render(<NavigationContainer {...defaultProps} isMenuExpanded={true} />);

      const closeButton = screen.getByTestId('close-menu');
      expect(closeButton).toBeInTheDocument();

      fireEvent.click(closeButton);
      expect(defaultProps.closeMenu).toHaveBeenCalledTimes(1);
    });
  });

  describe('Focus Management', () => {
    it('sets up focus trap when menu is expanded and not compact viewport', () => {
      mockUseMobileDetection.mockReturnValue(false);
      const { container: _container } = render(
        <NavigationContainer {...defaultProps} isMenuExpanded={true} />
      );

      const overlay = screen.getByTestId('mobile-menu-overlay');
      expect(overlay).toHaveAttribute('tabIndex', '-1');
    });

    it('does not set up focus trap when menu is collapsed', () => {
      mockUseMobileDetection.mockReturnValue(false);
      render(<NavigationContainer {...defaultProps} />);

      expect(screen.queryByTestId('mobile-menu-overlay')).not.toBeInTheDocument();
    });

    it('does not set up focus trap when compact viewport', () => {
      mockUseMobileDetection.mockReturnValue(true);
      render(<NavigationContainer {...defaultProps} isMenuExpanded={true} />);

      expect(screen.queryByTestId('mobile-menu-overlay')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('hides desktop navigation on compact viewports', () => {
      mockUseMobileDetection.mockReturnValue(true);
      render(<NavigationContainer {...defaultProps} />);

      const desktopNav = screen.getByTestId('client-only-navigation-links');
      expect(desktopNav.parentElement).toHaveClass('hidden', 'lg:flex');
    });

    it('shows desktop navigation on large viewports', () => {
      mockUseMobileDetection.mockReturnValue(false);
      render(<NavigationContainer {...defaultProps} />);

      const desktopNav = screen.getByTestId('client-only-navigation-links');
      expect(desktopNav.parentElement).toHaveClass('hidden', 'lg:flex');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes on mobile menu button', () => {
      render(<NavigationContainer {...defaultProps} />);

      const button = screen.getByTestId('mobile-menu-button');
      expect(button).toHaveAttribute('aria-label', 'Open menu');
    });

    it('has correct ARIA attributes on mobile menu button when expanded', () => {
      render(<NavigationContainer {...defaultProps} isMenuExpanded={true} />);

      const button = screen.getByTestId('mobile-menu-button');
      expect(button).toHaveAttribute('aria-label', 'Close menu');
    });

    it('has correct ARIA attributes on mobile overlay', () => {
      mockUseMobileDetection.mockReturnValue(false);
      render(<NavigationContainer {...defaultProps} isMenuExpanded={true} />);

      const overlay = screen.getByTestId('mobile-menu-overlay');
      expect(overlay).toHaveAttribute('role', 'dialog');
      expect(overlay).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined closeMenu function', () => {
      mockUseMobileDetection.mockReturnValue(false);
      render(
        <NavigationContainer {...defaultProps} closeMenu={undefined as any} isMenuExpanded={true} />
      );

      expect(screen.queryByTestId('close-menu')).not.toBeInTheDocument();
    });

    it('handles different isActive function results', () => {
      const customIsActive = vi.fn((path: string) => path === '/custom');
      render(<NavigationContainer {...defaultProps} isActive={customIsActive} />);

      expect(screen.getByTestId('is-active')).toHaveTextContent('inactive');
    });
  });
});
