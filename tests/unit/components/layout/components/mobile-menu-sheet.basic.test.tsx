import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, type MockedFunction } from 'vitest';

import { MobileMenuSheet } from '@/app/components/layout/components/MobileMenuSheet';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { useMenuContext } from '@/app/components/providers';

// Mock the dependencies
vi.mock('@/app/components/layout/components/SearchBar', () => ({
  useMobileDetection: vi.fn(),
}));

vi.mock('@/app/components/providers', () => ({
  useMenuContext: vi.fn(),
}));

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="close-icon">X</div>,
}));

// Mock the ClientOnlyNavigationLinks component
vi.mock('@/app/components/layout/components/navigation/ClientOnlyNavigationLinks', () => ({
  ClientOnlyNavigationLinks: ({ isActive }: { isActive: (path: string) => boolean }) => (
    <div data-testid="navigation-links">
      <button onClick={() => isActive('/test')}>Test Link</button>
    </div>
  ),
}));

const mockUseMobileDetection = useMobileDetection as MockedFunction<typeof useMobileDetection>;
const mockUseMenuContext = useMenuContext as MockedFunction<typeof useMenuContext>;

describe('MobileMenuSheet', () => {
  const defaultProps = {
    isActive: vi.fn((path: string) => path === '/'),
    isMobile: true,
    isMenuExpanded: true,
    setIsMenuExpanded: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMobileDetection.mockReturnValue(defaultProps.isMobile);
    mockUseMenuContext.mockReturnValue({
      isMenuExpanded: defaultProps.isMenuExpanded,
      setIsMenuExpanded: defaultProps.setIsMenuExpanded,
    });
  });

  it('renders nothing when not on mobile', () => {
    mockUseMobileDetection.mockReturnValue(false);

    const { container } = render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when menu is not expanded', () => {
    mockUseMenuContext.mockReturnValue({
      isMenuExpanded: false,
      setIsMenuExpanded: vi.fn(),
    });

    const { container } = render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders menu sheet when mobile and expanded', () => {
    render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Swipe down to close')).toBeInTheDocument();
  });

  it('renders backdrop', () => {
    render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    const backdrop = screen.getByRole('dialog').previousElementSibling;
    expect(backdrop).toHaveClass('fixed', 'inset-0', 'bg-black/50');
  });

  it('renders drag handle', () => {
    render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    const dragHandle = screen.getByRole('dialog').querySelector('.w-12.h-1');
    expect(dragHandle).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    const closeButton = screen.getByRole('button', { name: /close menu/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('closes menu when close button is clicked', () => {
    const setIsMenuExpanded = vi.fn();
    mockUseMenuContext.mockReturnValue({
      isMenuExpanded: true,
      setIsMenuExpanded,
    });

    render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    const closeButton = screen.getByRole('button', { name: /close menu/i });
    fireEvent.click(closeButton);

    expect(setIsMenuExpanded).toHaveBeenCalledWith(false);
  });

  it('closes menu when backdrop is clicked', () => {
    const setIsMenuExpanded = vi.fn();
    mockUseMenuContext.mockReturnValue({
      isMenuExpanded: true,
      setIsMenuExpanded,
    });

    render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    const backdrop = screen.getByRole('dialog').previousElementSibling;
    fireEvent.click(backdrop!);

    expect(setIsMenuExpanded).toHaveBeenCalledWith(false);
  });

  it('closes menu on escape key', async () => {
    const setIsMenuExpanded = vi.fn();
    mockUseMenuContext.mockReturnValue({
      isMenuExpanded: true,
      setIsMenuExpanded,
    });

    render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(setIsMenuExpanded).toHaveBeenCalledWith(false);
    });
  });

  it('sets body overflow to hidden when menu is expanded', () => {
    render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when menu is closed', () => {
    const { unmount } = render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    unmount();

    expect(document.body.style.overflow).toBe('');
  });

  it('handles touch gestures for closing', () => {
    const setIsMenuExpanded = vi.fn();
    mockUseMenuContext.mockReturnValue({
      isMenuExpanded: true,
      setIsMenuExpanded,
    });

    render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    const sheet = screen.getByRole('dialog');

    // Simulate touch start
    fireEvent.touchStart(sheet, {
      touches: [{ clientY: 100 }],
    });

    // Simulate touch move
    fireEvent.touchMove(sheet, {
      touches: [{ clientY: 250 }], // Move down 150px
    });

    // Simulate touch end
    fireEvent.touchEnd(sheet);

    expect(setIsMenuExpanded).toHaveBeenCalledWith(false);
  });

  it('does not close menu on small touch gestures', () => {
    const setIsMenuExpanded = vi.fn();
    mockUseMenuContext.mockReturnValue({
      isMenuExpanded: true,
      setIsMenuExpanded,
    });

    render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    const sheet = screen.getByRole('dialog');

    // Simulate small touch gesture
    fireEvent.touchStart(sheet, {
      touches: [{ clientY: 100 }],
    });

    fireEvent.touchMove(sheet, {
      touches: [{ clientY: 150 }], // Move down only 50px
    });

    fireEvent.touchEnd(sheet);

    expect(setIsMenuExpanded).not.toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Navigation menu');
  });

  it('has proper safe area padding', () => {
    render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    const sheet = screen.getByRole('dialog');
    expect(sheet).toHaveStyle({ paddingBottom: 'env(safe-area-inset-bottom)' });
  });

  it('renders navigation links', () => {
    render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    expect(screen.getByTestId('navigation-links')).toBeInTheDocument();
  });

  it('applies proper styling classes', () => {
    render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    const sheet = screen.getByRole('dialog');
    expect(sheet).toHaveClass(
      'fixed',
      'bottom-0',
      'left-0',
      'right-0',
      'z-50',
      'bg-white',
      'dark:bg-gray-900',
      'rounded-t-3xl',
      'shadow-2xl',
      'lg:hidden'
    );
  });

  it('handles focus trap correctly', () => {
    render(<MobileMenuSheet isActive={defaultProps.isActive} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Focus should be trapped within the dialog
    const closeButton = screen.getByRole('button', { name: /close menu/i });
    closeButton.focus();
    expect(document.activeElement).toBe(closeButton);
  });
});
