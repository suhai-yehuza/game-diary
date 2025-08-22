import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { EmptyState } from '@/app/components/common/EmptyState';

describe('EmptyState Enhanced Coverage', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<EmptyState />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
      expect(screen.getByText('There are no items to display at the moment.')).toBeInTheDocument();
    });

    it('renders with custom title and description', () => {
      render(<EmptyState title="Custom Title" description="Custom description text" />);

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom description text')).toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    it('renders with custom icon', () => {
      const CustomIcon = () => <div data-testid="custom-icon">Custom Icon</div>;

      render(<EmptyState icon={<CustomIcon />} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('renders with custom icon size', () => {
      const CustomIcon = ({ size }: { size?: number }) => (
        <div data-testid="custom-icon" style={{ width: size, height: size }}>
          Icon
        </div>
      );

      render(<EmptyState icon={<CustomIcon />} iconSize={64} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('renders without icon when not provided', () => {
      render(<EmptyState />);

      // Should not have any icon element
      expect(screen.queryByTestId('custom-icon')).not.toBeInTheDocument();
    });
  });

  describe('Action Button', () => {
    it('renders with action button', () => {
      const action = <button data-testid="action-button">Take Action</button>;

      render(<EmptyState action={action} />);

      expect(screen.getByTestId('action-button')).toBeInTheDocument();
    });

    it('renders without action when not provided', () => {
      render(<EmptyState />);

      expect(screen.queryByTestId('action-button')).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders with default variant', () => {
      const { container } = render(<EmptyState />);

      expect(container.firstChild).toHaveClass('text-muted-foreground');
    });

    it('renders with info variant', () => {
      const { container } = render(<EmptyState variant="info" />);

      expect(container.firstChild).toHaveClass('text-blue-600', 'dark:text-blue-400');
    });

    it('renders with warning variant', () => {
      const { container } = render(<EmptyState variant="warning" />);

      expect(container.firstChild).toHaveClass('text-yellow-600', 'dark:text-yellow-400');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<EmptyState className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('combines custom className with default classes', () => {
      const { container } = render(<EmptyState className="custom-class" variant="info" />);

      expect(container.firstChild).toHaveClass(
        'custom-class',
        'text-blue-600',
        'dark:text-blue-400'
      );
    });
  });

  describe('Children Content', () => {
    it('renders children when provided', () => {
      render(
        <EmptyState>
          <div data-testid="custom-children">Custom child content</div>
        </EmptyState>
      );

      expect(screen.getByTestId('custom-children')).toBeInTheDocument();
    });

    it('renders both default content and children', () => {
      render(
        <EmptyState title="Test Title">
          <div data-testid="custom-children">Additional content</div>
        </EmptyState>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByTestId('custom-children')).toBeInTheDocument();
    });
  });

  describe('Complex Scenarios', () => {
    it('renders with all props provided', () => {
      const CustomIcon = () => <div data-testid="custom-icon">Icon</div>;
      const action = <button data-testid="action-button">Action</button>;

      render(
        <EmptyState
          title="Complex Title"
          description="Complex description"
          icon={<CustomIcon />}
          action={action}
          variant="info"
          className="complex-class"
          iconSize={72}
        >
          <div data-testid="complex-children">Complex children</div>
        </EmptyState>
      );

      expect(screen.getByText('Complex Title')).toBeInTheDocument();
      expect(screen.getByText('Complex description')).toBeInTheDocument();
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.getByTestId('action-button')).toBeInTheDocument();
      expect(screen.getByTestId('complex-children')).toBeInTheDocument();
    });

    it('handles empty strings for title and description', () => {
      render(<EmptyState title="" description="" />);

      // Should still render the elements, even if empty
      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('handles very long content', () => {
      const longTitle = 'A'.repeat(200);
      const longDescription = 'B'.repeat(500);

      render(<EmptyState title={longTitle} description={longDescription} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<EmptyState title="Accessible Title" />);

      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('maintains semantic structure', () => {
      render(<EmptyState title="Semantic Title" description="Semantic description" />);

      // Check for proper heading structure
      const title = screen.getByRole('heading');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Semantic Title');
    });
  });
});
