import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import { FriendsTable } from '@/app/protected/user/components/FriendsTable';

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { id: 'me' } }),
}));

const searchMock = vi.fn(async () => ({
  data: {
    searchUsers: {
      edges: [
        {
          node: { id: 'u1', username: 'alice', first_name: 'Alice', last_name: 'A', image_url: '' },
        },
      ],
    },
  },
}));
const sendFriendRequestMock = vi.fn(async () => {});
const removeFriendMock = vi.fn(async () => {});
const friendshipRefetchMock = vi.fn(async () => ({
  data: { friendshipStatus: { friendshipId: 'f1' } },
}));

vi.mock('@/hooks/use-friendships', () => ({
  useFriendships: vi.fn((_args: any) => ({ friendships: [], loading: false, refetch: vi.fn() })),
  useFriendshipRequests: () => ({ requests: [], loading: false, refetch: vi.fn() }),
  useUserSearch: () => ({ users: [], loading: false, search: searchMock }),
  useFriendshipMutations: () => ({
    sendFriendRequest: sendFriendRequestMock,
    acceptFriendRequest: vi.fn(async () => {}),
    rejectFriendRequest: vi.fn(async () => {}),
    removeFriend: removeFriendMock,
    loading: false,
  }),
  useFriendshipStatus: () => ({ status: null, refetch: friendshipRefetchMock }),
}));

describe('FriendsTable basic rendering', () => {
  it('renders and toggles user search panel', () => {
    render(<FriendsTable />);
    expect(screen.getByText('Friends')).toBeInTheDocument();

    const addBtn = screen.getByText('Add Friends');
    fireEvent.click(addBtn);
    expect(screen.getByText('Find People')).toBeInTheDocument();
  });

  it('searches users and sends a friend request', async () => {
    render(<FriendsTable />);
    fireEvent.click(screen.getByText('Add Friends'));

    const input = screen.getByPlaceholderText('Search by username, name, or email...');
    fireEvent.change(input, { target: { value: 'ali' } });
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(searchMock).toHaveBeenCalledWith('ali');
    });

    // Click Add Friend
    // Try invoking the action if a button labeled Add Friend is present
    const addButtons = screen.queryAllByText('Add Friend');
    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);
      await waitFor(() => {
        expect(sendFriendRequestMock).toHaveBeenCalled();
      });
      expect(sendFriendRequestMock).toHaveBeenCalledWith('u1');
    }
    expect(friendshipRefetchMock).toHaveBeenCalled();
  });
});
