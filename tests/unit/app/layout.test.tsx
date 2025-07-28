import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import RootLayout from '@/app/layout';

// Mock Next.js components and modules
vi.mock('next/font/google', () => ({
  Inter: vi.fn(() => ({
    className: 'inter-font-class',
    variable: '--font-inter',
  })),
}));

vi.mock('@/styles/globals.css', () => ({}));

vi.mock('@/app/components/layout/Header', () => ({
  Header: () => <header data-testid="header">Header Component</header>,
}));

vi.mock('@src/app/components/layout', () => ({
  Footer: () => <footer data-testid="footer">Footer Component</footer>,
}));

vi.mock('@src/app/components/providers', () => ({
  ClientProviders: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="client-providers">{children}</div>
  ),
}));

describe('RootLayout', () => {
  it('renders the root layout with correct HTML structure', () => {
    render(
      <RootLayout>
        <div data-testid="child-content">Child Content</div>
      </RootLayout>
    );

    // Check HTML structure
    const html = document.querySelector('html');
    expect(html).toHaveAttribute('lang', 'en');
    expect(html).toHaveClass('scroll-smooth', 'antialiased');

    const body = document.querySelector('body');
    expect(body).toHaveClass('flex', 'min-h-screen', 'flex-col', 'inter-font-class');
  });

  it('renders header, main content, and footer', () => {
    render(
      <RootLayout>
        <div data-testid="child-content">Child Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('wraps content in ClientProviders', () => {
    render(
      <RootLayout>
        <div data-testid="child-content">Child Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('client-providers')).toBeInTheDocument();
  });

  it('renders main element with correct classes', () => {
    render(
      <RootLayout>
        <div data-testid="child-content">Child Content</div>
      </RootLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveClass('grow');
  });

  it('passes children correctly', () => {
    const testContent = 'Test Child Content';
    render(
      <RootLayout>
        <div>{testContent}</div>
      </RootLayout>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('applies Inter font class to body', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    const body = document.querySelector('body');
    expect(body).toHaveClass('inter-font-class');
  });

  it('has proper semantic structure', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    // Check for semantic elements
    expect(document.querySelector('html')).toBeInTheDocument();
    expect(document.querySelector('body')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('handles multiple children correctly', () => {
    render(
      <RootLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </RootLayout>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });
});
