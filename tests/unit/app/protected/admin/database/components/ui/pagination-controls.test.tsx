import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PaginationControls } from '@src/app/protected/admin/database/components/ui/pagination-controls';

describe('PaginationControls', () => {
  const defaultProps = {
    totalCount: 100,
    currentPage: 1,
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: true,
    },
    loading: false,
    onFirst: vi.fn(),
    onPrev: vi.fn(),
    onNext: vi.fn(),
    onLast: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all navigation buttons', () => {
    render(<PaginationControls {...defaultProps} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Last')).toBeInTheDocument();
  });

  it('displays current page number', () => {
    render(<PaginationControls {...defaultProps} currentPage={3} />);

    expect(screen.getByText('Page 3')).toBeInTheDocument();
  });

  it('disables Previous and First buttons when hasPreviousPage is false', () => {
    render(
      <PaginationControls
        {...defaultProps}
        pageInfo={{ hasPreviousPage: false, hasNextPage: true }}
      />
    );

    const firstButton = screen.getByText('First').closest('button');
    const prevButton = screen.getByText('Previous').closest('button');

    expect(firstButton).toBeDisabled();
    expect(prevButton).toBeDisabled();
  });

  it('disables Next and Last buttons when hasNextPage is false', () => {
    render(
      <PaginationControls
        {...defaultProps}
        pageInfo={{ hasPreviousPage: true, hasNextPage: false }}
      />
    );

    const nextButton = screen.getByText('Next').closest('button');
    const lastButton = screen.getByText('Last').closest('button');

    expect(nextButton).toBeDisabled();
    expect(lastButton).toBeDisabled();
  });

  it('disables all buttons when loading is true', () => {
    render(<PaginationControls {...defaultProps} loading={true} />);

    const firstButton = screen.getByText('First').closest('button');
    const prevButton = screen.getByText('Previous').closest('button');
    const nextButton = screen.getByText('Next').closest('button');
    const lastButton = screen.getByText('Last').closest('button');

    expect(firstButton).toBeDisabled();
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
    expect(lastButton).toBeDisabled();
  });

  it('does not render when totalCount is 0', () => {
    const { container } = render(<PaginationControls {...defaultProps} totalCount={0} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders with correct CSS classes', () => {
    const { container } = render(<PaginationControls {...defaultProps} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center', 'space-x-2', 'mt-4');
  });

  it('renders page number with correct styling', () => {
    render(<PaginationControls {...defaultProps} currentPage={5} />);

    const pageNumber = screen.getByText('Page 5');
    expect(pageNumber).toHaveClass('text-sm', 'font-medium', 'text-muted-foreground');
  });

  it('handles single page correctly', () => {
    render(
      <PaginationControls
        {...defaultProps}
        pageInfo={{ hasPreviousPage: false, hasNextPage: false }}
        currentPage={1}
      />
    );

    expect(screen.getByText('Page 1')).toBeInTheDocument();
    expect(screen.getByText('First').closest('button')).toBeDisabled();
    expect(screen.getByText('Previous').closest('button')).toBeDisabled();
    expect(screen.getByText('Next').closest('button')).toBeDisabled();
    expect(screen.getByText('Last').closest('button')).toBeDisabled();
  });

  it('handles middle page correctly', () => {
    render(
      <PaginationControls
        {...defaultProps}
        pageInfo={{ hasPreviousPage: true, hasNextPage: true }}
        currentPage={5}
      />
    );

    expect(screen.getByText('Page 5')).toBeInTheDocument();
    expect(screen.getByText('First').closest('button')).not.toBeDisabled();
    expect(screen.getByText('Previous').closest('button')).not.toBeDisabled();
    expect(screen.getByText('Next').closest('button')).not.toBeDisabled();
    expect(screen.getByText('Last').closest('button')).not.toBeDisabled();
  });

  it('handles large page numbers', () => {
    render(<PaginationControls {...defaultProps} currentPage={12345} />);

    expect(screen.getByText('Page 12345')).toBeInTheDocument();
  });

  it('renders icons alongside text', () => {
    render(<PaginationControls {...defaultProps} />);

    // Check that buttons have space-x-1 class for icon spacing
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('flex', 'items-center', 'space-x-1');
    });
  });
});
