import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import {
  NotificationProvider,
  useNotifications,
} from '@/app/components/providers/NotificationProvider';

vi.mock('@apollo/client', () => ({
  gql: (literals: TemplateStringsArray) => String(literals),
  useQuery: () => ({ data: undefined, refetch: vi.fn() }),
  useMutation: () => [vi.fn(async () => ({}))],
}));

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: null }),
}));

vi.mock('sonner', () => ({
  toast: { info: vi.fn(), error: vi.fn() },
}));

function Consumer() {
  const { unreadCount, addNotification, clearNotifications } = useNotifications();
  return (
    <div>
      <span data-testid="unread">{unreadCount}</span>
      <button
        onClick={() => addNotification({ title: 'T', message: 'M', type: 'info', userId: 'u1' })}
      >
        add
      </button>
      <button onClick={() => clearNotifications()}>clear</button>
    </div>
  );
}

describe('NotificationProvider (extended)', () => {
  it('adds and clears notifications, updating unread count', () => {
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>
    );
    const unread = screen.getByTestId('unread');
    expect(unread.textContent).toBe('0');
    fireEvent.click(screen.getByText('add'));
    expect(unread.textContent).toBe('1');
    fireEvent.click(screen.getByText('clear'));
    expect(unread.textContent).toBe('0');
  });
});
