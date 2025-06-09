import type { AnyScalar } from '@/lib/types/scalars';
import type { DateTimeScalar } from '@/lib/types/scalars';
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { DBPlayer, Activity, AppNotification } from '@/lib/types';
import type { Context } from '@/lib/graphql/context';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Any: { input: AnyScalar; output: AnyScalar; }
  DateTime: { input: DateTimeScalar; output: DateTimeScalar; }
};

export type AcceptFriendRequestResponse = {
  errors: Maybe<Array<ErrorResult>>;
  friendship: Maybe<Friendship>;
};

export type Arena = {
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  state: Maybe<Scalars['String']['output']>;
};

export type AuthenticationError = {
  message: Scalars['String']['output'];
};

export type AuthorizationError = {
  message: Scalars['String']['output'];
  requiredRole: Maybe<Scalars['String']['output']>;
};

export type BusinessLogicError = {
  code: Scalars['String']['output'];
  details: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
};

export type Classification =
  | 'Private'
  | 'Protected'
  | 'Public';

export type Comment = {
  childComments: CommentConnection;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt: Maybe<Scalars['DateTime']['output']>;
  depth: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  parentId: Scalars['ID']['output'];
  parentType: ParentType;
  reactions: Array<Reaction>;
  updatedAt: Scalars['DateTime']['output'];
  user: UserSummary;
  userId: Scalars['ID']['output'];
};


export type CommentChildCommentsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
};

