import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock both possible aliases, both named and default export
vi.mock('@src/app/components/auth/sign-up-page', () => ({
  __esModule: true,
  SignUpPage: () => <div data-testid="sign-up-page">Sign Up Page Component</div>,
  default: () => <div data-testid="sign-up-page">Sign Up Page Component</div>,
}));
vi.mock('@/app/components/auth/sign-up-page', () => ({
  __esModule: true,
  SignUpPage: () => <div data-testid="sign-up-page">Sign Up Page Component</div>,
  default: () => <div data-testid="sign-up-page">Sign Up Page Component</div>,
}));

describe('SignUpRoutePage', () => {
  it('renders the SignUpPage component', async () => {
    const { default: SignUpRoutePage } = await import('@/app/sign-up/[[...sign-up]]/page');
    render(<SignUpRoutePage />);
    expect(screen.getByTestId('sign-up-page')).toBeInTheDocument();
    expect(screen.getByText('Sign Up Page Component')).toBeInTheDocument();
  });

  it('renders without crashing', async () => {
    const { default: SignUpRoutePage } = await import('@/app/sign-up/[[...sign-up]]/page');
    expect(() => render(<SignUpRoutePage />)).not.toThrow();
  });

  it('has the correct component structure', async () => {
    const { default: SignUpRoutePage } = await import('@/app/sign-up/[[...sign-up]]/page');
    const { container } = render(<SignUpRoutePage />);
    const signUpElement = container.querySelector('[data-testid="sign-up-page"]');
    expect(signUpElement).toBeInTheDocument();
  });
});
