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

import { ApolloError, ApolloQueryResult, OperationVariables } from '@apollo/client';
import { ChartData } from 'chart.js';
import type { InferSelectModel, sql } from 'drizzle-orm';
import { ReactNode } from 'react';

import { nba_games } from '@/lib/db/schema/nba-schemas';
import { DataProcessor } from '@/lib/db/seed/data-processor';
import { OptimizedAPIClient } from '@/lib/db/seed/utils/api-client';
import { APIError, type Activity } from '@/lib/types/api.types';
import type {
  GameStatusValue,
  WatchedSettingValue,
  WatchedScopeValue,
  ClassificationValue,
} from '@/lib/types/config.types';
import { DatabaseClient } from '@/lib/types/database.types';
import type {
  Player,
  Classification,
  TeamStats,
  Team,
  GameLog,
  TeamFilters,
  Friendship,
  DBUser,
  FriendshipStatus,
} from '@/lib/types/generated/graphql';
import type { Friend, FriendGroup } from '@/lib/types/social.types';

// =============================================================================
// ENUMS AND CONSTANTS
// =============================================================================

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

export type SortDirection = 'asc' | 'desc';

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

// =============================================================================
// DATABASE TYPES
// =============================================================================

export type DBGameRecord = InferSelectModel<typeof nba_games>;

export interface Migration {
  name: string;
  path: string;
  content: string;
  checksum: string;
}

export interface MigrationVerification {
  tables?: string[];
  functions?: string[];
  triggers?: string[];
  indexes?: string[];
}

export interface MigrationVersion {
  name: string;
  checksum: string;
  executed_at: string;
  execution_time_ms: number;
  status: string;
  error_message?: string;
  rollback_executed: boolean;
}

// =============================================================================
// CORE GAME TYPES
// =============================================================================

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

export interface GameTeams {
  home: GameTeam;
  visitors: GameTeam;
}

export interface GameScores {
  home: GameScore;
  visitors: GameScore;
}

