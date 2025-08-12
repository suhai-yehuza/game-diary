import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { UserSearchResultCard } from '@/app/protected/user/components/UserSearchResultCard';

vi.mock('@/hooks/use-friendships', () => ({
  useFriendshipStatus: () => ({
    status: null,
    refetch: vi.fn(async () => ({ data: { friendshipStatus: { friendshipId: 'fx' } } })),
  }),
}));

vi.mock('lucide-react', () => ({
  UserPlus: (props: any) => <svg data-testid="userplus-icon" {...props} />,
}));

describe('UserSearchResultCard (unit)', () => {
  it('shows add friend and triggers send', async () => {
    const onSend = vi.fn(async () => {});
    const onRemove = vi.fn(async () => {});
    const user = {
      id: 'u2',
      username: 'eve',
      first_name: 'Eve',
      last_name: 'E',
      image_url: '',
    };
    render(
      <UserSearchResultCard
        user={user as any}
        currentUserId="me"
        onSendRequest={onSend}
        onRemoveFriend={onRemove}
        loading={false}
      />
    );
    fireEvent.click(screen.getByText('Add Friend'));
    expect(onSend).toHaveBeenCalledWith('u2', expect.any(Function));
  });
});
