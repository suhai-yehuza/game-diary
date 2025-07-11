import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock both possible aliases, both named and default export
vi.mock('@src/app/components/auth/sign-in-page', () => ({
  __esModule: true,
  SignInPage: () => <div data-testid="sign-in-page">Sign In Page Component</div>,
  default: () => <div data-testid="sign-in-page">Sign In Page Component</div>,
}));
vi.mock('@/app/components/auth/sign-in-page', () => ({
  __esModule: true,
  SignInPage: () => <div data-testid="sign-in-page">Sign In Page Component</div>,
  default: () => <div data-testid="sign-in-page">Sign In Page Component</div>,
}));

describe('SignInRoutePage', () => {
  it('renders the SignInPage component', async () => {
    const { default: SignInRoutePage } = await import('@/app/sign-in/[[...sign-in]]/page');
    render(<SignInRoutePage />);
    expect(screen.getByTestId('sign-in-page')).toBeInTheDocument();
    expect(screen.getByText('Sign In Page Component')).toBeInTheDocument();
  });

  it('renders without crashing', async () => {
    const { default: SignInRoutePage } = await import('@/app/sign-in/[[...sign-in]]/page');
    expect(() => render(<SignInRoutePage />)).not.toThrow();
  });

  it('has the correct component structure', async () => {
    const { default: SignInRoutePage } = await import('@/app/sign-in/[[...sign-in]]/page');
    const { container } = render(<SignInRoutePage />);
    const signInElement = container.querySelector('[data-testid="sign-in-page"]');
    expect(signInElement).toBeInTheDocument();
  });
});
