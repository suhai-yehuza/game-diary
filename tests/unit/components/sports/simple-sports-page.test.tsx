import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import { SimpleSportsPage } from '@/app/components/sports/SimpleSportsPage';

describe('SimpleSportsPage', () => {
  it('renders with title and description', () => {
    render(
      <SimpleSportsPage title="Test Title" description="Test Description">
        <div>Test Content</div>
      </SimpleSportsPage>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with only title', () => {
    render(<SimpleSportsPage title="Test Title" description="Test Description" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders with children content', () => {
    render(
      <SimpleSportsPage title="Test Title" description="Test Description">
        <button>Click me</button>
        <p>Some paragraph text</p>
      </SimpleSportsPage>
    );

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    expect(screen.getByText('Some paragraph text')).toBeInTheDocument();
  });

  it('renders with complex children', () => {
    const ComplexChild = () => (
      <div>
        <h2>Subtitle</h2>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    );

    render(
      <SimpleSportsPage title="Test Title" description="Test Description">
        <ComplexChild />
      </SimpleSportsPage>
    );

    expect(screen.getByText('Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <SimpleSportsPage title="Test Title" description="Test Description" />
    );

    const section = container.querySelector('section');
    const div = container.querySelector('div');
    const h1 = container.querySelector('h1');
    const p = container.querySelector('p');

    expect(section).toHaveClass(
      'min-h-[calc(100vh-4rem)]',
      'flex',
      'flex-col',
      'items-center',
      'justify-center'
    );
    expect(div).toHaveClass('text-center');
    expect(h1).toHaveClass('text-3xl', 'font-bold', 'mb-4');
    expect(p).toHaveClass('text-gray-600', 'dark:text-gray-400', 'mb-6');
  });

  it('renders without children', () => {
    render(<SimpleSportsPage title="Test Title" description="Test Description" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders with empty children', () => {
    render(
      <SimpleSportsPage title="Test Title" description="Test Description">
        {null}
      </SimpleSportsPage>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders with multiple children', () => {
    render(
      <SimpleSportsPage title="Test Title" description="Test Description">
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </SimpleSportsPage>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });
});
