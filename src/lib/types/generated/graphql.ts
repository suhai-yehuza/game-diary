/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Any: { input: any; output: any; }
  DateTime: { input: any; output: any; }
};

export type AcceptFriendRequestResponse = {
  __typename?: 'AcceptFriendRequestResponse';
  errors?: Maybe<Array<ErrorResult>>;
  friendship?: Maybe<Friendship>;
};

export type Arena = {
  __typename?: 'Arena';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  state?: Maybe<Scalars['String']['output']>;
};

export type AuthenticationError = {
  __typename?: 'AuthenticationError';
  message: Scalars['String']['output'];
};

export type AuthorizationError = {
  __typename?: 'AuthorizationError';
  message: Scalars['String']['output'];
  requiredRole?: Maybe<Scalars['String']['output']>;
};

export type BusinessLogicError = {
  __typename?: 'BusinessLogicError';
  code: Scalars['String']['output'];
  details?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
};

export enum Classification {
  BoxScore = 'BOX_SCORE',
  Highlights = 'HIGHLIGHTS',
  News = 'NEWS',
  Other = 'OTHER',
  Recap = 'RECAP',
  Social = 'SOCIAL',
  Stats = 'STATS',
  Watched = 'WATCHED'
}

export type Comment = {
  __typename?: 'Comment';
  childComments: CommentConnection;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  depth: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  parentId: Scalars['ID']['output'];
  parentType: ParentType;
  reactions: Array<Reaction>;
  updatedAt: Scalars['DateTime']['output'];
  user: UserSummary;
  userId: Scalars['ID']['output'];
};

