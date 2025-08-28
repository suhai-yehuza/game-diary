import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { UserSearchResult } from '@/app/components/search/UserSearchResult';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('UserSearchResult (extended)', () => {
  it('navigates on click and renders username and joined date', () => {
    const user = {
      id: '1',
      type: 'user' as const,
      created_at: '2023-01-02',
      username: 'tester',
      first_name: 'Test',
      last_name: 'User',
      image_url: '',
      email_address: 't@example.com',
    };
    render(<UserSearchResult user={user as any} />);
    fireEvent.click(screen.getByText('Test User'));
    expect(screen.getByText('tester')).toBeInTheDocument();
    expect(screen.getByText(/Joined/)).toBeInTheDocument();
  });
});
