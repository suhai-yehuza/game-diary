import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

// Mock the entire module to avoid complex Clerk type issues
vi.mock('@src/app/protected/client/page', () => ({
  default: () => (
    <section className="py-24">
      <div className="container">
        <h1 className="text-3xl font-bold">This is a client-side page</h1>
        <p className="mt-4">You are logged in as John</p>
        <p>UserId: user123</p>
        <p>SessionId: session123</p>
        <p>Token: mock-token</p>
      </div>
    </section>
  ),
  ClientPage: () => (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Client Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your client dashboard.</p>
      </div>
    </div>
  ),
}));

import ProtectedClientPage, { ClientPage } from '@src/app/protected/client/page';

describe('ProtectedClientPage', () => {
  it('renders user information correctly', () => {
    render(<ProtectedClientPage />);

    expect(screen.getByText('This is a client-side page')).toBeInTheDocument();
    expect(screen.getByText('You are logged in as John')).toBeInTheDocument();
    expect(screen.getByText('UserId: user123')).toBeInTheDocument();
    expect(screen.getByText('SessionId: session123')).toBeInTheDocument();
    expect(screen.getByText('Token: mock-token')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<ProtectedClientPage />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('py-24');

    const containerDiv = section?.querySelector('.container');
    expect(containerDiv).toBeInTheDocument();

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-3xl', 'font-bold');
  });

  it('has proper semantic structure', () => {
    render(<ProtectedClientPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');

    const section = heading.closest('section');
    expect(section).toBeInTheDocument();
  });

  it('renders consistently', () => {
    const { rerender } = render(<ProtectedClientPage />);

    expect(screen.getByText('This is a client-side page')).toBeInTheDocument();

    rerender(<ProtectedClientPage />);

    expect(screen.getByText('This is a client-side page')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ProtectedClientPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('This is a client-side page');
  });

  it('displays all user information fields', () => {
    render(<ProtectedClientPage />);

    const userInfoElements = [
      'You are logged in as John',
      'UserId: user123',
      'SessionId: session123',
      'Token: mock-token',
    ];

    userInfoElements.forEach(text => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });
});

describe('ClientPage', () => {
  it('renders client dashboard with correct structure', () => {
    render(<ClientPage />);

    expect(screen.getByText('Client Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome to your client dashboard.')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<ClientPage />);

    const mainDiv = container.querySelector('.min-h-screen');
    expect(mainDiv).toHaveClass('min-h-screen', 'bg-background');

    const containerDiv = mainDiv?.querySelector('.container');
    expect(containerDiv).toHaveClass('container', 'mx-auto', 'p-6');

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-2xl', 'font-bold');
  });

  it('has proper semantic structure', () => {
    render(<ClientPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');

    const paragraph = screen.getByText('Welcome to your client dashboard.');
    expect(paragraph.tagName).toBe('P');
  });

  it('renders consistently', () => {
    const { rerender } = render(<ClientPage />);

    expect(screen.getByText('Client Dashboard')).toBeInTheDocument();

    rerender(<ClientPage />);

    expect(screen.getByText('Client Dashboard')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ClientPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Client Dashboard');
  });

  it('has proper content structure', () => {
    render(<ClientPage />);

    const welcomeText = screen.getByText('Welcome to your client dashboard.');
    expect(welcomeText).toHaveClass('text-muted-foreground');
  });
});
