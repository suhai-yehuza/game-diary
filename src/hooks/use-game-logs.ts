/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { useQuery } from '@apollo/client';
import { useState, useCallback } from 'react';

import { GET_GAME_LOGS, GET_FRIENDS_GAME_LOGS } from '@/lib/graphql/queries';
import type { IGameLogsOptions, IGameLogsResponse } from '@/lib/types';
import { CLASSIFICATION } from '@/lib/types';
import type { IGameLog } from '@/lib/types/gameLog.types';
import type {
  Query,
  GameLog as GqlGameLog,
  Game as GqlGame,
  Team as GqlTeam,
} from '@/lib/types/generated/graphql';

interface IFriendsGameLogsShape {
  edges: Array<{ node: unknown }>;
  pageInfo: {
    endCursor: string | null;
    hasNextPage: boolean;
  };
}

// @ts-expect-error codegen types are trusted and safe for member access
function mapTeam(team: GqlTeam | null | undefined): IGameLog['game']['home_team'] | undefined {
  if (!team) return undefined;
  return {
    id: team.id,

    name: team.name,

    nickname: team.nickname ?? undefined,

    code: team.code ?? undefined,

    city: team.city ?? undefined,

    logo: team.logo ?? undefined,

    all_star: team.all_star,

    nba_franchise: team.nba_franchise,

    conference: team.conference ?? undefined,

    created_at: team.created_at ?? undefined,

    updated_at: team.updated_at ?? undefined,
  };
}

function mapGame(game: GqlGame | null | undefined): IGameLog['game'] | undefined {
  if (!game) return undefined;
  return {
    id: game.id,
    date: game.date ?? undefined,
    status: game.status ?? undefined,
    game_type: game.game_type ?? undefined,
    nba_game_id: game.nba_game_id ?? undefined,
    home_team_id: game.home_team_id ?? undefined,
    away_team_id: game.away_team_id ?? undefined,
    home_team: mapTeam(game.home_team),
    away_team: mapTeam(game.away_team),
    home_team_score: game.home_team_score ?? undefined,
    away_team_score: game.away_team_score ?? undefined,
    average_rating: game.average_rating ?? undefined,
    total_ratings: game.total_ratings ?? undefined,
    created_at: game.created_at ?? undefined,
    updated_at: game.updated_at ?? undefined,
  };
}

function mapUser(user: unknown): IGameLog['user'] {
  if (!user || typeof user !== 'object' || !('id' in user)) {
    return { id: '', username: '' };
  }
  const id = (user as { id?: string }).id ?? '';
  let username = (user as { username?: string | null }).username;
  username ??= '';
  const first_name = (user as { first_name?: string | null }).first_name ?? undefined;
  const last_name = (user as { last_name?: string | null }).last_name ?? undefined;
  const image_url = (user as { image_url?: string | null }).image_url ?? undefined;
  return { id, username, first_name, last_name, image_url };
}

// Type guard for filtering only strings
function isString(t: unknown): t is string {
  return typeof t === 'string';
}

// Omit comments and reactions from mapped log
type GqlGameLogNoComments = Omit<GqlGameLog, 'comments' | 'reactions'>;

function mapGameLog(log: GqlGameLogNoComments): IGameLog {
  return {
    id: log.id ?? '',
    game_id: log.game_id ?? '',
    notes: log.notes ?? undefined,
    tags: log.tags ? log.tags.map(t => t ?? '').filter(isString) : [],
    watched_date: log.watched_date ?? undefined,
    watched_setting: log.watched_setting ?? undefined,
    watched_location: log.watched_location ?? undefined,
    watched_scope: log.watched_scope ?? undefined,
    classification: log.classification ?? '',
    created_at: log.created_at ?? '',
    updated_at: log.updated_at ?? '',
    rating_for_game: log.rating_for_game ?? 0,
    game: log.game ? mapGame(log.game) : undefined,
    user: mapUser(log.user),
    // comments and reactions are omitted
  };
}

// Helper to safely map an array of edges to IGameLog[]
function safeMapGameLogArray(edges: unknown): IGameLog[] {
  if (Array.isArray(edges)) {
    return edges
      .map(e => {
        if (e && typeof e === 'object' && 'node' in e) {
          return mapGameLog((e as { node: GqlGameLogNoComments }).node);
        }
        return undefined;
      })
      .filter((log): log is IGameLog => !!log);
  }
  return [];
}

