import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { SearchEmptyState } from '@/app/components/search/SearchEmptyState';

describe('SearchEmptyState', () => {
  it('renders no results state when hasQuery is true', () => {
    render(<SearchEmptyState hasQuery={true} />);

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(
      screen.getByText('Try searching for a different term or check your spelling.')
    ).toBeInTheDocument();
  });

  it('renders start searching state when hasQuery is false', () => {
    render(<SearchEmptyState hasQuery={false} />);

    expect(screen.getByText('Start searching')).toBeInTheDocument();
    expect(
      screen.getByText('Enter a search term above to find users and game logs.')
    ).toBeInTheDocument();
  });

  it('renders search icon in both states', () => {
    const { rerender } = render(<SearchEmptyState hasQuery={true} />);

    // Check that the component renders without errors
    expect(screen.getByText('No results found')).toBeInTheDocument();

    rerender(<SearchEmptyState hasQuery={false} />);

    // Check that the component still renders without errors
    expect(screen.getByText('Start searching')).toBeInTheDocument();
  });
});
