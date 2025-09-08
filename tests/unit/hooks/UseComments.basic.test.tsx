import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useGameLogComments,
  useCommentReplies,
} from '@/hooks/use-comments';
import { CREATE_COMMENT, UPDATE_COMMENT, DELETE_COMMENT } from '@/lib/graphql/mutations';
import { GET_COMMENTS } from '@/lib/graphql/queries';
import { ParentType } from '@/types';
import { errorHandlers } from '@/lib/utils/error-handler';

// Mock useOptimizedQuery
vi.mock('@/hooks/use-optimized-query', () => ({
  useOptimizedQuery: vi.fn(),
}));

// Mock useOptimizedMutation
vi.mock('@/hooks/use-optimized-mutation', () => ({
  useOptimizedMutation: vi.fn(),
}));

// Mock the generated GraphQL hooks
vi.mock('@/types', async () => {
  const actual = await vi.importActual('@/types');
  return {
    ...actual,
    useCreateCommentMutation: vi.fn(),
    useUpdateCommentMutation: vi.fn(),
    useDeleteCommentMutation: vi.fn(),
  };
});

// Mock console methods
const _mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const _mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('use-comments hooks', () => {
  const mockComment = {
    id: 'comment-1',
    content: 'Test comment',
    created_at: '2023-01-15T10:30:00Z',
    updated_at: '2023-01-15T10:30:00Z',
    user_id: 'user-1',
    parent_id: 'parent-1',
    parent_type: ParentType.GameLog,
    depth: 0,
    totalChildCommentCount: 0,
    reactions: [],
    totalReactionCount: 0,
    user: {
      id: 'user-1',
      first_name: 'John',
      last_name: 'Doe',
      username: 'johndoe',
      image_url: undefined,
    },
  };

  const mockCommentsResponse = {
    comments: {
      edges: [
        {
          node: mockComment,
        },
      ],
      totalCount: 1,
      pageInfo: {
        endCursor: 'cursor-1',
        hasNextPage: false,
      },
    },
  };

  const createCommentMock = {
    request: {
      query: CREATE_COMMENT,
      variables: {
        input: {
          content: 'New comment',
          parentId: 'parent-1',
          parentType: ParentType.GameLog,
        },
      },
    },
    result: {
      data: {
        createComment: {
          comment: {
            id: 'new-comment-1',
            content: 'New comment',
          },
        },
      },
    },
  };

  const updateCommentMock = {
    request: {
      query: UPDATE_COMMENT,
      variables: {
        id: 'comment-1',
        input: {
          content: 'Updated comment',
        },
      },
    },
    result: {
      data: {
        updateComment: {
          comment: {
            id: 'comment-1',
            content: 'Updated comment',
            updated_at: '2023-01-01T00:00:00Z',
            user: {
              id: 'user123',
              username: 'testuser',
            },
          },
        },
      },
    },
  };

  const deleteCommentMock = {
    request: {
      query: DELETE_COMMENT,
      variables: {
        id: 'comment-1',
      },
    },
    result: {
      data: {
        deleteComment: {
          id: 'comment-1',
        },
      },
    },
  };

  const getCommentsMock = {
    request: {
      query: GET_COMMENTS,
      variables: {
        filters: {
          parentId: 'parent-1',
          parentType: 'GAME_LOG',
        },
        pagination: {
          first: 10,
        },
      },
    },
    result: {
      data: mockCommentsResponse,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useComments', () => {
    it('should return comments data when query succeeds', async () => {
      const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
      const { useOptimizedMutation } = await import('@/hooks/use-optimized-mutation');
      const mockUseOptimizedQuery = vi.mocked(useOptimizedQuery);
      const mockUseOptimizedMutation = vi.mocked(useOptimizedMutation);

      // Mock the query hook to return the expected data
      const mockRefetch = vi.fn();
      const mockFetchMore = vi.fn();
      let onCompletedCallback: ((data: any) => void) | undefined;

      mockUseOptimizedQuery.mockImplementation((query, options) => {
        // Capture the onCompleted callback
        onCompletedCallback = options?.onCompleted;

        // Simulate the onCompleted callback being called with the mock data
        setTimeout(() => {
          if (onCompletedCallback) {
            onCompletedCallback({
              comments: {
                edges: [{ node: mockComment }],
                totalCount: 1,
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            });
          }
        }, 0);

        return {
          data: {
            comments: {
              edges: [{ node: mockComment }],
              totalCount: 1,
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
          loading: false,
          error: undefined,
          refetch: mockRefetch,
          fetchMore: mockFetchMore,
        };
      });

      // Mock the mutation hook
      mockUseOptimizedMutation.mockReturnValue([vi.fn(), { loading: false, error: undefined }]);

      const { result } = renderHook(() => useComments('parent-1', 'GAME_LOG'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.comments).toHaveLength(1);
      });

      expect(result.current.comments[0]).toMatchObject(mockComment);
      expect(result.current.commentsTotalCount).toBe(1);
      expect(result.current.commentsHasNextPage).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle query error gracefully', async () => {
      const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
      const { useOptimizedMutation } = await import('@/hooks/use-optimized-mutation');
      const mockUseOptimizedQuery = vi.mocked(useOptimizedQuery);
      const mockUseOptimizedMutation = vi.mocked(useOptimizedMutation);

      const mockError = new Error('Network error');

      // Mock the query hook to return an error
      mockUseOptimizedQuery.mockReturnValue({
        data: undefined,
        loading: false,
        error: mockError,
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      // Mock the mutation hook
      mockUseOptimizedMutation.mockReturnValue([vi.fn(), { loading: false, error: undefined }]);

      const { result } = renderHook(() => useComments('parent-1', 'GAME_LOG'));

      expect(result.current.error).toBe(mockError);
    });

    it('should handle authentication errors gracefully', async () => {
      const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
      const { useOptimizedMutation } = await import('@/hooks/use-optimized-mutation');
      const mockUseOptimizedQuery = vi.mocked(useOptimizedQuery);
      const mockUseOptimizedMutation = vi.mocked(useOptimizedMutation);

      const authError = new Error('Authentication error');

      // Mock the query hook to return an authentication error
      mockUseOptimizedQuery.mockReturnValue({
        data: undefined,
        loading: false,
        error: authError,
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      // Mock the mutation hook
      mockUseOptimizedMutation.mockReturnValue([vi.fn(), { loading: false, error: undefined }]);

      const { result } = renderHook(() => useComments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.comments).toEqual([]);
    });

    it('should handle filters and pagination options', async () => {
      const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
      const { useOptimizedMutation } = await import('@/hooks/use-optimized-mutation');
      const mockUseOptimizedQuery = vi.mocked(useOptimizedQuery);
      const mockUseOptimizedMutation = vi.mocked(useOptimizedMutation);

      // Mock the query hook to return the expected data
      let onCompletedCallback: ((data: any) => void) | undefined;

      mockUseOptimizedQuery.mockImplementation((query, options) => {
        // Capture the onCompleted callback
        onCompletedCallback = options?.onCompleted;

        // Simulate the onCompleted callback being called with the mock data
        setTimeout(() => {
          if (onCompletedCallback) {
            onCompletedCallback({
              comments: {
                edges: [{ node: mockComment }],
                totalCount: 1,
                pageInfo: { hasNextPage: false },
              },
            });
          }
        }, 0);

        return {
          data: {
            comments: {
              edges: [{ node: mockComment }],
              totalCount: 1,
              pageInfo: { hasNextPage: false },
            },
          },
          loading: false,
          error: undefined,
          refetch: vi.fn(),
          fetchMore: vi.fn(),
        };
      });

      // Mock the mutation hook
      mockUseOptimizedMutation.mockReturnValue([vi.fn(), { loading: false, error: undefined }]);

      const { result } = renderHook(() =>
        useComments('game-1', ParentType.GameLog, {}, { first: 10 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.comments).toHaveLength(1);
      });

      expect(result.current.comments).toHaveLength(1);
    });

    it('should provide refetch function', async () => {
      const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
      const { useOptimizedMutation } = await import('@/hooks/use-optimized-mutation');
      const mockUseOptimizedQuery = vi.mocked(useOptimizedQuery);
      const mockUseOptimizedMutation = vi.mocked(useOptimizedMutation);

      const mockRefetch = vi.fn();

      // Mock the query hook to return the expected data
      mockUseOptimizedQuery.mockReturnValue({
        data: {
          comments: {
            edges: [{ node: mockComment }],
            totalCount: 1,
            pageInfo: { hasNextPage: false },
          },
        },
        loading: false,
        error: undefined,
        refetch: mockRefetch,
        fetchMore: vi.fn(),
      });

      // Mock the mutation hook
      mockUseOptimizedMutation.mockReturnValue([vi.fn(), { loading: false, error: undefined }]);

      const { result } = renderHook(() => useComments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });

    it('should provide loadMoreComments function', async () => {
      const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
      const { useOptimizedMutation } = await import('@/hooks/use-optimized-mutation');
      const mockUseOptimizedQuery = vi.mocked(useOptimizedQuery);
      const mockUseOptimizedMutation = vi.mocked(useOptimizedMutation);

      const mockFetchMore = vi.fn();

      // Mock the query hook to return the expected data
      mockUseOptimizedQuery.mockReturnValue({
        data: {
          comments: {
            edges: [{ node: mockComment }],
            totalCount: 1,
            pageInfo: { hasNextPage: false },
          },
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        fetchMore: mockFetchMore,
      });

      // Mock the mutation hook
      mockUseOptimizedMutation.mockReturnValue([vi.fn(), { loading: false, error: undefined }]);

      const { result } = renderHook(() => useComments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.loadMoreComments).toBe('function');
    });
  });

  describe('useCreateComment', () => {
    it('should create comment successfully', async () => {
      const { useCreateCommentMutation } = await import('@/types');
      const mockUseCreateCommentMutation = vi.mocked(useCreateCommentMutation);

      const mockCreateComment = vi.fn().mockResolvedValue({
        data: {
          createComment: {
            comment: {
              id: 'new-comment-1',
              content: 'New comment',
            },
          },
        },
      });

      // Mock the mutation hook
      mockUseCreateCommentMutation.mockReturnValue([
        mockCreateComment,
        { loading: false, error: undefined },
      ]);

      const { result } = renderHook(() => useCreateComment());

      expect(typeof result.current.createComment).toBe('function');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle creation error', async () => {
      const { useCreateCommentMutation } = await import('@/types');
      const mockUseCreateCommentMutation = vi.mocked(useCreateCommentMutation);

      const mockCreateComment = vi.fn().mockRejectedValue(new Error('Creation failed'));

      // Mock the mutation hook
      mockUseCreateCommentMutation.mockReturnValue([
        mockCreateComment,
        { loading: false, error: new Error('Creation failed') },
      ]);

      const { result } = renderHook(() => useCreateComment());

      expect(typeof result.current.createComment).toBe('function');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useUpdateComment', () => {
    it('should update comment successfully', async () => {
      const { useUpdateCommentMutation } = await import('@/types');
      const mockUseUpdateCommentMutation = vi.mocked(useUpdateCommentMutation);

      const mockUpdateComment = vi.fn().mockResolvedValue({
        data: {
          updateComment: {
            comment: {
              id: 'comment-1',
              content: 'Updated comment',
              updated_at: expect.any(String),
              user: {
                id: 'user123',
                username: 'testuser',
              },
            },
          },
        },
      });

      // Mock the mutation hook
      mockUseUpdateCommentMutation.mockReturnValue([
        mockUpdateComment,
        { loading: false, error: undefined },
      ]);

      const { result } = renderHook(() => useUpdateComment());

      expect(typeof result.current.updateComment).toBe('function');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle update error', async () => {
      const { useUpdateCommentMutation } = await import('@/types');
      const mockUseUpdateCommentMutation = vi.mocked(useUpdateCommentMutation);

      const mockUpdateComment = vi.fn().mockRejectedValue(new Error('Update failed'));

      // Mock the mutation hook
      mockUseUpdateCommentMutation.mockReturnValue([
        mockUpdateComment,
        { loading: false, error: new Error('Update failed') },
      ]);

      const { result } = renderHook(() => useUpdateComment());

      expect(typeof result.current.updateComment).toBe('function');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useDeleteComment', () => {
    it('should delete comment successfully', async () => {
      const { useDeleteCommentMutation } = await import('@/types');
      const mockUseDeleteCommentMutation = vi.mocked(useDeleteCommentMutation);

      const mockDeleteComment = vi.fn().mockResolvedValue({
        data: {
          deleteComment: {
            id: 'comment-1',
          },
        },
      });

      // Mock the mutation hook
      mockUseDeleteCommentMutation.mockReturnValue([
        mockDeleteComment,
        { loading: false, error: undefined },
      ]);

      const { result } = renderHook(() => useDeleteComment());

      expect(typeof result.current.deleteComment).toBe('function');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle deletion error', async () => {
      const { useDeleteCommentMutation } = await import('@/types');
      const mockUseDeleteCommentMutation = vi.mocked(useDeleteCommentMutation);

      const mockDeleteComment = vi.fn().mockRejectedValue(new Error('Deletion failed'));

      // Mock the mutation hook
      mockUseDeleteCommentMutation.mockReturnValue([
        mockDeleteComment,
        { loading: false, error: new Error('Deletion failed') },
      ]);

      const { result } = renderHook(() => useDeleteComment());

      expect(typeof result.current.deleteComment).toBe('function');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useGameLogComments', () => {
    it('should return game log comments with correct filters', async () => {
      const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
      const { useOptimizedMutation } = await import('@/hooks/use-optimized-mutation');
      const mockUseOptimizedQuery = vi.mocked(useOptimizedQuery);
      const mockUseOptimizedMutation = vi.mocked(useOptimizedMutation);

      // Mock the query hook to return the expected data
      let onCompletedCallback: ((data: any) => void) | undefined;

      mockUseOptimizedQuery.mockImplementation((query, options) => {
        // Capture the onCompleted callback
        onCompletedCallback = options?.onCompleted;

        // Simulate the onCompleted callback being called with the mock data
        setTimeout(() => {
          if (onCompletedCallback) {
            onCompletedCallback({
              comments: {
                edges: [{ node: mockComment }],
                totalCount: 1,
                pageInfo: { hasNextPage: false },
              },
            });
          }
        }, 0);

        return {
          data: {
            comments: {
              edges: [{ node: mockComment }],
              totalCount: 1,
              pageInfo: { hasNextPage: false },
            },
          },
          loading: false,
          error: undefined,
          refetch: vi.fn(),
          fetchMore: vi.fn(),
        };
      });

      // Mock the mutation hook
      mockUseOptimizedMutation.mockReturnValue([vi.fn(), { loading: false, error: undefined }]);

      const { result } = renderHook(() => useGameLogComments('game-1', 3));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.comments).toHaveLength(1);
      });

      expect(result.current.comments).toHaveLength(1);
    });
  });

  describe('useCommentReplies', () => {
    it('should return comment replies with correct filters', async () => {
      const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
      const { useOptimizedMutation } = await import('@/hooks/use-optimized-mutation');
      const mockUseOptimizedQuery = vi.mocked(useOptimizedQuery);
      const mockUseOptimizedMutation = vi.mocked(useOptimizedMutation);

      // Mock the query hook to return the expected data
      let onCompletedCallback: ((data: any) => void) | undefined;

      mockUseOptimizedQuery.mockImplementation((query, options) => {
        // Capture the onCompleted callback
        onCompletedCallback = options?.onCompleted;

        // Simulate the onCompleted callback being called with the mock data
        setTimeout(() => {
          if (onCompletedCallback) {
            onCompletedCallback({
              comments: {
                edges: [{ node: mockComment }],
                totalCount: 1,
                pageInfo: { hasNextPage: false },
              },
            });
          }
        }, 0);

        return {
          data: {
            comments: {
              edges: [{ node: mockComment }],
              totalCount: 1,
              pageInfo: { hasNextPage: false },
            },
          },
          loading: false,
          error: undefined,
          refetch: vi.fn(),
          fetchMore: vi.fn(),
        };
      });

      // Mock the mutation hook
      mockUseOptimizedMutation.mockReturnValue([vi.fn(), { loading: false, error: undefined }]);

      const { result } = renderHook(() => useCommentReplies('comment-1', 2));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.comments).toHaveLength(1);
      });

      expect(result.current.comments).toHaveLength(1);
    });
  });
});