export function useGameLogs(options: IGameLogsOptions = {}) {
  const { filters = {}, pagination = {} } = options;
  // Separate state for gameLogs and friendsGameLogs
  const [gameLogs, setGameLogs] = useState<IGameLog[]>([]);
  const [gameLogsEndCursor, setGameLogsEndCursor] = useState<string | null>(null);
  const [gameLogsHasNextPage, setGameLogsHasNextPage] = useState(true);

  const [friendsLogs, setFriendsLogs] = useState<IGameLog[]>([]);
  const [friendsLogsEndCursor, setFriendsLogsEndCursor] = useState<string | null>(null);
  const [friendsLogsHasNextPage, setFriendsLogsHasNextPage] = useState(true);

  const { loading, error, refetch, fetchMore } = useQuery<IGameLogsResponse>(GET_GAME_LOGS, {
    variables: {
      filters,
      pagination,
    },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    onCompleted: data => {
      if (
        data &&
        typeof data === 'object' &&
        'gameLogs' in data &&
        data.gameLogs &&
        Array.isArray(data.gameLogs.edges)
      ) {
        setGameLogs(safeMapGameLogArray(data.gameLogs.edges));

        setGameLogsEndCursor(data.gameLogs.pageInfo.endCursor ?? null);

        setGameLogsHasNextPage(!!data.gameLogs.pageInfo.hasNextPage);
      }
      if (
        data &&
        typeof data === 'object' &&
        'friendsGameLogs' in data &&
        data.friendsGameLogs &&
        typeof data.friendsGameLogs === 'object' &&
        'edges' in data.friendsGameLogs &&
        Array.isArray((data.friendsGameLogs as IFriendsGameLogsShape).edges) &&
        'pageInfo' in data.friendsGameLogs &&
        typeof (data.friendsGameLogs as IFriendsGameLogsShape).pageInfo === 'object'
      ) {
        const friendsGameLogs = data.friendsGameLogs as unknown;
        if (isFriendsGameLogsShape(friendsGameLogs)) {
          setFriendsLogs(safeMapGameLogArray(friendsGameLogs.edges));
          setFriendsLogsEndCursor(friendsGameLogs.pageInfo.endCursor ?? null);
          setFriendsLogsHasNextPage(!!friendsGameLogs.pageInfo.hasNextPage);
        }
      }
    },
  });

  const loadMoreGameLogs = useCallback(async () => {
    if (!gameLogsHasNextPage || loading) return;
    const fetchResult = await fetchMore({
      variables: {
        filters,
        pagination: { after: gameLogsEndCursor },
      },
    });
    const moreData = fetchResult?.data;
    if (
      moreData &&
      typeof moreData === 'object' &&
      'gameLogs' in moreData &&
      moreData.gameLogs &&
      Array.isArray(moreData.gameLogs.edges)
    ) {
      setGameLogs(prev => {
        const existingIds = new Set(prev.map(log => log.id));
        const newLogs = safeMapGameLogArray(moreData.gameLogs.edges).filter(
          log => !existingIds.has(log.id)
        );
        return [...prev, ...newLogs];
      });

      setGameLogsEndCursor(moreData.gameLogs.pageInfo.endCursor ?? null);

      setGameLogsHasNextPage(!!moreData.gameLogs.pageInfo.hasNextPage);
    }
  }, [fetchMore, filters, gameLogsEndCursor, gameLogsHasNextPage, loading]);

  const loadMoreFriendsLogs = useCallback(async () => {
    if (!friendsLogsHasNextPage || loading) return;
    const fetchResult = await fetchMore({
      variables: {
        filters,
        pagination: { after: friendsLogsEndCursor },
      },
    });
    const moreData = fetchResult?.data;
    if (
      moreData &&
      typeof moreData === 'object' &&
      'friendsGameLogs' in moreData &&
      moreData.friendsGameLogs &&
      typeof moreData.friendsGameLogs === 'object' &&
      'edges' in moreData.friendsGameLogs &&
      Array.isArray((moreData.friendsGameLogs as IFriendsGameLogsShape).edges) &&
      'pageInfo' in moreData.friendsGameLogs &&
      typeof (moreData.friendsGameLogs as IFriendsGameLogsShape).pageInfo === 'object'
    ) {
      const friendsGameLogs = moreData.friendsGameLogs as IFriendsGameLogsShape;
      if (isFriendsGameLogsShape(friendsGameLogs)) {
        setFriendsLogs(prev => {
          const existingIds = new Set(prev.map(log => log.id));
          const newLogs = safeMapGameLogArray(friendsGameLogs.edges).filter(
            log => !existingIds.has(log.id)
          );
          return [...prev, ...newLogs];
        });
        setFriendsLogsEndCursor(friendsGameLogs.pageInfo.endCursor ?? null);
        setFriendsLogsHasNextPage(!!friendsGameLogs.pageInfo.hasNextPage);
      }
    }
  }, [fetchMore, filters, friendsLogsEndCursor, friendsLogsHasNextPage, loading]);

  // Patch refetch to update both states
  const wrappedRefetch = useCallback(
    async (...args: Parameters<typeof refetch>) => {
      const result = await refetch(...args);
      const newData = result?.data;
      if (
        newData &&
        typeof newData === 'object' &&
        'gameLogs' in newData &&
        newData.gameLogs &&
        Array.isArray(newData.gameLogs.edges)
      ) {
        setGameLogs(safeMapGameLogArray(newData.gameLogs.edges));

        setGameLogsEndCursor(newData.gameLogs.pageInfo.endCursor ?? null);

        setGameLogsHasNextPage(!!newData.gameLogs.pageInfo.hasNextPage);
      }
      if (
        newData &&
        typeof newData === 'object' &&
        'friendsGameLogs' in newData &&
        newData.friendsGameLogs &&
        typeof newData.friendsGameLogs === 'object' &&
        'edges' in newData.friendsGameLogs &&
        Array.isArray((newData.friendsGameLogs as IFriendsGameLogsShape).edges) &&
        'pageInfo' in newData.friendsGameLogs &&
        typeof (newData.friendsGameLogs as IFriendsGameLogsShape).pageInfo === 'object'
      ) {
        const friendsGameLogs = newData.friendsGameLogs as unknown;
        if (isFriendsGameLogsShape(friendsGameLogs)) {
          setFriendsLogs(safeMapGameLogArray(friendsGameLogs.edges));
          setFriendsLogsEndCursor(friendsGameLogs.pageInfo.endCursor ?? null);
          setFriendsLogsHasNextPage(!!friendsGameLogs.pageInfo.hasNextPage);
        }
      }
      return result;
    },
    [refetch]
  );

  return {
    gameLogs,
    gameLogsEndCursor,
    gameLogsHasNextPage,
    loadMoreGameLogs,
    friendsLogs,
    friendsLogsEndCursor,
    friendsLogsHasNextPage,
    loadMoreFriendsLogs,
    loading,
    error: error ? new Error(error.message) : null,
    refetch: wrappedRefetch,
  };
}

