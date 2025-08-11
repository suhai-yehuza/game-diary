import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Comment } from '@/app/components/comments/Comment';
import type { IComment } from '@/lib/types';
import { ParentType } from '@/lib/types/generated/graphql';

// Mock the useUser hook
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
    },
  }),
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
});
