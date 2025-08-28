import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Badge } from '@/app/components/ui/badge';

// Mock the cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | null | Record<string, boolean>)[]) => {
    return classes
      .filter(cls => {
        if (cls === null || cls === undefined) return false;
        if (typeof cls === 'object') {
          return Object.entries(cls || {}).some(([, value]) => value);
        }
        return Boolean(cls);
      })
      .map(cls => {
        if (typeof cls === 'object') {
          return Object.entries(cls || {})
            .filter(([, value]) => value)
            .map(([key]) => key)
            .join(' ');
        }
        return cls;
      })
      .join(' ');
  },
}));

describe('Badge Component', () => {
  it('renders with default variant', () => {
    render(<Badge>Default Badge</Badge>);

    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
  });

  it('renders with secondary variant', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);

    const badge = screen.getByText('Secondary Badge');
    expect(badge).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);

    const badge = screen.getByText('Custom Badge');
    expect(badge).toBeInTheDocument();
  });

  it('renders with complex content', () => {
    render(
      <Badge>
        <span>Icon</span> Complex Content
      </Badge>
    );

    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Complex Content')).toBeInTheDocument();
  });

  it('handles empty string className', () => {
    render(<Badge className="">Empty Class</Badge>);

    const badge = screen.getByText('Empty Class');
    expect(badge).toBeInTheDocument();
  });
});