export function useMyGameLogs(userId?: string) {
  return useGameLogs({
    filters: { userId },
  });
}

export function usePublicGameLogs() {
  return useGameLogs({
    filters: { classification: CLASSIFICATION.PUBLIC },
  });
}

export function useFriendsGameLogs() {
  const [logs, setLogs] = useState<IGameLog[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  const { loading, error, refetch, fetchMore } = useQuery<Pick<Query, 'friendsGameLogs'>>(
    GET_FRIENDS_GAME_LOGS,
    {
      variables: {
        pagination: {},
      },
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
      onCompleted: data => {
        if (
          data &&
          typeof data === 'object' &&
          'friendsGameLogs' in data &&
          data.friendsGameLogs &&
          Array.isArray(data.friendsGameLogs.edges)
        ) {
          setLogs(safeMapGameLogArray(data.friendsGameLogs.edges));

          setEndCursor(data.friendsGameLogs.pageInfo.endCursor ?? null);

          setHasNextPage(!!data.friendsGameLogs.pageInfo.hasNextPage);
        }
      },
    }
  );

  // Patch refetch to update both states
  const wrappedRefetch = useCallback(
    async (...args: Parameters<typeof refetch>) => {
      const result = await refetch(...args);
      const newData = result?.data;
      if (
        newData &&
        typeof newData === 'object' &&
        'friendsGameLogs' in newData &&
        newData.friendsGameLogs &&
        Array.isArray(newData.friendsGameLogs.edges)
      ) {
        setLogs(safeMapGameLogArray(newData.friendsGameLogs.edges));

        setEndCursor(newData.friendsGameLogs.pageInfo.endCursor ?? null);

        setHasNextPage(!!newData.friendsGameLogs.pageInfo.hasNextPage);
      }
      return result;
    },
    [refetch]
  );

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading) return;
    const fetchResult = await fetchMore({
      variables: {
        pagination: { after: endCursor },
      },
    });
    const moreData = fetchResult?.data;
    if (
      moreData &&
      typeof moreData === 'object' &&
      'friendsGameLogs' in moreData &&
      moreData.friendsGameLogs &&
      Array.isArray(moreData.friendsGameLogs.edges)
    ) {
      setLogs(prev => {
        const existingIds = new Set(prev.map(log => log.id));
        const newLogs = safeMapGameLogArray(moreData.friendsGameLogs.edges).filter(
          log => !existingIds.has(log.id)
        );
        return [...prev, ...newLogs];
      });

      setEndCursor(moreData.friendsGameLogs.pageInfo.endCursor ?? null);

      setHasNextPage(!!moreData.friendsGameLogs.pageInfo.hasNextPage);
    }
  }, [fetchMore, endCursor, hasNextPage, loading]);

  return {
    logs,
    loading,
    error: error ? new Error(error.message) : null,
    refetch: wrappedRefetch,
    hasNextPage,
    loadMore,
  };
}

function isFriendsGameLogsShape(obj: unknown): obj is IFriendsGameLogsShape {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    (!('message' in obj) || typeof (obj as { message?: unknown }).message !== 'string') && // not an error object
    'edges' in obj &&
    Array.isArray((obj as { edges: unknown[] }).edges) &&
    'pageInfo' in obj &&
    typeof (obj as { pageInfo: unknown }).pageInfo === 'object' &&
    (obj as { pageInfo: unknown }).pageInfo !== null
  );
}
