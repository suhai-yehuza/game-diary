// Common Types
export type Position = "PG" | "SG" | "SF" | "PF" | "C" | "F" | "G";
export type Conference =
  | "East"
  | "West"
  | "California"
  | "summer"
  | "EASTERN"
  | "WESTERN";
export type Division =
  | "Atlantic"
  | "Central"
  | "Southeast"
  | "Northwest"
  | "Pacific"
  | "Southwest"
  | null;
export type GameStatus = "Scheduled" | "In Progress" | "Finished";
export type PlayerSort =
  | "POINTS"
  | "REBOUNDS"
  | "ASSISTS"
  | "STEALS"
  | "BLOCKS";
export type TeamSort = "WINS" | "LOSSES" | "WIN_PERCENTAGE" | "POINTS_PER_GAME";
export type SortOption = "ASC" | "DESC";
export type LeagueType =
  | "africa"
  | "orlando"
  | "sacramento"
  | "standard"
  | "utah"
  | "vegas";

// NBA API Types
export interface Season {
  id: string;
  year: string;
  isCurrent: boolean;
  startDate: string;
  endDate: string;
  allStarGameDate: string;
  playoffsStartDate: string;
  playoffsEndDate: string;
}

export interface League {
  conference: string;
  division: string;
}

export interface Leagues {
  standard: League;
  vegas?: League;
  utah?: League;
  sacramento?: League;
  [key: string]: League | undefined;
}

// Team Types
export interface TeamLeagueInfo {
  conference: string;
  division: string;
}

export interface TeamLeagues {
  standard: TeamLeagueInfo;
  [key: string]: TeamLeagueInfo;
}

export interface Team {
  id: number;
  name: string;
  nickname: string;
  code: string;
  city: string;
  logo: string;
  allStar?: boolean;
  nbaFranchise?: boolean;
  leagues: TeamLeagues;
  wins?: number;
  losses?: number;
  winPercentage?: number;
  streak?: string;
  lastTen?: string;
  homeRecord?: string;
  awayRecord?: string;
  pointsPerGame?: number;
  pointsAllowedPerGame?: number;
}

// Player Types
export interface Birth {
  date: string | null;
  country: string | null;
}

export interface NbaInfo {
  start: number;
  pro: number;
}

export interface Height {
  feets: string | number;
  inches: string | number;
  meters?: string;
}

export interface Weight {
  pounds: string | number;
  kilograms?: string;
}

export interface PlayerLeagueInfo {
  jersey: string | number;
  active: boolean;
  pos: string;
}

export interface PlayerLeagues {
  standard: PlayerLeagueInfo;
  [key: string]: PlayerLeagueInfo;
}

export interface Player {
  id: number | string;
  firstname: string;
  lastname: string;
  birth?: Birth;
  height?: Height;
  weight?: Weight;
  leagues?: PlayerLeagues;
  team?: {
    id: number | string;
    name: string;
    code: string;
    abbreviation?: string;
    leagues?: {
      standard?: {
        conference?: string;
        division?: string;
      };
    };
    logo?: string;
  };
  stats?: {
    gamesPlayed: number;
    gamesStarted: number;
    minutesPerGame: number;
    pointsPerGame: number;
    reboundsPerGame: number;
    assistsPerGame: number;
    stealsPerGame: number;
    blocksPerGame: number;
    fieldGoalPercentage: number;
    threePointPercentage: number;
    freeThrowPercentage: number;
    plusMinus: number;
  };
}

// Game Types
export interface GameDate {
  start: string;
  end: string;
  duration: string;
}

export interface GameStatusInfo {
  clock: string | null;
  halftime: boolean;
  short: number;
  long: string;
}

export interface GamePeriods {
  current: number;
  total: number;
  endOfPeriod: boolean;
}

export interface Arena {
  name: string;
  city: string;
  state: string;
  country: string;
  capacity?: number;
}

export interface GameTeam {
  id: number | string;
  name: string;
  code: string;
  nickname?: string;
  logo?: string;
}

export interface GameTeams {
  visitors: GameTeam;
  home: GameTeam;
}

export interface GameScore {
  points: number;
}

export interface GameScores {
  visitors: GameScore;
  home: GameScore;
  homeQ1?: number;
  homeQ2?: number;
  homeQ3?: number;
  homeQ4?: number;
  awayQ1?: number;
  awayQ2?: number;
  awayQ3?: number;
  awayQ4?: number;
}

