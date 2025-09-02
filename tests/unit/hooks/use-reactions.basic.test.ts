import { useQuery, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Apollo Client
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

// Mock GraphQL operations
vi.mock('@/lib/graphql/mutations', () => ({
  CREATE_REACTION: 'CREATE_REACTION',
  DELETE_REACTION: 'DELETE_REACTION',
}));

vi.mock('@/lib/graphql/queries', () => ({
  GET_REACTIONS: 'GET_REACTIONS',
}));

// Mock types
vi.mock('@/lib/constants', () => ({
  REACTION_EMOJIS: {
    THUMBS_UP: '👍',
    HEART: '❤️',
    LAUGH: '😂',
    CLAP: '👏',
    ROCKET: '🚀',
    FIRE: '🔥',
    EYES: '👀',
    MUSCLE: '💪',
  },
  CLASSIFICATION: {
    PRIVATE: 'private',
    PROTECTED: 'protected',
    PUBLIC: 'public',
  },
  API_ENDPOINTS: {
    NBA: {
      GAMES: '/api/games',
      TEAMS: '/api/teams',
      PLAYERS: '/api/players',
    },
  },
}));

import {
  useReactions,
  useGameLogReactions,
  useCommentReactions,
  useReactionEmojis,
} from '@/hooks/use-reactions';
import { ParentType } from '@/lib/types/generated/graphql';

describe('useReactions', () => {
  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  };

  const mockReactions = [
    {
      id: 'reaction-1',
      emoji: '👍',
      user_id: 'user-1',
      target_id: 'target-1',
      target_type: 'GAME_LOG',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      deleted_at: null,
      user: {
        id: 'user-1',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        email_address: 'test@example.com',
        phone_number: null,
        image_url: null,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useUser
    (useUser as any).mockReturnValue({
      user: mockUser,
    });

    // Mock useQuery
    (useQuery as any).mockReturnValue({
      data: { reactions: mockReactions },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    // Mock useMutation
    (useMutation as any).mockReturnValue([
      vi.fn().mockResolvedValue({ data: { createReaction: { reaction: mockReactions[0] } } }),
      { loading: false, error: null },
    ]);
  });

  it('should return reactions data', () => {
    const { result } = renderHook(() =>
      useReactions({
        targetId: 'target-1',
        targetType: ParentType.GameLog,
      })
    );

    expect(result.current.reactions).toBeDefined();
    expect(result.current.groupedReactions).toBeDefined();
    expect(result.current.userReactions).toBeDefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should have addReaction function', () => {
    const { result } = renderHook(() =>
      useReactions({
        targetId: 'target-1',
        targetType: ParentType.GameLog,
      })
    );

    expect(typeof result.current.addReaction).toBe('function');
  });

  it('should have removeReaction function', () => {
    const { result } = renderHook(() =>
      useReactions({
        targetId: 'target-1',
        targetType: ParentType.GameLog,
      })
    );

    expect(typeof result.current.removeReaction).toBe('function');
  });

  it('should have toggleReaction function', () => {
    const { result } = renderHook(() =>
      useReactions({
        targetId: 'target-1',
        targetType: ParentType.GameLog,
      })
    );

    expect(typeof result.current.toggleReaction).toBe('function');
  });

  it('should have refetch function', () => {
    const { result } = renderHook(() =>
      useReactions({
        targetId: 'target-1',
        targetType: ParentType.GameLog,
      })
    );

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should handle loading state', () => {
    (useQuery as any).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() =>
      useReactions({
        targetId: 'target-1',
        targetType: ParentType.GameLog,
      })
    );

    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', () => {
    (useQuery as any).mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'Test error' },
      refetch: vi.fn(),
    });

    const { result } = renderHook(() =>
      useReactions({
        targetId: 'target-1',
        targetType: ParentType.GameLog,
      })
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

    const { result } = renderHook(() =>
      useReactions({
        targetId: 'target-1',
        targetType: ParentType.GameLog,
      })
    );

    expect(result.current.reactions).toEqual([]);
    expect(result.current.groupedReactions).toEqual([]);
  });
});

describe('useGameLogReactions', () => {
  it('should call useReactions with GAME_LOG type', () => {
    const { result } = renderHook(() => useGameLogReactions('game-log-1'));

    expect(result.current).toBeDefined();
  });
});

describe('useCommentReactions', () => {
  it('should call useReactions with COMMENT type', () => {
    const { result } = renderHook(() => useCommentReactions('comment-1'));

    expect(result.current).toBeDefined();
  });
});

describe('useReactionEmojis', () => {
  it('should return available reaction emojis', () => {
    const { result } = renderHook(() => useReactionEmojis());

    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toContain('👍');
    expect(result.current).toContain('❤️');
    expect(result.current).toContain('😂');
    expect(result.current).toContain('👏');
    expect(result.current).toContain('🚀');
    expect(result.current).toContain('🔥');
    expect(result.current).toContain('👀');
    expect(result.current).toContain('💪');
  });
});
