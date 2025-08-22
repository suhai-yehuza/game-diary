import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { Comment } from '@/app/components/comments/Comment';
import type { IComment } from '@/lib/types';
import { ParentType } from '@/lib/types/generated/graphql';

// Mock the useUser hook
const mockUseUser = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
}));

// Mock the ReactionPicker component
vi.mock('@/app/components/reactions/ReactionPicker', () => ({
  ReactionPicker: ({ targetId, targetType }: { targetId: string; targetType: string }) => (
    <div data-testid="reaction-picker" data-target-id={targetId} data-target-type={targetType}>
      ReactionPicker
    </div>
  ),
}));

// Mock the CommentReplies component
vi.mock('@/app/components/comments/CommentReplies', () => ({
  CommentReplies: ({ commentId }: { commentId: string }) => (
    <div data-testid="comment-replies" data-comment-id={commentId}>
      CommentReplies
    </div>
  ),
}));

// Mock the CommentForm component
vi.mock('@/app/components/comments/CommentForm', () => ({
  CommentForm: ({
    onSuccess,
    onCancel,
    placeholder,
    initialContent,
    commentId,
  }: {
    onSuccess: (comment: IComment) => void;
    onCancel: () => void;
    placeholder: string;
    initialContent?: string;
    commentId?: string;
  }) => (
    <div data-testid="comment-form">
      <input data-testid="comment-input" placeholder={placeholder} defaultValue={initialContent} />
      <button
        data-testid="save-button"
        onClick={() =>
          onSuccess({
            id: commentId || 'new-comment',
            content: initialContent || 'Updated comment',
            user_id: 'test-user-id',
            parent_id: 'parent-1',
            parent_type: ParentType.GameLog,
            depth: 0,
            created_at: '2025-08-10T20:00:00Z',
            updated_at: '2025-08-10T20:00:00Z',
            user: {
              id: 'test-user-id',
              username: 'testuser',
              first_name: 'Test',
              last_name: 'User',
            },
            reactions: [],
          })
        }
      >
        Save
      </button>
      <button data-testid="cancel-button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

describe('Comment', () => {
  const mockComment: IComment = {
    id: 'comment-1',
    content: 'Test comment content',
    user_id: 'test-user-id',
    parent_id: 'parent-1',
    parent_type: ParentType.GameLog,
    depth: 0,
    created_at: '2025-08-10T20:00:00Z',
    updated_at: '2025-08-10T20:00:00Z',
    user: {
      id: 'test-user-id',
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
    },
    reactions: [],
  };

  const mockOnReply = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockUseUser.mockReturnValue({
      user: {
        id: 'test-user-id',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
      },
    });
    vi.clearAllMocks();
  });

  it('should render comment with basic information', () => {
    render(<Comment comment={mockComment} />);

    expect(screen.getByText('Test comment content')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText(/Aug 10, 2025/)).toBeInTheDocument();
  });

  it('should show user avatar with first letter of first name', () => {
    render(<Comment comment={mockComment} />);

    const avatar = screen.getByText('T');
    expect(avatar).toBeInTheDocument();
  });

  it('should show user avatar with first letter of username when first name is not available', () => {
    const commentWithoutFirstName = {
      ...mockComment,
      user: {
        ...mockComment.user,
        first_name: null,
      },
    };

    render(<Comment comment={commentWithoutFirstName} />);

    const avatar = screen.getByText('t');
    expect(avatar).toBeInTheDocument();
  });

  it('should show "u" when username is "unknown"', () => {
    const commentWithoutName = {
      ...mockComment,
      user: {
        ...mockComment.user,
        first_name: null,
        username: 'unknown',
      },
    };

    render(<Comment comment={commentWithoutName} />);

    const avatar = screen.getByText('u');
    expect(avatar).toBeInTheDocument();
  });

  it('should show "unknown" when username is "unknown"', () => {
    const commentWithoutName = {
      ...mockComment,
      user: {
        ...mockComment.user,
        first_name: null,
        username: 'unknown',
      },
    };

    render(<Comment comment={commentWithoutName} />);

    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('should show edited indicator when comment was updated', () => {
    const editedComment = {
      ...mockComment,
      updated_at: '2025-08-10T21:00:00Z',
    };

    render(<Comment comment={editedComment} />);

    expect(screen.getByText('(edited)')).toBeInTheDocument();
  });

  it('should not show edited indicator when comment was not updated', () => {
    render(<Comment comment={mockComment} />);

    expect(screen.queryByText('(edited)')).not.toBeInTheDocument();
  });

  it('should show edit and delete options for own comment', async () => {
    const user = userEvent.setup();
    render(<Comment comment={mockComment} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const moreButtons = screen.getAllByTestId('morehorizontal-icon');
    const moreButton = moreButtons[0].closest('button');
    expect(moreButton).toBeInTheDocument();

    if (moreButton) {
      await user.click(moreButton);
      expect(await screen.findByTestId('edit-icon')).toBeInTheDocument();
      expect(await screen.findByTestId('trash2-icon')).toBeInTheDocument();
    }
  });

  it('should not show edit and delete options for other user comment', () => {
    mockUseUser.mockReturnValue({
      user: {
        id: 'other-user-id',
        username: 'otheruser',
        first_name: 'Other',
        last_name: 'User',
      },
    });

    render(<Comment comment={mockComment} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const moreButtons = screen
      .getAllByRole('button')
      .filter(button => button.querySelector('.lucide-ellipsis'));
    expect(moreButtons).toHaveLength(0);
  });

  it('should show reply button when depth is less than max depth', () => {
    render(<Comment comment={mockComment} onReply={mockOnReply} />);

    expect(screen.getByTestId('reply-icon')).toBeInTheDocument();
  });

  it('should not show reply button when depth equals max depth', () => {
    const maxDepthComment = {
      ...mockComment,
      depth: 3, // Assuming max depth is 3
    };

    render(<Comment comment={maxDepthComment} onReply={mockOnReply} maxDepth={3} />);

    expect(screen.queryByText('Reply')).not.toBeInTheDocument();
  });

  it('should call onReply when reply button is clicked', async () => {
    const user = userEvent.setup();
    render(<Comment comment={mockComment} onReply={mockOnReply} />);

    const replyButton = screen.getByTestId('reply-icon').closest('button');
    expect(replyButton).not.toBeNull();
    await user.click(replyButton!);

    expect(mockOnReply).toHaveBeenCalledWith('comment-1');
  });

  it('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<Comment comment={mockComment} onEdit={mockOnEdit} />);

    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons.find(button => button.querySelector('.lucide-ellipsis'));
    if (moreButton) {
      await user.click(moreButton);
      const editButton = await screen.findByText('Edit');
      await user.click(editButton);
      expect(mockOnEdit).toHaveBeenCalledWith('comment-1');
    }
  });

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<Comment comment={mockComment} onDelete={mockOnDelete} />);

    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons.find(button => button.querySelector('.lucide-ellipsis'));
    if (moreButton) {
      await user.click(moreButton);
      const deleteButton = await screen.findByText('Delete');
      await user.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith('comment-1');
    }
  });

  it('should show comment form when editing', async () => {
    const user = userEvent.setup();
    render(<Comment comment={mockComment} onEdit={mockOnEdit} />);

    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons.find(button => button.querySelector('.lucide-ellipsis'));
    if (moreButton) {
      await user.click(moreButton);
      const editButton = await screen.findByText('Edit');
      await user.click(editButton);

      expect(screen.getByTestId('comment-form')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Edit your comment...')).toBeInTheDocument();
    }
  });

  it('should show comment form when replying', async () => {
    const user = userEvent.setup();
    render(<Comment comment={mockComment} onReply={mockOnReply} />);

    const replyButton = screen.getByTestId('reply-icon').closest('button');
    expect(replyButton).not.toBeNull();
    await user.click(replyButton!);

    expect(screen.getByTestId('comment-form')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
  });

  it('should handle edit success and update optimistic comment', async () => {
    const user = userEvent.setup();
    render(<Comment comment={mockComment} onEdit={mockOnEdit} />);

    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons.find(button => button.querySelector('.lucide-ellipsis'));
    if (moreButton) {
      await user.click(moreButton);
      const editButton = await screen.findByText('Edit');
      await user.click(editButton);

      const saveButton = screen.getByTestId('save-button');
      await user.click(saveButton);

      // Should exit edit mode
      expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
      expect(mockOnEdit).toHaveBeenCalledWith('comment-1');
    }
  });

  it('should handle reply success and show replies', async () => {
    const user = userEvent.setup();
    render(<Comment comment={mockComment} onReply={mockOnReply} />);

    const replyButton = screen.getByTestId('reply-icon').closest('button');
    expect(replyButton).not.toBeNull();
    await user.click(replyButton!);

    const saveButton = screen.getByTestId('save-button');
    await user.click(saveButton);

    // Should exit reply mode and show replies
    expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
  });

  it('should handle cancel and exit edit mode', async () => {
    const user = userEvent.setup();
    render(<Comment comment={mockComment} onEdit={mockOnEdit} />);

    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons.find(button => button.querySelector('.lucide-ellipsis'));
    if (moreButton) {
      await user.click(moreButton);
      const editButton = await screen.findByText('Edit');
      await user.click(editButton);

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
    }
  });

  it('should handle cancel and exit reply mode', async () => {
    const user = userEvent.setup();
    render(<Comment comment={mockComment} onReply={mockOnReply} />);

    const replyButton = screen.getByTestId('reply-icon').closest('button');
    expect(replyButton).not.toBeNull();
    await user.click(replyButton!);

    const cancelButton = screen.getByTestId('cancel-button');
    await user.click(cancelButton);

    expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
  });

  it('should not show reply count when totalChildCommentCount is 0', () => {
    const commentWithZeroReplies = {
      ...mockComment,
      totalChildCommentCount: 0,
    };

    render(<Comment comment={commentWithZeroReplies} />);

    // Should not show the reply count button
    expect(screen.queryByText(/0 reply/)).not.toBeInTheDocument();
    expect(screen.queryByText(/0 replies/)).not.toBeInTheDocument();

    // Should not show the "Show replies" button
    expect(screen.queryByText(/Show replies/)).not.toBeInTheDocument();
  });

  it('should show reply count when totalChildCommentCount is greater than 0', () => {
    const commentWithReplies = {
      ...mockComment,
      totalChildCommentCount: 3,
    };

    render(<Comment comment={commentWithReplies} />);

    // Should show the reply count button with white text
    const replyButton = screen.getByText(/3 replies/);
    expect(replyButton).toBeInTheDocument();
    expect(replyButton).toHaveClass('text-gray-900', 'dark:text-white');
  });

  it('should show singular "reply" when totalChildCommentCount is 1', () => {
    const commentWithOneReply = {
      ...mockComment,
      totalChildCommentCount: 1,
    };

    render(<Comment comment={commentWithOneReply} />);

    // Should show "1 reply" (singular)
    expect(screen.getByText(/1 reply/)).toBeInTheDocument();
  });

  it('should show "Show replies" button when there are replies', () => {
    const commentWithReplies = {
      ...mockComment,
      totalChildCommentCount: 2,
    };

    render(<Comment comment={commentWithReplies} />);

    // Should show the "Show replies" button
    expect(screen.getByText(/Show replies/)).toBeInTheDocument();
  });

  it('should not show "Show replies" button when there are no replies', () => {
    const commentWithZeroReplies = {
      ...mockComment,
      totalChildCommentCount: 0,
    };

    render(<Comment comment={commentWithZeroReplies} />);

    // Should not show the "Show replies" button
    expect(screen.queryByText(/Show replies/)).not.toBeInTheDocument();
  });

  it('should toggle replies visibility when show replies button is clicked', async () => {
    const user = userEvent.setup();
    const commentWithReplies = {
      ...mockComment,
      totalChildCommentCount: 2,
    };

    render(<Comment comment={commentWithReplies} />);

    const showRepliesButton = screen.getByText(/Show replies/);
    await user.click(showRepliesButton);

    // Should show "Hide replies" button and CommentReplies component
    expect(screen.getByText(/Hide replies/)).toBeInTheDocument();
    expect(screen.getByTestId('comment-replies')).toBeInTheDocument();

    await user.click(screen.getByText(/Hide replies/));
    expect(screen.getByText(/Show replies/)).toBeInTheDocument();
    expect(screen.queryByTestId('comment-replies')).not.toBeInTheDocument();
  });

  it('should show replies when showReplies prop is true', () => {
    const commentWithReplies = {
      ...mockComment,
      totalChildCommentCount: 2,
    };

    render(<Comment comment={commentWithReplies} showReplies={true} />);

    expect(screen.getByText(/Hide replies/)).toBeInTheDocument();
    expect(screen.getByTestId('comment-replies')).toBeInTheDocument();
  });

  it('should render ReactionPicker with correct props', () => {
    render(<Comment comment={mockComment} />);

    const reactionPicker = screen.getByTestId('reaction-picker');
    expect(reactionPicker).toBeInTheDocument();
    expect(reactionPicker).toHaveAttribute('data-target-id', 'comment-1');
    expect(reactionPicker).toHaveAttribute('data-target-type', 'COMMENT');
  });

  it('should handle missing user gracefully', () => {
    mockUseUser.mockReturnValue({
      user: null,
    });

    render(<Comment comment={mockComment} />);

    // Should still render the comment content
    expect(screen.getByText('Test comment content')).toBeInTheDocument();
    // Should not show edit/delete options
    const moreButtons = screen
      .getAllByRole('button')
      .filter(button => button.querySelector('.lucide-ellipsis'));
    expect(moreButtons).toHaveLength(0);
  });
});
