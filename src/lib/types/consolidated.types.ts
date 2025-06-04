/**
 * Consolidated types from various type files
 * This file combines and deduplicates types from:
 * - pagination.types
 * - game-utility.types
 * - api-request.types
 * - monitoring.types
 * - component.types
 * - api-response.types
 * - query-mutation.types
 * - hook.types
 * - team-statistics.types
 * - season.types
 * - component-props.types
 */

import { ApolloError } from '@apollo/client';
import { ChartData } from 'chart.js';
import type { InferSelectModel } from 'drizzle-orm';

import { nba_games } from '@/lib/db/schema/nba-schemas';
import { APIError, type Activity } from '@/lib/types/api.types';
import type {
  GameStatusValue,
  WatchedSettingValue,
  WatchedScopeValue,
  ClassificationValue,
} from '@/lib/types/config.types';
import type {
  Player,
  Classification,
  TeamStats,
  Team,
  GameLog,
  TeamFilters,
} from '@/lib/types/generated/graphql';
import type { Friend, FriendGroup } from '@/lib/types/social.types';

// Database Types
export type DBGameRecord = InferSelectModel<typeof nba_games>;

// Core Types
export interface GameTeam {
  id: string;
  name: string;
  nickname: string;
  code: string;
  logo: string | null;
}

export interface GameScore {
  points: number;
  win?: number;
  loss?: number;
  series?: {
    win: number;
    loss: number;
  };
  linescore?: number[];
}

export interface GameArena {
  name: string;
  city: string;
  state?: string;
  country?: string;
}

export interface GamePeriods {
  current: number;
  total: number;
  endOfPeriod: boolean;
}

export interface GameStatus {
  long: string;
  short: string;
  clock?: string | null;
  halftime?: boolean;
}

export interface GameDate {
  start: string;
  end?: string;
  duration?: string;
}

// Base Game type that matches GraphQL schema - all games use this structure
export interface Game {
  id: string;
  date: string | GameDate;
  status: GameStatus;
  teams: {
    home: GameTeam;
    visitors: GameTeam;
  };
  scores: {
    home: GameScore;
    visitors: GameScore;
  };
  arena?: GameArena;
  league: string;
  season: number;
  stage: number;
  periods?: GamePeriods;
  officials?: string[];
  timesTied?: number;
  leadChanges?: number;
  nugget?: string;
  createdAt?: string;
  updatedAt?: string;
  // Optional fields for database compatibility
  homeTeamId?: string;
  awayTeamId?: string;
}

// Type aliases for clarity
export type ExtendedGame = Game & { extended?: boolean };
export type SearchGame = Game; // For search results

// Export types that some files expect
export type GameTeams = {
  home: GameTeam;
  visitors: GameTeam;
};

export type GameScores = {
  home: GameScore;
  visitors: GameScore;
};

// API Response Types
export interface APITeamResponse {
  id: number;
  name: string;
  code: string;
}

export interface GameResponseData {
  id: number;
  league: string;
  season: number;
  date: {
    start: string;
    end?: string;
    duration?: string;
  };
  stage: number;
  status: {
    clock?: string;
    halftime: boolean;
    short: string;
    long: string;
  };
  periods: {
    current: number;
    total: number;
    endOfPeriod: boolean;
  };
  arena: {
    name: string;
    city: string;
    state?: string;
    country?: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      nickname: string;
      code: string;
      logo: string;
    };
    visitors: {
      id: number;
      name: string;
      nickname: string;
      code: string;
      logo: string;
    };
  };
  scores: {
    home: {
      win: number;
      loss: number;
      series: {
        win: number;
        loss: number;
      };
      linescore: number[];
      points: number;
    };
    visitors: {
      win: number;
      loss: number;
      series: {
        win: number;
        loss: number;
      };
      linescore: number[];
      points: number;
    };
  };
  officials: string[];
  timesTied: number;
  leadChanges: number;
  nugget?: string;
}

export interface GamePlayerStats {
  id: string;
  playerId: string;
  name: string;
  teamId: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  minutesPlayed: number;
  plusMinus: number;
  fieldGoals: {
    made: number;
    attempted: number;
  };
  threePointers: {
    made: number;
    attempted: number;
  };
  freeThrows: {
    made: number;
    attempted: number;
  };
}

export interface GameTeamWithStats extends GameTeam {
  stats?: GameTeamStatistics;
}

