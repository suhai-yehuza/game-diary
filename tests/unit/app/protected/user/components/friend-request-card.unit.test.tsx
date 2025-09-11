import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { FriendRequestCard } from '@/app/protected/dashboard/components/FriendRequestCard';

describe('FriendRequestCard (unit)', () => {
  it('renders requester and triggers accept/reject', async () => {
    const onAccept = vi.fn(async () => {});
    const onReject = vi.fn(async () => {});
    const request = {
      id: 'r1',
      status: 'PENDING',
      initiator: { id: 'x', username: 'x', first_name: 'X', last_name: 'Y', image_url: '' },
    };
    render(
      <FriendRequestCard
        request={request as any}
        onAccept={onAccept}
        onReject={onReject}
        loading={false}
      />
    );
    expect(screen.getByText('X Y')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Accept'));
    fireEvent.click(screen.getByText('Reject'));
    expect(onAccept).toHaveBeenCalledWith('r1');
    expect(onReject).toHaveBeenCalledWith('r1');
  });
});