export interface Game {
  id: string;
  league: {
    id: string;
    name: string;
    type: string;
    logo: string;
  };
  season: number;
  date: {
    start: string;
    end: string;
    duration: string;
  };
  stage: number;
  status: {
    clock: string;
    halftime: boolean;
    short: number;
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
    state: string;
    country: string;
  };
  teams: {
    visitors: {
      id: string;
      name: string;
      nickname: string;
      code: string;
      logo: string;
    };
    home: {
      id: string;
      name: string;
      nickname: string;
      code: string;
      logo: string;
    };
  };
  scores: {
    visitors: {
      win: number;
      loss: number;
      series: {
        win: number;
        loss: number;
      };
      linescore: string[];
      points: number;
    };
    home: {
      win: number;
      loss: number;
      series: {
        win: number;
        loss: number;
      };
      linescore: string[];
      points: number;
    };
  };
  officials: string[];
  timesTied: number;
  leadChanges: number;
  nugget: string | null;
  statistics: GameStatistics[];
}

// Statistics Types
export interface GameStatistics {
  game_id: number;
  team: number;
  playerId: number;
  points: number;
  rebounds: {
    total: number;
    offensive: number;
    defensive: number;
  };
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  minutes: string;
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
  plusMinus: number | string;
  fastBreakPoints?: number;
  pointsInPaint?: number;
  biggestLead?: number;
  secondChancePoints?: number;
  pointsOffTurnovers?: number;
  longestRun?: number;
}

export interface TeamStatistics {
  team: number;
  season: number;
  gamesPlayed: number;
  pointsPerGame: number;
  fieldGoalPercentage: string;
  threePointPercentage: string;
  freeThrowPercentage: string;
  reboundsPerGame: number;
  assistsPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  turnoversPerGame: number;
  foulsPerGame: number;
  fastBreakPoints?: number;
  pointsInPaint?: number;
  biggestLead?: number;
  secondChancePoints?: number;
  pointsOffTurnovers?: number;
  longestRun?: number;
}

export interface PlayerStatistics {
  playerId: number;
  season: number;
  gamesPlayed: number;
  pointsPerGame: number;
  fieldGoalPercentage: string;
  threePointPercentage: string;
  freeThrowPercentage: string;
  reboundsPerGame: number;
  assistsPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  turnoversPerGame: number;
  foulsPerGame: number;
  plusMinus: number;
  minutesPerGame: string;
  doubleDoubles: number;
  tripleDoubles: number;
}

// Standing Types
export interface ConferenceStanding {
  name: string;
  rank: number;
  win: WinLossRecord;
  loss: WinLossRecord;
}

export interface DivisionStanding {
  name: string;
  rank: number;
  win: WinLossRecord;
  loss: WinLossRecord;
  gamesBehind: string;
}

export interface WinLossRecord {
  home: number;
  away: number;
  total: number;
  percentage: string;
  lastTen: number;
}

export interface Standing {
  team: Team;
  conference: ConferenceStanding;
  division: DivisionStanding;
  win: WinLossRecord;
  loss: WinLossRecord;
  gamesBehind: string;
  streak: number;
  lastTen: WinLossRecord;
  winStreak?: boolean;
  tieBreakerPoints?: number | null;
}

// User and Social Types
export interface ClerkUserData {
  id: string;
  username: string | null;
  email_addresses: { email_address: string }[];
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  updated_at: number;
}

export interface ClerkDeletedUserData {
  id: string;
  deleted: boolean;
}

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email_address: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  banned: boolean;
  timestamp: string;
  inbound_friendship_ids: string[];
  outbound_friendship_ids: string[];
  initiated_friendships?: {
    id: string;
    status: string;
    timestamp: string;
    responder: {
      username: string;
      image_url: string;
    };
  }[];
  received_friendships?: {
    id: string;
    status: string;
    timestamp: string;
    initiator: {
      username: string;
      image_url: string;
    };
  }[];
  game_logs?: {
    id: string;
    game_id: string;
    watched_setting: string;
    watched_date: string;
    watched_location: string;
    rating_for_game: number;
    rating_stars: string;
    watched_count: number;
    created_at: string;
    updated_at: string;
  }[];
}

export type FriendshipStatus = "pending" | "accepted" | "rejected";

export interface Friendship {
  id: string;
  status: FriendshipStatus;
  subscriber_id: string;
  user_id: string;
  timestamp: string;
  initiator?: {
    username: string;
  };
  responder?: {
    username: string;
  };
}

// Game Rating and Log Types
export interface PaginationArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export interface GameRating {
  id: string;
  game_id: string;
  average_rating: string;
  total_ratings: number;
  created_at: string;
  updated_at: string;
}

export type watched_setting =
  | "tv"
  | "arena"
  | "phone"
  | "laptop"
  | "bar"
  | "home"
  | "other";

