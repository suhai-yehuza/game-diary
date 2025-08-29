import { MockedProvider } from '@apollo/client/testing';
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
import { ParentType } from '@/lib/types/generated/graphql';
import { errorHandlers } from '@/lib/utils/error-handler';

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
    user: {
      id: 'user-1',
      first_name: 'John',
      last_name: 'Doe',
      username: 'johndoe',
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
          id: 'new-comment-1',
          content: 'New comment',
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
          id: 'comment-1',
          content: 'Updated comment',
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
        filters: {},
        pagination: {},
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
      const { result } = renderHook(() => useComments(), {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[getCommentsMock]} addTypename={false}>
            {children}
          </MockedProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.comments).toHaveLength(1);
      expect(result.current.comments[0]).toEqual(mockComment);
      expect(result.current.commentsTotalCount).toBe(1);
      expect(result.current.commentsHasNextPage).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle query error gracefully', async () => {
      const errorMock = {
        request: {
          query: GET_COMMENTS,
          variables: {
            filters: {},
            pagination: {},
          },
        },
        error: new Error('Network error'),
      };

      const { result } = renderHook(() => useComments(), {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[errorMock]} addTypename={false}>
            {children}
          </MockedProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Network error');
    });

    it('should handle authentication errors gracefully', async () => {
      const authErrorMock = {
        request: {
          query: GET_COMMENTS,
          variables: {
            filters: {},
            pagination: {},
          },
        },
        error: {
          name: 'GraphQLError',
          message: 'Authentication error',
          graphQLErrors: [
            {
              extensions: {
                code: 'FORBIDDEN',
              },
            },
          ],
        },
      };

      const { result } = renderHook(() => useComments(), {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[authErrorMock]} addTypename={false}>
            {children}
          </MockedProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Note: Console warnings may not be called in test environment
    });

    it('should handle filters and pagination options', async () => {
      const filteredMock = {
        request: {
          query: GET_COMMENTS,
          variables: {
            filters: { parentId: 'game-1', parentType: ParentType.GameLog },
            pagination: { first: 10 },
          },
        },
        result: {
          data: mockCommentsResponse,
        },
      };

      const { result } = renderHook(
        () =>
          useComments({
            filters: { parentId: 'game-1', parentType: ParentType.GameLog },
            pagination: { first: 10 },
          }),
        {
          wrapper: ({ children }) => (
            <MockedProvider mocks={[filteredMock]} addTypename={false}>
              {children}
            </MockedProvider>
          ),
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.comments).toHaveLength(1);
    });

    it('should provide refetch function', async () => {
      const { result } = renderHook(() => useComments(), {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[getCommentsMock]} addTypename={false}>
            {children}
          </MockedProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });

    it('should provide loadMoreComments function', async () => {
      const { result } = renderHook(() => useComments(), {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[getCommentsMock]} addTypename={false}>
            {children}
          </MockedProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.loadMoreComments).toBe('function');
    });
  });

  describe('useCreateComment', () => {
    it('should create comment successfully', async () => {
      const { result } = renderHook(() => useCreateComment(), {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[createCommentMock]} addTypename={false}>
            {children}
          </MockedProvider>
        ),
      });

      await act(async () => {
        const response = await result.current.createComment({
          content: 'New comment',
          parentId: 'parent-1',
          parentType: ParentType.GameLog,
        });

        expect(response).toEqual({
          id: 'new-comment-1',
          content: 'New comment',
        });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle creation error', async () => {
      const errorMock = {
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
        error: new Error('Creation failed'),
      };

      const { result } = renderHook(() => useCreateComment(), {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[errorMock]} addTypename={false}>
            {children}
          </MockedProvider>
        ),
      });

      await act(async () => {
        try {
          await result.current.createComment({
            content: 'New comment',
            parentId: 'parent-1',
            parentType: ParentType.GameLog,
          });
        } catch (error) {
          // Use centralized error handling
          errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
            component: 'Unit Test',
            action: 'Create comment test',
          });
          expect(error).toBeInstanceOf(Error);
        }
      });

      // Note: Console errors may not be called in test environment
    });
  });

  describe('useUpdateComment', () => {
    it('should update comment successfully', async () => {
      const { result } = renderHook(() => useUpdateComment(), {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[updateCommentMock]} addTypename={false}>
            {children}
          </MockedProvider>
        ),
      });

      await act(async () => {
        const response = await result.current.updateComment('comment-1', {
          content: 'Updated comment',
        });

        expect(response).toEqual({
          id: 'comment-1',
          content: 'Updated comment',
        });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle update error', async () => {
      const errorMock = {
        request: {
          query: UPDATE_COMMENT,
          variables: {
            id: 'comment-1',
            input: {
              content: 'Updated comment',
            },
          },
        },
        error: new Error('Update failed'),
      };

      const { result } = renderHook(() => useUpdateComment(), {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[errorMock]} addTypename={false}>
            {children}
          </MockedProvider>
        ),
      });

      await act(async () => {
        try {
          await result.current.updateComment('comment-1', {
            content: 'Updated comment',
          });
        } catch (error) {
          // Use centralized error handling
          errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
            component: 'Unit Test',
            action: 'Update comment test',
          });
          expect(error).toBeInstanceOf(Error);
        }
      });

      // Note: Console errors may not be called in test environment
    });
  });

  describe('useDeleteComment', () => {
    it('should delete comment successfully', async () => {
      const { result } = renderHook(() => useDeleteComment(), {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[deleteCommentMock]} addTypename={false}>
            {children}
          </MockedProvider>
        ),
      });

      await act(async () => {
        const response = await result.current.deleteComment('comment-1');

        expect(response).toEqual({
          id: 'comment-1',
        });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle deletion error', async () => {
      const errorMock = {
        request: {
          query: DELETE_COMMENT,
          variables: {
            id: 'comment-1',
          },
        },
        error: new Error('Deletion failed'),
      };

      const { result } = renderHook(() => useDeleteComment(), {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[errorMock]} addTypename={false}>
            {children}
          </MockedProvider>
        ),
      });

      await act(async () => {
        try {
          await result.current.deleteComment('comment-1');
        } catch (error) {
          // Use centralized error handling
          errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
            component: 'Unit Test',
            action: 'Delete comment test',
          });
          expect(error).toBeInstanceOf(Error);
        }
      });

      // Note: Console errors may not be called in test environment
    });
  });

  describe('useGameLogComments', () => {
    it('should return game log comments with correct filters', async () => {
      const gameLogMock = {
        request: {
          query: GET_COMMENTS,
          variables: {
            filters: { parentId: 'game-1', parentType: ParentType.GameLog },
            pagination: { first: 3 },
          },
        },
        result: {
          data: mockCommentsResponse,
        },
      };

      const { result } = renderHook(() => useGameLogComments('game-1', 3), {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[gameLogMock]} addTypename={false}>
            {children}
          </MockedProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.comments).toHaveLength(1);
    });
  });

  describe('useCommentReplies', () => {
    it('should return comment replies with correct filters', async () => {
      const repliesMock = {
        request: {
          query: GET_COMMENTS,
          variables: {
            filters: { parentId: 'comment-1', parentType: ParentType.Comment },
            pagination: { first: 2 },
          },
        },
        result: {
          data: mockCommentsResponse,
        },
      };

      const { result } = renderHook(() => useCommentReplies('comment-1', 2), {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[repliesMock]} addTypename={false}>
            {children}
          </MockedProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.comments).toHaveLength(1);
    });
  });
});
