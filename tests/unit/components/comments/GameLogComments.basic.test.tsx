import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { GameLogComments } from '@/app/components/comments/GameLogComments';
import { ParentType } from '@/lib/types/generated/graphql';

// Mock the useGameLogComments hook
const mockUseGameLogComments = vi.fn();
const mockUseDeleteComment = vi.fn();
const mockUseUpdateComment = vi.fn();

vi.mock('@/hooks/use-comments', () => ({
  useGameLogComments: (gameLogId: string, limit: number) =>
    mockUseGameLogComments(gameLogId, limit),
  useDeleteComment: () => mockUseDeleteComment(),
  useUpdateComment: () => mockUseUpdateComment(),
}));

// Mock the Comment component
vi.mock('@/app/components/comments/Comment', () => ({
  Comment: ({ comment, onDelete }: { comment: any; onDelete?: (id: string) => void }) => (
    <div data-testid="comment" data-comment-id={comment.id}>
      <span>{comment.content}</span>
      {onDelete && <button onClick={() => onDelete(comment.id)}>Delete</button>}
    </div>
  ),
}));

// Mock the CommentForm component
vi.mock('@/app/components/comments/CommentForm', () => ({
  CommentForm: ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => (
    <div data-testid="comment-form">
      <button onClick={onSuccess}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('GameLogComments', () => {
  const mockGameLog = {
    id: 'game-log-1',
    game_id: 'game-1',
    rating_for_game: 8,
    classification: 'watched',
    created_at: '2025-08-10T20:00:00Z',
    updated_at: '2025-08-10T20:00:00Z',
    totalCommentCount: 3,
    user: {
      id: 'user-1',
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
    },
  };

  const mockComment = {
    id: 'comment-1',
    content: 'Test comment',
    user_id: 'user-1',
    parent_id: 'game-log-1',
    parent_type: ParentType.GameLog,
    depth: 0,
    created_at: '2025-08-10T20:00:00Z',
    updated_at: '2025-08-10T20:00:00Z',
    user: {
      id: 'user-1',
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
    },
    reactions: [],
  };

  const mockComments = [
    mockComment,
    {
      ...mockComment,
      id: 'comment-2',
      content: 'Second comment',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGameLogComments.mockReturnValue({
      comments: [],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: 0,
    });
    mockUseDeleteComment.mockReturnValue({
      deleteComment: vi.fn(),
    });
    mockUseUpdateComment.mockReturnValue({
      updateComment: vi.fn(),
    });
  });

  it('should render comments section with correct title', () => {
    render(<GameLogComments gameLog={mockGameLog} />);

    expect(screen.getByText(/Comments/)).toBeInTheDocument();
    expect(screen.getByText(/Comments \(3\)/)).toBeInTheDocument();
  });

  it('should not show comment count when there are no comments', () => {
    const gameLogWithoutComments = {
      ...mockGameLog,
      totalCommentCount: 0,
    };

    render(<GameLogComments gameLog={gameLogWithoutComments} />);

    expect(screen.getByText(/Comments/)).toBeInTheDocument();
    expect(screen.queryByText(/Comments \(0\)/)).not.toBeInTheDocument();
  });

  it('should load comments when expanded', () => {
    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    expect(mockUseGameLogComments).toHaveBeenCalledWith('game-log-1', 5);
  });

  it('should not load comments when collapsed', () => {
    render(<GameLogComments gameLog={mockGameLog} showComments={false} />);

    expect(mockUseGameLogComments).toHaveBeenCalledWith('game-log-1', 0);
  });

  it('should render comments when they exist', () => {
    mockUseGameLogComments.mockReturnValue({
      comments: mockComments,
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: 2,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    expect(screen.getByText('Test comment')).toBeInTheDocument();
    expect(screen.getByText('Second comment')).toBeInTheDocument();
    expect(screen.getAllByTestId('comment')).toHaveLength(2);
  });

  it('should show loading state when loading comments', () => {
    mockUseGameLogComments.mockReturnValue({
      comments: [],
      loading: true,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: 0,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    expect(screen.getByText('Loading comments...')).toBeInTheDocument();
  });

  it('should show load more button when there are more pages', () => {
    const mockLoadMore = vi.fn();
    mockUseGameLogComments.mockReturnValue({
      comments: mockComments,
      loading: false,
      commentsHasNextPage: true,
      loadMoreComments: mockLoadMore,
      refetch: vi.fn(),
      commentsTotalCount: 2,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    const loadMoreButton = screen.getByText('Load more comments');
    expect(loadMoreButton).toBeInTheDocument();
  });

  it('should not show load more button when there are no more pages', () => {
    mockUseGameLogComments.mockReturnValue({
      comments: mockComments,
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: 2,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    expect(screen.queryByText('Load more comments')).not.toBeInTheDocument();
  });

  it('should not show load more button when loading', () => {
    const mockLoadMore = vi.fn();
    mockUseGameLogComments.mockReturnValue({
      comments: mockComments,
      loading: true,
      commentsHasNextPage: true,
      loadMoreComments: mockLoadMore,
      refetch: vi.fn(),
      commentsTotalCount: 2,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    expect(screen.queryByText('Load more comments')).not.toBeInTheDocument();
  });

  it('should call loadMoreComments when load more button is clicked', async () => {
    const user = userEvent.setup();
    const mockLoadMore = vi.fn();
    mockUseGameLogComments.mockReturnValue({
      comments: mockComments,
      loading: false,
      commentsHasNextPage: true,
      loadMoreComments: mockLoadMore,
      refetch: vi.fn(),
      commentsTotalCount: 2,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    const loadMoreButton = screen.getByText('Load more comments');
    await user.click(loadMoreButton);

    expect(mockLoadMore).toHaveBeenCalled();
  });

  it('should show add comment button when comment form is not visible', () => {
    mockUseGameLogComments.mockReturnValue({
      comments: [],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: 0,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    expect(screen.getByText('Add a comment')).toBeInTheDocument();
  });

  it('should show comment form when add comment button is clicked', async () => {
    const user = userEvent.setup();
    mockUseGameLogComments.mockReturnValue({
      comments: [],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: 0,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    const addCommentButton = screen.getByText('Add a comment');
    await user.click(addCommentButton);

    expect(screen.getByTestId('comment-form')).toBeInTheDocument();
    expect(screen.queryByText('Add a comment')).not.toBeInTheDocument();
  });

  it('should hide comment form when cancel is clicked', async () => {
    const user = userEvent.setup();
    mockUseGameLogComments.mockReturnValue({
      comments: [],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: 0,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    // Show comment form
    const addCommentButton = screen.getByText('Add a comment');
    await user.click(addCommentButton);

    // Cancel comment form
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
    expect(screen.getByText('Add a comment')).toBeInTheDocument();
  });

  it('should hide comment form and refetch when comment is submitted successfully', async () => {
    const user = userEvent.setup();
    const mockRefetch = vi.fn();
    mockUseGameLogComments.mockReturnValue({
      comments: [],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: mockRefetch,
      commentsTotalCount: 0,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    // Show comment form
    const addCommentButton = screen.getByText('Add a comment');
    await user.click(addCommentButton);

    // Submit comment form
    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);

    expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should show empty state when no comments exist', () => {
    mockUseGameLogComments.mockReturnValue({
      comments: [],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: 0,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
  });

  it('should not show empty state when comment form is visible', async () => {
    const user = userEvent.setup();
    mockUseGameLogComments.mockReturnValue({
      comments: [],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: 0,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    // Show comment form
    const addCommentButton = screen.getByText('Add a comment');
    await user.click(addCommentButton);

    expect(screen.queryByText('No comments yet. Be the first to comment!')).not.toBeInTheDocument();
  });

  it('should not show empty state when loading', () => {
    mockUseGameLogComments.mockReturnValue({
      comments: [],
      loading: true,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: 0,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    expect(screen.queryByText('No comments yet. Be the first to comment!')).not.toBeInTheDocument();
  });

  it('should handle comment deletion optimistically', async () => {
    const user = userEvent.setup();
    const mockDeleteComment = vi.fn().mockResolvedValue(undefined);
    mockUseDeleteComment.mockReturnValue({
      deleteComment: mockDeleteComment,
    });

    mockUseGameLogComments.mockReturnValue({
      comments: mockComments,
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: 2,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    // Delete a comment
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    expect(mockDeleteComment).toHaveBeenCalledWith('comment-1');
  });

  it('should handle comment deletion error gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockDeleteComment = vi.fn().mockRejectedValue(new Error('Delete failed'));
    mockUseDeleteComment.mockReturnValue({
      deleteComment: mockDeleteComment,
    });

    mockUseGameLogComments.mockReturnValue({
      comments: mockComments,
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: 2,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    // Delete a comment
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    expect(consoleSpy).toHaveBeenCalledWith('Error deleting comment:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should use commentsTotalCount when expanded and available', () => {
    mockUseGameLogComments.mockReturnValue({
      comments: mockComments,
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: 5, // Different from gameLog.totalCommentCount
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    expect(screen.getByText(/Comments \(5\)/)).toBeInTheDocument();
  });

  it('should use gameLog.totalCommentCount when not expanded', () => {
    mockUseGameLogComments.mockReturnValue({
      comments: mockComments,
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: 5,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={false} />);

    expect(screen.getByText(/Comments \(3\)/)).toBeInTheDocument();
  });

  it('should use gameLog.totalCommentCount when commentsTotalCount is undefined', () => {
    mockUseGameLogComments.mockReturnValue({
      comments: mockComments,
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: undefined,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    expect(screen.getByText(/Comments \(3\)/)).toBeInTheDocument();
  });

  it('should handle undefined gameLog.totalCommentCount gracefully', () => {
    const gameLogWithoutCommentCount = {
      ...mockGameLog,
      totalCommentCount: undefined,
    };

    mockUseGameLogComments.mockReturnValue({
      comments: [],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: undefined,
    });

    render(<GameLogComments gameLog={gameLogWithoutCommentCount} showComments={true} />);

    expect(screen.getByText(/Comments/)).toBeInTheDocument();
    expect(screen.queryByText(/Comments \(0\)/)).not.toBeInTheDocument();
  });

  it('should handle comment deletion optimistically', async () => {
    const user = userEvent.setup();
    const mockDeleteComment = vi.fn().mockResolvedValue(undefined);
    mockUseDeleteComment.mockReturnValue({
      deleteComment: mockDeleteComment,
    });

    mockUseGameLogComments.mockReturnValue({
      comments: mockComments,
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
      refetch: vi.fn(),
      commentsTotalCount: 2,
    });

    render(<GameLogComments gameLog={mockGameLog} showComments={true} />);

    // Initially should show both comments
    expect(screen.getAllByTestId('comment')).toHaveLength(2);

    // Delete a comment
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    // Should call delete function
    expect(mockDeleteComment).toHaveBeenCalledWith('comment-1');
  });
});