export type CommentConnection = {
  edges: Array<CommentEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CommentEdge = {
  cursor: Scalars['String']['output'];
  node: Comment;
};

export type CommentFilters = {
  parentId?: InputMaybe<Scalars['ID']['input']>;
  parentType?: InputMaybe<ParentType>;
  search?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type ConferenceStanding = {
  loss: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  rank: Scalars['Int']['output'];
  win: Scalars['Int']['output'];
};

export type CreateCommentInput = {
  content: Scalars['String']['input'];
  parentId: Scalars['ID']['input'];
  parentType: ParentType;
};

export type CreateCommentResponse = {
  comment: Maybe<Comment>;
  errors: Maybe<Array<ErrorResult>>;
};

export type CreateGameInput = {
  awayTeamId: Scalars['ID']['input'];
  awayTeamScore?: InputMaybe<Scalars['Int']['input']>;
  date: Scalars['DateTime']['input'];
  gameType: Scalars['String']['input'];
  homeTeamId: Scalars['ID']['input'];
  homeTeamScore?: InputMaybe<Scalars['Int']['input']>;
  nbaGameId?: InputMaybe<Scalars['ID']['input']>;
  status: GameStatusEnum;
};

export type CreateGameLogInput = {
  classification: Classification;
  gameId: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  ratingForGame: Scalars['Int']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  watchedDate?: InputMaybe<Scalars['DateTime']['input']>;
  watchedLocation?: InputMaybe<Scalars['String']['input']>;
  watchedScope: Scalars['String']['input'];
  watchedSetting: Scalars['String']['input'];
};

export type CreateGameLogResponse = {
  errors: Maybe<Array<ErrorResult>>;
  gameLog: Maybe<GameLog>;
};

export type CreateGameResponse = {
  errors: Maybe<Array<ErrorResult>>;
  game: Maybe<Game>;
};

export type CreateReactionInput = {
  emoji: ReactionEmojiType;
  targetId: Scalars['ID']['input'];
  targetType: ParentType;
};

export type CreateReactionResponse = {
  errors: Maybe<Array<ErrorResult>>;
  reaction: Maybe<Reaction>;
};

export type DbUser = {
  banned: Maybe<Scalars['Boolean']['output']>;
  comments: Array<Comment>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt: Maybe<Scalars['DateTime']['output']>;
  emailAddress: Maybe<Scalars['String']['output']>;
  email_verification_strategy: Maybe<Scalars['String']['output']>;
  email_verified: Maybe<Scalars['Boolean']['output']>;
  external_id: Maybe<Scalars['String']['output']>;
  firstName: Maybe<Scalars['String']['output']>;
  friendships: Array<Friendship>;
  gameLogs: Array<GameLog>;
  id: Scalars['ID']['output'];
  imageUrl: Maybe<Scalars['String']['output']>;
  inboundFriendshipIds: Maybe<Array<Scalars['String']['output']>>;
  initiatedFriendships: Array<Friendship>;
  lastName: Maybe<Scalars['String']['output']>;
  last_sign_in_at: Maybe<Scalars['DateTime']['output']>;
  outboundFriendshipIds: Maybe<Array<Scalars['String']['output']>>;
  password_enabled: Maybe<Scalars['Boolean']['output']>;
  reactions: Array<Reaction>;
  two_factor_enabled: Maybe<Scalars['Boolean']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type DateRangeInput = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start: Scalars['DateTime']['input'];
};

export type DeleteCommentResponse = {
  errors: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type DeleteGameLogResponse = {
  errors: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type DeleteReactionResponse = {
  errors: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type ErrorResult = {
  code: Maybe<Scalars['String']['output']>;
  field: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
};

export type Friendship = {
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  initiator: UserSummary;
  recipient: UserSummary;
  status: FriendshipStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type FriendshipStatus =
  | 'ACCEPTED'
  | 'BLOCKED'
  | 'PENDING'
  | 'REJECTED';

export type Game = {
  arena: Maybe<Arena>;
  awayTeamId: Scalars['String']['output'];
  awayTeamScore: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  date: GameDate;
  gameType: Scalars['String']['output'];
  homeTeamId: Scalars['String']['output'];
  homeTeamScore: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isCompleted: Scalars['Boolean']['output'];
  leadChanges: Maybe<Scalars['Int']['output']>;
  league: Maybe<Scalars['String']['output']>;
  nbaGameId: Maybe<Scalars['ID']['output']>;
  nugget: Maybe<Scalars['String']['output']>;
  officials: Array<Scalars['String']['output']>;
  periods: GamePeriods;
  scores: GameScores;
  season: Maybe<Scalars['Int']['output']>;
  stage: Maybe<Scalars['Int']['output']>;
  status: GameStatus;
  teams: GameTeams;
  timesTied: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type GameConnection = {
  edges: Array<GameEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GameDate = {
  duration: Maybe<Scalars['Int']['output']>;
  end: Maybe<Scalars['DateTime']['output']>;
  start: Scalars['DateTime']['output'];
};

export type GameEdge = {
  cursor: Scalars['String']['output'];
  node: Game;
};

export type GameFilters = {
  arena?: InputMaybe<Scalars['String']['input']>;
  dateRange?: InputMaybe<DateRangeInput>;
  search?: InputMaybe<Scalars['String']['input']>;
  season?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<GameStatusEnum>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};

export type GameLog = {
  classification: Classification;
  comments: CommentConnection;
  createdAt: Scalars['DateTime']['output'];
  game: Game;
  id: Scalars['ID']['output'];
  notes: Maybe<Scalars['String']['output']>;
  ratingForGame: Scalars['Int']['output'];
  reactions: Array<Reaction>;
  tags: Maybe<Array<Scalars['String']['output']>>;
  updatedAt: Scalars['DateTime']['output'];
  user: UserSummary;
  watchedDate: Maybe<Scalars['DateTime']['output']>;
  watchedLocation: Maybe<Scalars['String']['output']>;
  watchedScope: Scalars['String']['output'];
  watchedSetting: Scalars['String']['output'];
};


export type GameLogCommentsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
};

export type GameLogConnection = {
  edges: Array<GameLogEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GameLogEdge = {
  cursor: Scalars['String']['output'];
  node: GameLog;
};

export type GameLogFilters = {
  classification?: InputMaybe<Classification>;
  dateRange?: InputMaybe<DateRangeInput>;
  gameId?: InputMaybe<Scalars['ID']['input']>;
  hasNotes?: InputMaybe<Scalars['Boolean']['input']>;
  maxRating?: InputMaybe<Scalars['Int']['input']>;
  minRating?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  searchText?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  userId?: InputMaybe<Scalars['ID']['input']>;
  watchedDateRange?: InputMaybe<DateRangeInput>;
  watchedLocation?: InputMaybe<Scalars['String']['input']>;
  watchedSetting?: InputMaybe<Scalars['String']['input']>;
};

export type GamePeriods = {
  current: Scalars['Int']['output'];
  endOfPeriod: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type GameScores = {
  home: TeamScore;
  visitors: TeamScore;
};

export type GameStatus = {
  clock: Maybe<Scalars['String']['output']>;
  halftime: Scalars['Boolean']['output'];
  long: Scalars['String']['output'];
  short: Scalars['String']['output'];
};

export type GameStatusEnum =
  | 'CANCELLED'
  | 'FINISHED'
  | 'LIVE'
  | 'POSTPONED'
  | 'SCHEDULED';

export type GameTeams = {
  home: TeamSummary;
  visitors: TeamSummary;
};

export type Mutation = {
  acceptFriendRequest: AcceptFriendRequestResponse;
  createComment: CreateCommentResponse;
  createGame: CreateGameResponse;
  createGameLog: CreateGameLogResponse;
  createReaction: CreateReactionResponse;
  deleteComment: DeleteCommentResponse;
  deleteGameLog: DeleteGameLogResponse;
  deleteReaction: DeleteReactionResponse;
  rejectFriendRequest: RejectFriendRequestResponse;
  removeFriend: RemoveFriendResponse;
  sendFriendRequest: SendFriendRequestResponse;
  updateComment: UpdateCommentResponse;
  updateGameLog: UpdateGameLogResponse;
  updateUserProfile: UpdateUserProfileResponse;
};


export type MutationAcceptFriendRequestArgs = {
  friendshipId: Scalars['ID']['input'];
};


export type MutationCreateCommentArgs = {
  input: CreateCommentInput;
};


export type MutationCreateGameArgs = {
  input: CreateGameInput;
};


export type MutationCreateGameLogArgs = {
  input: CreateGameLogInput;
};


export type MutationCreateReactionArgs = {
  input: CreateReactionInput;
};


export type MutationDeleteCommentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteGameLogArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteReactionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRejectFriendRequestArgs = {
  friendshipId: Scalars['ID']['input'];
};


export type MutationRemoveFriendArgs = {
  friendshipId: Scalars['ID']['input'];
};


export type MutationSendFriendRequestArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationUpdateCommentArgs = {
  id: Scalars['ID']['input'];
  input: CreateCommentInput;
};


export type MutationUpdateGameLogArgs = {
  id: Scalars['ID']['input'];
  input: CreateGameLogInput;
};


export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};

export type PageInfo = {
  endCursor: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor: Maybe<Scalars['String']['output']>;
};

export type PaginationInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type ParentType =
  | 'comment'
  | 'game_log';

export type Player = {
  active: Maybe<Scalars['Boolean']['output']>;
  affiliation: Maybe<Scalars['String']['output']>;
  birth: Maybe<PlayerBirth>;
  college: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  firstName: Maybe<Scalars['String']['output']>;
  games: Array<Game>;
  height: Maybe<PlayerHeight>;
  id: Scalars['ID']['output'];
  jersey: Maybe<Scalars['String']['output']>;
  lastName: Maybe<Scalars['String']['output']>;
  leagues: Maybe<PlayerLeagues>;
  nba: Maybe<PlayerNba>;
  position: Maybe<Scalars['String']['output']>;
  seasonsActive: Maybe<Scalars['String']['output']>;
  seasons_active: Maybe<Array<PlayerSeason>>;
  stats: Array<PlayerStats>;
  updatedAt: Scalars['DateTime']['output'];
  weight: Maybe<PlayerWeight>;
};

export type PlayerBirth = {
  country: Maybe<Scalars['String']['output']>;
  date: Maybe<Scalars['String']['output']>;
};

export type PlayerConnection = {
  edges: Array<PlayerEdge>;
  hasMore: Scalars['Boolean']['output'];
  items: Array<Player>;
  nextCursor: Maybe<Scalars['String']['output']>;
  pageInfo: PageInfo;
  total: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type PlayerEdge = {
  cursor: Scalars['String']['output'];
  node: Player;
};

export type PlayerFilters = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
};

export type PlayerHeight = {
  feets: Maybe<Scalars['String']['output']>;
  inches: Maybe<Scalars['String']['output']>;
  meters: Maybe<Scalars['String']['output']>;
};

export type PlayerLeagues = {
  standard: Maybe<PlayerStandard>;
};

export type PlayerNba = {
  pro: Maybe<Scalars['Int']['output']>;
  start: Maybe<Scalars['Int']['output']>;
};

export type PlayerSeason = {
  season: Maybe<Scalars['String']['output']>;
  teams: Maybe<Array<Scalars['String']['output']>>;
};

export type PlayerStandard = {
  active: Maybe<Scalars['Boolean']['output']>;
  jersey: Maybe<Scalars['String']['output']>;
  pos: Maybe<Scalars['String']['output']>;
};

export type PlayerStats = {
  assists: Scalars['Int']['output'];
  blocks: Scalars['Int']['output'];
  fieldGoals: StatPercentage;
  fouls: Scalars['Int']['output'];
  freeThrows: StatPercentage;
  gameId: Scalars['ID']['output'];
  minutes: Scalars['String']['output'];
  playerId: Scalars['ID']['output'];
  points: Scalars['Int']['output'];
  rebounds: Scalars['Int']['output'];
  steals: Scalars['Int']['output'];
  threePointers: StatPercentage;
  turnovers: Scalars['Int']['output'];
};

export type PlayerWeight = {
  kilograms: Maybe<Scalars['String']['output']>;
  pounds: Maybe<Scalars['String']['output']>;
};

export type Query = {
  comments: CommentConnection;
  game: Maybe<Game>;
  gameLog: Maybe<GameLog>;
  gameLogs: GameLogConnection;
  games: GameConnection;
  liveGames: GameConnection;
  me: Maybe<UserSummary>;
  player: Maybe<Player>;
  playerStats: Maybe<PlayerStats>;
  players: PlayerConnection;
  reactions: Array<Reaction>;
  searchUsers: UserConnection;
  team: Maybe<Team>;
  teamGameStats: Maybe<TeamStats>;
  teamH2H: Maybe<TeamH2H>;
  teamStats: Maybe<TeamStats>;
  teams: TeamConnection;
  user: Maybe<UserSummary>;
  users: Array<UserSummary>;
};


export type QueryCommentsArgs = {
  filters: InputMaybe<CommentFilters>;
  pagination: InputMaybe<PaginationInput>;
};


export type QueryGameArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGameLogArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGameLogsArgs = {
  filters: InputMaybe<GameLogFilters>;
  pagination: InputMaybe<PaginationInput>;
};


export type QueryGamesArgs = {
  filters: InputMaybe<GameFilters>;
  pagination: InputMaybe<PaginationInput>;
};


export type QueryLiveGamesArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPlayerArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPlayerStatsArgs = {
  gameId: Scalars['ID']['input'];
  playerId: Scalars['ID']['input'];
};


export type QueryPlayersArgs = {
  filters: InputMaybe<PlayerFilters>;
  pagination: InputMaybe<PaginationInput>;
};


export type QueryReactionsArgs = {
  targetId: Scalars['ID']['input'];
  targetType: ParentType;
};


export type QuerySearchUsersArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  filters: InputMaybe<UserSearchFilters>;
  first: InputMaybe<Scalars['Int']['input']>;
  searchTerm: InputMaybe<Scalars['String']['input']>;
};


export type QueryTeamArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTeamGameStatsArgs = {
  gameId: Scalars['ID']['input'];
  teamId: Scalars['String']['input'];
};


export type QueryTeamH2HArgs = {
  opponentId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};


export type QueryTeamStatsArgs = {
  season: Scalars['Int']['input'];
  teamId: Scalars['ID']['input'];
};


export type QueryTeamsArgs = {
  filters: InputMaybe<TeamFilters>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  filters: InputMaybe<UserFilters>;
  pagination: InputMaybe<PaginationInput>;
};

export type Reaction = {
  createdAt: Scalars['DateTime']['output'];
  emoji: ReactionEmojiType;
  id: Scalars['ID']['output'];
  targetId: Scalars['ID']['output'];
  targetType: ParentType;
  updatedAt: Scalars['DateTime']['output'];
  user: UserSummary;
  userId: Scalars['ID']['output'];
};

export type ReactionEmojiType =
  | 'ANGRY'
  | 'EYES'
  | 'FIRE'
  | 'HEART'
  | 'LAUGH'
  | 'ROCKET'
  | 'SAD'
  | 'THUMBS_DOWN'
  | 'THUMBS_UP'
  | 'WOW';

export type RejectFriendRequestResponse = {
  errors: Maybe<Array<ErrorResult>>;
  friendship: Maybe<Friendship>;
};

export type RemoveFriendResponse = {
  errors: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type SendFriendRequestResponse = {
  errors: Maybe<Array<ErrorResult>>;
  friendship: Maybe<Friendship>;
};

export type SeriesScore = {
  loss: Scalars['Int']['output'];
  win: Scalars['Int']['output'];
};

export type StatPercentage = {
  attempted: Scalars['Int']['output'];
  made: Scalars['Int']['output'];
  percentage: Scalars['String']['output'];
};

export type Team = {
  city: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  conference: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  division: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  logo: Maybe<Scalars['String']['output']>;
  logoUrl: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nickname: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type TeamConnection = {
  edges: Array<TeamEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type TeamEdge = {
  cursor: Scalars['String']['output'];
  node: Team;
};

export type TeamFilters = {
  city?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  conference?: InputMaybe<Scalars['String']['input']>;
  division?: InputMaybe<Scalars['String']['input']>;
  pagination?: InputMaybe<PaginationInput>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type TeamH2H = {
  lastTenGames: Maybe<Scalars['String']['output']>;
  losses: Scalars['Int']['output'];
  opponentId: Scalars['ID']['output'];
  teamId: Scalars['ID']['output'];
  winPercentage: Scalars['Float']['output'];
  wins: Scalars['Int']['output'];
};

export type TeamScore = {
  linescore: Array<Scalars['Int']['output']>;
  loss: Scalars['Int']['output'];
  points: Scalars['Int']['output'];
  series: SeriesScore;
  win: Scalars['Int']['output'];
};

export type TeamStats = {
  assists: Scalars['Int']['output'];
  assistsPerGame: Scalars['Float']['output'];
  blocks: Scalars['Int']['output'];
  blocksPerGame: Scalars['Float']['output'];
  conferenceStanding: Maybe<ConferenceStanding>;
  createdAt: Scalars['DateTime']['output'];
  defReb: Scalars['Int']['output'];
  fga: Scalars['Int']['output'];
  fgm: Scalars['Int']['output'];
  fgp: Scalars['String']['output'];
  fieldGoalPercentage: Scalars['Float']['output'];
  foulsPerGame: Scalars['Float']['output'];
  freeThrowPercentage: Scalars['Float']['output'];
  fta: Scalars['Int']['output'];
  ftm: Scalars['Int']['output'];
  ftp: Scalars['String']['output'];
  gamesPlayed: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  longestRun: Scalars['Int']['output'];
  losses: Scalars['Int']['output'];
  pFouls: Scalars['Int']['output'];
  plusMinus: Scalars['Int']['output'];
  points: Scalars['Int']['output'];
  pointsPerGame: Scalars['Float']['output'];
  reboundsPerGame: Scalars['Float']['output'];
  season: Scalars['Int']['output'];
  steals: Scalars['Int']['output'];
  stealsPerGame: Scalars['Float']['output'];
  team: Team;
  threePointPercentage: Scalars['Float']['output'];
  totReb: Scalars['Int']['output'];
  tpa: Scalars['Int']['output'];
  tpm: Scalars['Int']['output'];
  tpp: Scalars['String']['output'];
  turnovers: Scalars['Int']['output'];
  turnoversPerGame: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  wins: Scalars['Int']['output'];
};

export type TeamSummary = {
  code: Scalars['String']['output'];
  id: Scalars['String']['output'];
  logo: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nickname: Scalars['String']['output'];
};

export type UpdateCommentResponse = {
  comment: Maybe<Comment>;
  errors: Maybe<Array<ErrorResult>>;
};

export type UpdateGameLogResponse = {
  errors: Maybe<Array<ErrorResult>>;
  gameLog: Maybe<GameLog>;
};

export type UpdateUserProfileInput = {
  firstName?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserProfileResponse = {
  errors: Maybe<Array<ErrorResult>>;
  user: Maybe<UserSummary>;
};

export type UserConnection = {
  edges: Array<UserEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type UserEdge = {
  cursor: Scalars['String']['output'];
  node: UserSummary;
};

export type UserFilters = {
  hasGameLogs?: InputMaybe<Scalars['Boolean']['input']>;
  isVerified?: InputMaybe<Scalars['Boolean']['input']>;
  joinedAfter?: InputMaybe<Scalars['DateTime']['input']>;
  joinedBefore?: InputMaybe<Scalars['DateTime']['input']>;
  minGameLogs?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type UserSearchFilters = {
  hasGameLogs?: InputMaybe<Scalars['Boolean']['input']>;
  isVerified?: InputMaybe<Scalars['Boolean']['input']>;
  joinedAfter?: InputMaybe<Scalars['DateTime']['input']>;
  joinedBefore?: InputMaybe<Scalars['DateTime']['input']>;
  minGameLogs?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type UserSummary = {
  emailAddress: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  imageUrl: Maybe<Scalars['String']['output']>;
  lastName: Scalars['String']['output'];
  username: Scalars['String']['output'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AcceptFriendRequestResponse: ResolverTypeWrapper<AcceptFriendRequestResponse>;
  Any: ResolverTypeWrapper<Scalars['Any']['output']>;
  Arena: ResolverTypeWrapper<Arena>;
  AuthenticationError: ResolverTypeWrapper<AuthenticationError>;
  AuthorizationError: ResolverTypeWrapper<AuthorizationError>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BusinessLogicError: ResolverTypeWrapper<BusinessLogicError>;
  Classification: Classification;
  Comment: ResolverTypeWrapper<Comment>;
  CommentConnection: ResolverTypeWrapper<CommentConnection>;
  CommentEdge: ResolverTypeWrapper<CommentEdge>;
  CommentFilters: CommentFilters;
  ConferenceStanding: ResolverTypeWrapper<ConferenceStanding>;
  CreateCommentInput: CreateCommentInput;
  CreateCommentResponse: ResolverTypeWrapper<CreateCommentResponse>;
  CreateGameInput: CreateGameInput;
  CreateGameLogInput: CreateGameLogInput;
  CreateGameLogResponse: ResolverTypeWrapper<CreateGameLogResponse>;
  CreateGameResponse: ResolverTypeWrapper<CreateGameResponse>;
  CreateReactionInput: CreateReactionInput;
  CreateReactionResponse: ResolverTypeWrapper<CreateReactionResponse>;
  DBUser: ResolverTypeWrapper<DbUser>;
  DateRangeInput: DateRangeInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DeleteCommentResponse: ResolverTypeWrapper<DeleteCommentResponse>;
  DeleteGameLogResponse: ResolverTypeWrapper<DeleteGameLogResponse>;
  DeleteReactionResponse: ResolverTypeWrapper<DeleteReactionResponse>;
  ErrorResult: ResolverTypeWrapper<ErrorResult>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Friendship: ResolverTypeWrapper<Friendship>;
  FriendshipStatus: FriendshipStatus;
  Game: ResolverTypeWrapper<Game>;
  GameConnection: ResolverTypeWrapper<GameConnection>;
  GameDate: ResolverTypeWrapper<GameDate>;
  GameEdge: ResolverTypeWrapper<GameEdge>;
  GameFilters: GameFilters;
  GameLog: ResolverTypeWrapper<GameLog>;
  GameLogConnection: ResolverTypeWrapper<GameLogConnection>;
  GameLogEdge: ResolverTypeWrapper<GameLogEdge>;
  GameLogFilters: GameLogFilters;
  GamePeriods: ResolverTypeWrapper<GamePeriods>;
  GameScores: ResolverTypeWrapper<GameScores>;
  GameStatus: ResolverTypeWrapper<GameStatus>;
  GameStatusEnum: GameStatusEnum;
  GameTeams: ResolverTypeWrapper<GameTeams>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PaginationInput: PaginationInput;
  ParentType: ParentType;
  Player: ResolverTypeWrapper<DBPlayer>;
  PlayerBirth: ResolverTypeWrapper<PlayerBirth>;
  PlayerConnection: ResolverTypeWrapper<Omit<PlayerConnection, 'edges' | 'items'> & { edges: Array<ResolversTypes['PlayerEdge']>, items: Array<ResolversTypes['Player']> }>;
  PlayerEdge: ResolverTypeWrapper<Omit<PlayerEdge, 'node'> & { node: ResolversTypes['Player'] }>;
  PlayerFilters: PlayerFilters;
  PlayerHeight: ResolverTypeWrapper<PlayerHeight>;
  PlayerLeagues: ResolverTypeWrapper<PlayerLeagues>;
  PlayerNba: ResolverTypeWrapper<PlayerNba>;
  PlayerSeason: ResolverTypeWrapper<PlayerSeason>;
  PlayerStandard: ResolverTypeWrapper<PlayerStandard>;
  PlayerStats: ResolverTypeWrapper<PlayerStats>;
  PlayerWeight: ResolverTypeWrapper<PlayerWeight>;
  Query: ResolverTypeWrapper<{}>;
  Reaction: ResolverTypeWrapper<Reaction>;
  ReactionEmojiType: ReactionEmojiType;
  RejectFriendRequestResponse: ResolverTypeWrapper<RejectFriendRequestResponse>;
  RemoveFriendResponse: ResolverTypeWrapper<RemoveFriendResponse>;
  SendFriendRequestResponse: ResolverTypeWrapper<SendFriendRequestResponse>;
  SeriesScore: ResolverTypeWrapper<SeriesScore>;
  StatPercentage: ResolverTypeWrapper<StatPercentage>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Team: ResolverTypeWrapper<Team>;
  TeamConnection: ResolverTypeWrapper<TeamConnection>;
  TeamEdge: ResolverTypeWrapper<TeamEdge>;
  TeamFilters: TeamFilters;
  TeamH2H: ResolverTypeWrapper<TeamH2H>;
  TeamScore: ResolverTypeWrapper<TeamScore>;
  TeamStats: ResolverTypeWrapper<TeamStats>;
  TeamSummary: ResolverTypeWrapper<TeamSummary>;
  UpdateCommentResponse: ResolverTypeWrapper<UpdateCommentResponse>;
  UpdateGameLogResponse: ResolverTypeWrapper<UpdateGameLogResponse>;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateUserProfileResponse: ResolverTypeWrapper<UpdateUserProfileResponse>;
  UserConnection: ResolverTypeWrapper<UserConnection>;
  UserEdge: ResolverTypeWrapper<UserEdge>;
  UserFilters: UserFilters;
  UserSearchFilters: UserSearchFilters;
  UserSummary: ResolverTypeWrapper<UserSummary>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AcceptFriendRequestResponse: AcceptFriendRequestResponse;
  Any: Scalars['Any']['output'];
  Arena: Arena;
  AuthenticationError: AuthenticationError;
  AuthorizationError: AuthorizationError;
  Boolean: Scalars['Boolean']['output'];
  BusinessLogicError: BusinessLogicError;
  Comment: Comment;
  CommentConnection: CommentConnection;
  CommentEdge: CommentEdge;
  CommentFilters: CommentFilters;
  ConferenceStanding: ConferenceStanding;
  CreateCommentInput: CreateCommentInput;
  CreateCommentResponse: CreateCommentResponse;
  CreateGameInput: CreateGameInput;
  CreateGameLogInput: CreateGameLogInput;
  CreateGameLogResponse: CreateGameLogResponse;
  CreateGameResponse: CreateGameResponse;
  CreateReactionInput: CreateReactionInput;
  CreateReactionResponse: CreateReactionResponse;
  DBUser: DbUser;
  DateRangeInput: DateRangeInput;
  DateTime: Scalars['DateTime']['output'];
  DeleteCommentResponse: DeleteCommentResponse;
  DeleteGameLogResponse: DeleteGameLogResponse;
  DeleteReactionResponse: DeleteReactionResponse;
  ErrorResult: ErrorResult;
  Float: Scalars['Float']['output'];
  Friendship: Friendship;
  Game: Game;
  GameConnection: GameConnection;
  GameDate: GameDate;
  GameEdge: GameEdge;
  GameFilters: GameFilters;
  GameLog: GameLog;
  GameLogConnection: GameLogConnection;
  GameLogEdge: GameLogEdge;
  GameLogFilters: GameLogFilters;
  GamePeriods: GamePeriods;
  GameScores: GameScores;
  GameStatus: GameStatus;
  GameTeams: GameTeams;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  PageInfo: PageInfo;
  PaginationInput: PaginationInput;
  Player: DBPlayer;
  PlayerBirth: PlayerBirth;
  PlayerConnection: Omit<PlayerConnection, 'edges' | 'items'> & { edges: Array<ResolversParentTypes['PlayerEdge']>, items: Array<ResolversParentTypes['Player']> };
  PlayerEdge: Omit<PlayerEdge, 'node'> & { node: ResolversParentTypes['Player'] };
  PlayerFilters: PlayerFilters;
  PlayerHeight: PlayerHeight;
  PlayerLeagues: PlayerLeagues;
  PlayerNba: PlayerNba;
  PlayerSeason: PlayerSeason;
  PlayerStandard: PlayerStandard;
  PlayerStats: PlayerStats;
  PlayerWeight: PlayerWeight;
  Query: {};
  Reaction: Reaction;
  RejectFriendRequestResponse: RejectFriendRequestResponse;
  RemoveFriendResponse: RemoveFriendResponse;
  SendFriendRequestResponse: SendFriendRequestResponse;
  SeriesScore: SeriesScore;
  StatPercentage: StatPercentage;
  String: Scalars['String']['output'];
  Team: Team;
  TeamConnection: TeamConnection;
  TeamEdge: TeamEdge;
  TeamFilters: TeamFilters;
  TeamH2H: TeamH2H;
  TeamScore: TeamScore;
  TeamStats: TeamStats;
  TeamSummary: TeamSummary;
  UpdateCommentResponse: UpdateCommentResponse;
  UpdateGameLogResponse: UpdateGameLogResponse;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateUserProfileResponse: UpdateUserProfileResponse;
  UserConnection: UserConnection;
  UserEdge: UserEdge;
  UserFilters: UserFilters;
  UserSearchFilters: UserSearchFilters;
  UserSummary: UserSummary;
};

export type AcceptFriendRequestResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AcceptFriendRequestResponse'] = ResolversParentTypes['AcceptFriendRequestResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  friendship?: Resolver<Maybe<ResolversTypes['Friendship']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface AnyScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Any'], any> {
  name: 'Any';
}

export type ArenaResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Arena'] = ResolversParentTypes['Arena']> = {
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthenticationErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AuthenticationError'] = ResolversParentTypes['AuthenticationError']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthorizationErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AuthorizationError'] = ResolversParentTypes['AuthorizationError']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requiredRole?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BusinessLogicErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BusinessLogicError'] = ResolversParentTypes['BusinessLogicError']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  details?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']> = {
  childComments?: Resolver<ResolversTypes['CommentConnection'], ParentType, ContextType, Partial<CommentChildCommentsArgs>>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  depth?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentType?: Resolver<ResolversTypes['ParentType'], ParentType, ContextType>;
  reactions?: Resolver<Array<ResolversTypes['Reaction']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['UserSummary'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CommentConnection'] = ResolversParentTypes['CommentConnection']> = {
  edges?: Resolver<Array<ResolversTypes['CommentEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CommentEdge'] = ResolversParentTypes['CommentEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Comment'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ConferenceStandingResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ConferenceStanding'] = ResolversParentTypes['ConferenceStanding']> = {
  loss?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  win?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateCommentResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateCommentResponse'] = ResolversParentTypes['CreateCommentResponse']> = {
  comment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateGameLogResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateGameLogResponse'] = ResolversParentTypes['CreateGameLogResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  gameLog?: Resolver<Maybe<ResolversTypes['GameLog']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateGameResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateGameResponse'] = ResolversParentTypes['CreateGameResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  game?: Resolver<Maybe<ResolversTypes['Game']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateReactionResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateReactionResponse'] = ResolversParentTypes['CreateReactionResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  reaction?: Resolver<Maybe<ResolversTypes['Reaction']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DbUserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DBUser'] = ResolversParentTypes['DBUser']> = {
  banned?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  comments?: Resolver<Array<ResolversTypes['Comment']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  emailAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email_verification_strategy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email_verified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  external_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  friendships?: Resolver<Array<ResolversTypes['Friendship']>, ParentType, ContextType>;
  gameLogs?: Resolver<Array<ResolversTypes['GameLog']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  inboundFriendshipIds?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  initiatedFriendships?: Resolver<Array<ResolversTypes['Friendship']>, ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  last_sign_in_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  outboundFriendshipIds?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  password_enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  reactions?: Resolver<Array<ResolversTypes['Reaction']>, ParentType, ContextType>;
  two_factor_enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DeleteCommentResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteCommentResponse'] = ResolversParentTypes['DeleteCommentResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteGameLogResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteGameLogResponse'] = ResolversParentTypes['DeleteGameLogResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteReactionResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteReactionResponse'] = ResolversParentTypes['DeleteReactionResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ErrorResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ErrorResult'] = ResolversParentTypes['ErrorResult']> = {
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  field?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FriendshipResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Friendship'] = ResolversParentTypes['Friendship']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  initiator?: Resolver<ResolversTypes['UserSummary'], ParentType, ContextType>;
  recipient?: Resolver<ResolversTypes['UserSummary'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['FriendshipStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Game'] = ResolversParentTypes['Game']> = {
  arena?: Resolver<Maybe<ResolversTypes['Arena']>, ParentType, ContextType>;
  awayTeamId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  awayTeamScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['GameDate'], ParentType, ContextType>;
  gameType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  homeTeamId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  homeTeamScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  leadChanges?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  league?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nbaGameId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  nugget?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  officials?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  periods?: Resolver<ResolversTypes['GamePeriods'], ParentType, ContextType>;
  scores?: Resolver<ResolversTypes['GameScores'], ParentType, ContextType>;
  season?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  stage?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['GameStatus'], ParentType, ContextType>;
  teams?: Resolver<ResolversTypes['GameTeams'], ParentType, ContextType>;
  timesTied?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GameConnection'] = ResolversParentTypes['GameConnection']> = {
  edges?: Resolver<Array<ResolversTypes['GameEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameDateResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GameDate'] = ResolversParentTypes['GameDate']> = {
  duration?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  end?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GameEdge'] = ResolversParentTypes['GameEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Game'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameLogResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GameLog'] = ResolversParentTypes['GameLog']> = {
  classification?: Resolver<ResolversTypes['Classification'], ParentType, ContextType>;
  comments?: Resolver<ResolversTypes['CommentConnection'], ParentType, ContextType, Partial<GameLogCommentsArgs>>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  game?: Resolver<ResolversTypes['Game'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ratingForGame?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reactions?: Resolver<Array<ResolversTypes['Reaction']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['UserSummary'], ParentType, ContextType>;
  watchedDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  watchedLocation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  watchedScope?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  watchedSetting?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameLogConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GameLogConnection'] = ResolversParentTypes['GameLogConnection']> = {
  edges?: Resolver<Array<ResolversTypes['GameLogEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameLogEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GameLogEdge'] = ResolversParentTypes['GameLogEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['GameLog'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GamePeriodsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GamePeriods'] = ResolversParentTypes['GamePeriods']> = {
  current?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  endOfPeriod?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameScoresResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GameScores'] = ResolversParentTypes['GameScores']> = {
  home?: Resolver<ResolversTypes['TeamScore'], ParentType, ContextType>;
  visitors?: Resolver<ResolversTypes['TeamScore'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameStatusResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GameStatus'] = ResolversParentTypes['GameStatus']> = {
  clock?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  halftime?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  long?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  short?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameTeamsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GameTeams'] = ResolversParentTypes['GameTeams']> = {
  home?: Resolver<ResolversTypes['TeamSummary'], ParentType, ContextType>;
  visitors?: Resolver<ResolversTypes['TeamSummary'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  acceptFriendRequest?: Resolver<ResolversTypes['AcceptFriendRequestResponse'], ParentType, ContextType, RequireFields<MutationAcceptFriendRequestArgs, 'friendshipId'>>;
  createComment?: Resolver<ResolversTypes['CreateCommentResponse'], ParentType, ContextType, RequireFields<MutationCreateCommentArgs, 'input'>>;
  createGame?: Resolver<ResolversTypes['CreateGameResponse'], ParentType, ContextType, RequireFields<MutationCreateGameArgs, 'input'>>;
  createGameLog?: Resolver<ResolversTypes['CreateGameLogResponse'], ParentType, ContextType, RequireFields<MutationCreateGameLogArgs, 'input'>>;
  createReaction?: Resolver<ResolversTypes['CreateReactionResponse'], ParentType, ContextType, RequireFields<MutationCreateReactionArgs, 'input'>>;
  deleteComment?: Resolver<ResolversTypes['DeleteCommentResponse'], ParentType, ContextType, RequireFields<MutationDeleteCommentArgs, 'id'>>;
  deleteGameLog?: Resolver<ResolversTypes['DeleteGameLogResponse'], ParentType, ContextType, RequireFields<MutationDeleteGameLogArgs, 'id'>>;
  deleteReaction?: Resolver<ResolversTypes['DeleteReactionResponse'], ParentType, ContextType, RequireFields<MutationDeleteReactionArgs, 'id'>>;
  rejectFriendRequest?: Resolver<ResolversTypes['RejectFriendRequestResponse'], ParentType, ContextType, RequireFields<MutationRejectFriendRequestArgs, 'friendshipId'>>;
  removeFriend?: Resolver<ResolversTypes['RemoveFriendResponse'], ParentType, ContextType, RequireFields<MutationRemoveFriendArgs, 'friendshipId'>>;
  sendFriendRequest?: Resolver<ResolversTypes['SendFriendRequestResponse'], ParentType, ContextType, RequireFields<MutationSendFriendRequestArgs, 'userId'>>;
  updateComment?: Resolver<ResolversTypes['UpdateCommentResponse'], ParentType, ContextType, RequireFields<MutationUpdateCommentArgs, 'id' | 'input'>>;
  updateGameLog?: Resolver<ResolversTypes['UpdateGameLogResponse'], ParentType, ContextType, RequireFields<MutationUpdateGameLogArgs, 'id' | 'input'>>;
  updateUserProfile?: Resolver<ResolversTypes['UpdateUserProfileResponse'], ParentType, ContextType, RequireFields<MutationUpdateUserProfileArgs, 'input'>>;
};

export type PageInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Player'] = ResolversParentTypes['Player']> = {
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  affiliation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  birth?: Resolver<Maybe<ResolversTypes['PlayerBirth']>, ParentType, ContextType>;
  college?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  games?: Resolver<Array<ResolversTypes['Game']>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['PlayerHeight']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  jersey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  leagues?: Resolver<Maybe<ResolversTypes['PlayerLeagues']>, ParentType, ContextType>;
  nba?: Resolver<Maybe<ResolversTypes['PlayerNba']>, ParentType, ContextType>;
  position?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  seasonsActive?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  seasons_active?: Resolver<Maybe<Array<ResolversTypes['PlayerSeason']>>, ParentType, ContextType>;
  stats?: Resolver<Array<ResolversTypes['PlayerStats']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  weight?: Resolver<Maybe<ResolversTypes['PlayerWeight']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerBirthResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerBirth'] = ResolversParentTypes['PlayerBirth']> = {
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerConnection'] = ResolversParentTypes['PlayerConnection']> = {
  edges?: Resolver<Array<ResolversTypes['PlayerEdge']>, ParentType, ContextType>;
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['Player']>, ParentType, ContextType>;
  nextCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerEdge'] = ResolversParentTypes['PlayerEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Player'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerHeightResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerHeight'] = ResolversParentTypes['PlayerHeight']> = {
  feets?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  inches?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  meters?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerLeaguesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerLeagues'] = ResolversParentTypes['PlayerLeagues']> = {
  standard?: Resolver<Maybe<ResolversTypes['PlayerStandard']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerNbaResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerNba'] = ResolversParentTypes['PlayerNba']> = {
  pro?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  start?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerSeasonResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerSeason'] = ResolversParentTypes['PlayerSeason']> = {
  season?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  teams?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerStandardResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerStandard'] = ResolversParentTypes['PlayerStandard']> = {
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  jersey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pos?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerStatsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerStats'] = ResolversParentTypes['PlayerStats']> = {
  assists?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  blocks?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fieldGoals?: Resolver<ResolversTypes['StatPercentage'], ParentType, ContextType>;
  fouls?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  freeThrows?: Resolver<ResolversTypes['StatPercentage'], ParentType, ContextType>;
  gameId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  minutes?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  playerId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  rebounds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  steals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  threePointers?: Resolver<ResolversTypes['StatPercentage'], ParentType, ContextType>;
  turnovers?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerWeightResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerWeight'] = ResolversParentTypes['PlayerWeight']> = {
  kilograms?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pounds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  comments?: Resolver<ResolversTypes['CommentConnection'], ParentType, ContextType, Partial<QueryCommentsArgs>>;
  game?: Resolver<Maybe<ResolversTypes['Game']>, ParentType, ContextType, RequireFields<QueryGameArgs, 'id'>>;
  gameLog?: Resolver<Maybe<ResolversTypes['GameLog']>, ParentType, ContextType, RequireFields<QueryGameLogArgs, 'id'>>;
  gameLogs?: Resolver<ResolversTypes['GameLogConnection'], ParentType, ContextType, Partial<QueryGameLogsArgs>>;
  games?: Resolver<ResolversTypes['GameConnection'], ParentType, ContextType, Partial<QueryGamesArgs>>;
  liveGames?: Resolver<ResolversTypes['GameConnection'], ParentType, ContextType, Partial<QueryLiveGamesArgs>>;
  me?: Resolver<Maybe<ResolversTypes['UserSummary']>, ParentType, ContextType>;
  player?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType, RequireFields<QueryPlayerArgs, 'id'>>;
  playerStats?: Resolver<Maybe<ResolversTypes['PlayerStats']>, ParentType, ContextType, RequireFields<QueryPlayerStatsArgs, 'gameId' | 'playerId'>>;
  players?: Resolver<ResolversTypes['PlayerConnection'], ParentType, ContextType, Partial<QueryPlayersArgs>>;
  reactions?: Resolver<Array<ResolversTypes['Reaction']>, ParentType, ContextType, RequireFields<QueryReactionsArgs, 'targetId' | 'targetType'>>;
  searchUsers?: Resolver<ResolversTypes['UserConnection'], ParentType, ContextType, Partial<QuerySearchUsersArgs>>;
  team?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType, RequireFields<QueryTeamArgs, 'id'>>;
  teamGameStats?: Resolver<Maybe<ResolversTypes['TeamStats']>, ParentType, ContextType, RequireFields<QueryTeamGameStatsArgs, 'gameId' | 'teamId'>>;
  teamH2H?: Resolver<Maybe<ResolversTypes['TeamH2H']>, ParentType, ContextType, RequireFields<QueryTeamH2HArgs, 'opponentId' | 'teamId'>>;
  teamStats?: Resolver<Maybe<ResolversTypes['TeamStats']>, ParentType, ContextType, RequireFields<QueryTeamStatsArgs, 'season' | 'teamId'>>;
  teams?: Resolver<ResolversTypes['TeamConnection'], ParentType, ContextType, Partial<QueryTeamsArgs>>;
  user?: Resolver<Maybe<ResolversTypes['UserSummary']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<Array<ResolversTypes['UserSummary']>, ParentType, ContextType, Partial<QueryUsersArgs>>;
};

export type ReactionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Reaction'] = ResolversParentTypes['Reaction']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  emoji?: Resolver<ResolversTypes['ReactionEmojiType'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  targetId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  targetType?: Resolver<ResolversTypes['ParentType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['UserSummary'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RejectFriendRequestResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RejectFriendRequestResponse'] = ResolversParentTypes['RejectFriendRequestResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  friendship?: Resolver<Maybe<ResolversTypes['Friendship']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RemoveFriendResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RemoveFriendResponse'] = ResolversParentTypes['RemoveFriendResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SendFriendRequestResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SendFriendRequestResponse'] = ResolversParentTypes['SendFriendRequestResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  friendship?: Resolver<Maybe<ResolversTypes['Friendship']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SeriesScoreResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SeriesScore'] = ResolversParentTypes['SeriesScore']> = {
  loss?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  win?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StatPercentageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['StatPercentage'] = ResolversParentTypes['StatPercentage']> = {
  attempted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  made?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  percentage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Team'] = ResolversParentTypes['Team']> = {
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  conference?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  division?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  logo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  logoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nickname?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamConnection'] = ResolversParentTypes['TeamConnection']> = {
  edges?: Resolver<Array<ResolversTypes['TeamEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamEdge'] = ResolversParentTypes['TeamEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamH2HResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamH2H'] = ResolversParentTypes['TeamH2H']> = {
  lastTenGames?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  losses?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  opponentId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  winPercentage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  wins?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamScoreResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamScore'] = ResolversParentTypes['TeamScore']> = {
  linescore?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  loss?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  series?: Resolver<ResolversTypes['SeriesScore'], ParentType, ContextType>;
  win?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamStatsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamStats'] = ResolversParentTypes['TeamStats']> = {
  assists?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  assistsPerGame?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  blocks?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  blocksPerGame?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  conferenceStanding?: Resolver<Maybe<ResolversTypes['ConferenceStanding']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  defReb?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fga?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fgm?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fgp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fieldGoalPercentage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  foulsPerGame?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  freeThrowPercentage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  fta?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ftm?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ftp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gamesPlayed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  longestRun?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  losses?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pFouls?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  plusMinus?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pointsPerGame?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  reboundsPerGame?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  season?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  steals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  stealsPerGame?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  threePointPercentage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  totReb?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tpa?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tpm?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tpp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  turnovers?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  turnoversPerGame?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  wins?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamSummaryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamSummary'] = ResolversParentTypes['TeamSummary']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  logo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nickname?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateCommentResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateCommentResponse'] = ResolversParentTypes['UpdateCommentResponse']> = {
  comment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateGameLogResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateGameLogResponse'] = ResolversParentTypes['UpdateGameLogResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  gameLog?: Resolver<Maybe<ResolversTypes['GameLog']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateUserProfileResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateUserProfileResponse'] = ResolversParentTypes['UpdateUserProfileResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['UserSummary']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserConnection'] = ResolversParentTypes['UserConnection']> = {
  edges?: Resolver<Array<ResolversTypes['UserEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserEdge'] = ResolversParentTypes['UserEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['UserSummary'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSummaryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserSummary'] = ResolversParentTypes['UserSummary']> = {
  emailAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  AcceptFriendRequestResponse?: AcceptFriendRequestResponseResolvers<ContextType>;
  Any?: GraphQLScalarType;
  Arena?: ArenaResolvers<ContextType>;
  AuthenticationError?: AuthenticationErrorResolvers<ContextType>;
  AuthorizationError?: AuthorizationErrorResolvers<ContextType>;
  BusinessLogicError?: BusinessLogicErrorResolvers<ContextType>;
  Comment?: CommentResolvers<ContextType>;
  CommentConnection?: CommentConnectionResolvers<ContextType>;
  CommentEdge?: CommentEdgeResolvers<ContextType>;
  ConferenceStanding?: ConferenceStandingResolvers<ContextType>;
  CreateCommentResponse?: CreateCommentResponseResolvers<ContextType>;
  CreateGameLogResponse?: CreateGameLogResponseResolvers<ContextType>;
  CreateGameResponse?: CreateGameResponseResolvers<ContextType>;
  CreateReactionResponse?: CreateReactionResponseResolvers<ContextType>;
  DBUser?: DbUserResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DeleteCommentResponse?: DeleteCommentResponseResolvers<ContextType>;
  DeleteGameLogResponse?: DeleteGameLogResponseResolvers<ContextType>;
  DeleteReactionResponse?: DeleteReactionResponseResolvers<ContextType>;
  ErrorResult?: ErrorResultResolvers<ContextType>;
  Friendship?: FriendshipResolvers<ContextType>;
  Game?: GameResolvers<ContextType>;
  GameConnection?: GameConnectionResolvers<ContextType>;
  GameDate?: GameDateResolvers<ContextType>;
  GameEdge?: GameEdgeResolvers<ContextType>;
  GameLog?: GameLogResolvers<ContextType>;
  GameLogConnection?: GameLogConnectionResolvers<ContextType>;
  GameLogEdge?: GameLogEdgeResolvers<ContextType>;
  GamePeriods?: GamePeriodsResolvers<ContextType>;
  GameScores?: GameScoresResolvers<ContextType>;
  GameStatus?: GameStatusResolvers<ContextType>;
  GameTeams?: GameTeamsResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Player?: PlayerResolvers<ContextType>;
  PlayerBirth?: PlayerBirthResolvers<ContextType>;
  PlayerConnection?: PlayerConnectionResolvers<ContextType>;
  PlayerEdge?: PlayerEdgeResolvers<ContextType>;
  PlayerHeight?: PlayerHeightResolvers<ContextType>;
  PlayerLeagues?: PlayerLeaguesResolvers<ContextType>;
  PlayerNba?: PlayerNbaResolvers<ContextType>;
  PlayerSeason?: PlayerSeasonResolvers<ContextType>;
  PlayerStandard?: PlayerStandardResolvers<ContextType>;
  PlayerStats?: PlayerStatsResolvers<ContextType>;
  PlayerWeight?: PlayerWeightResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Reaction?: ReactionResolvers<ContextType>;
  RejectFriendRequestResponse?: RejectFriendRequestResponseResolvers<ContextType>;
  RemoveFriendResponse?: RemoveFriendResponseResolvers<ContextType>;
  SendFriendRequestResponse?: SendFriendRequestResponseResolvers<ContextType>;
  SeriesScore?: SeriesScoreResolvers<ContextType>;
  StatPercentage?: StatPercentageResolvers<ContextType>;
  Team?: TeamResolvers<ContextType>;
  TeamConnection?: TeamConnectionResolvers<ContextType>;
  TeamEdge?: TeamEdgeResolvers<ContextType>;
  TeamH2H?: TeamH2HResolvers<ContextType>;
  TeamScore?: TeamScoreResolvers<ContextType>;
  TeamStats?: TeamStatsResolvers<ContextType>;
  TeamSummary?: TeamSummaryResolvers<ContextType>;
  UpdateCommentResponse?: UpdateCommentResponseResolvers<ContextType>;
  UpdateGameLogResponse?: UpdateGameLogResponseResolvers<ContextType>;
  UpdateUserProfileResponse?: UpdateUserProfileResponseResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  UserEdge?: UserEdgeResolvers<ContextType>;
  UserSummary?: UserSummaryResolvers<ContextType>;
};

