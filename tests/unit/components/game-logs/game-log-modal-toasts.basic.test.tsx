import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { toast } from 'sonner';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameLogModal } from '@/app/components/game-logs/GameLogModal';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: { id: 'user-1' },
  }),
}));

// Mock UI components used inside modal
vi.mock('@/app/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));
vi.mock('@/app/components/ui/Card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

// Mock lucide-react icons to avoid SVG complexity
vi.mock('lucide-react', () => ({
  X: (props: any) => <div data-testid="x-icon" {...props} />,
  Star: (props: any) => <div data-testid="star-icon" {...props} />,
  Search: (props: any) => <div data-testid="search-icon" {...props} />,
  Calendar: (props: any) => <div data-testid="calendar-icon" {...props} />,
  MapPin: (props: any) => <div data-testid="mappin-icon" {...props} />,
  ChevronDown: (props: any) => <div data-testid="chevrondown-icon" {...props} />,
  ChevronRight: (props: any) => <div data-testid="chevronright-icon" {...props} />,
}));

// Mock sonner toast
vi.mock('sonner', () => {
  const success = vi.fn();
  const error = vi.fn();
  return {
    toast: { success, error },
  };
});

// Apollo mocks
let capturedCreateOptions: any = null;
let capturedUpdateOptions: any = null;
const mockCreateFn = vi.fn();
const mockUpdateFn = vi.fn();

vi.mock('@apollo/client', () => ({
  useMutation: (_doc: any, options: any) => {
    // Distinguish by presence of id in variables shape when invoked
    if (!capturedCreateOptions) {
      capturedCreateOptions = options;
      return [mockCreateFn, { loading: false }];
    }
    capturedUpdateOptions = options;
    return [mockUpdateFn, { loading: false }];
  },
  gql: vi.fn(),
}));

// Minimal fetch mock for game list requests during create mode
global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ response: [] }) }) as any;

describe('GameLogModal toasts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedCreateOptions = null;
    capturedUpdateOptions = null;
  });

  it('shows success toast on create success', async () => {
    // Arrange modal in create mode
    render(<GameLogModal mode="create" isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    // Simulate onCompleted from create mutation
    capturedCreateOptions?.onCompleted?.({ createGameLog: { gameLog: {}, errors: [] } });

    await waitFor(() => {
      expect((toast as any).success).toHaveBeenCalledWith('Game log created!');
    });
  });

  it('shows error toast with API message on create failure', async () => {
    render(<GameLogModal mode="create" isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    capturedCreateOptions?.onCompleted?.({
      createGameLog: { gameLog: null, errors: [{ message: 'Creation failed' }] },
    });

    await waitFor(() => {
      expect((toast as any).error).toHaveBeenCalledWith('Creation failed');
    });
  });

  it('shows generic error toast on create onError', async () => {
    render(<GameLogModal mode="create" isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    capturedCreateOptions?.onError?.(new Error('Boom'));

    await waitFor(() => {
      expect((toast as any).error).toHaveBeenCalledWith('Failed to create game log.');
    });
  });

  it('shows success toast on update success', async () => {
    render(
      <GameLogModal
        mode="edit"
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        gameLog={{ id: 'log-1', rating_for_game: 3, tags: [], classification: 'PUBLIC' }}
      />
    );

    capturedUpdateOptions?.onCompleted?.({
      updateGameLog: { gameLog: { id: 'log-1' }, errors: [] },
    });

    await waitFor(() => {
      expect((toast as any).success).toHaveBeenCalledWith('Game log updated!');
    });
  });

  it('shows error toast with backend message on update failure (errors array)', async () => {
    render(
      <GameLogModal
        mode="edit"
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        gameLog={{ id: 'log-1', rating_for_game: 3, tags: [], classification: 'PUBLIC' }}
      />
    );

    capturedUpdateOptions?.onCompleted?.({
      updateGameLog: { gameLog: null, errors: [{ message: 'Update failed' }] },
    });

    await waitFor(() => {
      expect((toast as any).error).toHaveBeenCalledWith('Update failed');
    });
  });

  it('shows generic error toast on update onError', async () => {
    render(
      <GameLogModal
        mode="edit"
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        gameLog={{ id: 'log-1', rating_for_game: 3, tags: [], classification: 'PUBLIC' }}
      />
    );

    capturedUpdateOptions?.onError?.(new Error('Boom'));

    await waitFor(() => {
      expect((toast as any).error).toHaveBeenCalledWith('Failed to update game log: Boom');
    });
  });
});