export type CommentConnection = {
  __typename?: 'CommentConnection';
  edges: Array<CommentEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CommentEdge = {
  __typename?: 'CommentEdge';
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
  __typename?: 'ConferenceStanding';
  loss: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  win: Scalars['Int']['output'];
};

export type CreateCommentInput = {
  content: Scalars['String']['input'];
  parentId: Scalars['ID']['input'];
  parentType: ParentType;
};

export type CreateCommentResponse = {
  __typename?: 'CreateCommentResponse';
  comment?: Maybe<Comment>;
  errors?: Maybe<Array<ErrorResult>>;
};

export type CreateGameInput = {
  awayTeamId: Scalars['String']['input'];
  date: Scalars['DateTime']['input'];
  gameType: Scalars['String']['input'];
  homeTeamId: Scalars['String']['input'];
  league: Scalars['String']['input'];
  nbaGameId?: InputMaybe<Scalars['ID']['input']>;
  season: Scalars['Int']['input'];
  stage: Scalars['Int']['input'];
};

export type CreateGameLogInput = {
  classification: Classification;
  gameId: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  ratingForGame: Scalars['Int']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  watchedDate?: InputMaybe<Scalars['DateTime']['input']>;
  watchedLocation?: InputMaybe<Scalars['String']['input']>;
  watchedScope?: InputMaybe<Scalars['String']['input']>;
  watchedSetting?: InputMaybe<Scalars['String']['input']>;
};

export type CreateGameLogResponse = {
  __typename?: 'CreateGameLogResponse';
  errors?: Maybe<Array<ErrorResult>>;
  gameLog?: Maybe<GameLog>;
};

export type CreateGameResponse = {
  __typename?: 'CreateGameResponse';
  errors?: Maybe<Array<ErrorResult>>;
  game?: Maybe<Game>;
};

export type CreateReactionInput = {
  emoji: ReactionEmojiType;
  targetId: Scalars['ID']['input'];
  targetType: ParentType;
};

export type CreateReactionResponse = {
  __typename?: 'CreateReactionResponse';
  errors?: Maybe<Array<ErrorResult>>;
  reaction?: Maybe<Reaction>;
};

export type DbUser = {
  __typename?: 'DBUser';
  banned?: Maybe<Scalars['Boolean']['output']>;
  comments: Array<Comment>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  emailAddress?: Maybe<Scalars['String']['output']>;
  email_verification_strategy?: Maybe<Scalars['String']['output']>;
  email_verified?: Maybe<Scalars['Boolean']['output']>;
  external_id?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  friendships: Array<Friendship>;
  gameLogs: Array<GameLog>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  inboundFriendshipIds?: Maybe<Array<Scalars['String']['output']>>;
  initiatedFriendships: Array<Friendship>;
  lastName?: Maybe<Scalars['String']['output']>;
  last_sign_in_at?: Maybe<Scalars['DateTime']['output']>;
  outboundFriendshipIds?: Maybe<Array<Scalars['String']['output']>>;
  password_enabled?: Maybe<Scalars['Boolean']['output']>;
  reactions: Array<Reaction>;
  two_factor_enabled?: Maybe<Scalars['Boolean']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type DateRangeInput = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start: Scalars['DateTime']['input'];
};

export type DeleteCommentResponse = {
  __typename?: 'DeleteCommentResponse';
  errors?: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type DeleteGameLogResponse = {
  __typename?: 'DeleteGameLogResponse';
  errors?: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type DeleteReactionResponse = {
  __typename?: 'DeleteReactionResponse';
  errors?: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type ErrorResult = {
  __typename?: 'ErrorResult';
  code?: Maybe<Scalars['String']['output']>;
  field?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
};

export type Friendship = {
  __typename?: 'Friendship';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  initiator: UserSummary;
  recipient: UserSummary;
  status: FriendshipStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export enum FriendshipStatus {
  Accepted = 'ACCEPTED',
  Blocked = 'BLOCKED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type Game = {
  __typename?: 'Game';
  arena?: Maybe<Arena>;
  awayTeamId: Scalars['String']['output'];
  awayTeamScore?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  date: GameDate;
  gameType: Scalars['String']['output'];
  homeTeamId: Scalars['String']['output'];
  homeTeamScore?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isCompleted: Scalars['Boolean']['output'];
  leadChanges?: Maybe<Scalars['Int']['output']>;
  league?: Maybe<Scalars['String']['output']>;
  nbaGameId?: Maybe<Scalars['ID']['output']>;
  nugget?: Maybe<Scalars['String']['output']>;
  officials: Array<Scalars['String']['output']>;
  periods: GamePeriods;
  scores: GameScores;
  season?: Maybe<Scalars['Int']['output']>;
  stage?: Maybe<Scalars['Int']['output']>;
  status: GameStatus;
  teams: GameTeams;
  timesTied?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type GameConnection = {
  __typename?: 'GameConnection';
  edges: Array<GameEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GameDate = {
  __typename?: 'GameDate';
  duration?: Maybe<Scalars['Int']['output']>;
  end?: Maybe<Scalars['DateTime']['output']>;
  start: Scalars['DateTime']['output'];
};

export type GameEdge = {
  __typename?: 'GameEdge';
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
  __typename?: 'GameLog';
  classification: Classification;
  comments: CommentConnection;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  game: Game;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  ratingForGame: Scalars['Int']['output'];
  reactions: Array<Reaction>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  updatedAt: Scalars['DateTime']['output'];
  user: UserSummary;
  watchedDate?: Maybe<Scalars['DateTime']['output']>;
  watchedLocation?: Maybe<Scalars['String']['output']>;
  watchedScope?: Maybe<Scalars['String']['output']>;
  watchedSetting?: Maybe<Scalars['String']['output']>;
};

export type GameLogConnection = {
  __typename?: 'GameLogConnection';
  edges: Array<GameLogEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GameLogEdge = {
  __typename?: 'GameLogEdge';
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
  __typename?: 'GamePeriods';
  current: Scalars['Int']['output'];
  endOfPeriod: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type GameScores = {
  __typename?: 'GameScores';
  home: TeamScore;
  visitors: TeamScore;
};

export type GameStatus = {
  __typename?: 'GameStatus';
  clock?: Maybe<Scalars['String']['output']>;
  halftime: Scalars['Boolean']['output'];
  long: Scalars['String']['output'];
  short: Scalars['String']['output'];
};

export enum GameStatusEnum {
  Cancelled = 'CANCELLED',
  Finished = 'FINISHED',
  Live = 'LIVE',
  Postponed = 'POSTPONED',
  Scheduled = 'SCHEDULED'
}

export type GameTeams = {
  __typename?: 'GameTeams';
  home: TeamSummary;
  visitors: TeamSummary;
};

export type IPlayerFilters = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  team?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['String']['input']>;
};

export type IPlayerStats = {
  __typename?: 'IPlayerStats';
  assists?: Maybe<Scalars['Int']['output']>;
  blocks?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  fieldGoalsAttempted?: Maybe<Scalars['Int']['output']>;
  fieldGoalsMade?: Maybe<Scalars['Int']['output']>;
  fouls?: Maybe<Scalars['Int']['output']>;
  freeThrowsAttempted?: Maybe<Scalars['Int']['output']>;
  freeThrowsMade?: Maybe<Scalars['Int']['output']>;
  gameId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  minutes?: Maybe<Scalars['String']['output']>;
  playerId: Scalars['ID']['output'];
  points?: Maybe<Scalars['Int']['output']>;
  rebounds?: Maybe<Scalars['Int']['output']>;
  steals?: Maybe<Scalars['Int']['output']>;
  teamId: Scalars['ID']['output'];
  threePointersAttempted?: Maybe<Scalars['Int']['output']>;
  threePointersMade?: Maybe<Scalars['Int']['output']>;
  turnovers?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ITeamH2H = {
  __typename?: 'ITeamH2H';
  lastTenGames?: Maybe<Scalars['String']['output']>;
  losses: Scalars['Int']['output'];
  wins: Scalars['Int']['output'];
};

export type ITeamStats = {
  __typename?: 'ITeamStats';
  assists: Scalars['Int']['output'];
  assistsPerGame: Scalars['Float']['output'];
  biggestLead: Scalars['Int']['output'];
  blocks: Scalars['Int']['output'];
  blocksPerGame: Scalars['Float']['output'];
  fastBreakPoints: Scalars['Int']['output'];
  fgp: Scalars['Float']['output'];
  ftp: Scalars['Float']['output'];
  games: Scalars['Int']['output'];
  longestRun: Scalars['Int']['output'];
  pFouls: Scalars['Int']['output'];
  plusMinus: Scalars['Int']['output'];
  points: Scalars['Int']['output'];
  pointsInPaint: Scalars['Int']['output'];
  pointsOffTurnovers: Scalars['Int']['output'];
  pointsPerGame: Scalars['Float']['output'];
  reboundsPerGame: Scalars['Float']['output'];
  secondChancePoints: Scalars['Int']['output'];
  steals: Scalars['Int']['output'];
  stealsPerGame: Scalars['Float']['output'];
  totReb: Scalars['Int']['output'];
  tpp: Scalars['Float']['output'];
  turnovers: Scalars['Int']['output'];
  turnoversPerGame: Scalars['Float']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
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

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PaginationInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export enum ParentType {
  Comment = 'comment',
  GameLog = 'game_log'
}

export type Player = {
  __typename?: 'Player';
  active?: Maybe<Scalars['Boolean']['output']>;
  affiliation?: Maybe<Scalars['String']['output']>;
  birth?: Maybe<PlayerBirth>;
  college?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  height?: Maybe<PlayerHeight>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  leagues?: Maybe<PlayerLeagues>;
  nba?: Maybe<PlayerNba>;
  seasons_active?: Maybe<Array<PlayerSeason>>;
  weight?: Maybe<PlayerWeight>;
};

export type PlayerBirth = {
  __typename?: 'PlayerBirth';
  country?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
};

export type PlayerConnection = {
  __typename?: 'PlayerConnection';
  edges: Array<PlayerEdge>;
  hasMore: Scalars['Boolean']['output'];
  totalCount: Scalars['Int']['output'];
};

export type PlayerEdge = {
  __typename?: 'PlayerEdge';
  cursor: Scalars['String']['output'];
  node: Player;
};

export type PlayerHeight = {
  __typename?: 'PlayerHeight';
  feets?: Maybe<Scalars['String']['output']>;
  inches?: Maybe<Scalars['String']['output']>;
  meters?: Maybe<Scalars['String']['output']>;
};

export type PlayerLeagues = {
  __typename?: 'PlayerLeagues';
  standard?: Maybe<PlayerStandard>;
};

export type PlayerNba = {
  __typename?: 'PlayerNba';
  pro?: Maybe<Scalars['Int']['output']>;
  start?: Maybe<Scalars['Int']['output']>;
};

export type PlayerSeason = {
  __typename?: 'PlayerSeason';
  season?: Maybe<Scalars['String']['output']>;
  teams?: Maybe<Array<Scalars['String']['output']>>;
};

export type PlayerStandard = {
  __typename?: 'PlayerStandard';
  active?: Maybe<Scalars['Boolean']['output']>;
  jersey?: Maybe<Scalars['String']['output']>;
  pos?: Maybe<Scalars['String']['output']>;
};

export type PlayerWeight = {
  __typename?: 'PlayerWeight';
  kilograms?: Maybe<Scalars['String']['output']>;
  pounds?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  comments: CommentConnection;
  game?: Maybe<Game>;
  gameLog?: Maybe<GameLog>;
  gameLogs: GameLogConnection;
  games: GameConnection;
  liveGames: GameConnection;
  me?: Maybe<UserSummary>;
  player?: Maybe<Player>;
  playerStats?: Maybe<IPlayerStats>;
  players: PlayerConnection;
  reactions: Array<Reaction>;
  searchUsers: UserConnection;
  team?: Maybe<Team>;
  teamGameStats?: Maybe<ITeamStats>;
  teamH2H?: Maybe<ITeamH2H>;
  teamStats?: Maybe<ITeamStats>;
  teams: TeamConnection;
  user?: Maybe<UserSummary>;
  users: Array<UserSummary>;
};


export type QueryCommentsArgs = {
  filters?: InputMaybe<CommentFilters>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryGameArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGameLogArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGameLogsArgs = {
  filters?: InputMaybe<GameLogFilters>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryGamesArgs = {
  filters?: InputMaybe<GameFilters>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryLiveGamesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPlayerArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPlayerStatsArgs = {
  gameId: Scalars['ID']['input'];
  playerId: Scalars['ID']['input'];
};


export type QueryPlayersArgs = {
  filters?: InputMaybe<IPlayerFilters>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryReactionsArgs = {
  targetId: Scalars['ID']['input'];
  targetType: ParentType;
};


export type QuerySearchUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<UserSearchFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
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
  filters?: InputMaybe<TeamFilters>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  filters?: InputMaybe<UserFilters>;
  pagination?: InputMaybe<PaginationInput>;
};

export type Reaction = {
  __typename?: 'Reaction';
  createdAt: Scalars['DateTime']['output'];
  emoji: ReactionEmojiType;
  id: Scalars['ID']['output'];
  targetId: Scalars['ID']['output'];
  targetType: ParentType;
  updatedAt: Scalars['DateTime']['output'];
  user: UserSummary;
  userId: Scalars['ID']['output'];
};

export enum ReactionEmojiType {
  Angry = 'ANGRY',
  Baseball = 'BASEBALL',
  Basketball = 'BASKETBALL',
  Bullseye = 'BULLSEYE',
  Clap = 'CLAP',
  Eyes = 'EYES',
  Fire = 'FIRE',
  Football = 'FOOTBALL',
  Goat = 'GOAT',
  Golf = 'GOLF',
  Haha = 'HAHA',
  Like = 'LIKE',
  Love = 'LOVE',
  Muscle = 'MUSCLE',
  Rocket = 'ROCKET',
  Sad = 'SAD',
  Soccer = 'SOCCER',
  Tennis = 'TENNIS',
  ThumbsDown = 'THUMBS_DOWN',
  Wow = 'WOW'
}

export type RejectFriendRequestResponse = {
  __typename?: 'RejectFriendRequestResponse';
  errors?: Maybe<Array<ErrorResult>>;
  friendship?: Maybe<Friendship>;
};

export type RemoveFriendResponse = {
  __typename?: 'RemoveFriendResponse';
  errors?: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type SendFriendRequestResponse = {
  __typename?: 'SendFriendRequestResponse';
  errors?: Maybe<Array<ErrorResult>>;
  friendship?: Maybe<Friendship>;
};

export type SeriesScore = {
  __typename?: 'SeriesScore';
  loss: Scalars['Int']['output'];
  win: Scalars['Int']['output'];
};

export type Team = {
  __typename?: 'Team';
  city?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  conference?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  division?: Maybe<Scalars['String']['output']>;
  h2h?: Maybe<ITeamH2H>;
  id: Scalars['ID']['output'];
  league?: Maybe<Scalars['String']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nickname: Scalars['String']['output'];
  season?: Maybe<Scalars['Int']['output']>;
  standings?: Maybe<Array<ConferenceStanding>>;
  state?: Maybe<Scalars['String']['output']>;
  stats?: Maybe<ITeamStats>;
};

export type TeamConnection = {
  __typename?: 'TeamConnection';
  edges: Array<TeamEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type TeamEdge = {
  __typename?: 'TeamEdge';
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

export type TeamScore = {
  __typename?: 'TeamScore';
  linescore: Array<Scalars['Int']['output']>;
  loss: Scalars['Int']['output'];
  points: Scalars['Int']['output'];
  series: SeriesScore;
  win: Scalars['Int']['output'];
};

export type TeamSummary = {
  __typename?: 'TeamSummary';
  code: Scalars['String']['output'];
  id: Scalars['String']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nickname: Scalars['String']['output'];
};

export type UpdateCommentInput = {
  content: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};

export type UpdateCommentResponse = {
  __typename?: 'UpdateCommentResponse';
  comment?: Maybe<Comment>;
  errors?: Maybe<Array<ErrorResult>>;
};

export type UpdateGameLogInput = {
  classification?: InputMaybe<Classification>;
  id: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  ratingForGame?: InputMaybe<Scalars['Int']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  watchedDate?: InputMaybe<Scalars['DateTime']['input']>;
  watchedLocation?: InputMaybe<Scalars['String']['input']>;
  watchedScope?: InputMaybe<Scalars['String']['input']>;
  watchedSetting?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGameLogResponse = {
  __typename?: 'UpdateGameLogResponse';
  errors?: Maybe<Array<ErrorResult>>;
  gameLog?: Maybe<GameLog>;
};

export type UpdateUserProfileResponse = {
  __typename?: 'UpdateUserProfileResponse';
  errors?: Maybe<Array<ErrorResult>>;
  user?: Maybe<UserSummary>;
};

export type UserConnection = {
  __typename?: 'UserConnection';
  edges: Array<UserEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type UserEdge = {
  __typename?: 'UserEdge';
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
  __typename?: 'UserSummary';
  emailAddress?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  lastName: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type CreateGameMutationVariables = Exact<{
  input: CreateGameInput;
}>;


export type CreateGameMutation = { __typename?: 'Mutation', createGame: { __typename?: 'CreateGameResponse', game?: { __typename?: 'Game', id: string, league?: string | null, season?: number | null, officials: Array<string>, timesTied?: number | null, leadChanges?: number | null, nugget?: string | null, createdAt: any, updatedAt: any, date: { __typename?: 'GameDate', start: any, end?: any | null, duration?: number | null }, status: { __typename?: 'GameStatus', clock?: string | null, halftime: boolean, short: string, long: string }, periods: { __typename?: 'GamePeriods', current: number, total: number, endOfPeriod: boolean }, arena?: { __typename?: 'Arena', name: string, city?: string | null, state?: string | null, country?: string | null } | null, teams: { __typename?: 'GameTeams', home: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null }, visitors: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null } }, scores: { __typename?: 'GameScores', home: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } }, visitors: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } } } } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type CreateGameLogMutationVariables = Exact<{
  input: CreateGameLogInput;
}>;


export type CreateGameLogMutation = { __typename?: 'Mutation', createGameLog: { __typename?: 'CreateGameLogResponse', gameLog?: { __typename?: 'GameLog', id: string, watchedSetting?: string | null, watchedDate?: any | null, ratingForGame: number, notes?: string | null, tags?: Array<string> | null, classification: Classification, createdAt: any, updatedAt: any, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, imageUrl?: string | null }, game: { __typename?: 'Game', id: string, league?: string | null, season?: number | null, officials: Array<string>, timesTied?: number | null, leadChanges?: number | null, nugget?: string | null, createdAt: any, updatedAt: any, date: { __typename?: 'GameDate', start: any, end?: any | null, duration?: number | null }, status: { __typename?: 'GameStatus', clock?: string | null, halftime: boolean, short: string, long: string }, arena?: { __typename?: 'Arena', name: string, city?: string | null, state?: string | null, country?: string | null } | null, periods: { __typename?: 'GamePeriods', current: number, total: number, endOfPeriod: boolean }, teams: { __typename?: 'GameTeams', home: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null }, visitors: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null } }, scores: { __typename?: 'GameScores', home: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } }, visitors: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } } } } } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type UpdateGameLogMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: CreateGameLogInput;
}>;


export type UpdateGameLogMutation = { __typename?: 'Mutation', updateGameLog: { __typename?: 'UpdateGameLogResponse', gameLog?: { __typename?: 'GameLog', id: string, watchedSetting?: string | null, watchedDate?: any | null, ratingForGame: number, notes?: string | null, tags?: Array<string> | null, classification: Classification, createdAt: any, updatedAt: any, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, imageUrl?: string | null }, game: { __typename?: 'Game', id: string } } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type DeleteGameLogMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteGameLogMutation = { __typename?: 'Mutation', deleteGameLog: { __typename?: 'DeleteGameLogResponse', success: boolean, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type CreateCommentMutationVariables = Exact<{
  input: CreateCommentInput;
}>;


export type CreateCommentMutation = { __typename?: 'Mutation', createComment: { __typename?: 'CreateCommentResponse', comment?: { __typename?: 'Comment', id: string, userId: string, parentId: string, parentType: ParentType, content: string, createdAt: any, updatedAt: any, deletedAt?: any | null, depth: number, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: ReactionEmojiType, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null } }>, childComments: { __typename?: 'CommentConnection', totalCount: number, edges: Array<{ __typename?: 'CommentEdge', node: { __typename?: 'Comment', id: string, userId: string, parentId: string, parentType: ParentType, content: string, createdAt: any, updatedAt: any, deletedAt?: any | null, depth: number, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: ReactionEmojiType, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null } }> } }> } } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type UpdateCommentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: CreateCommentInput;
}>;


export type UpdateCommentMutation = { __typename?: 'Mutation', updateComment: { __typename?: 'UpdateCommentResponse', comment?: { __typename?: 'Comment', id: string, userId: string, parentId: string, parentType: ParentType, content: string, createdAt: any, updatedAt: any, deletedAt?: any | null, depth: number, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: ReactionEmojiType, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null } }>, childComments: { __typename?: 'CommentConnection', totalCount: number, edges: Array<{ __typename?: 'CommentEdge', node: { __typename?: 'Comment', id: string, userId: string, parentId: string, parentType: ParentType, content: string, createdAt: any, updatedAt: any, deletedAt?: any | null, depth: number, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: ReactionEmojiType, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null } }> } }> } } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type DeleteCommentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteCommentMutation = { __typename?: 'Mutation', deleteComment: { __typename?: 'DeleteCommentResponse', success: boolean, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type CreateReactionMutationVariables = Exact<{
  input: CreateReactionInput;
}>;


export type CreateReactionMutation = { __typename?: 'Mutation', createReaction: { __typename?: 'CreateReactionResponse', reaction?: { __typename?: 'Reaction', id: string, emoji: ReactionEmojiType, targetId: string, targetType: ParentType, userId: string, createdAt: any, updatedAt: any, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null } } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type DeleteReactionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteReactionMutation = { __typename?: 'Mutation', deleteReaction: { __typename?: 'DeleteReactionResponse', success: boolean, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type SendFriendRequestMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type SendFriendRequestMutation = { __typename?: 'Mutation', sendFriendRequest: { __typename?: 'SendFriendRequestResponse', friendship?: { __typename?: 'Friendship', id: string, status: FriendshipStatus, createdAt: any, updatedAt: any, initiator: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null }, recipient: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null } } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type AcceptFriendRequestMutationVariables = Exact<{
  friendshipId: Scalars['ID']['input'];
}>;


export type AcceptFriendRequestMutation = { __typename?: 'Mutation', acceptFriendRequest: { __typename?: 'AcceptFriendRequestResponse', friendship?: { __typename?: 'Friendship', id: string, status: FriendshipStatus, createdAt: any, updatedAt: any, initiator: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null }, recipient: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null } } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type RejectFriendRequestMutationVariables = Exact<{
  friendshipId: Scalars['ID']['input'];
}>;


export type RejectFriendRequestMutation = { __typename?: 'Mutation', rejectFriendRequest: { __typename?: 'RejectFriendRequestResponse', friendship?: { __typename?: 'Friendship', id: string, status: FriendshipStatus, createdAt: any, updatedAt: any, initiator: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null }, recipient: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null } } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type RemoveFriendMutationVariables = Exact<{
  friendshipId: Scalars['ID']['input'];
}>;


export type RemoveFriendMutation = { __typename?: 'Mutation', removeFriend: { __typename?: 'RemoveFriendResponse', success: boolean, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type GameFragmentFragment = { __typename?: 'Game', id: string, league?: string | null, season?: number | null, officials: Array<string>, timesTied?: number | null, leadChanges?: number | null, nugget?: string | null, createdAt: any, updatedAt: any, date: { __typename?: 'GameDate', start: any, end?: any | null, duration?: number | null }, status: { __typename?: 'GameStatus', clock?: string | null, halftime: boolean, long: string, short: string }, arena?: { __typename?: 'Arena', name: string, city?: string | null, state?: string | null, country?: string | null } | null, periods: { __typename?: 'GamePeriods', current: number, total: number, endOfPeriod: boolean }, teams: { __typename?: 'GameTeams', home: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null }, visitors: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null } }, scores: { __typename?: 'GameScores', home: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } }, visitors: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } } } };

export type PlayerFragmentFragment = { __typename?: 'Player', id: string, firstName?: string | null, lastName?: string | null, college?: string | null, affiliation?: string | null, birth?: { __typename?: 'PlayerBirth', date?: string | null, country?: string | null } | null, nba?: { __typename?: 'PlayerNba', start?: number | null, pro?: number | null } | null, height?: { __typename?: 'PlayerHeight', feets?: string | null, inches?: string | null, meters?: string | null } | null, weight?: { __typename?: 'PlayerWeight', pounds?: string | null, kilograms?: string | null } | null, leagues?: { __typename?: 'PlayerLeagues', standard?: { __typename?: 'PlayerStandard', jersey?: string | null, active?: boolean | null, pos?: string | null } | null } | null, seasons_active?: Array<{ __typename?: 'PlayerSeason', season?: string | null, teams?: Array<string> | null }> | null };

export type PlayerStatsFragmentFragment = { __typename?: 'IPlayerStats', playerId: string, gameId: string, points?: number | null, assists?: number | null, rebounds?: number | null, steals?: number | null, blocks?: number | null, turnovers?: number | null, fouls?: number | null, minutes?: string | null, fieldGoalsMade?: number | null, fieldGoalsAttempted?: number | null, threePointersMade?: number | null, threePointersAttempted?: number | null, freeThrowsMade?: number | null, freeThrowsAttempted?: number | null, createdAt: any, updatedAt: any, deletedAt?: any | null };

export type BasicUserFragmentFragment = { __typename?: 'DBUser', id: string, username: string, firstName?: string | null, lastName?: string | null, emailAddress?: string | null, imageUrl?: string | null, createdAt: any, updatedAt: any, deletedAt?: any | null, comments: Array<{ __typename?: 'Comment', id: string, parentId: string, parentType: ParentType, content: string }>, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: ReactionEmojiType, targetId: string, targetType: ParentType }>, gameLogs: Array<{ __typename?: 'GameLog', id: string }>, initiatedFriendships: Array<{ __typename?: 'Friendship', id: string, status: FriendshipStatus }> };

export type UserSummaryFragmentFragment = { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null };

export type CommentFragmentFragment = { __typename?: 'Comment', id: string, userId: string, parentId: string, parentType: ParentType, content: string, createdAt: any, updatedAt: any, deletedAt?: any | null, depth: number, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: ReactionEmojiType, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null } }>, childComments: { __typename?: 'CommentConnection', totalCount: number, edges: Array<{ __typename?: 'CommentEdge', node: { __typename?: 'Comment', id: string, userId: string, parentId: string, parentType: ParentType, content: string, createdAt: any, updatedAt: any, deletedAt?: any | null, depth: number, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: ReactionEmojiType, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null } }> } }> } };

export type GameLogFragmentFragment = { __typename?: 'GameLog', id: string, watchedSetting?: string | null, watchedScope?: string | null, watchedDate?: any | null, watchedLocation?: string | null, ratingForGame: number, notes?: string | null, tags?: Array<string> | null, classification: Classification, createdAt: any, updatedAt: any, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null }, game: { __typename?: 'Game', id: string, league?: string | null, season?: number | null, officials: Array<string>, timesTied?: number | null, leadChanges?: number | null, nugget?: string | null, createdAt: any, updatedAt: any, date: { __typename?: 'GameDate', start: any, end?: any | null, duration?: number | null }, status: { __typename?: 'GameStatus', clock?: string | null, halftime: boolean, long: string, short: string }, arena?: { __typename?: 'Arena', name: string, city?: string | null, state?: string | null, country?: string | null } | null, periods: { __typename?: 'GamePeriods', current: number, total: number, endOfPeriod: boolean }, teams: { __typename?: 'GameTeams', home: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null }, visitors: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null } }, scores: { __typename?: 'GameScores', home: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } }, visitors: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } } } }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: ReactionEmojiType, userId: string, targetId: string, targetType: ParentType, createdAt: any, updatedAt: any, user: { __typename?: 'UserSummary', id: string, username: string, emailAddress?: string | null, imageUrl?: string | null } }> };

