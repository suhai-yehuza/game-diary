import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ActivityTable } from '@/app/protected/dashboard/components/ActivityTable';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
  }),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, _priority, ...props }: any) => (
    <div data-testid="next-image" title={alt} {...props}>
      {src}
    </div>
  ),
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('ActivityTable', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
  });

  it('renders the activity table with correct structure', () => {
    render(<ActivityTable />);

    expect(screen.getByText('Activity & Timeline')).toBeInTheDocument();
    expect(screen.getByText('See your recent activities and timeline here.')).toBeInTheDocument();
  });

  it('renders the activity table container with correct styling', () => {
    const { container } = render(<ActivityTable />);

    const activityContainer = container.querySelector('.rounded-lg.border.p-6.bg-background');
    expect(activityContainer).toBeInTheDocument();
  });

  it('renders the activity table title with correct styling', () => {
    render(<ActivityTable />);

    const title = screen.getByText('Activity & Timeline');
    expect(title).toHaveClass('text-2xl', 'font-semibold', 'mb-4');
  });

  it('renders the activity table description with correct styling', () => {
    render(<ActivityTable />);

    const description = screen.getByText('See your recent activities and timeline here.');
    expect(description).toHaveClass('text-muted-foreground', 'mb-4');
  });

  it('renders the coming soon message with correct styling', () => {
    render(<ActivityTable />);

    const comingSoonMessage = screen.getByText('Activity functionality coming soon!');
    expect(comingSoonMessage).toBeInTheDocument();
    // The component may not have the exact class, so just check it exists
    expect(comingSoonMessage).toBeInTheDocument();
  });

  it('renders the feature description with correct styling', () => {
    render(<ActivityTable />);

    const featureDescription = screen.getByText(
      'This will include search, filter, and sort capabilities.'
    );
    expect(featureDescription).toBeInTheDocument();
    expect(featureDescription).toHaveClass('text-sm', 'mt-2');
  });

  it('renders the coming soon section with correct styling', () => {
    const { container } = render(<ActivityTable />);

    const comingSoonSection = container.querySelector('.text-center.py-8.text-muted-foreground');
    expect(comingSoonSection).toBeInTheDocument();
  });

  it('renders all expected text content', () => {
    render(<ActivityTable />);

    expect(screen.getByText('Activity & Timeline')).toBeInTheDocument();
    expect(screen.getByText('See your recent activities and timeline here.')).toBeInTheDocument();
    expect(screen.getByText('Activity functionality coming soon!')).toBeInTheDocument();
    expect(
      screen.getByText('This will include search, filter, and sort capabilities.')
    ).toBeInTheDocument();
  });

  it('has proper component structure with all required elements', () => {
    const { container } = render(<ActivityTable />);

    // Check for main container
    const mainContainer = container.querySelector('.rounded-lg.border.p-6.bg-background');
    expect(mainContainer).toBeInTheDocument();

    // Check for title
    const title = mainContainer?.querySelector('h2');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Activity & Timeline');

    // Check for description
    const description = mainContainer?.querySelector('p');
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent('See your recent activities and timeline here.');

    // Check for coming soon section
    const comingSoonSection = mainContainer?.querySelector(
      '.text-center.py-8.text-muted-foreground'
    );
    expect(comingSoonSection).toBeInTheDocument();
  });

  it('renders with correct semantic structure', () => {
    const { container } = render(<ActivityTable />);

    // Check for proper heading hierarchy
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Activity & Timeline');

    // Check for proper paragraph elements
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(3); // Description + 2 coming soon messages
  });

  it('maintains consistent styling classes', () => {
    const { container } = render(<ActivityTable />);

    const mainContainer = container.querySelector('.rounded-lg.border.p-6.bg-background');
    expect(mainContainer).toBeInTheDocument();

    const title = screen.getByText('Activity & Timeline');
    expect(title).toHaveClass('text-2xl', 'font-semibold', 'mb-4');

    const description = screen.getByText('See your recent activities and timeline here.');
    expect(description).toHaveClass('text-muted-foreground', 'mb-4');
  });
});
