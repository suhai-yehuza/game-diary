import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ErrorDisplay } from '@src/app/protected/admin/database/components/ui/error-display';

describe('ErrorDisplay', () => {
  it('renders error message when error is provided', () => {
    render(<ErrorDisplay error="Test error message" />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('does not render when error is null', () => {
    const { container } = render(<ErrorDisplay error={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('does not render when error is empty string', () => {
    const { container } = render(<ErrorDisplay error="" />);

    expect(container.firstChild).toBeNull();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<ErrorDisplay error="Test error message" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass(
      'p-3',
      'sm:p-4',
      'bg-destructive/10',
      'border',
      'border-destructive/20',
      'rounded-md'
    );
  });

  it('renders error text with correct styling', () => {
    render(<ErrorDisplay error="Test error message" />);

    const errorText = screen.getByText('Test error message');
    expect(errorText).toHaveClass('text-destructive', 'text-xs', 'sm:text-sm');
  });

  it('handles long error messages', () => {
    const longError =
      'This is a very long error message that should be displayed properly without breaking the layout or causing any issues with the component rendering';

    render(<ErrorDisplay error={longError} />);

    expect(screen.getByText(longError)).toBeInTheDocument();
  });

  it('handles special characters in error messages', () => {
    const specialError = 'Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';

    render(<ErrorDisplay error={specialError} />);

    expect(screen.getByText(specialError)).toBeInTheDocument();
  });

  it('handles HTML-like content in error messages', () => {
    const htmlError = 'Error with <script>alert("xss")</script> content';

    render(<ErrorDisplay error={htmlError} />);

    expect(screen.getByText(htmlError)).toBeInTheDocument();
    // Should not render as HTML
    expect(screen.queryByText('alert("xss")')).not.toBeInTheDocument();
  });

  it('renders multiple error displays independently', () => {
    render(
      <div>
        <ErrorDisplay error="First error" />
        <ErrorDisplay error="Second error" />
      </div>
    );

    expect(screen.getByText('First error')).toBeInTheDocument();
    expect(screen.getByText('Second error')).toBeInTheDocument();
  });

  it('handles undefined error gracefully', () => {
    const { container } = render(<ErrorDisplay error={undefined as any} />);

    expect(container.firstChild).toBeNull();
  });

  it('maintains consistent styling across renders', () => {
    const { rerender } = render(<ErrorDisplay error="First error" />);

    const firstError = screen.getByText('First error');
    expect(firstError).toHaveClass('text-destructive', 'text-xs', 'sm:text-sm');

    rerender(<ErrorDisplay error="Second error" />);

    const secondError = screen.getByText('Second error');
    expect(secondError).toHaveClass('text-destructive', 'text-xs', 'sm:text-sm');
  });
});
