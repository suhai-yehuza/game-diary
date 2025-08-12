import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { FriendRequestCard } from '@/app/protected/user/components/FriendRequestCard';

vi.mock('lucide-react', () => ({
  UserPlus: (props: any) => <svg data-testid="userplus-icon" {...props} />,
  Check: (props: any) => <svg data-testid="check-icon" {...props} />,
  X: (props: any) => <svg data-testid="x-icon" {...props} />,
}));

describe('FriendRequestCard branch coverage', () => {
  const request = {
    id: 'fr1',
    initiator: { id: 'i1', first_name: 'A', last_name: 'Req', username: 'areq', image_url: '' },
  } as any;

  it('accepts and rejects requests', async () => {
    const onAccept = vi.fn(async () => {});
    const onReject = vi.fn(async () => {});
    render(
      <FriendRequestCard
        request={request}
        onAccept={onAccept}
        onReject={onReject}
        loading={false}
      />
    );

    fireEvent.click(screen.getByText('Accept'));
    await waitFor(() => expect(onAccept).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Reject'));
    await waitFor(() => expect(onReject).toHaveBeenCalled());
  });
});
