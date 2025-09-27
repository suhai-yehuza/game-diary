import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { SimpleSportsPage } from '@/app/components/sports/SimpleSportsPage';

describe('SimpleSportsPage', () => {
  it('renders with title and description', () => {
    render(<SimpleSportsPage title="Test Sports Page" description="This is a test description" />);

    expect(screen.getByText('Test Sports Page')).toBeInTheDocument();
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <SimpleSportsPage title="Test Sports Page" description="This is a test description">
        <div data-testid="child-content">Child content here</div>
      </SimpleSportsPage>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child content here')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <SimpleSportsPage title="Test Sports Page" description="This is a test description" />
    );

    const section = container.querySelector('section');
    expect(section).toHaveClass(
      'min-h-[calc(100vh-4rem)]',
      'flex',
      'flex-col',
      'items-center',
      'justify-center'
    );

    const div = container.querySelector('div');
    expect(div).toHaveClass('text-center');
  });

  it('renders title with correct styling', () => {
    render(<SimpleSportsPage title="NBA Games" description="View NBA games" />);

    const title = screen.getByText('NBA Games');
    expect(title).toHaveClass('text-3xl', 'font-bold', 'mb-4');
  });

  it('renders description with correct styling', () => {
    render(<SimpleSportsPage title="NBA Games" description="View NBA games" />);

    const description = screen.getByText('View NBA games');
    expect(description).toHaveClass('text-theme-muted', 'mb-6');
  });

  it('handles empty children', () => {
    render(<SimpleSportsPage title="Empty Page" description="No children" />);

    expect(screen.getByText('Empty Page')).toBeInTheDocument();
    expect(screen.getByText('No children')).toBeInTheDocument();
  });

  it('handles multiple children', () => {
    render(
      <SimpleSportsPage title="Multiple Children" description="Testing multiple children">
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <button data-testid="child-3">Child 3</button>
      </SimpleSportsPage>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('handles long title and description', () => {
    const longTitle = 'This is a very long title that might wrap to multiple lines';
    const longDescription =
      'This is a very long description that contains a lot of text and might also wrap to multiple lines';

    render(<SimpleSportsPage title={longTitle} description={longDescription} />);

    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('handles special characters in title and description', () => {
    const specialTitle = 'NBA Games & Stats (2023-24)';
    const specialDescription = 'View games, stats & more! 🏀';

    render(<SimpleSportsPage title={specialTitle} description={specialDescription} />);

    expect(screen.getByText(specialTitle)).toBeInTheDocument();
    expect(screen.getByText(specialDescription)).toBeInTheDocument();
  });

  it('maintains proper structure with complex children', () => {
    render(
      <SimpleSportsPage title="Complex Page" description="Testing complex children structure">
        <div className="grid grid-cols-2 gap-4">
          <div>Left content</div>
          <div>Right content</div>
        </div>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white">Action Button</button>
      </SimpleSportsPage>
    );

    expect(screen.getByText('Left content')).toBeInTheDocument();
    expect(screen.getByText('Right content')).toBeInTheDocument();
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('is accessible with proper heading structure', () => {
    render(<SimpleSportsPage title="Accessible Page" description="Testing accessibility" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Accessible Page');
  });

  it('handles undefined or null props gracefully', () => {
    render(<SimpleSportsPage title={undefined as any} description={null as any} />);

    // Should not crash and should render empty content
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
