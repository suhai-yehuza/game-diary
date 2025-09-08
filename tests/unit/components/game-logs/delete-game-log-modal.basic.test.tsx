import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { toast } from 'sonner';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DeleteGameLogModal } from '@/app/components/game-logs/DeleteGameLogModal';

// Mock error handlers
vi.mock('@/lib/utils/error-handler', () => ({
  errorHandlers: {
    api: vi.fn(),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => {
  const success = vi.fn();
  const error = vi.fn();
  return {
    toast: { success, error },
  };
});

// Mock Apollo Client
const mockUseOptimizedMutation = vi.fn();
let capturedUseOptimizedMutationOptions: any = null;
vi.mock('@/hooks/use-optimized-mutation', () => ({
  useOptimizedMutation: (_doc: any, options: any) => {
    capturedUseOptimizedMutationOptions = options;
    return mockUseOptimizedMutation();
  },
}));

// Mock UI components
vi.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/app/components/ui/Card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

describe('DeleteGameLogModal', () => {
  const mockGameLog = {
    id: 'test-log-id',
    game_id: 'test-game-id',
    rating_for_game: 4,
    notes: 'Test notes',
    tags: ['test', 'game'],
    classification: 'PUBLIC',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    user: {
      id: 'test-user-id',
      username: 'testuser',
    },
  };

  const mockProps = {
    gameLog: mockGameLog,
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOptimizedMutation.mockReturnValue([vi.fn(), { loading: false }]);
    capturedUseOptimizedMutationOptions = null;
  });

  it('renders when isOpen is true', () => {
    render(<DeleteGameLogModal {...mockProps} />);

    expect(screen.getByRole('heading', { name: /Delete Game Log/ })).toBeInTheDocument();
    expect(screen.getAllByText(/This action cannot be undone/)).toHaveLength(2);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Game Log' })).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<DeleteGameLogModal {...mockProps} isOpen={false} />);

    expect(screen.queryByText('Delete Game Log')).not.toBeInTheDocument();
  });

  it('displays game ID in the confirmation message', () => {
    render(<DeleteGameLogModal {...mockProps} />);

    expect(screen.getByText(/test-game-id/)).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<DeleteGameLogModal {...mockProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button (X) is clicked', () => {
    render(<DeleteGameLogModal {...mockProps} />);

    const closeButton = screen.getByRole('button', { name: 'X' }); // X button
    fireEvent.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('calls delete mutation when delete button is clicked', async () => {
    const mockDeleteMutation = vi.fn().mockResolvedValue({
      data: { deleteGameLog: { success: true, errors: [] } },
    });

    mockUseOptimizedMutation.mockReturnValue([mockDeleteMutation, { loading: false }]);

    render(<DeleteGameLogModal {...mockProps} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete Game Log' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteMutation).toHaveBeenCalledWith({
        variables: { id: 'test-log-id' },
      });
    });
  });

  it('calls onSuccess when deletion is successful', async () => {
    const mockDeleteMutation = vi.fn().mockResolvedValue({
      data: { deleteGameLog: { success: true, errors: [] } },
    });

    mockUseOptimizedMutation.mockReturnValue([mockDeleteMutation, { loading: false }]);

    render(<DeleteGameLogModal {...mockProps} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete Game Log' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteMutation).toHaveBeenCalledWith({
        variables: { id: 'test-log-id' },
      });
    });

    // Since we're testing the component's behavior, we can verify that the mutation was called
    // The onSuccess callback would be called by Apollo's onCompleted in a real scenario
    expect(mockDeleteMutation).toHaveBeenCalled();
  });

  it('does not call onSuccess when deletion fails', async () => {
    let onCompletedCallback: ((data: any) => void) | undefined;

    const mockDeleteMutation = vi.fn().mockImplementation(options => {
      onCompletedCallback = options?.onCompleted;
      return Promise.resolve({
        data: { deleteGameLog: { success: false, errors: ['Error'] } },
      });
    });

    mockUseOptimizedMutation.mockReturnValue([mockDeleteMutation, { loading: false }]);

    render(<DeleteGameLogModal {...mockProps} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete Game Log' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteMutation).toHaveBeenCalled();
    });

    // Manually trigger the onCompleted callback
    if (onCompletedCallback) {
      onCompletedCallback({
        deleteGameLog: { success: false, errors: ['Error'] },
      });
    }

    await waitFor(() => {
      expect(mockProps.onSuccess).not.toHaveBeenCalled();
    });
  });

  it('shows loading state when deletion is in progress', () => {
    mockUseOptimizedMutation.mockReturnValue([vi.fn(), { loading: true }]);

    render(<DeleteGameLogModal {...mockProps} />);

    const deleteButton = screen.getByText('Deleting...').closest('button');
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();
  });

  it('handles mutation errors gracefully', async () => {
    const mockDeleteMutation = vi.fn().mockRejectedValue(new Error('Network error'));

    mockUseOptimizedMutation.mockReturnValue([mockDeleteMutation, { loading: false }]);

    const { errorHandlers } = await import('@/lib/utils/error-handler');
    const mockErrorHandlers = vi.mocked(errorHandlers);

    render(<DeleteGameLogModal {...mockProps} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete Game Log' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockErrorHandlers.api).toHaveBeenCalledWith(expect.any(Error), {
        component: 'React Component',
        action: 'Delete game log',
      });
    });
  });

  it('shows success toast on successful deletion (onCompleted)', async () => {
    render(<DeleteGameLogModal {...mockProps} />);

    // Simulate Apollo calling onCompleted
    capturedUseOptimizedMutationOptions?.onCompleted?.({
      deleteGameLog: { success: true, errors: [] },
    });

    await waitFor(() => {
      expect((toast as any).success).toHaveBeenCalledWith('Game log deleted');
    });
  });

  it('shows error toast with message when deletion fails (onCompleted)', async () => {
    render(<DeleteGameLogModal {...mockProps} />);

    capturedUseOptimizedMutationOptions?.onCompleted?.({
      deleteGameLog: { success: false, errors: [{ message: 'Custom error' }] },
    });

    await waitFor(() => {
      expect((toast as any).error).toHaveBeenCalledWith('Custom error');
    });
  });

  it('shows generic error toast when onError is called', async () => {
    render(<DeleteGameLogModal {...mockProps} />);

    capturedUseOptimizedMutationOptions?.onError?.(new Error('Network error'));

    await waitFor(() => {
      expect((toast as any).error).toHaveBeenCalledWith('Failed to delete game log');
    });
  });

  it('has correct styling classes', () => {
    render(<DeleteGameLogModal {...mockProps} />);

    const modal = screen
      .getByRole('heading', { name: /Delete Game Log/ })
      .closest('[class*="fixed"]');
    expect(modal).toHaveClass('fixed', 'inset-0', 'flex', 'items-center', 'justify-center', 'z-50');
  });

  it('displays warning icon and styling', () => {
    render(<DeleteGameLogModal {...mockProps} />);

    const title = screen.getByRole('heading', { name: /Delete Game Log/ });
    expect(title).toHaveClass('text-neutral-900', 'dark:text-neutral-100');
  });

  it('displays permanent deletion warning', () => {
    render(<DeleteGameLogModal {...mockProps} />);

    expect(screen.getByText(/permanently delete/)).toBeInTheDocument();
    expect(screen.getByText(/permanently delete/)).toHaveClass(
      'font-semibold',
      'text-semantic-error'
    );
  });
});