export type GetGameByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetGameByIdQuery = { __typename?: 'Query', game?: { __typename?: 'Game', id: string, league?: string | null, season?: number | null, officials: Array<string>, timesTied?: number | null, leadChanges?: number | null, nugget?: string | null, createdAt: any, updatedAt: any, date: { __typename?: 'GameDate', start: any, end?: any | null, duration?: number | null }, status: { __typename?: 'GameStatus', clock?: string | null, halftime: boolean, long: string, short: string }, arena?: { __typename?: 'Arena', name: string, city?: string | null, state?: string | null, country?: string | null } | null, periods: { __typename?: 'GamePeriods', current: number, total: number, endOfPeriod: boolean }, teams: { __typename?: 'GameTeams', home: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null }, visitors: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null } }, scores: { __typename?: 'GameScores', home: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } }, visitors: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } } } } | null };

export type GetExternalGamesQueryVariables = Exact<{
  filters?: InputMaybe<GameFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetExternalGamesQuery = { __typename?: 'Query', games: { __typename?: 'GameConnection', totalCount: number, edges: Array<{ __typename?: 'GameEdge', cursor: string, node: { __typename?: 'Game', id: string, league?: string | null, season?: number | null, officials: Array<string>, timesTied?: number | null, leadChanges?: number | null, nugget?: string | null, createdAt: any, updatedAt: any, date: { __typename?: 'GameDate', start: any, end?: any | null, duration?: number | null }, status: { __typename?: 'GameStatus', clock?: string | null, halftime: boolean, long: string, short: string }, arena?: { __typename?: 'Arena', name: string, city?: string | null, state?: string | null, country?: string | null } | null, periods: { __typename?: 'GamePeriods', current: number, total: number, endOfPeriod: boolean }, teams: { __typename?: 'GameTeams', home: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null }, visitors: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null } }, scores: { __typename?: 'GameScores', home: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } }, visitors: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } } } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type GetTeamsQueryVariables = Exact<{
  filters?: InputMaybe<TeamFilters>;
}>;


