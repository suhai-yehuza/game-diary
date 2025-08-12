import { useQuery, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  useReactions,
  useGameLogReactions,
  useCommentReactions,
  useReactionEmojis,
} from '@/hooks/use-reactions';
import { REACTION_EMOJIS as _REACTION_EMOJIS } from '@/lib/types/constant.types';
import { ParentType } from '@/lib/types/generated/graphql';
// Mock Apollo Client
vi.mock('@apollo/client', () => {
  const mockUseQuery = vi.fn();
  const mockUseMutation = vi.fn();
  const mockGql = vi.fn(() => '');

  return {
    useQuery: mockUseQuery,
    useMutation: mockUseMutation,
    gql: mockGql,
  };
});

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

describe('Reactions Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUser as any).mockReturnValue({
      user: { id: 'user123' },
    });
  });

  describe('useReactions', () => {
    it('should be a function', () => {
      expect(typeof useReactions).toBe('function');
    });

    it('should return an object with expected properties', () => {
      (useQuery as any).mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });
      (useMutation as any).mockReturnValue([vi.fn(), { loading: false }]);

      const { result } = renderHook(() =>
        useReactions({ targetId: 'test123', targetType: ParentType.GameLog })
      );

      expect(result.current).toHaveProperty('reactions');
      expect(result.current).toHaveProperty('groupedReactions');
      expect(result.current).toHaveProperty('userReactions');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('addReaction');
      expect(result.current).toHaveProperty('removeReaction');
      expect(result.current).toHaveProperty('toggleReaction');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should skip query when targetId is not provided', () => {
      (useQuery as any).mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });
      (useMutation as any).mockReturnValue([vi.fn(), { loading: false }]);

      renderHook(() => useReactions({ targetId: '', targetType: ParentType.GameLog }));

      expect(useQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          skip: true,
        })
      );
    });

    it('should handle loading state', () => {
      (useQuery as any).mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: vi.fn(),
      });
      (useMutation as any).mockReturnValue([vi.fn(), { loading: false }]);

      const { result } = renderHook(() =>
        useReactions({ targetId: 'test123', targetType: ParentType.GameLog })
      );

      expect(result.current.loading).toBe(true);
    });

    it('should handle error state', () => {
      const mockError = new Error('Test error');
      (useQuery as any).mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: vi.fn(),
      });
      (useMutation as any).mockReturnValue([vi.fn(), { loading: false }]);

      const { result } = renderHook(() =>
        useReactions({ targetId: 'test123', targetType: ParentType.GameLog })
      );

      expect(result.current.error).toBe('Test error');
    });

    it('should handle empty reactions data', () => {
      (useQuery as any).mockReturnValue({
        data: { reactions: [] },
        loading: false,
        error: null,
        refetch: vi.fn(),
      });
      (useMutation as any).mockReturnValue([vi.fn(), { loading: false }]);

      const { result } = renderHook(() =>
        useReactions({ targetId: 'test123', targetType: ParentType.GameLog })
      );

      expect(result.current.reactions).toEqual([]);
      expect(result.current.groupedReactions).toEqual([]);
      expect(result.current.userReactions.size).toBe(0);
    });

    it('should group reactions correctly', () => {
      const mockData = {
        reactions: [
          { id: '1', emoji: '👍', user_id: 'user123' },
          { id: '2', emoji: '👍', user_id: 'user456' },
          { id: '3', emoji: '❤️', user_id: 'user789' },
          { id: '4', emoji: '🔥', user_id: 'user123' },
        ],
      };

      (useQuery as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });
      (useMutation as any).mockReturnValue([vi.fn(), { loading: false }]);

      const { result } = renderHook(() =>
        useReactions({ targetId: 'test123', targetType: ParentType.GameLog })
      );

      expect(result.current.reactions).toEqual(mockData.reactions);
      expect(result.current.groupedReactions).toHaveLength(3);

      const thumbsUpGroup = result.current.groupedReactions.find(g => g.emoji === '👍');
      expect(thumbsUpGroup?.count).toBe(2);
      expect(thumbsUpGroup?.hasUserReacted).toBe(true);
      expect(thumbsUpGroup?.reactionIds).toEqual(['1', '2']);

      const heartGroup = result.current.groupedReactions.find(g => g.emoji === '❤️');
      expect(heartGroup?.count).toBe(1);
      expect(heartGroup?.hasUserReacted).toBe(false);
      expect(heartGroup?.reactionIds).toEqual(['3']);

      const fireGroup = result.current.groupedReactions.find(g => g.emoji === '🔥');
      expect(fireGroup?.count).toBe(1);
      expect(fireGroup?.hasUserReacted).toBe(true);
      expect(fireGroup?.reactionIds).toEqual(['4']);

      expect(result.current.userReactions.has('👍')).toBe(true);
      expect(result.current.userReactions.has('🔥')).toBe(true);
      expect(result.current.userReactions.has('❤️')).toBe(false);
    });

    it('should handle addReaction functionality', async () => {
      const mockCreateReaction = vi.fn().mockResolvedValue({});
      const mockRefetch = vi.fn().mockResolvedValue({});

      (useQuery as any).mockReturnValue({
        data: { reactions: [] },
        loading: false,
        error: null,
        refetch: mockRefetch,
      });
      (useMutation as any).mockReturnValue([mockCreateReaction, { loading: false }]);

      const { result } = renderHook(() =>
        useReactions({ targetId: 'test123', targetType: ParentType.GameLog })
      );

      await act(async () => {
        await result.current.addReaction('👍');
      });

      expect(mockCreateReaction).toHaveBeenCalledWith({
        variables: {
          input: {
            emoji: '👍',
            targetId: 'test123',
            targetType: 'GAME_LOG',
          },
        },
      });
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should not add reaction when user is not authenticated', async () => {
      (useUser as any).mockReturnValue({ user: null });

      const mockCreateReaction = vi.fn();
      const mockRefetch = vi.fn();

      (useQuery as any).mockReturnValue({
        data: { reactions: [] },
        loading: false,
        error: null,
        refetch: mockRefetch,
      });
      (useMutation as any).mockReturnValue([mockCreateReaction, { loading: false }]);

      const { result } = renderHook(() =>
        useReactions({ targetId: 'test123', targetType: ParentType.GameLog })
      );

      await act(async () => {
        await result.current.addReaction('👍');
      });

      expect(mockCreateReaction).not.toHaveBeenCalled();
      expect(mockRefetch).not.toHaveBeenCalled();
    });

    it('should handle addReaction error', async () => {
      const mockCreateReaction = vi.fn().mockRejectedValue(new Error('Failed to create'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (useQuery as any).mockReturnValue({
        data: { reactions: [] },
        loading: false,
        error: null,
        refetch: vi.fn(),
      });
      (useMutation as any).mockReturnValue([mockCreateReaction, { loading: false }]);

      const { result } = renderHook(() =>
        useReactions({ targetId: 'test123', targetType: ParentType.GameLog })
      );

      await act(async () => {
        await result.current.addReaction('👍');
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to add reaction:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle removeReaction functionality', async () => {
      const mockDeleteReaction = vi.fn().mockResolvedValue({});
      const mockRefetch = vi.fn().mockResolvedValue({});

      const mockData = {
        reactions: [
          { id: '1', emoji: '👍', user_id: 'user123' },
          { id: '2', emoji: '❤️', user_id: 'user456' },
        ],
      };

      (useQuery as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: mockRefetch,
      });
      (useMutation as any).mockReturnValue([mockDeleteReaction, { loading: false }]);

      const { result } = renderHook(() =>
        useReactions({ targetId: 'test123', targetType: ParentType.GameLog })
      );

      await act(async () => {
        await result.current.removeReaction('👍');
      });

      expect(mockDeleteReaction).toHaveBeenCalledWith({
        variables: {
          id: '1',
        },
      });
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should not remove reaction when user has not reacted', async () => {
      const mockDeleteReaction = vi.fn();
      const mockRefetch = vi.fn();

      const mockData = {
        reactions: [
          { id: '1', emoji: '👍', user_id: 'user456' }, // Different user
        ],
      };

      (useQuery as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: mockRefetch,
      });
      (useMutation as any).mockReturnValue([mockDeleteReaction, { loading: false }]);

      const { result } = renderHook(() =>
        useReactions({ targetId: 'test123', targetType: ParentType.GameLog })
      );

      await act(async () => {
        await result.current.removeReaction('👍');
      });

      expect(mockDeleteReaction).not.toHaveBeenCalled();
      expect(mockRefetch).not.toHaveBeenCalled();
    });

    it('should handle removeReaction error', async () => {
      const mockDeleteReaction = vi.fn().mockRejectedValue(new Error('Failed to delete'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockData = {
        reactions: [{ id: '1', emoji: '👍', user_id: 'user123' }],
      };

      (useQuery as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });
      (useMutation as any).mockReturnValue([mockDeleteReaction, { loading: false }]);

      const { result } = renderHook(() =>
        useReactions({ targetId: 'test123', targetType: ParentType.GameLog })
      );

      await act(async () => {
        await result.current.removeReaction('👍');
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to remove reaction:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle toggleReaction - adding reaction', async () => {
      const mockCreateReaction = vi.fn().mockResolvedValue({});
      const mockRefetch = vi.fn().mockResolvedValue({});

      (useQuery as any).mockReturnValue({
        data: { reactions: [] },
        loading: false,
        error: null,
        refetch: mockRefetch,
      });
      (useMutation as any).mockReturnValue([mockCreateReaction, { loading: false }]);

      const { result } = renderHook(() =>
        useReactions({ targetId: 'test123', targetType: ParentType.GameLog })
      );

      await act(async () => {
        await result.current.toggleReaction('👍');
      });

      expect(mockCreateReaction).toHaveBeenCalledWith({
        variables: {
          input: {
            emoji: '👍',
            targetId: 'test123',
            targetType: 'GAME_LOG',
          },
        },
      });
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should handle toggleReaction - removing reaction', async () => {
      const mockDeleteReaction = vi.fn().mockResolvedValue({});
      const mockRefetch = vi.fn().mockResolvedValue({});

      const mockData = {
        reactions: [{ id: '1', emoji: '👍', user_id: 'user123' }],
      };

      (useQuery as any).mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: mockRefetch,
      });
      (useMutation as any).mockReturnValue([mockDeleteReaction, { loading: false }]);

      const { result } = renderHook(() =>
        useReactions({ targetId: 'test123', targetType: ParentType.GameLog })
      );

      await act(async () => {
        await result.current.toggleReaction('👍');
      });

      expect(mockDeleteReaction).toHaveBeenCalledWith({
        variables: {
          id: '1',
        },
      });
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('useGameLogReactions', () => {
    it('should be a function', () => {
      expect(typeof useGameLogReactions).toBe('function');
    });

    it('should call useReactions with correct parameters', () => {
      (useQuery as any).mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });
      (useMutation as any).mockReturnValue([vi.fn(), { loading: false }]);

      renderHook(() => useGameLogReactions('gameLog123'));

      expect(useQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          variables: {
            targetId: 'gameLog123',
            targetType: ParentType.GameLog,
          },
        })
      );
    });
  });

  describe('useCommentReactions', () => {
    it('should be a function', () => {
      expect(typeof useCommentReactions).toBe('function');
    });

    it('should call useReactions with correct parameters', () => {
      (useQuery as any).mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });
      (useMutation as any).mockReturnValue([vi.fn(), { loading: false }]);

      renderHook(() => useCommentReactions('comment123'));

      expect(useQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          variables: {
            targetId: 'comment123',
            targetType: 'COMMENT',
          },
        })
      );
    });
  });

  describe('useReactionEmojis', () => {
    it('should be a function', () => {
      expect(typeof useReactionEmojis).toBe('function');
    });

    it('should return array of emoji values', () => {
      const { result } = renderHook(() => useReactionEmojis());

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current).toContain('👍');
      expect(result.current).toContain('👎');
      expect(result.current).toContain('❤️');
      expect(result.current).toContain('🔥');
      expect(result.current).toContain('👀');
    });

    it('should return the same array on re-renders', () => {
      const { result, rerender } = renderHook(() => useReactionEmojis());

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult); // Should be the same reference due to useMemo
    });
  });
});