export type GameTeamStatistics = {
  team: {
    id: number | string;
    name?: string;
    [key: string]: unknown;
  };
  statistics: GameStatistics[];
};

export interface GameWithStatistics extends Game {
  statistics: GameStatistics[];
}

export interface GameStatistics {
  playerId: string;
  teamId: string;
  minutes: string;
  minutesPlayed: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  plusMinus: number;
  fieldGoals: {
    made: number;
    attempted: number;
    percentage: string;
  };
  threePointers: {
    made: number;
    attempted: number;
    percentage: string;
  };
  freeThrows: {
    made: number;
    attempted: number;
    percentage: string;
  };
}

export interface GameTeamStatistic {
  fastBreakPoints?: number;
  pointsInPaint?: number;
  biggestLead?: number;
  secondChancePoints?: number;
  pointsOffTurnovers?: number;
  longestRun?: number;
  fgm?: number;
  fga?: number;
  fgp?: string;
  ftm?: number;
  fta?: number;
  ftp?: string;
  tpm?: number;
  tpa?: number;
  tpp?: string;
  offReb?: number;
  defReb?: number;
  totReb?: number;
  assists?: number;
  pFouls?: number;
  steals?: number;
  turnovers?: number;
  blocks?: number;
  plusMinus?: number;
  min?: number;
  points?: number;
}

export interface CustomTeamStats extends TeamStats {
  fastBreakPoints: number;
  pointsInPaint: number;
  secondChancePoints: number;
  pointsOffTurnovers: number;
}

// Extended Game Types
export interface GameWithStats extends Game {
  homeTeamStats?: CustomTeamStats;
  awayTeamStats?: CustomTeamStats;
}

export interface GameWithDetails extends Game {
  homeTeam: GameTeamWithStats;
  awayTeam: GameTeamWithStats;
  gameLogs: GameLog[];
  ratings: GameRatingWithUser[];
  userRating?: GameRatingWithUser;
}

// Game Log Types
export interface GameLogInput {
  gameId: string;
  watchedDate: string;
  watchedLocation?: string;
  watchedSetting?: string;
  watchedScope?: string;
  ratingForGame: number;
  comment?: string;
}

export interface GameLogFormData {
  gameId: string;
  watchedSetting: WatchedSettingValue;
  watchedDate: Date;
  watchedLocation?: string;
  ratingForGame: number;
  watchedScope: WatchedScopeValue;
  notes: string;
  tags: string[];
  classification: ClassificationValue;
}

// Rating and Reaction Types
export interface GameRating {
  id: string;
  gameId: string;
  averageRating: string;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameRatingWithUser {
  id: string;
  ratingForGame: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    photoUrl?: string;
  };
}

export interface Reaction {
  id: string;
  emoji: string | import('./generated/graphql').ReactionEmojiType;
  userId: string;
  targetId: string;
  targetType: string | import('./generated/graphql').ParentType;
  createdAt: Date;
  updatedAt: Date;
  user: UserSummary;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  parentId: string;
  parentType: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  depth?: number;
  childComments?: {
    edges: Array<{
      node: Comment;
    }>;
    totalCount: number;
  };
  reactions?: Array<Reaction>;
  user?: UserSummary;
}

export interface CommentResponse {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    photo_url?: string;
  };
  reactions: {
    emoji: string;
    count: number;
    userReactions: {
      userId: string;
      emoji: string;
    }[];
  }[];
}

// Query and Filter Types
export interface GameFilters {
  gameId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  season?: number;
  status?: GameStatusValue;
  dateRange?: {
    start: Date;
    end?: Date;
  };
  classification?: Classification;
  userId?: string;
  leadChangesMin?: number;
  leadChangesMax?: number;
  timesTiedMin?: number;
  timesTiedMax?: number;
  minScore?: number;
  maxScore?: number;
  officials?: string[];
  teamId?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
  pagination?: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  };
  league?: string;
  stage?: number;
  period?: number;
  arena?: string;
  nugget?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface GameSortInput {
  field: string;
  direction: SortDirection;
}

export interface GameQueryResult {
  loading: boolean;
  error?: ApolloError;
  data?: {
    games?: {
      items: Game[];
    };
  };
}

export interface ProcessedGameData {
  isLoading: boolean;
  hasError: boolean;
  games: Game[];
}

