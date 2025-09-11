import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('lucide-react', () => ({
  UserPlus: (props: any) => <svg data-testid="userplus-icon" {...props} />,
}));

const mockImpl: { useFriendshipStatus: any } = {
  useFriendshipStatus: () => ({
    status: null,
    refetch: vi.fn(async () => ({ data: { friendshipStatus: { friendshipId: 'fid' } } })),
  }),
};

vi.mock('@/hooks/use-friendships', () => ({
  useFriendshipStatus: (...args: any[]) => mockImpl.useFriendshipStatus(...args),
}));

import { UserSearchResultCard } from '@/app/protected/dashboard/components/UserSearchResultCard';

describe('UserSearchResultCard branch coverage', () => {
  const baseUser = {
    id: 'u1',
    username: 'john',
    first_name: 'John',
    last_name: 'Doe',
    email_address: 'j@d.com',
    image_url: '',
  } as any;

  it('shows "This is you" when user is current user', () => {
    mockImpl.useFriendshipStatus = () => ({ status: null, refetch: vi.fn() });
    render(
      <UserSearchResultCard
        user={{ ...baseUser, id: 'me' }}
        currentUserId="me"
        onSendRequest={vi.fn()}
        onRemoveFriend={vi.fn()}
        loading={false}
      />
    );
    expect(screen.getByText('This is you')).toBeInTheDocument();
  });

  it('shows Friends badge when status is ACCEPTED', () => {
    mockImpl.useFriendshipStatus = () => ({ status: { status: 'ACCEPTED' }, refetch: vi.fn() });
    const { unmount } = render(
      <UserSearchResultCard
        user={baseUser}
        currentUserId="me"
        onSendRequest={vi.fn()}
        onRemoveFriend={vi.fn()}
        loading={false}
      />
    );
    expect(screen.getByText('Friends')).toBeInTheDocument();
    unmount();
  });

  it('shows Request Received when status is PENDING and not initiator', () => {
    mockImpl.useFriendshipStatus = () => ({
      status: { status: 'PENDING', isInitiator: false },
      refetch: vi.fn(),
    });
    const { unmount } = render(
      <UserSearchResultCard
        user={baseUser}
        currentUserId="me"
        onSendRequest={vi.fn()}
        onRemoveFriend={vi.fn()}
        loading={false}
      />
    );
    expect(screen.getByText('Request Received')).toBeInTheDocument();
    unmount();
  });

  it('toggles between Add Friend and Cancel Request paths', async () => {
    const refetch = vi.fn(async () => ({ data: { friendshipStatus: { friendshipId: 'fid-1' } } }));
    mockImpl.useFriendshipStatus = () => ({ status: null, refetch });
    const onSendRequest = vi.fn(async () => {});
    const onRemoveFriend = vi.fn(async () => {});

    const { rerender, unmount } = render(
      <UserSearchResultCard
        user={baseUser}
        currentUserId="me"
        onSendRequest={onSendRequest}
        onRemoveFriend={onRemoveFriend}
        loading={false}
      />
    );

    // Initially shows Add Friend
    const addBtn = screen.getByText('Add Friend');
    fireEvent.click(addBtn);
    await waitFor(() => expect(onSendRequest).toHaveBeenCalled());

    // After sending, local state considers pending; now Cancel Request should be visible
    rerender(
      <UserSearchResultCard
        user={baseUser}
        currentUserId="me"
        onSendRequest={onSendRequest}
        onRemoveFriend={onRemoveFriend}
        loading={false}
      />
    );

    const cancelBtn = await screen.findByText('Cancel Request');
    fireEvent.click(cancelBtn);
    await waitFor(() => expect(onRemoveFriend).toHaveBeenCalled());

    unmount();
  });
});
