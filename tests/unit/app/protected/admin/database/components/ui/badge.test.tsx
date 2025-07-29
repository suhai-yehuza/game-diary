import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import { Badge } from '@/app/protected/admin/database/components/ui/badge';

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge>Test Badge</Badge>);

    const badge = screen.getByText('Test Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-full',
      'px-2.5',
      'py-0.5',
      'text-xs',
      'font-medium'
    );
  });

  it('renders with default variant', () => {
    render(<Badge>Default Badge</Badge>);

    const badge = screen.getByText('Default Badge');
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('renders with secondary variant', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);

    const badge = screen.getByText('Secondary Badge');
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground');
  });

  it('renders with custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);

    const badge = screen.getByText('Custom Badge');
    expect(badge).toHaveClass('custom-class');
  });

  it('combines variant and custom className', () => {
    render(
      <Badge variant="secondary" className="custom-class">
        Combined Badge
      </Badge>
    );

    const badge = screen.getByText('Combined Badge');
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground', 'custom-class');
  });

  it('renders with complex children', () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Text</span>
      </Badge>
    );

    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('renders with number children', () => {
    render(<Badge>42</Badge>);

    const badge = screen.getByText('42');
    expect(badge).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<Badge>Semantic Badge</Badge>);

    const badge = screen.getByText('Semantic Badge');
    expect(badge.tagName).toBe('SPAN');
  });

  it('handles multiple badges', () => {
    render(
      <div>
        <Badge>First Badge</Badge>
        <Badge variant="secondary">Second Badge</Badge>
      </div>
    );

    expect(screen.getByText('First Badge')).toBeInTheDocument();
    expect(screen.getByText('Second Badge')).toBeInTheDocument();
  });
});
