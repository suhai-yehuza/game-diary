import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { PendingFriendshipCard } from '@/app/protected/dashboard/components/PendingFriendshipCard';

vi.mock('lucide-react', () => ({
  UserX: (props: any) => <svg data-testid="userx-icon" {...props} />,
  UserPlus: (props: any) => <svg data-testid="userplus-icon" {...props} />,
}));

describe('PendingFriendshipCard branch coverage', () => {
  const pending = {
    id: 'p1',
    recipient: { id: 'r1', first_name: 'R', last_name: 'One', username: 'rone', image_url: '' },
  } as any;

  it('shows Cancel Request then Add Friend after cancel', async () => {
    const onWithdraw = vi.fn(async () => {});
    const onSendRequest = vi.fn(async () => {});
    render(
      <PendingFriendshipCard
        pending={pending}
        onWithdraw={onWithdraw}
        onSendRequest={onSendRequest}
        loading={false}
      />
    );

    const cancel = screen.getByText('Cancel Request');
    fireEvent.click(cancel);
    await waitFor(() => expect(onWithdraw).toHaveBeenCalled());

    // After cancel, Add Friend path appears
    const add = await screen.findByText('Add Friend');
    fireEvent.click(add);
    await waitFor(() => expect(onSendRequest).toHaveBeenCalled());
  });
});
