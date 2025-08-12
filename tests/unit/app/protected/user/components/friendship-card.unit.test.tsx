import { render, screen } from '@testing-library/react';
import React from 'react';

import { FriendshipCard } from '@/app/protected/user/components/FriendshipCard';

vi.mock('lucide-react', () => ({
  UserX: (props: any) => <svg data-testid="userx-icon" {...props} />,
  MoreHorizontal: (props: any) => <svg data-testid="more-icon" {...props} />,
}));

const baseFriend = {
  id: 'f1',
  status: 'ACCEPTED',
  initiator: { id: 'a1', username: 'alice', first_name: 'Alice', last_name: 'A', image_url: '' },
  recipient: { id: 'b1', username: 'bob', first_name: 'Bob', last_name: 'B', image_url: '' },
};

describe('FriendshipCard (unit)', () => {
  it('renders friend details for recipient when current user is initiator', () => {
    render(
      <FriendshipCard
        friendship={baseFriend as any}
        currentUserId="a1"
        onRemove={async () => {}}
        loading={false}
      />
    );
    expect(screen.getByText('Bob B')).toBeInTheDocument();
    expect(screen.getByText('@bob')).toBeInTheDocument();
    expect(screen.getByText('Friends')).toBeInTheDocument();
  });
});