// Base Game type that matches GraphQL schema - all games use this structure
export interface Game {
  id: string;
  date: GameDate;
  status: GameStatus;
  teams: GameTeams;
  scores: GameScores;
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

// =============================================================================
// GAME UTILITY FUNCTIONS
// =============================================================================

// Utility function to convert between old and new game formats
export function convertToLegacyGame(game: Game): LegacyGame {
  return {
    ...game,
    date: game.date,
    homeTeam: game.teams.home,
    awayTeam: game.teams.visitors,
    scores: game.scores,
  };
}

export function convertFromLegacyGame(game: LegacyGame): Game {
  const gameDate =
    typeof game.date === 'string'
      ? { start: game.date, end: undefined, duration: undefined }
      : game.date;

  return {
    ...game,
    date: gameDate,
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

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

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

export interface GameApiResponse {
  response: GameResponseData[];
  data?: GameResponseData[];
  get?: string;
  parameters?: Record<string, string>;
  errors?: string[];
  results?: number;
}

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

export interface APIResponse<T = unknown> {
  response?: T[];
  data?: T[];
  get?: string;
  parameters?: Record<string, string>;
  errors?: string[];
  results?: number;
}

// =============================================================================
// GAME STATISTICS TYPES
// =============================================================================

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

export interface ComponentGameStats {
  players: GamePlayerStats[];
  homeTeam: GameTeamStatistics;
  awayTeam: GameTeamStatistics;
}

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

// =============================================================================
// GAME LOG TYPES
// =============================================================================

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

export interface GameLogByIdResponse {
  gameLogById: import('./generated/graphql').GameLog;
}

// =============================================================================
// RATING AND REACTION TYPES
// =============================================================================

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

// =============================================================================
// QUERY AND FILTER TYPES
// =============================================================================

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

// =============================================================================
// GRAPHQL TYPES
// =============================================================================

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

export interface LiveGameEdge {
  node: {
    id: string;
    status: {
      long: string;
    };
  };
}

export interface LiveGamesData {
  liveGames: {
    edges: LiveGameEdge[];
    totalCount: number;
  };
}

export interface GQLValidationError {
  field: string;
  message: string;
}

// =============================================================================
// TEAM TYPES
// =============================================================================

export interface TeamSummary {
  id: string;
  code: string;
  logo: string;
  name: string;
  nickname: string;
}

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

export interface TeamSortInput {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface TeamCounts {
  [key: string]: number;
}

// =============================================================================
// TEAM STATISTICS TYPES
// =============================================================================

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

export interface HeadToHeadData {
  teamH2H?: {
    wins: number;
    losses: number;
    winPercentage: string;
    lastTenGames: string[];
  };
}

export interface TeamStatsData {
  teamGameStats?: {
    team?: {
      logo?: string;
      nickname?: string;
    };
    points: number;
    field_goals_made: number;
    field_goals_attempted: number;
    field_goal_percentage: number;
    three_pointers_made: number;
    three_pointers_attempted: number;
    three_pointer_percentage: number;
    free_throws_made: number;
    free_throws_attempted: number;
    free_throw_percentage: number;
    offensive_rebounds: number;
    defensive_rebounds: number;
    total_rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
    personal_fouls: number;
  };
}

// =============================================================================
// PLAYER TYPES
// =============================================================================

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

export interface PlayerFilters {
  team?: string;
  position?: string;
  status?: string;
}

export interface DBWeightInfo {
  pounds: number;
  kilograms: number;
}

// =============================================================================
// SEASON TYPES
// =============================================================================

export interface SeasonData {
  id: string;
  year: number;
  displayYear: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isPlayoffs: boolean;
}

export type DBSeason = {
  id: number;
  year: number;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isPlayoffs: boolean;
};

// =============================================================================
// USER TYPES
// =============================================================================

export interface UserSummary {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  emailAddress?: string | null;
}

export interface GetFriendshipsForUserResponse {
  friendships: import('./generated/graphql').Friendship[];
}

// Re-export types from other files to avoid circular dependencies
export type {
  UserSearchProps,
  UserProfileProps,
  UsersTableProps,
  UserPageProps,
} from './user.types';

// =============================================================================
// COMPONENT PROPS TYPES
// =============================================================================

export interface GameStatsProps {
  game: GameWithStatistics;
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

export interface TeamDisplayProps {
  team: TeamSummary | null;
  score?: number;
  opponentScore?: number;
  isHome: boolean;
  imageErrors?: Record<string, boolean>;
  onImageError?: (id: string) => void;
  gameId?: string;
}

export interface Arena {
  name?: string;
  city?: string;
  state?: string;
}

export type GameCardProps = {
  game: SearchGame;
  className?: string;
  index?: number;
  imageErrors?: Set<string>;
  onImageError?: (gameId: string) => void;
};

export interface GamesListProps {
  games: Game[];
  loading?: boolean;
  initialFilters?: GameFilters;
  onGameSelect?: (game: Game) => void;
}

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

export type ActivityTimelineProps = {
  activities: Activity[];
  gameLogs: GameLog[];
  timeFilter?: import('./api.types').TimeFilter;
};

export type FriendActivityProps = {
  friendId: string;
  activities: Activity[];
};

export type NavItem = {
  href: string;
  label: string;
  subItems?: NavItem[];
  icon?: string;
  isNew?: boolean;
  badge?: string | number;
};

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

export interface HeadToHeadProps {
  h2hData: HeadToHeadData;
  homeTeam: { nickname: string; logo: string | null };
  awayTeam: { nickname: string; logo: string | null };
  loading: boolean;
  error: ApolloError | undefined;
}

export interface TeamStatsProps {
  teamStats: TeamStatsData;
  team: { nickname: string; logo: string | null };
  isHome: boolean;
  loading: boolean;
  error: ApolloError | undefined;
}

export interface AuthModalProps {
  children: ReactNode;
}

export interface ExtendedReactionDisplayProps extends ReactionDisplayProps {
  reactions?: Reaction[];
  totalReactionCount?: number;
  onReactionChange?: () => void;
}

export interface GameLogProps {
  gameLogId: string;
}

export interface GameLogPageProps {
  params: {
    id: string;
  };
}

export interface GameLogActionsProps {
  gameLog: GameLog;
  onSuccess?: () => void;
}

export interface GameLogsSectionProps {
  gameLogs: GameLog[];
  loading: boolean;
  isFetchingMore: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  onLoadMore: () => void;
  refetch?: () => void;
}

export interface GameLogSearchSectionProps {
  userId?: string;
  initialSearchText?: string;
}

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'spellCheck'> {
  spellCheck?: boolean;
}

// =============================================================================
// HOOK TYPES
// =============================================================================

export interface UseCreateGameLogProps {
  onSuccess?: () => void;
}

export interface UseGameDataProps {
  initialSeason?: number;
  initialFilters?: {
    season?: number;
    status?: string;
  };
}

export interface ProcessedGames {
  live: Game[];
  scheduled: Game[];
  completed: Game[];
}

export interface UseGameDataReturn {
  games: Game[];
  processedGames: ProcessedGames;
  loading: boolean;
  error: ApolloError | null;
  hasShownInitialLoad: boolean;
  isFetchingMore: boolean;
  currentSeason: number;
  hasMoreSeasons: boolean;
  showUpcomingGames: boolean;
  setShowUpcomingGames: (show: boolean) => void;
  handleLoadMore: () => Promise<void>;
  canLoadMore: boolean;
}

export interface PaginationHookOptions<T> {
  pageSize: number;
  fetchMore: (options: {
    variables: OperationVariables;
    updateQuery: (prev: unknown, options: { fetchMoreResult?: PaginationFetchResult }) => unknown;
  }) => Promise<ApolloQueryResult<unknown>>;
  data?: { edges?: Array<{ node: T; cursor: string }> };
  hasNextPage?: boolean;
  filters: Record<string, unknown>;
}

export interface PaginationFetchResult {
  games?: {
    edges: Array<{ node: unknown }>;
    pageInfo: {
      endCursor: string | null;
      hasNextPage: boolean;
    };
  };
  gameLogs?: {
    edges: Array<{ node: unknown }>;
    pageInfo: {
      endCursor: string | null;
      hasNextPage: boolean;
    };
  };
}

export interface FilterConfig {
  [key: string]: {
    defaultValue: string | number;
    type?: 'string' | 'number' | 'boolean';
  };
}

export interface UseSearchFiltersOptions {
  filterConfig: FilterConfig;
  additionalFilters?: Record<string, unknown>;
}

export interface UseUserProfileProps {
  targetUserId?: string;
}

export interface UseUserProfileReturn {
  targetUser: DBUser | null;
  dbUserId: string | null;
  currentUserDbId: string | null;
  friendshipStatus: FriendshipStatus | null | 'loading';
  currentFriendship: Friendship | null;
  isLoading: boolean;
  isOwnProfile: boolean;
  handleSendFriendRequest: () => void;
  handleAcceptFriendRequest: () => void;
  handleRemoveFriend: () => void;
  sendingRequest: boolean;
  acceptingRequest: boolean;
  removingFriend: boolean;
}

// =============================================================================
// API REQUEST TYPES
// =============================================================================

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

export interface PaginationInput {
  page: number;
  limit: number;
}

// =============================================================================
// MONITORING TYPES
// =============================================================================

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

// =============================================================================
// SEEDER AND DATABASE UTILITY TYPES
// =============================================================================

export interface RawDatabaseClient {
  execute: (query: ReturnType<typeof sql>) => Promise<{ rows: unknown[] }>;
  query?: (query: string) => Promise<unknown>;
}

export interface TriggerSetupOptions {
  env?: string;
  dropExisting?: boolean;
  skipVerification?: boolean;
}

export interface ScriptOptions {
  env?: string;
  dryRun?: boolean;
  runTests?: boolean;
  verbose?: boolean;
}

export interface ApplicationSeederOptions {
  db?: DatabaseClient;
  apiClient: OptimizedAPIClient;
  processor: DataProcessor;
  tables?: string[];
  appendingData?: boolean;
  env?: string;
  shouldResetDb?: boolean;
  shouldTruncateTables?: boolean;
  seasons?: number[];
  skipExternalDb?: boolean;
  skipApplicationDb?: boolean;
  concurrency?: number;
  batchSize?: number;
  enableMonitoring?: boolean;
  skipUsers?: boolean;
}

export interface ConnectionArgs {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
}

export interface Edge<T> {
  cursor: string;
  node: T;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface PaginationParams {
  limit: number;
  offset: number;
  isForward: boolean;
}
