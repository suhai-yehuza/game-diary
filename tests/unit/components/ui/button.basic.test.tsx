import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import { Button } from '@/app/components/ui/button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);

    const button = screen.getByRole('button', { name: 'Custom Button' });
    expect(button).toHaveClass('custom-class');
  });

  it('renders with default variant', () => {
    render(<Button>Default Button</Button>);

    const button = screen.getByRole('button', { name: 'Default Button' });
    expect(button).toHaveClass(
      'bg-brand-primary',
      'text-theme-inverse',
      'hover:bg-brand-primary-hover'
    );
  });

  it('renders with outline variant', () => {
    render(<Button variant="outline">Outline Button</Button>);

    const button = screen.getByRole('button', { name: 'Outline Button' });
    expect(button).toHaveClass(
      'bg-bg-theme-secondary',
      'hover:bg-bg-theme-tertiary',
      'text-theme-primary'
    );
  });

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost Button</Button>);

    const button = screen.getByRole('button', { name: 'Ghost Button' });
    expect(button).toHaveClass('hover:bg-bg-theme-secondary', 'text-theme-primary');
  });

  it('renders with destructive variant', () => {
    render(<Button variant="destructive">Destructive Button</Button>);

    const button = screen.getByRole('button', { name: 'Destructive Button' });
    expect(button).toHaveClass(
      'bg-semantic-error',
      'text-theme-inverse',
      'hover:bg-semantic-error/90'
    );
  });

  it('renders with default size', () => {
    render(<Button>Default Size Button</Button>);

    const button = screen.getByRole('button', { name: 'Default Size Button' });
    expect(button).toHaveClass('h-10', 'px-4', 'py-2');
  });

  it('renders with small size', () => {
    render(<Button size="sm">Small Button</Button>);

    const button = screen.getByRole('button', { name: 'Small Button' });
    expect(button).toHaveClass('h-9', 'px-3');
  });

  it('renders with large size', () => {
    render(<Button size="lg">Large Button</Button>);

    const button = screen.getByRole('button', { name: 'Large Button' });
    expect(button).toHaveClass('h-11', 'px-8');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable Button</Button>);

    const button = screen.getByRole('button', { name: 'Clickable Button' });
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles disabled state', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:pointer-events-none');
  });

  it('handles type attribute', () => {
    render(<Button type="submit">Submit Button</Button>);

    const button = screen.getByRole('button', { name: 'Submit Button' });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('handles aria attributes', () => {
    render(<Button aria-label="Custom label">Aria Button</Button>);

    const button = screen.getByRole('button', { name: 'Custom label' });
    expect(button).toHaveAttribute('aria-label', 'Custom label');
  });

  it('handles data attributes', () => {
    render(<Button data-testid="test-button">Data Button</Button>);

    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();
  });

  it('combines variant and size classes correctly', () => {
    render(
      <Button variant="outline" size="lg">
        Combined Button
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Combined Button' });
    expect(button).toHaveClass('bg-bg-theme-secondary', 'h-11', 'px-8');
  });

  it('renders with complex children', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    );

    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('handles form type attribute', () => {
    render(<Button type="submit">Submit Button</Button>);

    const button = screen.getByRole('button', { name: 'Submit Button' });
    expect(button).toHaveAttribute('type', 'submit');
  });
});
