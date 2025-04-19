import { useQuery, useMutation, useApolloClient } from '@apollo/client';

import { CREATE_GAME } from '@/lib/graphql/mutations';
import { GET_EXTERNAL_GAMES, GET_GAME_BY_ID, GAME_FRAGMENT } from '@/lib/graphql/queries';

export function useGame(gameId?: string) {
  const client = useApolloClient();

  // Query for internal game (from DB)
  const { data: internalData, loading: internalLoading } = useQuery(GET_GAME_BY_ID, {
    variables: { id: gameId },
    skip: !gameId,
    fetchPolicy: 'cache-first',
  });

  // Query for external game
  const { data: externalData, loading: externalLoading } = useQuery(GET_EXTERNAL_GAMES, {
    variables: {
      filters: { id: gameId },
      pagination: { first: 1 },
    },
    skip: !gameId || !!internalData?.game,
    fetchPolicy: 'network-only',
  });

  // Mutation to create game in DB
  const [createGame] = useMutation(CREATE_GAME);

  const getGame = async (id: string) => {
    // First check Apollo cache
    const cachedGame = client.readFragment({
      id: `Game:${id}`,
      fragment: GAME_FRAGMENT,
    });

    if (cachedGame) {
      return cachedGame;
    }

    // Then check DB
    const { data: dbGame } = await client.query({
      query: GET_GAME_BY_ID,
      variables: { id },
      fetchPolicy: 'network-only',
    });

    if (dbGame?.game) {
      return dbGame.game;
    }

    // Finally fetch from external API
    const { data: externalGame } = await client.query({
      query: GET_EXTERNAL_GAMES,
      variables: {
        filters: { id },
        pagination: { first: 1 },
      },
      fetchPolicy: 'network-only',
    });

    if (externalGame?.games?.items?.[0]) {
      const game = externalGame.games.items[0];

      // Create game in DB
      await createGame({
        variables: {
          input: {
            id: game.id,
            date: game.date,
            status: game.status,
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            scores: game.scores,
            officials: game.officials,
            timesTied: game.timesTied,
            leadChanges: game.leadChanges,
          },
        },
      });

      return game;
    }

    return null;
  };

  return {
    game: internalData?.game || externalData?.games?.items?.[0],
    loading: internalLoading || externalLoading,
    getGame,
  };
}
