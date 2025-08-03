import { mockDataProvider } from '@src/lib/mock';
import type {
  MockDatabaseSchema,
  MockUser,
  MockGameLog,
  MockFriendship,
  MockComment,
  MockReaction,
  MockNotification,
  MockGameRating,
} from '@src/lib/types';

// Generate realistic mock data
function generateMockUsers(count = 50): MockUser[] {
  const users: MockUser[] = [];
  const usernames = [
    'jordan23',
    'lebron_king',
    'curry30',
    'giannis34',
    'durant35',
    'luka77',
    'embiid21',
    'jokic15',
    'tatum0',
    'booker1',
    'basketball_fan',
    'hoops_lover',
    'court_warrior',
    'dunk_master',
    'three_pointer',
    'game_changer',
    'clutch_player',
    'defense_first',
    'offense_machine',
    'team_player',
  ];

  for (let i = 0; i < count; i++) {
    const username = usernames[i % usernames.length];
    users.push({
      id: `user_${i + 1}`,
      email: `${username}@example.com`,
      username: `${username}_${i + 1}`,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return users;
}

function generateMockGameLogs(users: MockUser[], count = 100): MockGameLog[] {
  const gameLogs: MockGameLog[] = [];
  const titles = [
    'Amazing comeback win!',
    'Tough loss but learned a lot',
    'Career high performance',
    'Great team chemistry',
    'Incredible buzzer beater',
    'Defensive masterclass',
    'Offensive explosion',
    'Clutch performance',
    'Rookie of the year candidate',
    'Veteran leadership',
    'Young talent showing up',
    'Playoff atmosphere',
  ];

  const contents = [
    'What an incredible game today! The team really showed their potential.',
    'Tough loss but we learned valuable lessons. Defense needs improvement.',
    'Personal best performance today. Everything was clicking!',
    'The chemistry between teammates was amazing. We played as one unit.',
    'Unbelievable buzzer beater to win the game! Crowd went wild!',
    'Defense was the key today. We shut them down completely.',
    'Offense was unstoppable today. Every shot was falling!',
    'Clutch performance when it mattered most. Pressure makes diamonds!',
    'Young talent is really stepping up. Future looks bright!',
    'Veteran leadership was key today. Experience showed in crunch time.',
    'Young talent is the future! These kids are going to be stars.',
    'Playoff atmosphere in the regular season. Every possession mattered.',
  ];

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const titleIndex = Math.floor(Math.random() * titles.length);
    const contentIndex = Math.floor(Math.random() * contents.length);

    gameLogs.push({
      id: `game_log_${i + 1}`,
      user_id: user.id,
      game_id: `game_${Math.floor(Math.random() * 1000) + 1}`,
      title: titles[titleIndex],
      content: contents[contentIndex],
      rating: Math.floor(Math.random() * 5) + 1,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return gameLogs;
}

function generateMockFriendships(users: MockUser[], count = 75): MockFriendship[] {
  const friendships: MockFriendship[] = [];

  for (let i = 0; i < count; i++) {
    const user1 = users[Math.floor(Math.random() * users.length)];
    const user2 = users[Math.floor(Math.random() * users.length)];

    if (user1.id !== user2.id) {
      friendships.push({
        id: `friendship_${i + 1}`,
        user_id: user1.id,
        friend_id: user2.id,
        status: ['pending', 'accepted', 'rejected'][Math.floor(Math.random() * 3)] as
          | 'pending'
          | 'accepted'
          | 'rejected',
        created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  return friendships;
}

function generateMockComments(
  gameLogs: MockGameLog[],
  users: MockUser[],
  count = 200
): MockComment[] {
  const comments: MockComment[] = [];
  const commentTexts = [
    'Great game!',
    'Amazing performance!',
    'Keep it up!',
    'You played so well!',
    'Incredible comeback!',
    'That was clutch!',
    'Defense was on point!',
    'Offense was unstoppable!',
    'Team chemistry was perfect!',
    'Leadership showed!',
    'Young talent is impressive!',
    'Veteran presence was key!',
    'Future is bright!',
    'Championship material!',
    'Playoff ready!',
    'MVP performance!',
    'All-star level play!',
    'Rookie of the year!',
    'Defensive player of the year!',
    'Sixth man of the year!',
    'Coach of the year!',
    'Executive of the year!',
  ];

  for (let i = 0; i < count; i++) {
    const gameLog = gameLogs[Math.floor(Math.random() * gameLogs.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const commentText = commentTexts[Math.floor(Math.random() * commentTexts.length)];

    comments.push({
      id: `comment_${i + 1}`,
      user_id: user.id,
      game_log_id: gameLog.id,
      content: commentText,
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return comments;
}

function generateMockReactions(
  gameLogs: MockGameLog[],
  users: MockUser[],
  count = 300
): MockReaction[] {
  const reactions: MockReaction[] = [];
  const reactionTypes: Array<'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'> = [
    'like',
    'love',
    'laugh',
    'wow',
    'sad',
    'angry',
  ];

  for (let i = 0; i < count; i++) {
    const gameLog = gameLogs[Math.floor(Math.random() * gameLogs.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const reactionType = reactionTypes[Math.floor(Math.random() * reactionTypes.length)];

    reactions.push({
      id: `reaction_${i + 1}`,
      user_id: user.id,
      game_log_id: gameLog.id,
      type: reactionType,
      created_at: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return reactions;
}

function generateMockGameRatings(
  users: MockUser[],
  gameLogs: MockGameLog[],
  count = 200
): MockGameRating[] {
  const gameRatings: MockGameRating[] = [];

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const gameLog = gameLogs[Math.floor(Math.random() * gameLogs.length)];

    gameRatings.push({
      id: `game_rating_${i + 1}`,
      user_id: user.id,
      game_id: gameLog.game_id,
      rating: Math.floor(Math.random() * 5) + 1, // 1-5 rating
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return gameRatings;
}

function generateMockNotifications(users: MockUser[], count = 150): MockNotification[] {
  const notifications: MockNotification[] = [];
  const types: Array<'friend_request' | 'comment' | 'reaction' | 'system'> = [
    'friend_request',
    'comment',
    'reaction',
    'system',
  ];

  const messages = {
    friend_request: [
      'sent you a friend request',
      'wants to be your friend',
      'requested to connect with you',
    ],
    comment: [
      'commented on your game log',
      'left a comment on your post',
      'replied to your game log',
    ],
    reaction: ['reacted to your game log', 'liked your post', 'loved your game log'],
    system: [
      'Welcome to GameLog! Start sharing your basketball experiences.',
      'Your account has been verified successfully.',
      'New features are available! Check them out.',
    ],
  };

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const messageArray = messages[type];
    const message = messageArray[Math.floor(Math.random() * messageArray.length)];

    notifications.push({
      id: `notification_${i + 1}`,
      user_id: user.id,
      type,
      title: `New ${type.replace('_', ' ')}`,
      message,
      read: Math.random() > 0.3,
      created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return notifications;
}

// Generate NBA mock data
async function generateMockNBAData() {
  const nbaGames = await mockDataProvider.getNbaGamesMock();
  const nbaTeams = await mockDataProvider.getNbaTeamsMock();
  const nbaPlayers = await mockDataProvider.getNbaPlayersMock();

  return {
    nba_games: Array.isArray(nbaGames)
      ? nbaGames.map((game: Record<string, unknown>, index: number) => ({
          id: `nba_game_${index + 1}`,
          home_team_id:
            (game.home_team_id as string) || `team_${Math.floor(Math.random() * 30) + 1}`,
          away_team_id:
            (game.away_team_id as string) || `team_${Math.floor(Math.random() * 30) + 1}`,
          home_score: (game.home_score as number) || Math.floor(Math.random() * 150),
          away_score: (game.away_score as number) || Math.floor(Math.random() * 150),
          status:
            (game.status as string) ||
            ['scheduled', 'live', 'finished'][Math.floor(Math.random() * 3)],
          date: (game.date as string) || new Date().toISOString(),
          season: (game.season as string) || '2023-24',
          league: (game.league as string) || 'NBA',
        }))
      : [],
    teams: Array.isArray(nbaTeams)
      ? nbaTeams.map((team: Record<string, unknown>, index: number) => ({
          id: (team.id as string) || `team_${index + 1}`,
          name: (team.name as string) || `Team ${index + 1}`,
          city: (team.city as string) || `City ${index + 1}`,
          conference: (team.conference as string) || (index < 15 ? 'Eastern' : 'Western'),
          division:
            (team.division as string) ||
            ['Atlantic', 'Central', 'Southeast', 'Northwest', 'Pacific', 'Southwest'][
              Math.floor(Math.random() * 6)
            ],
          logo_url:
            (team.logo_url as string) ||
            `https://api.dicebear.com/7.x/shapes/svg?seed=team${index + 1}`,
        }))
      : [],
    nba_players: Array.isArray(nbaPlayers)
      ? nbaPlayers.map((player: Record<string, unknown>, index: number) => ({
          id: (player.id as string) || `player_${index + 1}`,
          name: (player.name as string) || `Player ${index + 1}`,
          team_id: (player.team_id as string) || `team_${Math.floor(Math.random() * 30) + 1}`,
          position:
            (player.position as string) ||
            ['PG', 'SG', 'SF', 'PF', 'C'][Math.floor(Math.random() * 5)],
          jersey_number: (player.jersey_number as number) || Math.floor(Math.random() * 99) + 1,
          height:
            (player.height as string) ||
            `${Math.floor(Math.random() * 2) + 6}'${Math.floor(Math.random() * 12)}"`,
          weight: (player.weight as number) || Math.floor(Math.random() * 100) + 180,
          birth_date:
            (player.birth_date as string) ||
            new Date(
              1990 + Math.floor(Math.random() * 15),
              Math.floor(Math.random() * 12),
              Math.floor(Math.random() * 28)
            ).toISOString(),
        }))
      : [],
  };
}

export function createMockDatabase() {
  // Initialize mock data
  const users = generateMockUsers();
  const gameLogs = generateMockGameLogs(users);
  const friendships = generateMockFriendships(users);
  const comments = generateMockComments(gameLogs, users);
  const reactions = generateMockReactions(gameLogs, users);
  const gameRatings = generateMockGameRatings(users, gameLogs);
  const notifications = generateMockNotifications(users);

  // Initialize NBA data
  void generateMockNBAData().then(nbaData => {
    Object.assign(mockData, nbaData);
  });

  const mockData: MockDatabaseSchema = {
    users,
    game_logs: gameLogs,
    friendships,
    comments,
    reactions,
    game_ratings: gameRatings,
    notifications,
    nba_games: [],
    teams: [],
    nba_players: [],
  };

  return {
    // Database operations
    select: (table: string, query?: Record<string, unknown>) => {
      const tableData = mockData[table as keyof MockDatabaseSchema] || [];
      let data = [...tableData];

      if (query?.where) {
        data = data.filter(item => {
          const recordItem = item as unknown as Record<string, unknown>;
          return Object.entries(query.where as Record<string, unknown>).every(([key, value]) => {
            return recordItem[key] === value;
          });
        });
      }

      if (query?.limit) {
        data = data.slice(0, query.limit as number);
      }

      if (query?.offset) {
        data = data.slice(query.offset as number);
      }

      return data;
    },

    insert: (table: string, data: Record<string, unknown>) => {
      const tableData = mockData[table as keyof MockDatabaseSchema];
      if (!Array.isArray(tableData)) {
        throw new Error(`Table ${table} is not an array`);
      }
      const newId = `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newRecord = { id: newId, ...data };
      (tableData as unknown[]).push(newRecord);
      return newRecord;
    },

    update: (table: string, id: string, data: Record<string, unknown>) => {
      const tableData = mockData[table as keyof MockDatabaseSchema];
      if (!Array.isArray(tableData)) {
        throw new Error(`Table ${table} is not an array`);
      }
      const index = (tableData as unknown[]).findIndex(
        item => (item as Record<string, unknown>).id === id
      );
      if (index !== -1) {
        const currentItem = (tableData as unknown[])[index] as Record<string, unknown>;
        (tableData as unknown[])[index] = {
          ...currentItem,
          ...data,
        };
        return (tableData as unknown[])[index];
      }
      return null;
    },

    delete: (table: string, id: string) => {
      const tableData = mockData[table as keyof MockDatabaseSchema];
      if (!Array.isArray(tableData)) {
        throw new Error(`Table ${table} is not an array`);
      }
      const index = (tableData as unknown[]).findIndex(
        item => (item as Record<string, unknown>).id === id
      );
      if (index !== -1) {
        const deleted = (tableData as unknown[]).splice(index, 1)[0];
        return deleted;
      }
      return null;
    },

    // Utility methods
    getAll: () => mockData,
    getSchema: () => Object.keys(mockData),
    reset: () => {
      // Reset to initial state
      const newUsers = generateMockUsers();
      const newGameLogs = generateMockGameLogs(newUsers);
      const newFriendships = generateMockFriendships(newUsers);
      const newComments = generateMockComments(newGameLogs, newUsers);
      const newReactions = generateMockReactions(newGameLogs, newUsers);
      const newGameRatings = generateMockGameRatings(newUsers, newGameLogs);
      const newNotifications = generateMockNotifications(newUsers);

      Object.assign(mockData, {
        users: newUsers,
        game_logs: newGameLogs,
        friendships: newFriendships,
        comments: newComments,
        reactions: newReactions,
        game_ratings: newGameRatings,
        notifications: newNotifications,
      });

      // Regenerate NBA data
      void generateMockNBAData().then(nbaData => {
        Object.assign(mockData, nbaData);
      });
    },
  };
}