export type GetTeamsQuery = { __typename?: 'Query', teams: { __typename?: 'TeamConnection', totalCount: number, edges: Array<{ __typename?: 'TeamEdge', cursor: string, node: { __typename?: 'Team', id: string, name: string, nickname: string, code: string, city?: string | null, logo?: string | null, conference?: string | null, division?: string | null } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type GetPlayersQueryVariables = Exact<{
  filters?: InputMaybe<IPlayerFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetPlayersQuery = { __typename?: 'Query', players: { __typename?: 'PlayerConnection', totalCount: number, edges: Array<{ __typename?: 'PlayerEdge', cursor: string, node: { __typename?: 'Player', id: string, firstName?: string | null, lastName?: string | null, college?: string | null, affiliation?: string | null, birth?: { __typename?: 'PlayerBirth', date?: string | null, country?: string | null } | null, nba?: { __typename?: 'PlayerNba', start?: number | null, pro?: number | null } | null, height?: { __typename?: 'PlayerHeight', feets?: string | null, inches?: string | null, meters?: string | null } | null, weight?: { __typename?: 'PlayerWeight', pounds?: string | null, kilograms?: string | null } | null, leagues?: { __typename?: 'PlayerLeagues', standard?: { __typename?: 'PlayerStandard', jersey?: string | null, active?: boolean | null, pos?: string | null } | null } | null, seasons_active?: Array<{ __typename?: 'PlayerSeason', season?: string | null, teams?: Array<string> | null }> | null } }> } };

export type GetCommentsWithFiltersQueryVariables = Exact<{
  filters?: InputMaybe<CommentFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetCommentsWithFiltersQuery = { __typename?: 'Query', comments: { __typename?: 'CommentConnection', totalCount: number, edges: Array<{ __typename?: 'CommentEdge', cursor: string, node: { __typename?: 'Comment', id: string, userId: string, parentId: string, parentType: ParentType, content: string, createdAt: any, updatedAt: any, deletedAt?: any | null, depth: number, user: { __typename?: 'UserSummary', id: string, username: string, emailAddress?: string | null, imageUrl?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: ReactionEmojiType, userId: string, targetId: string, targetType: ParentType, createdAt: any, updatedAt: any, user: { __typename?: 'UserSummary', id: string, username: string, emailAddress?: string | null, imageUrl?: string | null } }>, childComments: { __typename?: 'CommentConnection', totalCount: number, edges: Array<{ __typename?: 'CommentEdge', node: { __typename?: 'Comment', id: string, userId: string, parentId: string, parentType: ParentType, content: string, createdAt: any, updatedAt: any, deletedAt?: any | null, depth: number, user: { __typename?: 'UserSummary', id: string, username: string, emailAddress?: string | null, imageUrl?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: ReactionEmojiType, userId: string, targetId: string, targetType: ParentType, createdAt: any, updatedAt: any, user: { __typename?: 'UserSummary', id: string, username: string, emailAddress?: string | null, imageUrl?: string | null } }> } }> } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type GetUsersQueryVariables = Exact<{
  filters?: InputMaybe<UserFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetUsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null }> };

export type GetUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', user?: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null } | null };

export type GetGameLogsQueryVariables = Exact<{
  filters?: InputMaybe<GameLogFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetGameLogsQuery = { __typename?: 'Query', gameLogs: { __typename?: 'GameLogConnection', totalCount: number, edges: Array<{ __typename?: 'GameLogEdge', cursor: string, node: { __typename?: 'GameLog', id: string, watchedSetting?: string | null, watchedScope?: string | null, watchedDate?: any | null, watchedLocation?: string | null, ratingForGame: number, notes?: string | null, tags?: Array<string> | null, classification: Classification, createdAt: any, updatedAt: any, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null }, game: { __typename?: 'Game', id: string, league?: string | null, season?: number | null, officials: Array<string>, timesTied?: number | null, leadChanges?: number | null, nugget?: string | null, createdAt: any, updatedAt: any, date: { __typename?: 'GameDate', start: any, end?: any | null, duration?: number | null }, status: { __typename?: 'GameStatus', clock?: string | null, halftime: boolean, long: string, short: string }, arena?: { __typename?: 'Arena', name: string, city?: string | null, state?: string | null, country?: string | null } | null, periods: { __typename?: 'GamePeriods', current: number, total: number, endOfPeriod: boolean }, teams: { __typename?: 'GameTeams', home: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null }, visitors: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null } }, scores: { __typename?: 'GameScores', home: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } }, visitors: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } } } }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: ReactionEmojiType, userId: string, targetId: string, targetType: ParentType, createdAt: any, updatedAt: any, user: { __typename?: 'UserSummary', id: string, username: string, emailAddress?: string | null, imageUrl?: string | null } }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type GetLiveGamesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetLiveGamesQuery = { __typename?: 'Query', liveGames: { __typename?: 'GameConnection', totalCount: number, edges: Array<{ __typename?: 'GameEdge', cursor: string, node: { __typename?: 'Game', id: string, league?: string | null, season?: number | null, officials: Array<string>, timesTied?: number | null, leadChanges?: number | null, nugget?: string | null, createdAt: any, updatedAt: any, date: { __typename?: 'GameDate', start: any, end?: any | null, duration?: number | null }, status: { __typename?: 'GameStatus', clock?: string | null, halftime: boolean, long: string, short: string }, arena?: { __typename?: 'Arena', name: string, city?: string | null, state?: string | null, country?: string | null } | null, periods: { __typename?: 'GamePeriods', current: number, total: number, endOfPeriod: boolean }, teams: { __typename?: 'GameTeams', home: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null }, visitors: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null } }, scores: { __typename?: 'GameScores', home: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } }, visitors: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } } } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type GetTeamStatsQueryVariables = Exact<{
  teamId: Scalars['ID']['input'];
  season: Scalars['Int']['input'];
}>;


export type GetTeamStatsQuery = { __typename?: 'Query', teamStats?: { __typename?: 'ITeamStats', games: number, points: number, fgp: number, tpp: number, ftp: number, totReb: number, assists: number, steals: number, blocks: number, turnovers: number, pFouls: number, plusMinus: number, fastBreakPoints: number, pointsInPaint: number, biggestLead: number, secondChancePoints: number, pointsOffTurnovers: number, longestRun: number, assistsPerGame: number, blocksPerGame: number, pointsPerGame: number, reboundsPerGame: number, stealsPerGame: number, turnoversPerGame: number } | null };

export type GetGamesQueryVariables = Exact<{
  filters?: InputMaybe<GameFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetGamesQuery = { __typename?: 'Query', games: { __typename?: 'GameConnection', totalCount: number, edges: Array<{ __typename?: 'GameEdge', cursor: string, node: { __typename?: 'Game', id: string, league?: string | null, season?: number | null, officials: Array<string>, timesTied?: number | null, leadChanges?: number | null, nugget?: string | null, createdAt: any, updatedAt: any, date: { __typename?: 'GameDate', start: any, end?: any | null, duration?: number | null }, status: { __typename?: 'GameStatus', clock?: string | null, halftime: boolean, long: string, short: string }, arena?: { __typename?: 'Arena', name: string, city?: string | null, state?: string | null, country?: string | null } | null, periods: { __typename?: 'GamePeriods', current: number, total: number, endOfPeriod: boolean }, teams: { __typename?: 'GameTeams', home: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null }, visitors: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null } }, scores: { __typename?: 'GameScores', home: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } }, visitors: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } } } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type GetReactionsQueryVariables = Exact<{
  targetId: Scalars['ID']['input'];
  targetType: ParentType;
}>;


export type GetReactionsQuery = { __typename?: 'Query', reactions: Array<{ __typename?: 'Reaction', id: string, emoji: ReactionEmojiType, userId: string, targetId: string, targetType: ParentType, createdAt: any, updatedAt: any, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null } }> };

export type SearchUsersQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<UserSearchFilters>;
}>;


