import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { GameLogsPagination } from '@/app/components/game-logs/GameLogsPagination';

describe('GameLogsPagination', () => {
  it('renders load more button when hasNextPage is true', () => {
    const onLoadMore = vi.fn();
    render(<GameLogsPagination hasNextPage={true} loading={false} onLoadMore={onLoadMore} />);

    expect(screen.getByText('Load More')).toBeInTheDocument();
  });

  it('does not render anything when hasNextPage is false', () => {
    const onLoadMore = vi.fn();
    const { container } = render(
      <GameLogsPagination hasNextPage={false} loading={false} onLoadMore={onLoadMore} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('calls onLoadMore when button is clicked', () => {
    const onLoadMore = vi.fn();
    render(<GameLogsPagination hasNextPage={true} loading={false} onLoadMore={onLoadMore} />);

    const loadMoreButton = screen.getByText('Load More');
    fireEvent.click(loadMoreButton);

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('shows loading text when loading is true', () => {
    const onLoadMore = vi.fn();
    render(<GameLogsPagination hasNextPage={true} loading={true} onLoadMore={onLoadMore} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows custom load more text when provided', () => {
    const onLoadMore = vi.fn();
    render(
      <GameLogsPagination
        hasNextPage={true}
        loading={false}
        onLoadMore={onLoadMore}
        loadMoreText="Load More Games"
      />
    );

    expect(screen.getByText('Load More Games')).toBeInTheDocument();
  });

  it('disables button when loading is true', () => {
    const onLoadMore = vi.fn();
    render(<GameLogsPagination hasNextPage={true} loading={true} onLoadMore={onLoadMore} />);

    const loadMoreButton = screen.getByText('Loading...');
    expect(loadMoreButton).toBeDisabled();
  });

  it('enables button when loading is false', () => {
    const onLoadMore = vi.fn();
    render(<GameLogsPagination hasNextPage={true} loading={false} onLoadMore={onLoadMore} />);

    const loadMoreButton = screen.getByText('Load More');
    expect(loadMoreButton).not.toBeDisabled();
  });

  it('applies correct CSS classes to the container', () => {
    const onLoadMore = vi.fn();
    render(<GameLogsPagination hasNextPage={true} loading={false} onLoadMore={onLoadMore} />);

    const container = screen.getByText('Load More').parentElement;
    expect(container).toHaveClass('flex', 'justify-center', 'mt-8', 'mb-4');
  });

  it('applies correct CSS classes to the button', () => {
    const onLoadMore = vi.fn();
    render(<GameLogsPagination hasNextPage={true} loading={false} onLoadMore={onLoadMore} />);

    const button = screen.getByText('Load More');
    expect(button).toHaveClass(
      'bg-blue-600',
      'text-white',
      'rounded-full',
      'px-6',
      'py-2',
      'font-semibold',
      'shadow',
      'hover:bg-blue-700',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-400',
      'transition',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed'
    );
  });

  it('applies disabled styles when loading', () => {
    const onLoadMore = vi.fn();
    render(<GameLogsPagination hasNextPage={true} loading={true} onLoadMore={onLoadMore} />);

    const button = screen.getByText('Loading...');
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('renders button in a centered container', () => {
    const onLoadMore = vi.fn();
    render(<GameLogsPagination hasNextPage={true} loading={false} onLoadMore={onLoadMore} />);

    const container = screen.getByText('Load More').parentElement;
    expect(container).toHaveClass('flex', 'justify-center');
  });

  it('has proper spacing around the button', () => {
    const onLoadMore = vi.fn();
    render(<GameLogsPagination hasNextPage={true} loading={false} onLoadMore={onLoadMore} />);

    const container = screen.getByText('Load More').parentElement;
    expect(container).toHaveClass('mt-8', 'mb-4');
  });
});