export interface GameLog {
  id: string;
  user_id: string;
  game_id: string;
  watched_setting: watched_setting;
  watched_date: string;
  watched_location: string;
  rating_for_game: number;
  rating_stars: string;
  watched_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  game?: GameRating;
}

// Comment and Reaction Types
export interface Comment {
  id: string;
  user_id: string;
  parent_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Reaction {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  emoji: string;
  created_at: string;
  updated_at: string;
}

// Filter Types
export interface GameFilters {
  season?: number;
  date?: string;
  team?: string;
}

export interface TeamFilters {
  conference?: string;
  division?: string;
  code?: string;
}

export interface PlayerFilters {
  team?: string;
  season?: number;
  country?: string;
}

// API Response Types
export interface ApiResponse<T> {
  get: string;
  parameters: Record<string, string> | never[];
  errors: string[];
  results: number;
  response: T[];
}

export type SeasonApiResponse = ApiResponse<number[]>;
export type LeagueApiResponse = ApiResponse<string[]>;
export type GameApiResponse = ApiResponse<Game[]>;
export type TeamSearchApiResponse = ApiResponse<Team[]>;
export type PlayersApiResponse = ApiResponse<Player[]>;
export type StandingsApiResponse = ApiResponse<Standing[]>;
export type GameStatisticsApiResponse = ApiResponse<GameStatistics[]>;
export type TeamStatisticsApiResponse = ApiResponse<TeamStatistics[]>;
export type PlayerStatisticsApiResponse = ApiResponse<PlayerStatistics[]>;

// Response Types
export interface SeasonResponse {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface LeagueResponse {
  id: string;
  name: string;
  type: string;
  logo: string;
}

export interface GameResponse {
  id: string;
  season: string;
  date: {
    start: string;
    end: string;
    duration: string;
  };
  status: {
    clock: string;
    halftime: boolean;
    short: string;
    long: string;
  };
  teams: {
    visitors: {
      id: string;
      name: string;
      code: string;
    };
    home: {
      id: string;
      name: string;
      code: string;
    };
  };
  scores: {
    visitors: {
      points: number;
    };
    home: {
      points: number;
    };
  };
}

export interface TeamResponse {
  id: string;
  name: string;
  nickname: string;
  code: string;
  city: string;
  logo: string;
  leagues: {
    standard: {
      conference: string;
      division: string;
    };
  };
}

export interface PlayerResponse {
  id: string;
  first_name: string;
  last_name: string;
  birth: {
    date: string;
    country: string;
  };
  height: {
    feets: number;
    inches: number;
  };
  weight: {
    pounds: number;
  };
  leagues: {
    standard: {
      jersey: string;
      active: boolean;
      pos: string;
    };
  };
}

export interface StandingResponse {
  team: {
    name: string;
    code: string;
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
  };
  win: {
    total: number;
    percentage: string;
  };
  loss: {
    total: number;
  };
  gamesBehind: string;
  streak: string;
}

export interface GameStatResponse {
  game_id: string;
  team: string;
  playerId: string;
  points: number;
  rebounds: {
    total: number;
    offensive: number;
    defensive: number;
  };
  assists: number;
  steals: number;
  blocks: number;
}

export interface PlayerStatResponse {
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
}

export interface GameRatingResponse {
  id: string;
  game_id: string;
  average_rating: number;
  total_ratings: number;
  created_at: string;
  updated_at: string;
}

export interface GameLogResponse {
  id: string;
  user_id: string;
  game_id: string;
  watched_setting: string;
  watched_date: string;
  watched_location: string;
  rating_for_game: number;
  rating_stars: string;
  watched_count: number;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
}

export interface CommentResponse {
  id: string;
  user_id: string;
  parent_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface FriendshipResponse {
  id: string;
  status: string;
  subscriber_id: string;
  user_id: string;
  timestamp: string;
  responder?: {
    username: string;
    image_url: string;
  };
}

export interface UserResponse {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email_address: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  banned: boolean;
  inbound_friendship_ids: string[];
  outbound_friendship_ids: string[];
  initiated_friendships: FriendshipResponse[];
  received_friendships: FriendshipResponse[];
  game_logs: GameLogResponse[];
}

export interface AllUserResponse {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email_address: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  banned: boolean;
  inbound_friendship_ids: string[];
  outbound_friendship_ids: string[];
}

export interface ReactionResponse {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  emoji: string;
  created_at: string;
  updated_at: string;
}

export interface CommentResponse {
  id: string;
  user_id: string;
  parent_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url: string;
  };
}
