import { render, screen, waitFor } from '@testing-library/react';
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

// Mock fetch for user profile API
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      }),
  })
) as any;

describe('ActivityTable', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
  });

  it('renders the activity table with correct structure', async () => {
    render(<ActivityTable />);

    await waitFor(() => {
      expect(screen.getByText('Activity & Timeline')).toBeInTheDocument();
    });
    expect(screen.getByText('See your recent activities and timeline here.')).toBeInTheDocument();
  });

  it('renders the activity table container with correct styling', async () => {
    const { container } = render(<ActivityTable />);

    await waitFor(() => {
      const activityContainer = container.querySelector(
        '.rounded-lg.border.bg-card.text-card-foreground.shadow-sm'
      );
      expect(activityContainer).toBeInTheDocument();
    });
  });

  it('renders the activity table title with correct styling', async () => {
    render(<ActivityTable />);

    await waitFor(() => {
      const title = screen.getByText('Activity & Timeline');
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'mb-4');
    });
  });

  it('renders the activity table description with correct styling', async () => {
    render(<ActivityTable />);

    await waitFor(() => {
      const description = screen.getByText('See your recent activities and timeline here.');
      expect(description).toHaveClass('text-muted-foreground', 'mb-4');
    });
  });

  it('renders the coming soon message with correct styling', async () => {
    render(<ActivityTable />);

    await waitFor(() => {
      const comingSoonMessage = screen.getByText('Activity functionality coming soon!');
      expect(comingSoonMessage).toBeInTheDocument();
    });
  });

  it('renders the feature description with correct styling', async () => {
    render(<ActivityTable />);

    await waitFor(() => {
      const featureDescription = screen.getByText(
        'This will include search, filter, and sort capabilities.'
      );
      expect(featureDescription).toBeInTheDocument();
      expect(featureDescription).toHaveClass('text-sm', 'mt-2');
    });
  });

  it('renders the coming soon section with correct styling', async () => {
    const { container } = render(<ActivityTable />);

    await waitFor(() => {
      const comingSoonSection = container.querySelector('.text-center.py-8.text-muted-foreground');
      expect(comingSoonSection).toBeInTheDocument();
    });
  });

  it('renders all expected text content', async () => {
    render(<ActivityTable />);

    await waitFor(() => {
      expect(screen.getByText('Activity & Timeline')).toBeInTheDocument();
      expect(screen.getByText('See your recent activities and timeline here.')).toBeInTheDocument();
      expect(screen.getByText('Activity functionality coming soon!')).toBeInTheDocument();
      expect(
        screen.getByText('This will include search, filter, and sort capabilities.')
      ).toBeInTheDocument();
    });
  });

  it('has proper component structure with all required elements', async () => {
    const { container } = render(<ActivityTable />);

    await waitFor(() => {
      // Check for activity container (second card)
      const activityContainer = container.querySelectorAll(
        '.rounded-lg.border.bg-card.text-card-foreground.shadow-sm'
      )[1];
      expect(activityContainer).toBeInTheDocument();

      // Check for title
      const title = activityContainer?.querySelector('h2');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Activity & Timeline');

      // Check for description
      const description = activityContainer?.querySelector('p');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent('See your recent activities and timeline here.');

      // Check for coming soon section
      const comingSoonSection = activityContainer?.querySelector(
        '.text-center.py-8.text-muted-foreground'
      );
      expect(comingSoonSection).toBeInTheDocument();
    });
  });

  it('renders with correct semantic structure', async () => {
    const { container } = render(<ActivityTable />);

    await waitFor(() => {
      // Check for proper heading hierarchy
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Activity & Timeline');

      // Check for proper paragraph elements
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(3); // Description + 2 coming soon messages
    });
  });

  it('maintains consistent styling classes', async () => {
    const { container } = render(<ActivityTable />);

    await waitFor(() => {
      const mainContainer = container.querySelector(
        '.rounded-lg.border.bg-card.text-card-foreground.shadow-sm'
      );
      expect(mainContainer).toBeInTheDocument();

      const title = screen.getByText('Activity & Timeline');
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'mb-4');

      const description = screen.getByText('See your recent activities and timeline here.');
      expect(description).toHaveClass('text-muted-foreground', 'mb-4');
    });
  });
});
