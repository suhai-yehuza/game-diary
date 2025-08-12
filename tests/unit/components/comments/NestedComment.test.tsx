import { useUser } from '@clerk/nextjs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { NestedComment } from '@/app/components/comments/NestedComment';
import { ParentType } from '@/lib/types/generated/graphql';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

// Mock CommentForm component
vi.mock('@/app/components/comments/CommentForm', () => ({
  CommentForm: ({ onSuccess, onCancel, placeholder, initialContent }: any) => (
    <div data-testid="comment-form">
      <textarea placeholder={placeholder} defaultValue={initialContent} />
      <button onClick={onSuccess} data-testid="save-button">
        Save
      </button>
      <button onClick={onCancel} data-testid="cancel-button">
        Cancel
      </button>
    </div>
  ),
}));

// Mock ReactionPicker component
vi.mock('@/app/components/reactions', () => ({
  ReactionPicker: ({ targetId, targetType, size, showCount }: any) => (
    <div data-testid="reaction-picker" data-target-id={targetId} data-target-type={targetType}>
      Reactions ({size}, {showCount ? 'show' : 'hide'} count)
    </div>
  ),
}));

describe('NestedComment', () => {
  const mockUser = {
    id: 'user-1',
    first_name: 'John',
    last_name: 'Doe',
    username: 'johndoe',
  };

  const mockComment = {
    id: 'comment-1',
    content: 'This is a test comment',
    created_at: '2023-01-15T10:30:00Z',
    updated_at: '2023-01-15T10:30:00Z',
    user_id: 'user-1',
    parent_id: 'parent-1',
    parent_type: ParentType.GameLog,
    depth: 1,
    totalChildCommentCount: 2,
    user: {
      id: 'user-1',
      first_name: 'John',
      last_name: 'Doe',
      username: 'johndoe',
    },
    reactions: [],
  };

  const mockOnReply = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUser as any).mockReturnValue({ user: mockUser });
  });

  it('should render comment information correctly', () => {
    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2023 02:30')).toBeInTheDocument();
    expect(screen.getByText('← Reply')).toBeInTheDocument();
  });

  it('should show user initial in avatar', () => {
    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const avatar = screen.getByText('J');
    expect(avatar).toBeInTheDocument();
  });

  it('should show username when first name is not available', () => {
    const commentWithoutFirstName = {
      ...mockComment,
      user: {
        ...mockComment.user,
        first_name: null,
      },
    };

    render(
      <NestedComment
        comment={commentWithoutFirstName}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('johndoe')).toBeInTheDocument();
  });

  it('should show "Unknown User" when no name is available', () => {
    const commentWithoutName = {
      ...mockComment,
      user: {
        ...mockComment.user,
        first_name: null,
        username: 'unknown',
      },
    };

    render(
      <NestedComment
        comment={commentWithoutName}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('should show "U" in avatar when no name is available', () => {
    const commentWithoutName = {
      ...mockComment,
      user: {
        ...mockComment.user,
        first_name: null,
        username: 'unknown',
      },
    };

    render(
      <NestedComment
        comment={commentWithoutName}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const avatar = screen.getByText('u');
    expect(avatar).toBeInTheDocument();
  });

  it('should show edited indicator when comment was updated', () => {
    const editedComment = {
      ...mockComment,
      updated_at: '2023-01-15T11:30:00Z',
    };

    render(
      <NestedComment
        comment={editedComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('(edited)')).toBeInTheDocument();
  });

  it('should show edit and delete options for own comment', async () => {
    const user = userEvent.setup();
    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const moreButton = screen.getAllByRole('button')[0]; // Get the first button (dropdown menu)
    await user.click(moreButton);

    expect(screen.getByTestId('edit-menu-item')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should not show edit and delete options for other user comment', () => {
    const otherUserComment = {
      ...mockComment,
      user_id: 'user-2',
    };

    render(
      <NestedComment
        comment={otherUserComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Should only have the reply button, not the dropdown menu button
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1); // Only reply button
    expect(buttons[0]).toHaveTextContent('Reply');
  });

  it('should show reply button when depth is below max', () => {
    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('reply-button')).toBeInTheDocument();
  });

  it('should not show reply button when at max depth', () => {
    const maxDepthComment = {
      ...mockComment,
      depth: 3,
    };

    render(
      <NestedComment
        comment={maxDepthComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        maxDepth={3}
      />
    );

    expect(screen.queryByText('Reply')).not.toBeInTheDocument();
  });

  it('should show reply indicator when there are child comments', () => {
    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('← Reply')).toBeInTheDocument();
  });

  it('should not show reply indicator when there are no child comments', () => {
    const commentWithoutReplies = {
      ...mockComment,
      totalChildCommentCount: 0,
    };

    render(
      <NestedComment
        comment={commentWithoutReplies}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText('← Reply')).not.toBeInTheDocument();
  });

  it('should render reaction picker', () => {
    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const reactionPicker = screen.getByTestId('reaction-picker');
    expect(reactionPicker).toBeInTheDocument();
    expect(reactionPicker).toHaveAttribute('data-target-id', 'comment-1');
    expect(reactionPicker).toHaveAttribute('data-target-type', 'COMMENT');
  });

  it('should handle reply button click', async () => {
    const user = userEvent.setup();
    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const replyButton = screen.getByTestId('reply-button');
    await user.click(replyButton);

    expect(mockOnReply).toHaveBeenCalledWith('comment-1');
    expect(screen.getByTestId('comment-form')).toBeInTheDocument();
  });

  it('should handle edit button click', async () => {
    const user = userEvent.setup();
    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const moreButton = screen.getAllByRole('button')[0]; // Get the first button (dropdown menu)
    await user.click(moreButton);

    const editButton = screen.getByTestId('edit-menu-item');
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith('comment-1');
    expect(screen.getByTestId('comment-form')).toBeInTheDocument();
  });

  it('should handle delete button click', async () => {
    const user = userEvent.setup();
    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const moreButton = screen.getAllByRole('button')[0]; // Get the first button (dropdown menu)
    await user.click(moreButton);

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('comment-1');
  });

  it('should show comment form when editing', async () => {
    const user = userEvent.setup();
    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const moreButton = screen.getAllByRole('button')[0]; // Get the first button (dropdown menu)
    await user.click(moreButton);

    const editButton = screen.getByTestId('edit-menu-item');
    await user.click(editButton);

    expect(screen.getByTestId('comment-form')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Edit your comment...')).toBeInTheDocument();
  });

  it('should show comment form when replying', async () => {
    const user = userEvent.setup();
    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const replyButton = screen.getByTestId('reply-button');
    await user.click(replyButton);

    expect(screen.getByTestId('comment-form')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
  });

  it('should handle edit success and exit edit mode', async () => {
    const user = userEvent.setup();
    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const moreButton = screen.getAllByRole('button')[0]; // Get the first button (dropdown menu)
    await user.click(moreButton);

    const editButton = screen.getByTestId('edit-menu-item');
    await user.click(editButton);

    const saveButton = screen.getByTestId('save-button');
    await user.click(saveButton);

    expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
  });

  it('should handle reply success and exit reply mode', async () => {
    const user = userEvent.setup();
    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const replyButton = screen.getByTestId('reply-button');
    await user.click(replyButton);

    const saveButton = screen.getByTestId('save-button');
    await user.click(saveButton);

    expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
  });

  it('should handle cancel and exit edit mode', async () => {
    const user = userEvent.setup();
    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const moreButton = screen.getAllByRole('button')[0]; // Get the first button (dropdown menu)
    await user.click(moreButton);

    const editButton = screen.getByTestId('edit-menu-item');
    await user.click(editButton);

    const cancelButton = screen.getByTestId('cancel-button');
    await user.click(cancelButton);

    expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
  });

  it('should handle cancel and exit reply mode', async () => {
    const user = userEvent.setup();
    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const replyButton = screen.getByTestId('reply-button');
    await user.click(replyButton);

    const cancelButton = screen.getByTestId('cancel-button');
    await user.click(cancelButton);

    expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
  });

  it('should handle user not being logged in', () => {
    (useUser as any).mockReturnValue({ user: null });

    render(
      <NestedComment
        comment={mockComment}
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Should only have the reply button, not the dropdown menu button
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1); // Only reply button
    expect(buttons[0]).toHaveTextContent('Reply');
  });
});
