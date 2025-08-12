import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { PendingFriendshipCard } from '@/app/protected/user/components/PendingFriendshipCard';

vi.mock('lucide-react', () => ({
  UserX: (props: any) => <svg data-testid="userx-icon" {...props} />,
  UserPlus: (props: any) => <svg data-testid="userplus-icon" {...props} />,
}));

describe('PendingFriendshipCard (unit)', () => {
  it('renders recipient and triggers cancel', async () => {
    const onWithdraw = vi.fn(async () => {});
    const onSendRequest = vi.fn(async () => {});
    const pending = {
      id: 'p1',
      status: 'PENDING',
      recipient: { id: 'b1', username: 'bob', first_name: 'Bob', last_name: 'B', image_url: '' },
    };
    render(
      <PendingFriendshipCard
        pending={pending as any}
        onWithdraw={onWithdraw}
        onSendRequest={onSendRequest}
        loading={false}
      />
    );
    expect(screen.getByText('Bob B')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel Request'));
    expect(onWithdraw).toHaveBeenCalledWith('p1', 'cancel-request');
  });
});
