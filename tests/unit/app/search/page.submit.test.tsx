import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import SearchPage from '@/app/search/page';

const pushSpy = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(''),
  useRouter: () => ({ push: pushSpy, back: vi.fn() }),
}));

vi.mock('@/app/components/layout/components/SearchBar', () => ({
  useMobileDetection: () => false,
}));

vi.mock('@/app/components/search', () => ({
  SearchEmptyState: ({ hasQuery }: { hasQuery: boolean }) => (
    <div data-testid="empty">{hasQuery ? 'has-query' : 'no-query'}</div>
  ),
  SearchResults: ({ query }: { query: string }) => <div data-testid="results">{query}</div>,
}));

describe('SearchPage submit behavior', () => {
  it('submits the form and navigates with query param', () => {
    const { container } = render(<SearchPage />);
    const input = screen.getByPlaceholderText('Search games, teams, players...');
    fireEvent.change(input, { target: { value: 'kobe' } });
    const form = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);
    expect(pushSpy).toHaveBeenCalled();
    expect(pushSpy.mock.calls[0][0]).toContain('/search?');
    expect(pushSpy.mock.calls[0][0]).toContain('q=kobe');
  });
});
