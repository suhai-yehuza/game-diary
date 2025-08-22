import { render, screen } from '@testing-library/react';

import {
  LoadingSpinner,
  PageLoadingSpinner,
  CardLoadingSpinner,
  InlineLoadingSpinner,
} from '@/app/components/common/LoadingSpinner';

describe('LoadingSpinner convenience components', () => {
  it('renders base LoadingSpinner with defaults', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('renders PageLoadingSpinner with default text', () => {
    render(<PageLoadingSpinner />);
    const loadingTexts = screen.getAllByText('Loading...');
    expect(loadingTexts).toHaveLength(2); // One in sr-only span, one in p element
  });

  it('renders CardLoadingSpinner with custom text', () => {
    render(<CardLoadingSpinner text="Fetching" />);
    expect(screen.getByText('Fetching')).toBeInTheDocument();
  });

  it('renders InlineLoadingSpinner without text', () => {
    render(<InlineLoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });
});
