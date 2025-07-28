import { useUser } from '@clerk/nextjs';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

import { ActivityTable } from '@/app/protected/user/components/ActivityTable';

describe('ActivityTable', () => {
  const mockUseUser = useUser as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign-in message when user is not signed in', () => {
    mockUseUser.mockReturnValue({
      user: null,
    });

    render(<ActivityTable />);

    expect(screen.getByText('Please sign in to view your activity.')).toBeInTheDocument();
    expect(screen.queryByText('Activity & Timeline')).not.toBeInTheDocument();
  });

  it('renders sign-in message when user has no id', () => {
    mockUseUser.mockReturnValue({
      user: { id: null },
    });

    render(<ActivityTable />);

    expect(screen.getByText('Please sign in to view your activity.')).toBeInTheDocument();
    expect(screen.queryByText('Activity & Timeline')).not.toBeInTheDocument();
  });

  it('renders activity content when user is signed in', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<ActivityTable />);

    expect(screen.getByText('Activity & Timeline')).toBeInTheDocument();
    expect(screen.getByText('See your recent activities and timeline here.')).toBeInTheDocument();
    expect(screen.getByText('Activity functionality coming soon!')).toBeInTheDocument();
    expect(
      screen.getByText('This will include search, filter, and sort capabilities.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Please sign in to view your activity.')).not.toBeInTheDocument();
  });

  it('renders with proper styling classes', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<ActivityTable />);

    const container = screen.getByText('Activity & Timeline').closest('div');
    expect(container).toHaveClass('rounded-lg', 'border', 'p-6', 'bg-background');
  });

  it('renders sign-in message with proper styling', () => {
    mockUseUser.mockReturnValue({
      user: null,
    });

    render(<ActivityTable />);

    const signInContainer = screen
      .getByText('Please sign in to view your activity.')
      .closest('.rounded-lg');
    expect(signInContainer).toHaveClass('rounded-lg', 'border', 'p-6', 'bg-background');

    const messageContainer = screen.getByText('Please sign in to view your activity.');
    expect(messageContainer).toHaveClass('text-center', 'text-muted-foreground');
  });

  it('renders activity heading with proper styling', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<ActivityTable />);

    const heading = screen.getByText('Activity & Timeline');
    expect(heading).toHaveClass('text-2xl', 'font-semibold', 'mb-4');
  });

  it('renders activity description with proper styling', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<ActivityTable />);

    const description = screen.getByText('See your recent activities and timeline here.');
    expect(description).toHaveClass('text-muted-foreground', 'mb-4');
  });

  it('renders coming soon message with proper styling', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<ActivityTable />);

    const comingSoonContainer = screen
      .getByText('Activity functionality coming soon!')
      .closest('div');
    expect(comingSoonContainer).toHaveClass('text-center', 'py-8', 'text-muted-foreground');
  });

  it('renders coming soon description with proper styling', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<ActivityTable />);

    const description = screen.getByText(
      'This will include search, filter, and sort capabilities.'
    );
    expect(description).toHaveClass('text-sm', 'mt-2');
  });

  it('handles user with different id formats', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'test-user-id-456' },
    });

    render(<ActivityTable />);

    expect(screen.getByText('Activity & Timeline')).toBeInTheDocument();
    expect(screen.queryByText('Please sign in to view your activity.')).not.toBeInTheDocument();
  });

  it('handles user object with additional properties', () => {
    mockUseUser.mockReturnValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    render(<ActivityTable />);

    expect(screen.getByText('Activity & Timeline')).toBeInTheDocument();
    expect(screen.queryByText('Please sign in to view your activity.')).not.toBeInTheDocument();
  });

  it('renders proper component structure when signed in', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    const { container } = render(<ActivityTable />);

    // Should have the main container
    const mainContainer = container.querySelector('.rounded-lg.border.p-6.bg-background');
    expect(mainContainer).toBeInTheDocument();

    // Should contain the heading
    expect(mainContainer).toHaveTextContent('Activity & Timeline');

    // Should contain the description
    expect(mainContainer).toHaveTextContent('See your recent activities and timeline here.');

    // Should contain the coming soon message
    expect(mainContainer).toHaveTextContent('Activity functionality coming soon!');
  });

  it('renders proper component structure when not signed in', () => {
    mockUseUser.mockReturnValue({
      user: null,
    });

    const { container } = render(<ActivityTable />);

    // Should have the main container
    const mainContainer = container.querySelector('.rounded-lg.border.p-6.bg-background');
    expect(mainContainer).toBeInTheDocument();

    // Should contain the sign-in message
    expect(mainContainer).toHaveTextContent('Please sign in to view your activity.');

    // Should not contain activity content
    expect(mainContainer).not.toHaveTextContent('Activity & Timeline');
  });
});
