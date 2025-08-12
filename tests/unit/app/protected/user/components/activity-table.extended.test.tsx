import { render, screen } from '@testing-library/react';
import React from 'react';

import { ActivityTable } from '@/app/protected/user/components/ActivityTable';

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: null }),
}));

describe('ActivityTable', () => {
  it('shows sign-in prompt when no user', () => {
    render(<ActivityTable />);
    expect(screen.getByText('Please sign in to view your activity.')).toBeInTheDocument();
  });
});
