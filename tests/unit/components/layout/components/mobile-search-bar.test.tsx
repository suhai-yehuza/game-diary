import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { vi, type MockedFunction } from 'vitest';

import { MobileSearchBar } from '@/app/components/layout/components/MobileSearchBar';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';

// Mock the dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('@/app/components/layout/components/SearchBar', () => ({
  useMobileDetection: vi.fn(),
}));

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  X: () => <div data-testid="clear-icon">X</div>,
}));

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as MockedFunction<typeof useSearchParams>;
const mockUseMobileDetection = useMobileDetection as MockedFunction<typeof useMobileDetection>;

describe('MobileSearchBar', () => {
  const defaultProps = {
    isMobile: true,
    router: {
      push: vi.fn(),
    },
    searchParams: new URLSearchParams(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMobileDetection.mockReturnValue(defaultProps.isMobile);
    mockUseRouter.mockReturnValue(defaultProps.router as any);
    mockUseSearchParams.mockReturnValue(defaultProps.searchParams as any);
  });

  it('renders nothing when not on mobile', () => {
    mockUseMobileDetection.mockReturnValue(false);

    const { container } = render(<MobileSearchBar />);

    expect(container.firstChild).toBeNull();
  });

  it('renders search button when collapsed', () => {
    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    expect(searchButton).toBeInTheDocument();
    expect(searchButton).toHaveClass('rounded-full');
  });

  it('expands search bar when search button is clicked', () => {
    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('renders search input with proper attributes', () => {
    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveAttribute('placeholder', 'Search games, teams, players...');
    expect(searchInput).toHaveAttribute('autocomplete', 'off');
    expect(searchInput).toHaveAttribute('spellcheck', 'false');
  });

  it('handles search input changes', () => {
    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(searchInput).toHaveValue('test query');
  });

  it('shows clear button when search input has value', () => {
    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
  });

  it('clears search input when clear button is clicked', () => {
    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  it('submits search form', () => {
    const push = vi.fn();
    mockUseRouter.mockReturnValue({ push } as any);

    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    const form = screen.getByRole('searchbox').closest('form');
    fireEvent.submit(form!);

    expect(push).toHaveBeenCalledWith('/search?q=test+query');
  });

  it('does not submit empty search', () => {
    const push = vi.fn();
    mockUseRouter.mockReturnValue({ push } as any);

    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    const form = screen.getByRole('searchbox').closest('form');
    fireEvent.submit(form!);

    expect(push).not.toHaveBeenCalled();
  });

  it('closes search bar when cancel is clicked', () => {
    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open search/i })).toBeInTheDocument();
  });

  it('closes search bar on escape key', async () => {
    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    });
  });

  it('initializes search query from URL params', () => {
    const searchParams = new URLSearchParams('?q=initial+query');
    mockUseSearchParams.mockReturnValue(searchParams as any);

    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveValue('initial query');
  });

  it('auto-focuses search input when expanded', () => {
    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    const searchInput = screen.getByRole('searchbox');
    expect(document.activeElement).toBe(searchInput);
  });

  it('renders backdrop when expanded', () => {
    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    const backdrop = screen.getByRole('searchbox').closest('.fixed');
    expect(backdrop).toHaveClass('bg-black/50', 'backdrop-blur-sm');
  });

  it('has proper accessibility attributes', () => {
    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    expect(searchButton).toHaveAttribute('aria-label', 'Open search');

    fireEvent.click(searchButton);

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveAttribute('type', 'search');
  });

  it('disables search button when query is empty', () => {
    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    const submitButton = screen.getByRole('button', { name: /^search$/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables search button when query has content', () => {
    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const submitButton = screen.getByRole('button', { name: /^search$/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('applies proper styling classes', () => {
    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveClass(
      'flex-1',
      'bg-transparent',
      'border-none',
      'outline-none',
      'text-base'
    );
  });

  it('handles search with existing URL params', () => {
    const searchParams = new URLSearchParams('?existing=param');
    mockUseSearchParams.mockReturnValue(searchParams as any);

    const push = vi.fn();
    mockUseRouter.mockReturnValue({ push } as any);

    render(<MobileSearchBar />);

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'new query' } });

    const form = screen.getByRole('searchbox').closest('form');
    fireEvent.submit(form!);

    expect(push).toHaveBeenCalledWith('/search?existing=param&q=new+query');
  });
});
