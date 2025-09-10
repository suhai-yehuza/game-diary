import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { toast } from 'sonner';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameLogModal } from '@/app/components/game-logs/BaseGameLogModal';

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
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: vi.fn(fn => fn),
    formState: { errors: {}, isSubmitting: false, isValid: true },
    reset: vi.fn(),
    setValue: vi.fn(),
  }),
}));

// Mock @hookform/resolvers/zod
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(),
}));

// Mock useOptimizedMutation
const mockCreateFn = vi.fn();
const mockUpdateFn = vi.fn();

let createMutationOptions: any = null;
let updateMutationOptions: any = null;

vi.mock('@/hooks/use-optimized-mutation', () => ({
  useOptimizedMutation: vi.fn((_doc: any, options: any) => {
    // Store options so tests can trigger callbacks
    if (_doc === 'CREATE_GAME_LOG') {
      createMutationOptions = options;
      return [mockCreateFn, { loading: false, error: undefined }];
    } else if (_doc === 'UPDATE_GAME_LOG') {
      updateMutationOptions = options;
      return [mockUpdateFn, { loading: false, error: undefined }];
    }
    return [vi.fn(), { loading: false, error: undefined }];
  }),
}));

// Mock other dependencies
vi.mock('@/lib/constants', () => ({
  CLASSIFICATION: { PROTECTED: 'PROTECTED' },
  WATCHED_SETTING: { TV: 'TV' },
  WATCHED_SCOPE: { FULL_GAME: 'FULL_GAME' },
}));

vi.mock('@/lib/graphql/mutations', () => ({
  CREATE_GAME_LOG: 'CREATE_GAME_LOG',
  UPDATE_GAME_LOG: 'UPDATE_GAME_LOG',
}));

vi.mock('@/lib/utils/error-handler', () => ({
  errorHandlers: {
    api: vi.fn(),
  },
}));

vi.mock('@/lib/utils/nba-season', () => ({
  getLatestNbaSeason: vi.fn(() => 2024),
  getRecentNbaSeasons: vi.fn(() => [2024, 2023, 2022]),
}));

vi.mock('@/app/components/game-logs/utils/gameLogsUtils', () => ({
  generateDistinctTagColors: vi.fn(() => []),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Minimal fetch mock for game list requests during create mode
global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ response: [] }) }) as any;

describe('GameLogModal toasts', () => {
  const mockToast = vi.mocked(toast);

  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    createMutationOptions = null;
    updateMutationOptions = null;
  });

  it('shows success toast on create success', async () => {
    // Arrange modal in create mode
    render(<GameLogModal mode="create" isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    // Wait for component to render
    await waitFor(() => {
      expect(document.querySelector('form')).toBeInTheDocument();
    });

    // Wait for mutation options to be set
    await waitFor(() => {
      expect(createMutationOptions).toBeTruthy();
    });

    // Simulate successful mutation completion
    createMutationOptions.onCompleted({
      createGameLog: { gameLog: { id: 'test-log' }, errors: [] },
    });

    // The success toast should be shown
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Game log created!');
    });
  });

  it('shows error toast with API message on create failure', async () => {
    // Arrange modal in create mode
    render(<GameLogModal mode="create" isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    // Wait for component to render
    await waitFor(() => {
      expect(document.querySelector('form')).toBeInTheDocument();
    });

    // Wait for mutation options to be set
    await waitFor(() => {
      expect(createMutationOptions).toBeTruthy();
    });

    // Simulate mutation completion with error
    createMutationOptions.onCompleted({
      createGameLog: { gameLog: null, errors: [{ message: 'Creation failed' }] },
    });

    // The error toast should be shown
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Creation failed');
    });
  });

  it('shows generic error toast on create onError', async () => {
    // Arrange modal in create mode
    render(<GameLogModal mode="create" isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    // Wait for component to render
    await waitFor(() => {
      expect(document.querySelector('form')).toBeInTheDocument();
    });

    // Wait for mutation options to be set
    await waitFor(() => {
      expect(createMutationOptions).toBeTruthy();
    });

    // Simulate mutation error
    createMutationOptions.onError(new Error('Boom'));

    // The error toast should be shown
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to create game log.');
    });
  });

  it('shows success toast on update success', async () => {
    // Arrange modal in edit mode
    render(
      <GameLogModal
        mode="edit"
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        gameLog={{ id: 'log-1', rating_for_game: 3, tags: [], classification: 'PUBLIC' }}
      />
    );

    // Wait for component to render
    await waitFor(() => {
      expect(document.querySelector('form')).toBeInTheDocument();
    });

    // Wait for mutation options to be set
    await waitFor(() => {
      expect(updateMutationOptions).toBeTruthy();
    });

    // Simulate successful mutation completion
    updateMutationOptions.onCompleted({
      updateGameLog: { gameLog: { id: 'log-1' }, errors: [] },
    });

    // The success toast should be shown
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Game log updated!');
    });
  });

  it('shows error toast with backend message on update failure (errors array)', async () => {
    // Arrange modal in edit mode
    render(
      <GameLogModal
        mode="edit"
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        gameLog={{ id: 'log-1', rating_for_game: 3, tags: [], classification: 'PUBLIC' }}
      />
    );

    // Wait for component to render
    await waitFor(() => {
      expect(document.querySelector('form')).toBeInTheDocument();
    });

    // Wait for mutation options to be set
    await waitFor(() => {
      expect(updateMutationOptions).toBeTruthy();
    });

    // Simulate mutation completion with error
    updateMutationOptions.onCompleted({
      updateGameLog: { gameLog: null, errors: [{ message: 'Update failed' }] },
    });

    // The error toast should be shown
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Update failed');
    });
  });

  it('shows generic error toast on update onError', async () => {
    // Arrange modal in edit mode
    render(
      <GameLogModal
        mode="edit"
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        gameLog={{ id: 'log-1', rating_for_game: 3, tags: [], classification: 'PUBLIC' }}
      />
    );

    // Wait for component to render
    await waitFor(() => {
      expect(document.querySelector('form')).toBeInTheDocument();
    });

    // Wait for mutation options to be set
    await waitFor(() => {
      expect(updateMutationOptions).toBeTruthy();
    });

    // Simulate mutation error
    updateMutationOptions.onError(new Error('Boom'));

    // The error toast should be shown
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to update game log: Boom');
    });
  });
});
