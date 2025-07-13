import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import ProtectedLayout from '@/app/protected/layout';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

const mockAuth = auth as any;
const mockRedirect = redirect as any;

describe('ProtectedLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user is authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: 'user123' });

    const TestComponent = () => <div data-testid="test-child">Test Content</div>;

    const result = await ProtectedLayout({ children: <TestComponent /> });
    render(result);

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects to sign-in when user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const result = await ProtectedLayout({ children: <div>Test</div> });

    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('throws error when auth throws an error', async () => {
    mockAuth.mockRejectedValue(new Error('Auth error'));

    await expect(ProtectedLayout({ children: <div>Test</div> })).rejects.toThrow('Auth error');

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('handles undefined userId', async () => {
    mockAuth.mockResolvedValue({ userId: undefined as any });

    const result = await ProtectedLayout({ children: <div>Test</div> });

    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('handles empty string userId', async () => {
    mockAuth.mockResolvedValue({ userId: '' });

    const result = await ProtectedLayout({ children: <div>Test</div> });

    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('renders multiple children correctly', async () => {
    mockAuth.mockResolvedValue({ userId: 'user123' });

    const result = await ProtectedLayout({
      children: (
        <>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </>
      ),
    });
    render(result);

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});
