import type { ITeamsApiResponse } from '@/lib/types';

export const MOCK_NBA_TEAMS: ITeamsApiResponse = {
  get: 'teams',
  parameters: {
    league: '12',
    season: '2024',
  },
  errors: [],
  results: 30,
  response: [
    {
      id: 583,
      name: 'New York Knicks',
      nickname: 'Knicks',
      code: 'NYK',
      city: 'New York',
      logo: 'https://media.api-sports.io/basketball/teams/583.png',
      allStar: false,
      nbaFranchise: true,
      leagues: {
        standard: {
          conference: 'Eastern',
          division: 'Atlantic',
        },
      },
    },
    {
      id: 584,
      name: 'Boston Celtics',
      nickname: 'Celtics',
      code: 'BOS',
      city: 'Boston',
      logo: 'https://media.api-sports.io/basketball/teams/584.png',
      allStar: false,
      nbaFranchise: true,
      leagues: {
        standard: {
          conference: 'Eastern',
          division: 'Atlantic',
        },
      },
    },
    {
      id: 585,
      name: 'Golden State Warriors',
      nickname: 'Warriors',
      code: 'GSW',
      city: 'Golden State',
      logo: 'https://media.api-sports.io/basketball/teams/585.png',
      allStar: false,
      nbaFranchise: true,
      leagues: {
        standard: {
          conference: 'Western',
          division: 'Pacific',
        },
      },
    },
    {
      id: 586,
      name: 'Los Angeles Lakers',
      nickname: 'Lakers',
      code: 'LAL',
      city: 'LA Lakers',
      logo: 'https://media.api-sports.io/basketball/teams/586.png',
      allStar: false,
      nbaFranchise: true,
      leagues: {
        standard: {
          conference: 'Western',
          division: 'Pacific',
        },
      },
    },
    {
      id: 587,
      name: 'Miami Heat',
      nickname: 'Heat',
      code: 'MIA',
      city: 'Miami',
      logo: 'https://media.api-sports.io/basketball/teams/587.png',
      allStar: false,
      nbaFranchise: true,
      leagues: {
        standard: {
          conference: 'Eastern',
          division: 'Southeast',
        },
      },
    },
    {
      id: 588,
      name: 'Philadelphia 76ers',
      nickname: '76ers',
      code: 'PHI',
      city: 'Philadelphia',
      logo: 'https://media.api-sports.io/basketball/teams/588.png',
      allStar: false,
      nbaFranchise: true,
      leagues: {
        standard: {
          conference: 'Eastern',
          division: 'Atlantic',
        },
      },
    },
    {
      id: 589,
      name: 'Milwaukee Bucks',
      nickname: 'Bucks',
      code: 'MIL',
      city: 'Milwaukee',
      logo: 'https://media.api-sports.io/basketball/teams/589.png',
      allStar: false,
      nbaFranchise: true,
      leagues: {
        standard: {
          conference: 'Eastern',
          division: 'Central',
        },
      },
    },
    {
      id: 590,
      name: 'Phoenix Suns',
      nickname: 'Suns',
      code: 'PHX',
      city: 'Phoenix',
      logo: 'https://media.api-sports.io/basketball/teams/590.png',
      allStar: false,
      nbaFranchise: true,
      leagues: {
        standard: {
          conference: 'Western',
          division: 'Pacific',
        },
      },
    },
    {
      id: 591,
      name: 'Dallas Mavericks',
      nickname: 'Mavericks',
      code: 'DAL',
      city: 'Dallas',
      logo: 'https://media.api-sports.io/basketball/teams/591.png',
      allStar: false,
      nbaFranchise: true,
      leagues: {
        standard: {
          conference: 'Western',
          division: 'Southwest',
        },
      },
    },
    {
      id: 592,
      name: 'Denver Nuggets',
      nickname: 'Nuggets',
      code: 'DEN',
      city: 'Denver',
      logo: 'https://media.api-sports.io/basketball/teams/592.png',
      allStar: false,
      nbaFranchise: true,
      leagues: {
        standard: {
          conference: 'Western',
          division: 'Northwest',
        },
      },
    },
  ],
};