export type SearchUsersQuery = { __typename?: 'Query', searchUsers: { __typename?: 'UserConnection', totalCount: number, edges: Array<{ __typename?: 'UserEdge', cursor: string, node: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type GetGameLogQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  commentsFirst?: InputMaybe<Scalars['Int']['input']>;
  commentsAfter?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetGameLogQuery = { __typename?: 'Query', gameLog?: { __typename?: 'GameLog', id: string, watchedSetting?: string | null, watchedScope?: string | null, watchedDate?: any | null, watchedLocation?: string | null, ratingForGame: number, notes?: string | null, tags?: Array<string> | null, classification: Classification, createdAt: any, updatedAt: any, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: ReactionEmojiType, userId: string, targetId: string, targetType: ParentType, createdAt: any, updatedAt: any, user: { __typename?: 'UserSummary', id: string, username: string, emailAddress?: string | null, imageUrl?: string | null } }>, comments: { __typename?: 'CommentConnection', totalCount: number, edges: Array<{ __typename?: 'CommentEdge', cursor: string, node: { __typename?: 'Comment', id: string, content: string, user: { __typename?: 'UserSummary', id: string, username: string, imageUrl?: string | null } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } }, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null }, game: { __typename?: 'Game', id: string, league?: string | null, season?: number | null, officials: Array<string>, timesTied?: number | null, leadChanges?: number | null, nugget?: string | null, createdAt: any, updatedAt: any, date: { __typename?: 'GameDate', start: any, end?: any | null, duration?: number | null }, status: { __typename?: 'GameStatus', clock?: string | null, halftime: boolean, long: string, short: string }, arena?: { __typename?: 'Arena', name: string, city?: string | null, state?: string | null, country?: string | null } | null, periods: { __typename?: 'GamePeriods', current: number, total: number, endOfPeriod: boolean }, teams: { __typename?: 'GameTeams', home: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null }, visitors: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null } }, scores: { __typename?: 'GameScores', home: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } }, visitors: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } } } } } | null };

