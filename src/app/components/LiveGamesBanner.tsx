import React from 'react';

import { useLiveGames } from '@/hooks/use-live-games';

export function LiveGamesBanner() {
  const { games } = useLiveGames();
  if (!games || games.length === 0) {
    return null;
  }
  return (
    <div>
      Games: {games.length}
      <ul>
        {games.map(game => (
          <li key={game.id}>
            {game.teams.visitors.code} vs {game.teams.home.code}
          </li>
        ))}
      </ul>
    </div>
  );
}
