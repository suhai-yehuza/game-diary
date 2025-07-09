import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@/app/components/providers/theme-provider';

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }: any) => (
    <div data-testid="next-themes-provider" data-props={JSON.stringify(props)}>
      {children}
    </div>
  ),
}));

describe('ThemeProvider', () => {
  it('renders children wrapped in NextThemesProvider', () => {
    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('next-themes-provider')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('passes through props to NextThemesProvider', () => {
    const testProps = {
      attribute: 'class' as const,
      defaultTheme: 'system' as const,
      enableSystem: true,
      disableTransitionOnChange: false,
    };

    render(
      <ThemeProvider {...testProps}>
        <div>Test content</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    const props = JSON.parse(provider.getAttribute('data-props') || '{}');

    expect(props).toEqual(testProps);
  });

  it('handles complex children', () => {
    render(
      <ThemeProvider>
        <div>
          <header>Header</header>
          <main>
            <h1>Main Content</h1>
            <p>Some text</p>
          </main>
          <footer>Footer</footer>
        </div>
      </ThemeProvider>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('Some text')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('handles null children', () => {
    render(<ThemeProvider>{null}</ThemeProvider>);

    expect(screen.getByTestId('next-themes-provider')).toBeInTheDocument();
  });

  it('handles undefined children', () => {
    render(<ThemeProvider>{undefined}</ThemeProvider>);

    expect(screen.getByTestId('next-themes-provider')).toBeInTheDocument();
  });

  it('handles empty children', () => {
    render(<ThemeProvider></ThemeProvider>);

    expect(screen.getByTestId('next-themes-provider')).toBeInTheDocument();
  });

  it('passes empty props object when no props provided', () => {
    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    const props = JSON.parse(provider.getAttribute('data-props') || '{}');

    expect(props).toEqual({});
  });

  it('handles multiple nested providers', () => {
    render(
      <ThemeProvider>
        <ThemeProvider>
          <div>Nested content</div>
        </ThemeProvider>
      </ThemeProvider>
    );

    const providers = screen.getAllByTestId('next-themes-provider');
    expect(providers).toHaveLength(2);
    expect(screen.getByText('Nested content')).toBeInTheDocument();
  });

  it('maintains proper component structure', () => {
    const { container } = render(
      <ThemeProvider>
        <div data-testid="child">Child content</div>
      </ThemeProvider>
    );

    const child = screen.getByTestId('child');
    const provider = screen.getByTestId('next-themes-provider');

    expect(child).toBeInTheDocument();
    expect(provider).toBeInTheDocument();
    expect(provider).toContainElement(child);
  });
});