// GraphQL Types
export interface GameEdge {
  node: Game;
}

export interface GameConnection {
  edges: GameEdge[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  totalCount: number;
}

export interface GameQueryResponse {
  games: GameConnection;
}

export interface GameLogByIdResponse {
  gameLogById: import('./generated/graphql').GameLog;
}

// Component Props Types
export interface GameStatsProps {
  game: GameWithStatistics;
}

export interface ComponentGameStats {
  players: GamePlayerStats[];
  homeTeam: GameTeamStatistics;
  awayTeam: GameTeamStatistics;
}

export interface GameLogFormProps {
  onSuccess?: () => void;
  formData?: GameLogFormData;
  setFormData?: (data: GameLogFormData) => void;
  selectedGame?: Game | null;
  loading?: boolean;
  onSubmit?: (data: import('./generated/graphql').CreateGameLogInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

// Supporting Types
export interface TeamSummary {
  id: string;
  code: string;
  logo: string;
  name: string;
  nickname: string;
}

export interface Arena {
  name?: string;
  city?: string;
  state?: string;
}

export interface TeamDisplayProps {
  team: TeamSummary | null;
  score?: number;
  isHome: boolean;
  imageErrors?: Record<string, boolean>;
  onImageError?: (id: string) => void;
  gameId?: string;
}

export interface SeasonData {
  id: string;
  year: number;
  displayYear: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isPlayoffs: boolean;
}

export interface TeamData {
  id: string;
  name: string;
  nickname: string;
  code: string;
  logo: string;
  allStar: boolean;
  nbaFranchise: boolean;
  leagues: {
    standard?: {
      conference?: string;
      division?: string;
    };
    [key: string]:
      | {
          conference?: string;
          division?: string;
        }
      | undefined;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PlayerData {
  id: string;
  firstName: string;
  lastName: string;
  birth: {
    date: string;
    country: string;
  };
  nba: {
    start: number;
    pro: number;
  };
  height: {
    feets: number;
    inches: number;
    meters: number;
  };
  weight: {
    pounds: number;
    kilograms: number;
  };
  college: string;
  affiliation: string;
  leagues: {
    standard: {
      jersey: string;
      active: boolean;
      pos: string;
    };
  };
  seasons_active: Array<{
    season: number;
    teams: string[];
  }>;
}

export interface PlayerWithOptionalPhoto extends Player {
  photoUrl?: string;
}

export interface UserSummary {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  emailAddress?: string;
}

// Enums
export enum ConferenceType {
  EASTERN = 'eastern',
  WESTERN = 'western',
}

export enum DivisionType {
  ATLANTIC = 'atlantic',
  CENTRAL = 'central',
  SOUTHEAST = 'southeast',
  NORTHWEST = 'northwest',
  PACIFIC = 'pacific',
  SOUTHWEST = 'southwest',
}

export type GameField =
  | 'season'
  | 'league'
  | 'date'
  | 'id'
  | 'stage'
  | 'status'
  | 'periods'
  | 'arena'
  | 'teams'
  | 'scores'
  | 'officials'
  | 'timesTied'
  | 'leadChanges'
  | 'nugget'
  | 'createdAt'
  | 'updatedAt';

export interface GameApiResponse {
  response: GameResponseData[];
  data?: GameResponseData[];
  get?: string;
  parameters?: Record<string, string>;
  errors?: string[];
  results?: number;
}

// Legacy Game type for components that need the old homeTeam/awayTeam structure
export interface LegacyGame {
  id: string;
  date: string | GameDate;
  status: GameStatus;
  homeTeam: GameTeam;
  awayTeam: GameTeam;
  homeTeamId?: string;
  awayTeamId?: string;
  arena?: GameArena;
  league: string;
  season: number;
  stage: number;
  periods?: GamePeriods;
  officials?: string[];
  timesTied?: number;
  leadChanges?: number;
  nugget?: string;
  createdAt?: string;
  updatedAt?: string;
  scores?: GameScores;
}

// Utility function to convert between old and new game formats
export function convertToLegacyGame(game: Game): LegacyGame {
  return {
    ...game,
    homeTeam: game.teams.home,
    awayTeam: game.teams.visitors,
    scores: game.scores,
  };
}

export function convertFromLegacyGame(game: LegacyGame): Game {
  return {
    ...game,
    teams: {
      home: game.homeTeam,
      visitors: game.awayTeam,
    },
    scores: game.scores || {
      home: { points: 0 },
      visitors: { points: 0 },
    },
  };
}

// API Response Types
export interface PlayerApiResponse {
  response: {
    get: string;
    parameters: {
      team: string;
      season: string;
    };
    errors: string[];
    results: number;
    response: Array<{
      id: number;
      firstname: string;
      lastname: string;
      birth?: {
        date: string | null;
        country: string | null;
      };
      nba?: {
        start: number;
        pro: number;
      };
      height?: {
        feets: string | null;
        inches: string | null;
        meters: string | null;
      };
      weight?: {
        pounds: string | null;
        kilograms: string | null;
      };
      college: string | null;
      affiliation: string | null;
      leagues?: {
        standard?: {
          jersey: number | null;
          active: boolean;
          pos: string;
        };
        vegas?: {
          jersey: number | null;
          active: boolean;
          pos: string;
        };
        utah?: {
          jersey: number | null;
          active: boolean;
          pos: string;
        };
      };
    }>;
  };
}

export type SeasonApiResponse = {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: number[];
};

export type TeamApiResponse = {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: Array<{
    id: number;
    name: string;
    nickname: string;
    code: string;
    city: string;
    logo: string;
    allStar: boolean;
    nbaFranchise: boolean;
    leagues: {
      standard?: {
        conference: string | null;
        division: string | null;
      };
    };
  }>;
};

export interface PlayerStatistics {
  player: {
    id: number;
    firstName: string;
    lastName: string;
  };
  team?: { id: number | string };
  min?: string | number;
  points?: number;
  totReb?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  pFouls?: number;
  fgm?: number;
  fga?: number;
  tpm?: number;
  tpa?: number;
  ftm?: number;
  fta?: number;
  plusMinus?: number;
}

// Season Types
export type DBSeason = {
  id: number;
  year: number;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isPlayoffs: boolean;
};

export type GameCardProps = {
  game: SearchGame;
  className?: string;
  index?: number;
  imageErrors?: Set<string>;
  onImageError?: (gameId: string) => void;
};

export type GamesListProps = {
  games: Game[];
  loading?: boolean;
  initialFilters?: GameFilters;
  onGameSelect?: (game: Game) => void;
};

export type FriendProfileProps = {
  friend?: Friend;
  friendId?: string;
  onClose?: () => void;
};

export type FriendGroupsProps = {
  groups: FriendGroup[];
  friends?: Friend[];
  onGroupUpdate?: (group: FriendGroup) => void;
};

export type FriendRequestButtonProps = {
  targetUserId: string;
  className?: string;
};

export type GetFriendshipsForUserResponse = {
  friendships: import('./generated/graphql').Friendship[];
};

export type ActivityTimelineProps = {
  activities: Activity[];
  gameLogs: GameLog[];
  timeFilter?: import('./api.types').TimeFilter;
};

export type FriendActivityProps = {
  friendId: string;
  activities: Activity[];
};

export interface TeamCounts {
  [key: string]: number;
}

export type NavItem = {
  href: string;
  label: string;
  subItems?: NavItem[];
  icon?: string;
  isNew?: boolean;
  badge?: string | number;
};

// Hook Types
export interface GQLValidationError {
  field: string;
  message: string;
}

// API Request Types
export type ExtendedNextApiRequest = import('next').NextApiRequest & {
  user?: {
    id: string;
    email: string;
  };
  selectedFields?: string[];
  pagination?: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  };
};

// Pagination Types
export interface PaginationInput {
  page: number;
  limit: number;
}

// Game Utility Types
export interface PlayerFilters {
  team?: string;
  position?: string;
  status?: string;
}

export interface TeamSortInput {
  field: string;
  direction: 'ASC' | 'DESC';
}

// Component Types
export type StatsChartProps = {
  data: ChartData;
  type: 'line' | 'bar' | 'radar';
  title: string;
  height?: number;
  stacked?: boolean;
};

export type ReactionDisplayProps = {
  targetId: string;
  targetType: string;
};

export type ReactionPickerProps = {
  targetId: string;
  targetType: string;
  existingReactions?: Reaction[];
  onReactionChanged?: () => void;
};

export interface MonitoringMetrics {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  queryPerformance: {
    [key: string]: {
      count: number;
      totalTime: number;
      avgTime: number;
    };
  };
  apiCalls: {
    [key: string]: number;
  };
  cacheMetrics: {
    hits: number;
    misses: number;
    size: number;
  };
  apiMetrics: {
    [key: string]: {
      count: number;
      success: number;
      failure: number;
      avgResponseTime: number;
    };
  };
  errors: {
    [key: string]: number;
  };
}

// Re-export types from other files to avoid circular dependencies
export type {
  UserSearchProps,
  UserProfileProps,
  UsersTableProps,
  UserPageProps,
} from './user.types';

export interface ApiTeam {
  id: string | number;
  name: string;
  nickname?: string | null;
  code?: string | null;
  city: string;
  logo?: string | null;
  allStar?: boolean;
  nbaFranchise?: boolean;
  leagues?: Record<string, unknown>;
}

export type ApiTeamResponse = { response: ApiTeam[] };

export interface CustomTeam extends Team {
  isFavorite?: boolean;
}

export interface TeamFields {
  teamId: string;
  team?: CustomTeam;
}

export interface TeamWithSeasonStats extends CustomTeam {
  stats: TeamStats;
  seasonStats: TeamStat[];
  isFavorite?: boolean;
}

export interface TeamStat {
  id: string;
  season: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  winPercentage: number;
  homeWins: number;
  homeLosses: number;
  awayWins: number;
  awayLosses: number;
  team: CustomTeam;
}

export interface CustomTeamFilters extends TeamFilters {
  search?: string;
}

export interface DBTeamStatistics {
  id: string;
  teamId: string;
  season: string;
  games_played: number;
  wins: number;
  losses: number;
  points_per_game: number;
  field_goal_percentage: number;
  three_point_percentage: number;
  free_throw_percentage: number;
  rebounds_per_game: number;
  assists_per_game: number;
  steals_per_game: number;
  blocks_per_game: number;
  turnovers_per_game: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBTeamStandings {
  team: CustomTeam;
  wins: number;
  losses: number;
  winPercentage: number;
  gamesBehind: number;
  lastTen: string;
  streak: string;
  division: string;
  conference: string;
}

export interface DBWinLossRecord {
  home: number;
  away: number;
  total: number;
  percentage: string;
  lastTen: string;
}

export interface DBWeightInfo {
  pounds: number;
  kilograms: number;
}

export interface TeamResponseData {
  id: number;
  name: string;
  nickname: string;
  code: string;
  city: string;
  logo: string;
  allStar: boolean;
  nbaFranchise: boolean;
  leagues: {
    standard?: { conference?: string; division?: string };
    vegas?: { conference?: string; division?: string };
    utah?: { conference?: string; division?: string };
    sacramento?: { conference?: string; division?: string };
  };
}

export type TeamStatisticsApiResponse = {
  get: string;
  parameters: Record<string, string>;
  errors: APIError[];
  results: number;
  response: TeamStatisticsResponseData[];
  data?: TeamStatisticsResponseData[]; // For backward compatibility
};

export interface TeamStatisticsResponseData {
  team: {
    id: number;
    name: string;
    nickname: string;
    code: string;
    logo: string;
  };
  statistics: {
    games: number;
    fastBreakPoints: number;
    pointsInPaint: number;
    biggestLead: number;
    secondChancePoints: number;
    pointsOffTurnovers: number;
    longestRun: number;
    points: number;
    fgm: number;
    fga: number;
    fgp: string;
    ftm: number;
    fta: number;
    ftp: string;
    tpm: number;
    tpa: number;
    tpp: string;
    offReb: number;
    defReb: number;
    totReb: number;
    assists: number;
    pFouls: number;
    steals: number;
    turnovers: number;
    blocks: number;
    plusMinus: number;
  }[];
}

export interface StandingResponseData {
  team: {
    id: number;
    name: string;
    nickname: string;
    code: string;
    logo: string;
  };
  conference: {
    name: string;
    rank: number;
    win: number;
    loss: number;
  };
  division: {
    name: string;
    rank: number;
    win: number;
    loss: number;
    gamesBehind: string;
  };
  win: {
    home: number;
    away: number;
    total: number;
    percentage: string;
    lastTen: number;
  };
  loss: {
    home: number;
    away: number;
    total: number;
    percentage: string;
    lastTen: number;
  };
  streak: number;
  winStreak: boolean;
}

export interface TeamDisplayStats extends GameTeamStatistic {
  games: number;
}