export type GetUserGameLogsQueryVariables = Exact<{
  filters?: InputMaybe<GameLogFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetUserGameLogsQuery = { __typename?: 'Query', gameLogs: { __typename?: 'GameLogConnection', totalCount: number, edges: Array<{ __typename?: 'GameLogEdge', node: { __typename?: 'GameLog', id: string, watchedSetting?: string | null, watchedScope?: string | null, watchedDate?: any | null, watchedLocation?: string | null, ratingForGame: number, notes?: string | null, tags?: Array<string> | null, classification: Classification, createdAt: any, updatedAt: any, user: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null }, game: { __typename?: 'Game', id: string, league?: string | null, season?: number | null, officials: Array<string>, timesTied?: number | null, leadChanges?: number | null, nugget?: string | null, createdAt: any, updatedAt: any, date: { __typename?: 'GameDate', start: any, end?: any | null, duration?: number | null }, status: { __typename?: 'GameStatus', clock?: string | null, halftime: boolean, long: string, short: string }, arena?: { __typename?: 'Arena', name: string, city?: string | null, state?: string | null, country?: string | null } | null, periods: { __typename?: 'GamePeriods', current: number, total: number, endOfPeriod: boolean }, teams: { __typename?: 'GameTeams', home: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null }, visitors: { __typename?: 'TeamSummary', id: string, name: string, nickname: string, code: string, logo?: string | null } }, scores: { __typename?: 'GameScores', home: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } }, visitors: { __typename?: 'TeamScore', win: number, loss: number, linescore: Array<number>, points: number, series: { __typename?: 'SeriesScore', win: number, loss: number } } } }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: ReactionEmojiType, userId: string, targetId: string, targetType: ParentType, createdAt: any, updatedAt: any, user: { __typename?: 'UserSummary', id: string, username: string, emailAddress?: string | null, imageUrl?: string | null } }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type GetUserFriendshipsQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GetUserFriendshipsQuery = { __typename?: 'Query', user?: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null } | null };

export type GetTeamH2HQueryVariables = Exact<{
  teamId: Scalars['ID']['input'];
  opponentId: Scalars['ID']['input'];
}>;


export type GetTeamH2HQuery = { __typename?: 'Query', teamH2H?: { __typename?: 'ITeamH2H', wins: number, losses: number, lastTenGames?: string | null } | null };

export type GetTeamGameStatsQueryVariables = Exact<{
  gameId: Scalars['ID']['input'];
  teamId: Scalars['String']['input'];
}>;


export type GetTeamGameStatsQuery = { __typename?: 'Query', teamGameStats?: { __typename?: 'ITeamStats', games: number, points: number, fgp: number, tpp: number, ftp: number, totReb: number, assists: number, steals: number, blocks: number, turnovers: number, pFouls: number, plusMinus: number, fastBreakPoints: number, pointsInPaint: number, biggestLead: number, secondChancePoints: number, pointsOffTurnovers: number, longestRun: number, assistsPerGame: number, blocksPerGame: number, pointsPerGame: number, reboundsPerGame: number, stealsPerGame: number, turnoversPerGame: number } | null };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', me?: { __typename?: 'UserSummary', id: string, username: string, firstName: string, lastName: string, emailAddress?: string | null, imageUrl?: string | null } | null };

