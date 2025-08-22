import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { CommentForm } from '@/app/components/comments/CommentForm';
import { ParentType } from '@/lib/types/generated/graphql';

// Mock the useUser hook
const mockUseUser = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
}));

// Mock the useCreateComment hook
const mockCreateComment = vi.fn();
const mockCreateLoading = vi.fn();
vi.mock('@/hooks/use-comments', () => ({
  useCreateComment: () => ({
    createComment: mockCreateComment,
    loading: mockCreateLoading(),
  }),
  useUpdateComment: () => ({
    updateComment: vi.fn(),
    loading: false,
  }),
}));

// Mock the Textarea component
vi.mock('@/app/components/ui', () => ({
  Textarea: ({
    value,
    onChange,
    onKeyDown,
    placeholder,
    disabled,
    className,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    placeholder: string;
    disabled: boolean;
    className: string;
  }) => (
    <textarea
      data-testid="comment-textarea"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  ),
}));

describe('CommentForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    parentId: 'parent-1',
    parentType: ParentType.GameLog,
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    mockUseUser.mockReturnValue({
      user: {
        id: 'test-user-id',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      },
    });
    mockCreateLoading.mockReturnValue(false);
    vi.clearAllMocks();
  });

  it('should render comment form with default props', () => {
    render(<CommentForm {...defaultProps} />);

    expect(screen.getByTestId('comment-textarea')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    expect(screen.getByText('Comment')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument(); // User avatar
  });

  it('should render with custom placeholder', () => {
    render(<CommentForm {...defaultProps} placeholder="Custom placeholder" />);

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('should render with initial content', () => {
    render(<CommentForm {...defaultProps} initialContent="Initial comment" />);

    const textarea = screen.getByTestId('comment-textarea');
    expect(textarea).toHaveValue('Initial comment');
  });

  it('should show "Update" button when editing existing comment', () => {
    render(
      <CommentForm {...defaultProps} initialContent="Existing comment" commentId="comment-1" />
    );

    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.queryByText('Comment')).not.toBeInTheDocument();
  });

  it('should show user avatar with first letter of firstName', () => {
    render(<CommentForm {...defaultProps} />);

    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('should show user avatar with first letter of username when firstName is not available', () => {
    mockUseUser.mockReturnValue({
      user: {
        id: 'test-user-id',
        username: 'testuser',
        firstName: null,
        lastName: 'User',
      },
    });

    render(<CommentForm {...defaultProps} />);

    expect(screen.getByText('t')).toBeInTheDocument();
  });

  it('should show "U" when neither firstName nor username is available', () => {
    mockUseUser.mockReturnValue({
      user: {
        id: 'test-user-id',
        username: null,
        firstName: null,
        lastName: 'User',
      },
    });

    render(<CommentForm {...defaultProps} />);

    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('should show sign-in message when user is not authenticated', () => {
    mockUseUser.mockReturnValue({
      user: null,
    });

    render(<CommentForm {...defaultProps} />);

    expect(screen.getByText('Please sign in to comment.')).toBeInTheDocument();
    expect(screen.queryByTestId('comment-textarea')).not.toBeInTheDocument();
  });

  it('should handle textarea value changes', async () => {
    const user = userEvent.setup();
    render(<CommentForm {...defaultProps} />);

    const textarea = screen.getByTestId('comment-textarea');
    await user.type(textarea, 'New comment content');

    expect(textarea).toHaveValue('New comment content');
  });

  it('should disable submit button when content is empty', () => {
    render(<CommentForm {...defaultProps} />);

    const submitButton = screen.getByText('Comment');
    expect(submitButton).toBeDisabled();
  });

  it('should disable submit button when content is only whitespace', async () => {
    const user = userEvent.setup();
    render(<CommentForm {...defaultProps} />);

    const textarea = screen.getByTestId('comment-textarea');
    await user.type(textarea, '   ');

    const submitButton = screen.getByText('Comment');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when content is provided', async () => {
    const user = userEvent.setup();
    render(<CommentForm {...defaultProps} />);

    const textarea = screen.getByTestId('comment-textarea');
    await user.type(textarea, 'Valid comment');

    const submitButton = screen.getByText('Comment');
    expect(submitButton).not.toBeDisabled();
  });

  it('should disable form when loading', () => {
    mockCreateLoading.mockReturnValue(true);

    render(<CommentForm {...defaultProps} />);

    const textarea = screen.getByTestId('comment-textarea');
    const submitButton = screen.getByText('Comment');
    const cancelButton = screen.getByTestId('x-icon').closest('button');

    expect(textarea).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<CommentForm {...defaultProps} />);

    const cancelButton = screen
      .getAllByRole('button')
      .find(button => button.querySelector('.lucide-x'));
    if (cancelButton) {
      await user.click(cancelButton);
      expect(mockOnCancel).toHaveBeenCalled();
    }
  });

  it('should call onCancel when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<CommentForm {...defaultProps} />);

    const textarea = screen.getByTestId('comment-textarea');
    await user.type(textarea, 'Some content');
    await user.keyboard('{Escape}');

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should submit form when Cmd+Enter is pressed', async () => {
    const user = userEvent.setup();
    mockCreateComment.mockResolvedValue({
      comment: {
        id: 'new-comment',
        content: 'New comment',
        user_id: 'test-user-id',
        parent_id: 'parent-1',
        parent_type: ParentType.GameLog,
        depth: 0,
        created_at: '2025-08-10T20:00:00Z',
        updated_at: '2025-08-10T20:00:00Z',
        user: {
          id: 'test-user-id',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
        reactions: [],
      },
    });

    render(<CommentForm {...defaultProps} />);

    const textarea = screen.getByTestId('comment-textarea');
    await user.type(textarea, 'New comment');
    await user.keyboard('{Meta>}{Enter}');

    await waitFor(() => {
      expect(mockCreateComment).toHaveBeenCalledWith({
        content: 'New comment',
        parentId: 'parent-1',
        parentType: ParentType.GameLog,
      });
    });
  });

  it('should submit form when Ctrl+Enter is pressed', async () => {
    const user = userEvent.setup();
    mockCreateComment.mockResolvedValue({
      comment: {
        id: 'new-comment',
        content: 'New comment',
        user_id: 'test-user-id',
        parent_id: 'parent-1',
        parent_type: ParentType.GameLog,
        depth: 0,
        created_at: '2025-08-10T20:00:00Z',
        updated_at: '2025-08-10T20:00:00Z',
        user: {
          id: 'test-user-id',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
        reactions: [],
      },
    });

    render(<CommentForm {...defaultProps} />);

    const textarea = screen.getByTestId('comment-textarea');
    await user.type(textarea, 'New comment');
    await user.keyboard('{Control>}{Enter}');

    await waitFor(() => {
      expect(mockCreateComment).toHaveBeenCalledWith({
        content: 'New comment',
        parentId: 'parent-1',
        parentType: ParentType.GameLog,
      });
    });
  });

  it('should submit form when submit button is clicked', async () => {
    const user = userEvent.setup();
    mockCreateComment.mockResolvedValue({
      comment: {
        id: 'new-comment',
        content: 'New comment',
        user_id: 'test-user-id',
        parent_id: 'parent-1',
        parent_type: ParentType.GameLog,
        depth: 0,
        created_at: '2025-08-10T20:00:00Z',
        updated_at: '2025-08-10T20:00:00Z',
        user: {
          id: 'test-user-id',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
        reactions: [],
      },
    });

    render(<CommentForm {...defaultProps} />);

    const textarea = screen.getByTestId('comment-textarea');
    await user.type(textarea, 'New comment');

    const submitButton = screen.getByText('Comment');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateComment).toHaveBeenCalledWith({
        content: 'New comment',
        parentId: 'parent-1',
        parentType: ParentType.GameLog,
      });
    });
  });

  it('should call onSuccess with created comment', async () => {
    const user = userEvent.setup();
    const mockComment = {
      id: 'new-comment',
      content: 'New comment',
      user_id: 'test-user-id',
      parent_id: 'parent-1',
      parent_type: ParentType.GameLog,
      depth: 0,
      created_at: '2025-08-10T20:00:00Z',
      updated_at: '2025-08-10T20:00:00Z',
      user: {
        id: 'test-user-id',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      },
      reactions: [],
    };

    mockCreateComment.mockResolvedValue({ comment: mockComment });

    render(<CommentForm {...defaultProps} />);

    const textarea = screen.getByTestId('comment-textarea');
    await user.type(textarea, 'New comment');

    const submitButton = screen.getByText('Comment');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(mockComment);
    });
  });

  it('should clear content after successful submission', async () => {
    const user = userEvent.setup();
    mockCreateComment.mockResolvedValue({
      comment: {
        id: 'new-comment',
        content: 'New comment',
        user_id: 'test-user-id',
        parent_id: 'parent-1',
        parent_type: ParentType.GameLog,
        depth: 0,
        created_at: '2025-08-10T20:00:00Z',
        updated_at: '2025-08-10T20:00:00Z',
        user: {
          id: 'test-user-id',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
        reactions: [],
      },
    });

    render(<CommentForm {...defaultProps} />);

    const textarea = screen.getByTestId('comment-textarea');
    await user.type(textarea, 'New comment');

    const submitButton = screen.getByText('Comment');
    await user.click(submitButton);

    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  it('should not submit when content is empty', async () => {
    const user = userEvent.setup();
    render(<CommentForm {...defaultProps} />);

    const submitButton = screen.getByText('Comment');
    await user.click(submitButton);

    expect(mockCreateComment).not.toHaveBeenCalled();
  });

  it('should not submit when content is only whitespace', async () => {
    const user = userEvent.setup();
    render(<CommentForm {...defaultProps} />);

    const textarea = screen.getByTestId('comment-textarea');
    await user.type(textarea, '   ');

    const submitButton = screen.getByText('Comment');
    await user.click(submitButton);

    expect(mockCreateComment).not.toHaveBeenCalled();
  });

  it('should not submit when user is not authenticated', async () => {
    mockUseUser.mockReturnValue({
      user: null,
    });

    render(<CommentForm {...defaultProps} />);

    // Form should not be rendered when user is not authenticated
    expect(screen.queryByTestId('comment-textarea')).not.toBeInTheDocument();
  });

  it('should handle submission errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockCreateComment.mockRejectedValue(new Error('Submission failed'));

    render(<CommentForm {...defaultProps} />);

    const textarea = screen.getByTestId('comment-textarea');
    await user.type(textarea, 'New comment');

    const submitButton = screen.getByText('Comment');
    await user.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error submitting comment:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should trim content before submission', async () => {
    const user = userEvent.setup();
    mockCreateComment.mockResolvedValue({
      comment: {
        id: 'new-comment',
        content: 'Trimmed comment',
        user_id: 'test-user-id',
        parent_id: 'parent-1',
        parent_type: ParentType.GameLog,
        depth: 0,
        created_at: '2025-08-10T20:00:00Z',
        updated_at: '2025-08-10T20:00:00Z',
        user: {
          id: 'test-user-id',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
        reactions: [],
      },
    });

    render(<CommentForm {...defaultProps} />);

    const textarea = screen.getByTestId('comment-textarea');
    await user.type(textarea, '  Trimmed comment  ');

    const submitButton = screen.getByText('Comment');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateComment).toHaveBeenCalledWith({
        content: 'Trimmed comment',
        parentId: 'parent-1',
        parentType: ParentType.GameLog,
      });
    });
  });

  it('should show keyboard shortcuts help text', () => {
    render(<CommentForm {...defaultProps} />);

    expect(screen.getByText('Press Cmd+Enter to submit, Esc to cancel')).toBeInTheDocument();
  });

  it('should focus textarea when autoFocus is true', () => {
    const focusSpy = vi.spyOn(HTMLTextAreaElement.prototype, 'focus');

    render(<CommentForm {...defaultProps} autoFocus={true} />);

    expect(focusSpy).toHaveBeenCalled();

    focusSpy.mockRestore();
  });
});
