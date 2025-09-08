import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { CommentReplies } from '@/app/components/comments/CommentReplies';
import { ParentType } from '@/types';

// Mock the useCommentReplies hook
const mockUseCommentReplies = vi.fn();
vi.mock('@/hooks/use-comments', () => ({
  useCommentReplies: (commentId: string, limit: number) => mockUseCommentReplies(commentId, limit),
}));

// Mock the NestedComment component
vi.mock('@/app/components/comments/NestedComment', () => ({
  NestedComment: ({
    comment,
    onReply,
    onEdit,
    onDelete,
  }: {
    comment: any;
    onReply?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
  }) => (
    <div data-testid="nested-comment" data-comment-id={comment.id}>
      <span>{comment.content}</span>
      {onReply && <button onClick={() => onReply(comment.id)}>Reply</button>}
      {onEdit && <button onClick={() => onEdit(comment.id)}>Edit</button>}
      {onDelete && <button onClick={() => onDelete(comment.id)}>Delete</button>}
    </div>
  ),
}));

describe('CommentReplies', () => {
  const mockOnReply = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const mockReply = {
    id: 'reply-1',
    content: 'Test reply content',
    user_id: 'user-1',
    parent_id: 'comment-1',
    parent_type: ParentType.Comment,
    depth: 1,
    created_at: '2025-08-10T20:00:00Z',
    updated_at: '2025-08-10T20:00:00Z',
    user: {
      id: 'user-1',
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
    },
    reactions: [],
    totalChildCommentCount: 0,
  };

  const mockReplies = [
    mockReply,
    {
      ...mockReply,
      id: 'reply-2',
      content: 'Second reply content',
      totalChildCommentCount: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render replies when they exist', () => {
    mockUseCommentReplies.mockReturnValue({
      comments: mockReplies,
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
    });

    render(
      <CommentReplies
        commentId="comment-1"
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getAllByText('Test reply content').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Second reply content').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('nested-comment').length).toBeGreaterThan(0);
  });

  it('should call useCommentReplies with correct parameters', () => {
    mockUseCommentReplies.mockReturnValue({
      comments: [],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
    });

    render(<CommentReplies commentId="comment-1" />);

    expect(mockUseCommentReplies).toHaveBeenCalledWith('comment-1', 2);
  });

  it('should render nothing when no replies and not loading', () => {
    mockUseCommentReplies.mockReturnValue({
      comments: [],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
    });

    const { container } = render(<CommentReplies commentId="comment-1" />);

    expect(container.firstChild).toBeNull();
  });

  it('should show loading state when loading', () => {
    mockUseCommentReplies.mockReturnValue({
      comments: [],
      loading: true,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
    });

    render(<CommentReplies commentId="comment-1" />);

    expect(screen.getByText('Loading replies...')).toBeInTheDocument();
  });

  it('should show load more button when there are more pages', () => {
    const mockLoadMore = vi.fn();
    mockUseCommentReplies.mockReturnValue({
      comments: mockReplies,
      loading: false,
      commentsHasNextPage: true,
      loadMoreComments: mockLoadMore,
    });

    render(<CommentReplies commentId="comment-1" />);

    const loadMoreButtons = screen.getAllByText('Load more replies');
    expect(loadMoreButtons.length).toBeGreaterThan(0);
  });

  it('should not show load more button when there are no more pages', () => {
    mockUseCommentReplies.mockReturnValue({
      comments: mockReplies,
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
    });

    render(<CommentReplies commentId="comment-1" />);

    expect(screen.queryByText('Load more replies')).not.toBeInTheDocument();
  });

  it('should not show load more button when loading', () => {
    const mockLoadMore = vi.fn();
    mockUseCommentReplies.mockReturnValue({
      comments: mockReplies,
      loading: true,
      commentsHasNextPage: true,
      loadMoreComments: mockLoadMore,
    });

    render(<CommentReplies commentId="comment-1" />);

    expect(screen.queryByText('Load more replies')).not.toBeInTheDocument();
  });

  it('should call loadMoreComments when load more button is clicked', async () => {
    const user = userEvent.setup();
    const mockLoadMore = vi.fn();
    mockUseCommentReplies.mockReturnValue({
      comments: mockReplies,
      loading: false,
      commentsHasNextPage: true,
      loadMoreComments: mockLoadMore,
    });

    render(<CommentReplies commentId="comment-1" />);

    const loadMoreButtons = screen.getAllByText('Load more replies');
    await user.click(loadMoreButtons[0]);

    expect(mockLoadMore).toHaveBeenCalled();
  });

  it('should pass callback functions to NestedComment components', () => {
    mockUseCommentReplies.mockReturnValue({
      comments: [mockReply],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
    });

    render(
      <CommentReplies
        commentId="comment-1"
        onReply={mockOnReply}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const replyButton = screen.getByText('Reply');
    const editButton = screen.getByText('Edit');
    const deleteButton = screen.getByText('Delete');

    fireEvent.click(replyButton);
    expect(mockOnReply).toHaveBeenCalledWith('reply-1');

    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith('reply-1');

    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith('reply-1');
  });

  it('should render nested replies when maxDepth > 1 and reply has child comments', () => {
    const mockNestedReplies = [
      {
        ...mockReply,
        id: 'nested-reply-1',
        content: 'Nested reply content',
        totalChildCommentCount: 0,
      },
    ];

    // Mock the nested CommentReplies component call
    mockUseCommentReplies
      .mockReturnValueOnce({
        comments: [
          {
            ...mockReply,
            id: 'reply-1',
            totalChildCommentCount: 1,
          },
        ],
        loading: false,
        commentsHasNextPage: false,
        loadMoreComments: vi.fn(),
      })
      .mockReturnValueOnce({
        comments: mockNestedReplies,
        loading: false,
        commentsHasNextPage: false,
        loadMoreComments: vi.fn(),
      });

    render(<CommentReplies commentId="comment-1" maxDepth={2} />);

    expect(screen.getByText('Nested reply content')).toBeInTheDocument();
  });

  it('should not render nested replies when maxDepth is 1', () => {
    mockUseCommentReplies.mockReturnValue({
      comments: [
        {
          ...mockReply,
          totalChildCommentCount: 1,
        },
      ],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
    });

    render(<CommentReplies commentId="comment-1" maxDepth={1} />);

    // Should only render the parent reply, not nested replies
    expect(screen.getByText('Test reply content')).toBeInTheDocument();
    // Nested replies should not be rendered
    expect(mockUseCommentReplies).toHaveBeenCalledTimes(1);
  });

  it('should not render nested replies when reply has no child comments', () => {
    mockUseCommentReplies.mockReturnValue({
      comments: [
        {
          ...mockReply,
          totalChildCommentCount: 0,
        },
      ],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
    });

    render(<CommentReplies commentId="comment-1" maxDepth={2} />);

    // Should only render the parent reply, not nested replies
    expect(screen.getByText('Test reply content')).toBeInTheDocument();
    // Nested replies should not be rendered
    expect(mockUseCommentReplies).toHaveBeenCalledTimes(1);
  });

  it('should use default maxDepth when not provided', () => {
    mockUseCommentReplies.mockReturnValue({
      comments: [],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
    });

    render(<CommentReplies commentId="comment-1" />);

    // The default maxDepth should be used (from API_CONFIG)
    expect(mockUseCommentReplies).toHaveBeenCalledWith('comment-1', 2);
  });

  it('should apply correct styling to reply container', () => {
    mockUseCommentReplies.mockReturnValue({
      comments: [mockReply],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
    });

    render(<CommentReplies commentId="comment-1" />);

    const replyContainer = screen.getByTestId('nested-comment').parentElement;
    expect(replyContainer).toHaveClass(
      'ml-4',
      'border-l-2',
      'border-gray-200',
      'dark:border-gray-600',
      'pl-4'
    );
  });

  it('should apply correct styling to loading container', () => {
    mockUseCommentReplies.mockReturnValue({
      comments: [],
      loading: true,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
    });

    render(<CommentReplies commentId="comment-1" />);

    const loadingContainer = screen.getByText('Loading replies...').parentElement;
    expect(loadingContainer).toHaveClass('ml-4', 'pl-4');
  });

  it('should apply correct styling to load more container', () => {
    const mockLoadMore = vi.fn();
    mockUseCommentReplies.mockReturnValue({
      comments: mockReplies,
      loading: false,
      commentsHasNextPage: true,
      loadMoreComments: mockLoadMore,
    });

    render(<CommentReplies commentId="comment-1" />);

    const loadMoreButtons = screen.getAllByText('Load more replies');
    const loadMoreContainer = loadMoreButtons[0].parentElement;
    expect(loadMoreContainer).toHaveClass('ml-4', 'pl-4');
  });

  it('should handle multiple levels of nesting correctly', () => {
    // Mock multiple levels of CommentReplies calls
    mockUseCommentReplies
      .mockReturnValueOnce({
        comments: [
          {
            ...mockReply,
            id: 'level-1-reply',
            totalChildCommentCount: 1,
          },
        ],
        loading: false,
        commentsHasNextPage: false,
        loadMoreComments: vi.fn(),
      })
      .mockReturnValueOnce({
        comments: [
          {
            ...mockReply,
            id: 'level-2-reply',
            content: 'Level 2 reply',
            totalChildCommentCount: 1,
          },
        ],
        loading: false,
        commentsHasNextPage: false,
        loadMoreComments: vi.fn(),
      })
      .mockReturnValueOnce({
        comments: [
          {
            ...mockReply,
            id: 'level-3-reply',
            content: 'Level 3 reply',
            totalChildCommentCount: 0,
          },
        ],
        loading: false,
        commentsHasNextPage: false,
        loadMoreComments: vi.fn(),
      });

    render(<CommentReplies commentId="comment-1" maxDepth={3} />);

    expect(screen.getByText('Level 2 reply')).toBeInTheDocument();
    expect(screen.getByText('Level 3 reply')).toBeInTheDocument();
  });

  it('should handle empty replies array gracefully', () => {
    mockUseCommentReplies.mockReturnValue({
      comments: [],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
    });

    const { container } = render(<CommentReplies commentId="comment-1" />);

    expect(container.firstChild).toBeNull();
  });

  it('should handle undefined totalChildCommentCount gracefully', () => {
    mockUseCommentReplies.mockReturnValue({
      comments: [
        {
          ...mockReply,
          totalChildCommentCount: undefined,
        },
      ],
      loading: false,
      commentsHasNextPage: false,
      loadMoreComments: vi.fn(),
    });

    render(<CommentReplies commentId="comment-1" maxDepth={2} />);

    // Should render the reply but not nested replies
    expect(screen.getByText('Test reply content')).toBeInTheDocument();
    expect(mockUseCommentReplies).toHaveBeenCalledTimes(1);
  });
});
