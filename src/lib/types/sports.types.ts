// Sports types

export const SPORTS_CONFIG = {
  nba: {
    name: 'NBA',
    fullName: 'National Basketball Association',
    description: 'National Basketball Association - Live scores, stats, and more',
    color: 'bg-orange-600 hover:bg-orange-700',
    href: '/sports/nba',
    icon: '🏀',
  },
  nfl: {
    name: 'NFL',
    fullName: 'National Football League',
    description: 'National Football League - Live scores, stats, and more',
    color: 'bg-blue-600 hover:bg-blue-700',
    href: '/sports/nfl',
    icon: '🏈',
  },
  mlb: {
    name: 'MLB',
    fullName: 'Major League Baseball',
    description: 'Major League Baseball - Live scores, stats, and more',
    color: 'bg-red-600 hover:bg-red-700',
    href: '/sports/mlb',
    icon: '⚾',
  },
  nhl: {
    name: 'NHL',
    fullName: 'National Hockey League',
    description: 'National Hockey League - Live scores, stats, and more',
    color: 'bg-gray-800 hover:bg-gray-900',
    href: '/sports/nhl',
    icon: '🏒',
  },
  mls: {
    name: 'MLS',
    fullName: 'Major League Soccer',
    description: 'Major League Soccer - Live scores, stats, and more',
    color: 'bg-green-600 hover:bg-green-700',
    href: '/sports/mls',
    icon: '⚽',
  },
} as const;

export type SportKey = keyof typeof SPORTS_CONFIG;