export const PlayerFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlayerFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Player"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"birth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nba"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"pro"}}]}},{"kind":"Field","name":{"kind":"Name","value":"height"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"feets"}},{"kind":"Field","name":{"kind":"Name","value":"inches"}},{"kind":"Field","name":{"kind":"Name","value":"meters"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pounds"}},{"kind":"Field","name":{"kind":"Name","value":"kilograms"}}]}},{"kind":"Field","name":{"kind":"Name","value":"college"}},{"kind":"Field","name":{"kind":"Name","value":"affiliation"}},{"kind":"Field","name":{"kind":"Name","value":"leagues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"standard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jersey"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"pos"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"seasons_active"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"season"}},{"kind":"Field","name":{"kind":"Name","value":"teams"}}]}}]}}]} as unknown as DocumentNode<PlayerFragmentFragment, unknown>;
export const PlayerStatsFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlayerStatsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"IPlayerStats"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"playerId"}},{"kind":"Field","name":{"kind":"Name","value":"gameId"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"assists"}},{"kind":"Field","name":{"kind":"Name","value":"rebounds"}},{"kind":"Field","name":{"kind":"Name","value":"steals"}},{"kind":"Field","name":{"kind":"Name","value":"blocks"}},{"kind":"Field","name":{"kind":"Name","value":"turnovers"}},{"kind":"Field","name":{"kind":"Name","value":"fouls"}},{"kind":"Field","name":{"kind":"Name","value":"minutes"}},{"kind":"Field","name":{"kind":"Name","value":"fieldGoalsMade"}},{"kind":"Field","name":{"kind":"Name","value":"fieldGoalsAttempted"}},{"kind":"Field","name":{"kind":"Name","value":"threePointersMade"}},{"kind":"Field","name":{"kind":"Name","value":"threePointersAttempted"}},{"kind":"Field","name":{"kind":"Name","value":"freeThrowsMade"}},{"kind":"Field","name":{"kind":"Name","value":"freeThrowsAttempted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}}]}}]} as unknown as DocumentNode<PlayerStatsFragmentFragment, unknown>;
export const BasicUserFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BasicUserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DBUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"parentType"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gameLogs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"initiatedFriendships"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}}]}}]} as unknown as DocumentNode<BasicUserFragmentFragment, unknown>;
export const UserSummaryFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]} as unknown as DocumentNode<UserSummaryFragmentFragment, unknown>;
export const CommentFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CommentFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Comment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"parentType"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"depth"}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"childComments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"parentType"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"depth"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]} as unknown as DocumentNode<CommentFragmentFragment, unknown>;
export const GameFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GameFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Game"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clock"}},{"kind":"Field","name":{"kind":"Name","value":"halftime"}},{"kind":"Field","name":{"kind":"Name","value":"long"}},{"kind":"Field","name":{"kind":"Name","value":"short"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arena"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"league"}},{"kind":"Field","name":{"kind":"Name","value":"season"}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"endOfPeriod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"officials"}},{"kind":"Field","name":{"kind":"Name","value":"timesTied"}},{"kind":"Field","name":{"kind":"Name","value":"leadChanges"}},{"kind":"Field","name":{"kind":"Name","value":"nugget"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GameFragmentFragment, unknown>;
export const GameLogFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GameLogFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GameLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"game"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"watchedSetting"}},{"kind":"Field","name":{"kind":"Name","value":"watchedScope"}},{"kind":"Field","name":{"kind":"Name","value":"watchedDate"}},{"kind":"Field","name":{"kind":"Name","value":"watchedLocation"}},{"kind":"Field","name":{"kind":"Name","value":"ratingForGame"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GameFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Game"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clock"}},{"kind":"Field","name":{"kind":"Name","value":"halftime"}},{"kind":"Field","name":{"kind":"Name","value":"long"}},{"kind":"Field","name":{"kind":"Name","value":"short"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arena"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"league"}},{"kind":"Field","name":{"kind":"Name","value":"season"}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"endOfPeriod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"officials"}},{"kind":"Field","name":{"kind":"Name","value":"timesTied"}},{"kind":"Field","name":{"kind":"Name","value":"leadChanges"}},{"kind":"Field","name":{"kind":"Name","value":"nugget"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GameLogFragmentFragment, unknown>;
export const CreateGameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateGameInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGame"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"game"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"league"}},{"kind":"Field","name":{"kind":"Name","value":"season"}},{"kind":"Field","name":{"kind":"Name","value":"date"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clock"}},{"kind":"Field","name":{"kind":"Name","value":"halftime"}},{"kind":"Field","name":{"kind":"Name","value":"short"}},{"kind":"Field","name":{"kind":"Name","value":"long"}}]}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"endOfPeriod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arena"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"officials"}},{"kind":"Field","name":{"kind":"Name","value":"timesTied"}},{"kind":"Field","name":{"kind":"Name","value":"leadChanges"}},{"kind":"Field","name":{"kind":"Name","value":"nugget"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}}]}}]}}]}}]} as unknown as DocumentNode<CreateGameMutation, CreateGameMutationVariables>;
export const CreateGameLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGameLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateGameLogInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGameLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gameLog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"game"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clock"}},{"kind":"Field","name":{"kind":"Name","value":"halftime"}},{"kind":"Field","name":{"kind":"Name","value":"short"}},{"kind":"Field","name":{"kind":"Name","value":"long"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arena"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"league"}},{"kind":"Field","name":{"kind":"Name","value":"season"}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"endOfPeriod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"officials"}},{"kind":"Field","name":{"kind":"Name","value":"timesTied"}},{"kind":"Field","name":{"kind":"Name","value":"leadChanges"}},{"kind":"Field","name":{"kind":"Name","value":"nugget"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"watchedSetting"}},{"kind":"Field","name":{"kind":"Name","value":"watchedDate"}},{"kind":"Field","name":{"kind":"Name","value":"ratingForGame"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}}]}}]}}]}}]} as unknown as DocumentNode<CreateGameLogMutation, CreateGameLogMutationVariables>;
export const UpdateGameLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateGameLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateGameLogInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateGameLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gameLog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"game"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"watchedSetting"}},{"kind":"Field","name":{"kind":"Name","value":"watchedDate"}},{"kind":"Field","name":{"kind":"Name","value":"ratingForGame"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateGameLogMutation, UpdateGameLogMutationVariables>;
export const DeleteGameLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteGameLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteGameLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteGameLogMutation, DeleteGameLogMutationVariables>;
export const CreateCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCommentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"comment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CommentFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CommentFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Comment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"parentType"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"depth"}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"childComments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"parentType"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"depth"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<CreateCommentMutation, CreateCommentMutationVariables>;
export const UpdateCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCommentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"comment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CommentFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CommentFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Comment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"parentType"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"depth"}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"childComments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"parentType"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"depth"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<UpdateCommentMutation, UpdateCommentMutationVariables>;
export const DeleteCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteCommentMutation, DeleteCommentMutationVariables>;
export const CreateReactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateReaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateReactionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createReaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetType"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]} as unknown as DocumentNode<CreateReactionMutation, CreateReactionMutationVariables>;
export const DeleteReactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteReaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteReaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteReactionMutation, DeleteReactionMutationVariables>;
export const SendFriendRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendFriendRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendFriendRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"friendship"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"initiator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]} as unknown as DocumentNode<SendFriendRequestMutation, SendFriendRequestMutationVariables>;
export const AcceptFriendRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptFriendRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"friendshipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptFriendRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"friendshipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"friendshipId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"friendship"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"initiator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]} as unknown as DocumentNode<AcceptFriendRequestMutation, AcceptFriendRequestMutationVariables>;
export const RejectFriendRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectFriendRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"friendshipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rejectFriendRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"friendshipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"friendshipId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"friendship"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"initiator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]} as unknown as DocumentNode<RejectFriendRequestMutation, RejectFriendRequestMutationVariables>;
export const RemoveFriendDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveFriend"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"friendshipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeFriend"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"friendshipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"friendshipId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}}]}}]}}]}}]} as unknown as DocumentNode<RemoveFriendMutation, RemoveFriendMutationVariables>;
export const GetGameByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGameById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"game"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GameFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Game"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clock"}},{"kind":"Field","name":{"kind":"Name","value":"halftime"}},{"kind":"Field","name":{"kind":"Name","value":"long"}},{"kind":"Field","name":{"kind":"Name","value":"short"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arena"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"league"}},{"kind":"Field","name":{"kind":"Name","value":"season"}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"endOfPeriod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"officials"}},{"kind":"Field","name":{"kind":"Name","value":"timesTied"}},{"kind":"Field","name":{"kind":"Name","value":"leadChanges"}},{"kind":"Field","name":{"kind":"Name","value":"nugget"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetGameByIdQuery, GetGameByIdQueryVariables>;
export const GetExternalGamesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetExternalGames"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GameFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"games"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GameFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Game"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clock"}},{"kind":"Field","name":{"kind":"Name","value":"halftime"}},{"kind":"Field","name":{"kind":"Name","value":"long"}},{"kind":"Field","name":{"kind":"Name","value":"short"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arena"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"league"}},{"kind":"Field","name":{"kind":"Name","value":"season"}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"endOfPeriod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"officials"}},{"kind":"Field","name":{"kind":"Name","value":"timesTied"}},{"kind":"Field","name":{"kind":"Name","value":"leadChanges"}},{"kind":"Field","name":{"kind":"Name","value":"nugget"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetExternalGamesQuery, GetExternalGamesQueryVariables>;
export const GetTeamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTeams"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamFilters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teams"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}},{"kind":"Field","name":{"kind":"Name","value":"conference"}},{"kind":"Field","name":{"kind":"Name","value":"division"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<GetTeamsQuery, GetTeamsQueryVariables>;
export const GetPlayersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPlayers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"IPlayerFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"players"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PlayerFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PlayerFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Player"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"birth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nba"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"pro"}}]}},{"kind":"Field","name":{"kind":"Name","value":"height"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"feets"}},{"kind":"Field","name":{"kind":"Name","value":"inches"}},{"kind":"Field","name":{"kind":"Name","value":"meters"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pounds"}},{"kind":"Field","name":{"kind":"Name","value":"kilograms"}}]}},{"kind":"Field","name":{"kind":"Name","value":"college"}},{"kind":"Field","name":{"kind":"Name","value":"affiliation"}},{"kind":"Field","name":{"kind":"Name","value":"leagues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"standard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jersey"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"pos"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"seasons_active"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"season"}},{"kind":"Field","name":{"kind":"Name","value":"teams"}}]}}]}}]} as unknown as DocumentNode<GetPlayersQuery, GetPlayersQueryVariables>;
export const GetCommentsWithFiltersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCommentsWithFilters"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CommentFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"parentType"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"depth"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"childComments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"parentType"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"depth"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<GetCommentsWithFiltersQuery, GetCommentsWithFiltersQueryVariables>;
export const GetUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UserFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]} as unknown as DocumentNode<GetUsersQuery, GetUsersQueryVariables>;
export const GetUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]} as unknown as DocumentNode<GetUserQuery, GetUserQueryVariables>;
export const GetGameLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGameLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GameLogFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gameLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameLogFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GameFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Game"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clock"}},{"kind":"Field","name":{"kind":"Name","value":"halftime"}},{"kind":"Field","name":{"kind":"Name","value":"long"}},{"kind":"Field","name":{"kind":"Name","value":"short"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arena"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"league"}},{"kind":"Field","name":{"kind":"Name","value":"season"}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"endOfPeriod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"officials"}},{"kind":"Field","name":{"kind":"Name","value":"timesTied"}},{"kind":"Field","name":{"kind":"Name","value":"leadChanges"}},{"kind":"Field","name":{"kind":"Name","value":"nugget"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GameLogFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GameLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"game"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"watchedSetting"}},{"kind":"Field","name":{"kind":"Name","value":"watchedScope"}},{"kind":"Field","name":{"kind":"Name","value":"watchedDate"}},{"kind":"Field","name":{"kind":"Name","value":"watchedLocation"}},{"kind":"Field","name":{"kind":"Name","value":"ratingForGame"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetGameLogsQuery, GetGameLogsQueryVariables>;
export const GetLiveGamesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLiveGames"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"liveGames"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GameFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Game"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clock"}},{"kind":"Field","name":{"kind":"Name","value":"halftime"}},{"kind":"Field","name":{"kind":"Name","value":"long"}},{"kind":"Field","name":{"kind":"Name","value":"short"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arena"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"league"}},{"kind":"Field","name":{"kind":"Name","value":"season"}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"endOfPeriod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"officials"}},{"kind":"Field","name":{"kind":"Name","value":"timesTied"}},{"kind":"Field","name":{"kind":"Name","value":"leadChanges"}},{"kind":"Field","name":{"kind":"Name","value":"nugget"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetLiveGamesQuery, GetLiveGamesQueryVariables>;
export const GetTeamStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTeamStats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"season"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamStats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"season"},"value":{"kind":"Variable","name":{"kind":"Name","value":"season"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"games"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"fgp"}},{"kind":"Field","name":{"kind":"Name","value":"tpp"}},{"kind":"Field","name":{"kind":"Name","value":"ftp"}},{"kind":"Field","name":{"kind":"Name","value":"totReb"}},{"kind":"Field","name":{"kind":"Name","value":"assists"}},{"kind":"Field","name":{"kind":"Name","value":"steals"}},{"kind":"Field","name":{"kind":"Name","value":"blocks"}},{"kind":"Field","name":{"kind":"Name","value":"turnovers"}},{"kind":"Field","name":{"kind":"Name","value":"pFouls"}},{"kind":"Field","name":{"kind":"Name","value":"plusMinus"}},{"kind":"Field","name":{"kind":"Name","value":"fastBreakPoints"}},{"kind":"Field","name":{"kind":"Name","value":"pointsInPaint"}},{"kind":"Field","name":{"kind":"Name","value":"biggestLead"}},{"kind":"Field","name":{"kind":"Name","value":"secondChancePoints"}},{"kind":"Field","name":{"kind":"Name","value":"pointsOffTurnovers"}},{"kind":"Field","name":{"kind":"Name","value":"longestRun"}},{"kind":"Field","name":{"kind":"Name","value":"assistsPerGame"}},{"kind":"Field","name":{"kind":"Name","value":"blocksPerGame"}},{"kind":"Field","name":{"kind":"Name","value":"pointsPerGame"}},{"kind":"Field","name":{"kind":"Name","value":"reboundsPerGame"}},{"kind":"Field","name":{"kind":"Name","value":"stealsPerGame"}},{"kind":"Field","name":{"kind":"Name","value":"turnoversPerGame"}}]}}]}}]} as unknown as DocumentNode<GetTeamStatsQuery, GetTeamStatsQueryVariables>;
export const GetGamesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGames"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GameFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"games"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GameFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Game"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clock"}},{"kind":"Field","name":{"kind":"Name","value":"halftime"}},{"kind":"Field","name":{"kind":"Name","value":"long"}},{"kind":"Field","name":{"kind":"Name","value":"short"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arena"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"league"}},{"kind":"Field","name":{"kind":"Name","value":"season"}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"endOfPeriod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"officials"}},{"kind":"Field","name":{"kind":"Name","value":"timesTied"}},{"kind":"Field","name":{"kind":"Name","value":"leadChanges"}},{"kind":"Field","name":{"kind":"Name","value":"nugget"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetGamesQuery, GetGamesQueryVariables>;
export const GetReactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReactions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"targetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"targetType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ParentType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"targetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"targetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"targetType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"targetType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]} as unknown as DocumentNode<GetReactionsQuery, GetReactionsQueryVariables>;
export const SearchUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchTerm"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UserSearchFilters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchTerm"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchTerm"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]} as unknown as DocumentNode<SearchUsersQuery, SearchUsersQueryVariables>;
export const GetGameLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGameLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commentsFirst"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commentsAfter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gameLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameLogFragment"}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GameFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Game"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clock"}},{"kind":"Field","name":{"kind":"Name","value":"halftime"}},{"kind":"Field","name":{"kind":"Name","value":"long"}},{"kind":"Field","name":{"kind":"Name","value":"short"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arena"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"league"}},{"kind":"Field","name":{"kind":"Name","value":"season"}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"endOfPeriod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"officials"}},{"kind":"Field","name":{"kind":"Name","value":"timesTied"}},{"kind":"Field","name":{"kind":"Name","value":"leadChanges"}},{"kind":"Field","name":{"kind":"Name","value":"nugget"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GameLogFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GameLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"game"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"watchedSetting"}},{"kind":"Field","name":{"kind":"Name","value":"watchedScope"}},{"kind":"Field","name":{"kind":"Name","value":"watchedDate"}},{"kind":"Field","name":{"kind":"Name","value":"watchedLocation"}},{"kind":"Field","name":{"kind":"Name","value":"ratingForGame"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetGameLogQuery, GetGameLogQueryVariables>;
export const GetUserGameLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUserGameLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GameLogFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gameLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameLogFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GameFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Game"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clock"}},{"kind":"Field","name":{"kind":"Name","value":"halftime"}},{"kind":"Field","name":{"kind":"Name","value":"long"}},{"kind":"Field","name":{"kind":"Name","value":"short"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arena"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"league"}},{"kind":"Field","name":{"kind":"Name","value":"season"}},{"kind":"Field","name":{"kind":"Name","value":"periods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"endOfPeriod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"home"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visitors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"win"}},{"kind":"Field","name":{"kind":"Name","value":"loss"}}]}},{"kind":"Field","name":{"kind":"Name","value":"linescore"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"officials"}},{"kind":"Field","name":{"kind":"Name","value":"timesTied"}},{"kind":"Field","name":{"kind":"Name","value":"leadChanges"}},{"kind":"Field","name":{"kind":"Name","value":"nugget"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GameLogFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GameLog"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"game"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GameFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"watchedSetting"}},{"kind":"Field","name":{"kind":"Name","value":"watchedScope"}},{"kind":"Field","name":{"kind":"Name","value":"watchedDate"}},{"kind":"Field","name":{"kind":"Name","value":"watchedLocation"}},{"kind":"Field","name":{"kind":"Name","value":"ratingForGame"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetUserGameLogsQuery, GetUserGameLogsQueryVariables>;
export const GetUserFriendshipsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUserFriendships"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]} as unknown as DocumentNode<GetUserFriendshipsQuery, GetUserFriendshipsQueryVariables>;
export const GetTeamH2HDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTeamH2H"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"opponentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamH2H"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"opponentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"opponentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wins"}},{"kind":"Field","name":{"kind":"Name","value":"losses"}},{"kind":"Field","name":{"kind":"Name","value":"lastTenGames"}}]}}]}}]} as unknown as DocumentNode<GetTeamH2HQuery, GetTeamH2HQueryVariables>;
export const GetTeamGameStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTeamGameStats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gameId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teamGameStats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gameId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gameId"}}},{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"games"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"fgp"}},{"kind":"Field","name":{"kind":"Name","value":"tpp"}},{"kind":"Field","name":{"kind":"Name","value":"ftp"}},{"kind":"Field","name":{"kind":"Name","value":"totReb"}},{"kind":"Field","name":{"kind":"Name","value":"assists"}},{"kind":"Field","name":{"kind":"Name","value":"steals"}},{"kind":"Field","name":{"kind":"Name","value":"blocks"}},{"kind":"Field","name":{"kind":"Name","value":"turnovers"}},{"kind":"Field","name":{"kind":"Name","value":"pFouls"}},{"kind":"Field","name":{"kind":"Name","value":"plusMinus"}},{"kind":"Field","name":{"kind":"Name","value":"fastBreakPoints"}},{"kind":"Field","name":{"kind":"Name","value":"pointsInPaint"}},{"kind":"Field","name":{"kind":"Name","value":"biggestLead"}},{"kind":"Field","name":{"kind":"Name","value":"secondChancePoints"}},{"kind":"Field","name":{"kind":"Name","value":"pointsOffTurnovers"}},{"kind":"Field","name":{"kind":"Name","value":"longestRun"}},{"kind":"Field","name":{"kind":"Name","value":"assistsPerGame"}},{"kind":"Field","name":{"kind":"Name","value":"blocksPerGame"}},{"kind":"Field","name":{"kind":"Name","value":"pointsPerGame"}},{"kind":"Field","name":{"kind":"Name","value":"reboundsPerGame"}},{"kind":"Field","name":{"kind":"Name","value":"stealsPerGame"}},{"kind":"Field","name":{"kind":"Name","value":"turnoversPerGame"}}]}}]}}]} as unknown as DocumentNode<GetTeamGameStatsQuery, GetTeamGameStatsQueryVariables>;
export const GetMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSummaryFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSummaryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]} as unknown as DocumentNode<GetMeQuery, GetMeQueryVariables>;