import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { Context } from '../../graphql/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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
  Any: { input: any; output: any; }
  DateTime: { input: Date; output: Date; }
  JSON: { input: any; output: any; }
};

export type AcceptFriendRequestResponse = {
  __typename?: 'AcceptFriendRequestResponse';
  errors: Maybe<Array<ErrorResult>>;
  friendship: Maybe<Friendship>;
};

export type Arena = {
  __typename?: 'Arena';
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  state: Maybe<Scalars['String']['output']>;
};

export type AuthenticationError = {
  __typename?: 'AuthenticationError';
  message: Scalars['String']['output'];
};

export type AuthorizationError = {
  __typename?: 'AuthorizationError';
  message: Scalars['String']['output'];
  requiredRole: Maybe<Scalars['String']['output']>;
};

export type BirthInfo = {
  __typename?: 'BirthInfo';
  country: Maybe<Scalars['String']['output']>;
  date: Maybe<Scalars['DateTime']['output']>;
};

export type BusinessLogicError = {
  __typename?: 'BusinessLogicError';
  code: Scalars['String']['output'];
  details: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
};

export type Classification =
  | 'PRIVATE'
  | 'PROTECTED'
  | 'PUBLIC';

export type Comment = {
  __typename?: 'Comment';
  content: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  deleted_at: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  parent_id: Scalars['ID']['output'];
  parent_type: ParentType;
  reactions: Array<Reaction>;
  updated_at: Scalars['DateTime']['output'];
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
  pagination?: InputMaybe<PaginationInput>;
  parent_id: Scalars['ID']['input'];
  parent_type: ParentType;
  user_id?: InputMaybe<Scalars['ID']['input']>;
};

export type ConferenceStanding = {
  __typename?: 'ConferenceStanding';
  loss: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  rank: Scalars['Int']['output'];
  win: Scalars['Int']['output'];
};

export type CreateCommentInput = {
  content: Scalars['String']['input'];
  parent_id: Scalars['ID']['input'];
  parent_type: ParentType;
};

export type CreateCommentResponse = {
  __typename?: 'CreateCommentResponse';
  comment: Maybe<Comment>;
  errors: Maybe<Array<ErrorResult>>;
};

export type CreateGameInput = {
  away_score?: InputMaybe<Scalars['Int']['input']>;
  away_team_id: Scalars['ID']['input'];
  date: Scalars['DateTime']['input'];
  game_type: Scalars['String']['input'];
  home_score?: InputMaybe<Scalars['Int']['input']>;
  home_team_id: Scalars['ID']['input'];
  nba_game_id?: InputMaybe<Scalars['ID']['input']>;
  status: GAME_STATUS;
};

export type CreateGameLogInput = {
  classification: Classification;
  game_id: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  rating_for_game?: InputMaybe<Scalars['Int']['input']>;
  rating_stars?: InputMaybe<Scalars['Int']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  watched_count?: InputMaybe<Scalars['Int']['input']>;
  watched_date?: InputMaybe<Scalars['DateTime']['input']>;
  watched_location?: InputMaybe<Scalars['String']['input']>;
  watched_setting: Scalars['String']['input'];
};

export type CreateGameLogResponse = {
  __typename?: 'CreateGameLogResponse';
  errors: Maybe<Array<ErrorResult>>;
  gameLog: Maybe<GameLog>;
};

export type CreateGameResponse = {
  __typename?: 'CreateGameResponse';
  errors: Maybe<Array<ErrorResult>>;
  game: Maybe<Game>;
};

export type CreateGameStatsInput = {
  assists: Scalars['Int']['input'];
  blocks: Scalars['Int']['input'];
  field_goal_percentage: Scalars['Float']['input'];
  field_goals_attempted: Scalars['Int']['input'];
  field_goals_made: Scalars['Int']['input'];
  fouls: Scalars['Int']['input'];
  free_throw_percentage: Scalars['Float']['input'];
  free_throws_attempted: Scalars['Int']['input'];
  free_throws_made: Scalars['Int']['input'];
  game_id: Scalars['ID']['input'];
  points: Scalars['Int']['input'];
  rebounds: Scalars['Int']['input'];
  steals: Scalars['Int']['input'];
  team_id: Scalars['ID']['input'];
  three_pointer_percentage: Scalars['Float']['input'];
  three_pointers_attempted: Scalars['Int']['input'];
  three_pointers_made: Scalars['Int']['input'];
  turnovers: Scalars['Int']['input'];
};

export type CreateGameStatsResponse = {
  __typename?: 'CreateGameStatsResponse';
  errors: Maybe<Array<ErrorResult>>;
  gameStats: Maybe<GameStats>;
};

export type CreateReactionInput = {
  emoji: ReactionEmojiType;
  target_id: Scalars['ID']['input'];
  target_type: ParentType;
};

export type CreateReactionResponse = {
  __typename?: 'CreateReactionResponse';
  errors: Maybe<Array<ErrorResult>>;
  reaction: Maybe<Reaction>;
};

export type DateRangeInput = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start: Scalars['DateTime']['input'];
};

export type DeleteCommentResponse = {
  __typename?: 'DeleteCommentResponse';
  errors: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type DeleteGameLogResponse = {
  __typename?: 'DeleteGameLogResponse';
  errors: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type DeleteGameResponse = {
  __typename?: 'DeleteGameResponse';
  errors: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type DeleteGameStatsResponse = {
  __typename?: 'DeleteGameStatsResponse';
  errors: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type DeletePlayerStatsResponse = {
  __typename?: 'DeletePlayerStatsResponse';
  errors: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type DeleteReactionResponse = {
  __typename?: 'DeleteReactionResponse';
  errors: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type DeleteUserResponse = {
  __typename?: 'DeleteUserResponse';
  errors: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type DivisionStanding = {
  __typename?: 'DivisionStanding';
  gamesBehind: Maybe<Scalars['String']['output']>;
  loss: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  rank: Scalars['Int']['output'];
  win: Scalars['Int']['output'];
};

export type ErrorResult = AuthenticationError | AuthorizationError | BusinessLogicError | NotFoundError | RateLimitError | ValidationError;

export type FavoritePlayerResponse = {
  __typename?: 'FavoritePlayerResponse';
  errors: Maybe<Array<ErrorResult>>;
  player: Maybe<Player>;
};

export type FavoriteTeamResponse = {
  __typename?: 'FavoriteTeamResponse';
  errors: Maybe<Array<ErrorResult>>;
  team: Maybe<Team>;
};

export type FieldGoalStats = {
  __typename?: 'FieldGoalStats';
  attempted: Scalars['Int']['output'];
  made: Scalars['Int']['output'];
  percentage: Scalars['String']['output'];
};

export type FreeThrowStats = {
  __typename?: 'FreeThrowStats';
  attempted: Scalars['Int']['output'];
  made: Scalars['Int']['output'];
  percentage: Scalars['String']['output'];
};

export type Friendship = {
  __typename?: 'Friendship';
  created_at: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  initiator: UserSummary;
  recipient: UserSummary;
  status: FriendshipStatus;
  subscriberId: Scalars['ID']['output'];
  updated_at: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type FriendshipStatus =
  | 'ACCEPTED'
  | 'BLOCKED'
  | 'PENDING'
  | 'REJECTED';

export type GAME_STATUS =
  | 'FINISHED'
  | 'LIVE'
  | 'SCHEDULED';

export type Game = {
  __typename?: 'Game';
  arena: Scalars['String']['output'];
  awayTeamId: Scalars['ID']['output'];
  away_score: Maybe<Scalars['Int']['output']>;
  created_at: Scalars['DateTime']['output'];
  date: GameDate;
  game_type: Scalars['String']['output'];
  homeTeamId: Scalars['ID']['output'];
  home_score: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isCompleted: Scalars['Boolean']['output'];
  leadChanges: Maybe<Scalars['Int']['output']>;
  league: Scalars['String']['output'];
  nba_game_id: Maybe<Scalars['ID']['output']>;
  nugget: Maybe<Scalars['String']['output']>;
  officials: Array<Scalars['String']['output']>;
  periods: Scalars['JSON']['output'];
  scores: Scalars['JSON']['output'];
  season: Scalars['Int']['output'];
  stage: Scalars['Int']['output'];
  status: GameStatus;
  teams: Scalars['JSON']['output'];
  timesTied: Maybe<Scalars['Int']['output']>;
  updated_at: Scalars['DateTime']['output'];
};

export type GameConnection = {
  __typename?: 'GameConnection';
  edges: Array<GameEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GameDate = {
  __typename?: 'GameDate';
  duration: Maybe<Scalars['String']['output']>;
  end: Maybe<Scalars['DateTime']['output']>;
  start: Scalars['DateTime']['output'];
};

export type GameEdge = {
  __typename?: 'GameEdge';
  cursor: Scalars['String']['output'];
  node: Game;
};

export type GameFilters = {
  awayTeamId?: InputMaybe<Scalars['ID']['input']>;
  classification?: InputMaybe<Classification>;
  dateRange?: InputMaybe<DateRangeInput>;
  game_id?: InputMaybe<Scalars['ID']['input']>;
  homeTeamId?: InputMaybe<Scalars['ID']['input']>;
  leadChangesMax?: InputMaybe<Scalars['Int']['input']>;
  leadChangesMin?: InputMaybe<Scalars['Int']['input']>;
  maxScore?: InputMaybe<Scalars['Int']['input']>;
  minScore?: InputMaybe<Scalars['Int']['input']>;
  officials?: InputMaybe<Array<Scalars['String']['input']>>;
  pagination?: InputMaybe<PaginationInput>;
  season?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<GAME_STATUS>;
  teamId?: InputMaybe<Scalars['ID']['input']>;
  timesTiedMax?: InputMaybe<Scalars['Int']['input']>;
  timesTiedMin?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['ID']['input']>;
};

export type GameLog = {
  __typename?: 'GameLog';
  classification: Classification;
  comments: CommentConnection;
  created_at: Scalars['DateTime']['output'];
  deleted_at: Maybe<Scalars['DateTime']['output']>;
  game: Game;
  gameId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  notes: Maybe<Scalars['String']['output']>;
  rating: Maybe<Scalars['Int']['output']>;
  ratingForGame: Maybe<Scalars['Int']['output']>;
  ratingStars: Maybe<Scalars['Int']['output']>;
  reactions: ReactionConnection;
  tags: Array<Scalars['String']['output']>;
  updated_at: Scalars['DateTime']['output'];
  user: UserSummary;
  userId: Scalars['ID']['output'];
  watchedCount: Maybe<Scalars['Int']['output']>;
  watchedDate: Maybe<Scalars['DateTime']['output']>;
  watchedLocation: Maybe<Scalars['String']['output']>;
  watchedSetting: Scalars['String']['output'];
};


export type GameLogcommentsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type GameLogreactionsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
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
  game_id?: InputMaybe<Scalars['ID']['input']>;
  pagination?: InputMaybe<PaginationInput>;
  user_id?: InputMaybe<Scalars['ID']['input']>;
  watched_date_range?: InputMaybe<DateRangeInput>;
};

export type GameLogStats = {
  __typename?: 'GameLogStats';
  averageRating: Scalars['Float']['output'];
  byClassification: Scalars['JSON']['output'];
  byMonth: Scalars['JSON']['output'];
  total: Scalars['Int']['output'];
};

export type GamePeriods = {
  __typename?: 'GamePeriods';
  current: Maybe<Scalars['Int']['output']>;
  endOfPeriod: Maybe<Scalars['Boolean']['output']>;
  total: Maybe<Scalars['Int']['output']>;
};

export type GameStats = {
  __typename?: 'GameStats';
  assists: Scalars['Int']['output'];
  blocks: Scalars['Int']['output'];
  created_at: Scalars['DateTime']['output'];
  fieldGoals: FieldGoalStats;
  fouls: Scalars['Int']['output'];
  freeThrows: FreeThrowStats;
  game: Game;
  id: Scalars['ID']['output'];
  points: Scalars['Int']['output'];
  rebounds: Scalars['Int']['output'];
  steals: Scalars['Int']['output'];
  team: Team;
  threePointers: ThreePointerStats;
  turnovers: Scalars['Int']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type GameStatus = {
  __typename?: 'GameStatus';
  clock: Maybe<Scalars['String']['output']>;
  halftime: Maybe<Scalars['Boolean']['output']>;
  long: Maybe<Scalars['String']['output']>;
  short: Maybe<Scalars['String']['output']>;
};

export type HeightInfo = {
  __typename?: 'HeightInfo';
  feets: Maybe<Scalars['Int']['output']>;
  inches: Maybe<Scalars['Int']['output']>;
  meters: Maybe<Scalars['Float']['output']>;
};

export type League = {
  __typename?: 'League';
  id: Scalars['ID']['output'];
  logo: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type LeagueConnection = {
  __typename?: 'LeagueConnection';
  edges: Array<LeagueEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type LeagueDetails = {
  __typename?: 'LeagueDetails';
  active: Maybe<Scalars['Boolean']['output']>;
  conference: Maybe<Scalars['String']['output']>;
  division: Maybe<Scalars['String']['output']>;
  jersey: Maybe<Scalars['String']['output']>;
  pos: Maybe<Scalars['String']['output']>;
};

export type LeagueEdge = {
  __typename?: 'LeagueEdge';
  cursor: Scalars['String']['output'];
  node: League;
};

export type LeaguesInfo = {
  __typename?: 'LeaguesInfo';
  sacramento: Maybe<LeagueDetails>;
  standard: Maybe<LeagueDetails>;
  utah: Maybe<LeagueDetails>;
  vegas: Maybe<LeagueDetails>;
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptFriendRequest: AcceptFriendRequestResponse;
  createComment: CreateCommentResponse;
  createGame: CreateGameResponse;
  createGameLog: CreateGameLogResponse;
  createGameStats: CreateGameStatsResponse;
  createReaction: CreateReactionResponse;
  deleteComment: DeleteCommentResponse;
  deleteGame: DeleteGameResponse;
  deleteGameLog: DeleteGameLogResponse;
  deleteGameStats: DeleteGameStatsResponse;
  deletePlayerStats: DeletePlayerStatsResponse;
  deleteReaction: DeleteReactionResponse;
  deleteUser: DeleteUserResponse;
  favoritePlayer: FavoritePlayerResponse;
  favoriteTeam: FavoriteTeamResponse;
  rejectFriendRequest: RejectFriendRequestResponse;
  removeFriend: RemoveFriendResponse;
  sendFriendRequest: SendFriendRequestResponse;
  updateComment: UpdateCommentResponse;
  updateFriendshipStatus: UpdateFriendshipStatusResponse;
  updateGame: UpdateGameResponse;
  updateGameLog: UpdateGameLogResponse;
  updateGameStats: UpdateGameStatsResponse;
  updatePlayer: UpdatePlayerResponse;
  updatePlayerStats: UpdatePlayerStatsResponse;
};


export type MutationacceptFriendRequestArgs = {
  friendshipId: Scalars['ID']['input'];
};


export type MutationcreateCommentArgs = {
  input: CreateCommentInput;
};


export type MutationcreateGameArgs = {
  input: CreateGameInput;
};


export type MutationcreateGameLogArgs = {
  input: CreateGameLogInput;
};


export type MutationcreateGameStatsArgs = {
  input: CreateGameStatsInput;
};


export type MutationcreateReactionArgs = {
  input: CreateReactionInput;
};


export type MutationdeleteCommentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationdeleteGameArgs = {
  id: Scalars['ID']['input'];
};


export type MutationdeleteGameLogArgs = {
  id: Scalars['ID']['input'];
};


export type MutationdeleteGameStatsArgs = {
  id: Scalars['ID']['input'];
};


export type MutationdeletePlayerStatsArgs = {
  id: Scalars['ID']['input'];
};


export type MutationdeleteReactionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationdeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationfavoritePlayerArgs = {
  id: Scalars['ID']['input'];
};


export type MutationfavoriteTeamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationrejectFriendRequestArgs = {
  friendshipId: Scalars['ID']['input'];
};


export type MutationremoveFriendArgs = {
  friendshipId: Scalars['ID']['input'];
};


export type MutationsendFriendRequestArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationupdateCommentArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCommentInput;
};


export type MutationupdateFriendshipStatusArgs = {
  input: UpdateFriendshipStatusInput;
};


export type MutationupdateGameArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGameInput;
};


export type MutationupdateGameLogArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGameLogInput;
};


export type MutationupdateGameStatsArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGameStatsInput;
};


export type MutationupdatePlayerArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePlayerInput;
};


export type MutationupdatePlayerStatsArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePlayerStatsInput;
};

export type MutationResponse = {
  __typename?: 'MutationResponse';
  errors: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type NbaInfo = {
  __typename?: 'NbaInfo';
  pro: Maybe<Scalars['Int']['output']>;
  start: Maybe<Scalars['Int']['output']>;
};

export type NotFoundError = {
  __typename?: 'NotFoundError';
  id: Maybe<Scalars['ID']['output']>;
  message: Scalars['String']['output'];
  resource: Scalars['String']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor: Maybe<Scalars['String']['output']>;
};

export type PaginatedItem = Comment | Game | GameLog | Player | PlayerStats | UserBase;

export type PaginatedResponse = {
  __typename?: 'PaginatedResponse';
  hasMore: Scalars['Boolean']['output'];
  items: Array<PaginatedItem>;
  nextCursor: Maybe<Scalars['ID']['output']>;
  total: Scalars['Int']['output'];
};

export type PaginationInput = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type ParentType =
  | 'comment'
  | 'game_log';

export type Player = {
  __typename?: 'Player';
  affiliation: Maybe<Scalars['String']['output']>;
  birth: Maybe<BirthInfo>;
  college: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  first_name: Scalars['String']['output'];
  height: Maybe<HeightInfo>;
  id: Scalars['ID']['output'];
  last_name: Scalars['String']['output'];
  leagues: Maybe<LeaguesInfo>;
  nba: Maybe<NbaInfo>;
  seasons_active: Maybe<Array<Maybe<SeasonActive>>>;
  updated_at: Scalars['DateTime']['output'];
  weight: Maybe<WeightInfo>;
};

export type PlayerConnection = {
  __typename?: 'PlayerConnection';
  edges: Array<PlayerEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PlayerEdge = {
  __typename?: 'PlayerEdge';
  cursor: Scalars['String']['output'];
  node: Player;
};

export type PlayerFilters = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  maxAssists?: InputMaybe<Scalars['Int']['input']>;
  maxPoints?: InputMaybe<Scalars['Int']['input']>;
  maxRebounds?: InputMaybe<Scalars['Int']['input']>;
  minAssists?: InputMaybe<Scalars['Int']['input']>;
  minFgPercentage?: InputMaybe<Scalars['Float']['input']>;
  minGames?: InputMaybe<Scalars['Int']['input']>;
  minPoints?: InputMaybe<Scalars['Int']['input']>;
  minRebounds?: InputMaybe<Scalars['Int']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
  season?: InputMaybe<Scalars['String']['input']>;
  team?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['String']['input']>;
};

export type PlayerGameStats = {
  __typename?: 'PlayerGameStats';
  assists: Maybe<Scalars['Int']['output']>;
  blocks: Maybe<Scalars['Int']['output']>;
  comment: Maybe<Scalars['String']['output']>;
  defReb: Maybe<Scalars['Int']['output']>;
  fga: Maybe<Scalars['Int']['output']>;
  fgm: Maybe<Scalars['Int']['output']>;
  fgp: Maybe<Scalars['String']['output']>;
  fieldGoals: FieldGoalStats;
  fouls: Scalars['Int']['output'];
  freeThrows: FreeThrowStats;
  fta: Maybe<Scalars['Int']['output']>;
  ftm: Maybe<Scalars['Int']['output']>;
  ftp: Maybe<Scalars['String']['output']>;
  game: Game;
  min: Maybe<Scalars['String']['output']>;
  minutes: Scalars['String']['output'];
  offReb: Maybe<Scalars['Int']['output']>;
  pFouls: Maybe<Scalars['Int']['output']>;
  player: Maybe<Player>;
  plusMinus: Maybe<Scalars['Int']['output']>;
  points: Scalars['Int']['output'];
  pos: Maybe<Scalars['String']['output']>;
  rebounds: Scalars['Int']['output'];
  steals: Maybe<Scalars['Int']['output']>;
  team: Team;
  threePointers: ThreePointerStats;
  totReb: Maybe<Scalars['Int']['output']>;
  tpa: Maybe<Scalars['Int']['output']>;
  tpm: Maybe<Scalars['Int']['output']>;
  tpp: Maybe<Scalars['String']['output']>;
  turnovers: Maybe<Scalars['Int']['output']>;
};

export type PlayerStats = {
  __typename?: 'PlayerStats';
  assists: Maybe<Scalars['Int']['output']>;
  blocks: Maybe<Scalars['Int']['output']>;
  comment: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  defReb: Maybe<Scalars['Int']['output']>;
  fga: Maybe<Scalars['Int']['output']>;
  fgm: Maybe<Scalars['Int']['output']>;
  fgp: Maybe<Scalars['String']['output']>;
  fta: Maybe<Scalars['Int']['output']>;
  ftm: Maybe<Scalars['Int']['output']>;
  ftp: Maybe<Scalars['String']['output']>;
  game: Game;
  id: Scalars['ID']['output'];
  min: Maybe<Scalars['String']['output']>;
  offReb: Maybe<Scalars['Int']['output']>;
  pFouls: Maybe<Scalars['Int']['output']>;
  player: Player;
  playerId: Scalars['ID']['output'];
  plusMinus: Maybe<Scalars['Int']['output']>;
  points: Maybe<Scalars['Int']['output']>;
  pos: Maybe<Scalars['String']['output']>;
  season: Scalars['Int']['output'];
  steals: Maybe<Scalars['Int']['output']>;
  team: Team;
  totReb: Maybe<Scalars['Int']['output']>;
  tpa: Maybe<Scalars['Int']['output']>;
  tpm: Maybe<Scalars['Int']['output']>;
  tpp: Maybe<Scalars['String']['output']>;
  turnovers: Maybe<Scalars['Int']['output']>;
  updated_at: Scalars['DateTime']['output'];
};

export type PlayerStatsConnection = {
  __typename?: 'PlayerStatsConnection';
  edges: Array<PlayerStatsEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PlayerStatsEdge = {
  __typename?: 'PlayerStatsEdge';
  cursor: Scalars['String']['output'];
  node: PlayerStats;
};

export type Query = {
  __typename?: 'Query';
  allPlayerStats: PlayerStatsConnection;
  allTeamStats: TeamStatsConnection;
  comments: CommentConnection;
  friendship: Maybe<Friendship>;
  friendships: UserBaseConnection;
  game: Maybe<Game>;
  gameLog: Maybe<GameLog>;
  gameLogStats: GameLogStats;
  gameLogs: GameLogConnection;
  gameStats: Maybe<GameStats>;
  games: GameConnection;
  leagues: LeagueConnection;
  liveGames: GameConnection;
  player: Maybe<Player>;
  playerGameStats: Maybe<PlayerStats>;
  playerSeasonStats: Maybe<PlayerStats>;
  playerSeasonStatsList: PlayerStatsConnection;
  playerStats: Maybe<PlayerStats>;
  playerStatsByTeam: PlayerStatsConnection;
  players: PlayerConnection;
  reactions: ReactionConnection;
  seasons: SeasonConnection;
  team: Maybe<Team>;
  teamGameStats: Maybe<TeamStats>;
  teamStats: TeamStatsConnection;
  teams: TeamConnection;
  topPlayers: PlayerConnection;
  user: Maybe<User>;
  users: UserConnection;
};


export type QueryallPlayerStatsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  season: Scalars['Int']['input'];
};


export type QueryallTeamStatsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  season: Scalars['Int']['input'];
};


export type QuerycommentsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  parent_id: Scalars['ID']['input'];
};


export type QueryfriendshipArgs = {
  id: Scalars['ID']['input'];
};


export type QueryfriendshipsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['ID']['input'];
};


export type QuerygameArgs = {
  id: Scalars['ID']['input'];
};


export type QuerygameLogArgs = {
  gameId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type QuerygameLogStatsArgs = {
  filters: InputMaybe<GameLogFilters>;
};


export type QuerygameLogsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  filters: InputMaybe<GameLogFilters>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type QuerygameStatsArgs = {
  id: Scalars['ID']['input'];
};


export type QuerygamesArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  filters: InputMaybe<GameFilters>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type QueryleaguesArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type QueryliveGamesArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type QueryplayerArgs = {
  id: Scalars['ID']['input'];
};


export type QueryplayerGameStatsArgs = {
  game_id: Scalars['ID']['input'];
  player_id: Scalars['ID']['input'];
};


export type QueryplayerSeasonStatsArgs = {
  playerId: Scalars['ID']['input'];
  season: Scalars['Int']['input'];
};


export type QueryplayerSeasonStatsListArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  playerId: Scalars['ID']['input'];
};


export type QueryplayerStatsArgs = {
  playerId: Scalars['ID']['input'];
  season: Scalars['Int']['input'];
};


export type QueryplayerStatsByTeamArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  season: Scalars['Int']['input'];
  team: Scalars['String']['input'];
};


export type QueryplayersArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  filters: InputMaybe<PlayerFilters>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type QueryreactionsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  targetId: Scalars['ID']['input'];
};


export type QueryseasonsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type QueryteamArgs = {
  id: Scalars['ID']['input'];
};


export type QueryteamGameStatsArgs = {
  game_id: Scalars['ID']['input'];
  team: Scalars['String']['input'];
};


export type QueryteamStatsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  sort: InputMaybe<TeamSortInput>;
  teamId: Scalars['ID']['input'];
};


export type QueryteamsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  filters: InputMaybe<TeamFilters>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type QuerytopPlayersArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  season: Scalars['Int']['input'];
};


export type QueryuserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryusersArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};

export type RateLimitError = {
  __typename?: 'RateLimitError';
  message: Scalars['String']['output'];
  retryAfter: Scalars['Int']['output'];
};

export type Reaction = {
  __typename?: 'Reaction';
  created_at: Scalars['DateTime']['output'];
  emoji: ReactionEmojiType;
  id: Scalars['ID']['output'];
  targetId: Scalars['ID']['output'];
  targetType: ParentType;
  updated_at: Scalars['DateTime']['output'];
  user: UserSummary;
  userId: Scalars['ID']['output'];
};

export type ReactionConnection = {
  __typename?: 'ReactionConnection';
  edges: Array<ReactionEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ReactionEdge = {
  __typename?: 'ReactionEdge';
  cursor: Scalars['String']['output'];
  node: Reaction;
};

export type ReactionEmojiType =
  | 'ANGRY'
  | 'BASEBALL'
  | 'BASKETBALL'
  | 'BULLSEYE'
  | 'CLAP'
  | 'EYES'
  | 'FIRE'
  | 'FOOTBALL'
  | 'GOAT'
  | 'GOLF'
  | 'LAUGH'
  | 'LIKE'
  | 'LOVE'
  | 'MUSCLE'
  | 'ROCKET'
  | 'SAD'
  | 'SOCCER'
  | 'TENNIS'
  | 'THUMBS_DOWN'
  | 'WOW';

export type RejectFriendRequestResponse = {
  __typename?: 'RejectFriendRequestResponse';
  errors: Maybe<Array<ErrorResult>>;
  friendship: Maybe<Friendship>;
};

export type RemoveFriendResponse = {
  __typename?: 'RemoveFriendResponse';
  errors: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type Scores = {
  __typename?: 'Scores';
  home: Maybe<TeamScore>;
  visitors: Maybe<TeamScore>;
};

export type Season = {
  __typename?: 'Season';
  display_year: Scalars['String']['output'];
  end_date: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  is_current: Scalars['Boolean']['output'];
  is_playoffs: Scalars['Boolean']['output'];
  start_date: Scalars['DateTime']['output'];
  year: Scalars['Int']['output'];
};

export type SeasonActive = {
  __typename?: 'SeasonActive';
  season: Maybe<Scalars['Int']['output']>;
  teams: Maybe<Array<Scalars['String']['output']>>;
};

export type SeasonConnection = {
  __typename?: 'SeasonConnection';
  edges: Array<SeasonEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type SeasonEdge = {
  __typename?: 'SeasonEdge';
  cursor: Scalars['String']['output'];
  node: Season;
};

export type SendFriendRequestResponse = {
  __typename?: 'SendFriendRequestResponse';
  errors: Maybe<Array<ErrorResult>>;
  friendship: Maybe<Friendship>;
};

export type SeriesScore = {
  __typename?: 'SeriesScore';
  loss: Maybe<Scalars['Int']['output']>;
  win: Maybe<Scalars['Int']['output']>;
};

export type SharedGameLog = {
  __typename?: 'SharedGameLog';
  classification: Classification;
  created_at: Scalars['DateTime']['output'];
  deleted_at: Maybe<Scalars['DateTime']['output']>;
  game: Game;
  gameId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  notes: Maybe<Scalars['String']['output']>;
  rating: Maybe<Scalars['Int']['output']>;
  tags: Array<Scalars['String']['output']>;
  updated_at: Scalars['DateTime']['output'];
  user: UserSummary;
  userId: Scalars['ID']['output'];
  watchedCount: Maybe<Scalars['Int']['output']>;
  watchedDate: Maybe<Scalars['DateTime']['output']>;
  watchedLocation: Maybe<Scalars['String']['output']>;
  watchedSetting: Scalars['String']['output'];
};

export type SortDirection =
  | 'ASC'
  | 'DESC';

export type TargetType =
  | 'comment'
  | 'game_log';

export type Team = {
  __typename?: 'Team';
  abbreviation: Scalars['String']['output'];
  city: Scalars['String']['output'];
  code: Maybe<Scalars['String']['output']>;
  conference: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  division: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  logo: Maybe<Scalars['String']['output']>;
  logo_url: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nickname: Maybe<Scalars['String']['output']>;
  primary_color: Maybe<Scalars['String']['output']>;
  secondary_color: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['DateTime']['output'];
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
  maxLosses?: InputMaybe<Scalars['Int']['input']>;
  maxPointsAllowed?: InputMaybe<Scalars['Int']['input']>;
  maxWins?: InputMaybe<Scalars['Int']['input']>;
  minLosses?: InputMaybe<Scalars['Int']['input']>;
  minPoints?: InputMaybe<Scalars['Int']['input']>;
  minWinPercentage?: InputMaybe<Scalars['Float']['input']>;
  minWins?: InputMaybe<Scalars['Int']['input']>;
  season?: InputMaybe<Scalars['String']['input']>;
};

export type TeamGameStats = {
  __typename?: 'TeamGameStats';
  assists: Scalars['Int']['output'];
  blocks: Scalars['Int']['output'];
  fieldGoals: FieldGoalStats;
  fouls: Scalars['Int']['output'];
  freeThrows: FreeThrowStats;
  game: Game;
  points: Scalars['Int']['output'];
  rebounds: Scalars['Int']['output'];
  steals: Scalars['Int']['output'];
  team: Team;
  threePointers: ThreePointerStats;
  turnovers: Scalars['Int']['output'];
};

export type TeamGameStatsInput = {
  assists?: InputMaybe<Scalars['Int']['input']>;
  biggest_lead?: InputMaybe<Scalars['Int']['input']>;
  blocks?: InputMaybe<Scalars['Int']['input']>;
  defensive_rebounds?: InputMaybe<Scalars['Int']['input']>;
  fast_break_points?: InputMaybe<Scalars['Int']['input']>;
  field_goal_percentage?: InputMaybe<Scalars['Float']['input']>;
  field_goals_attempted?: InputMaybe<Scalars['Int']['input']>;
  field_goals_made?: InputMaybe<Scalars['Int']['input']>;
  free_throw_percentage?: InputMaybe<Scalars['Float']['input']>;
  free_throws_attempted?: InputMaybe<Scalars['Int']['input']>;
  free_throws_made?: InputMaybe<Scalars['Int']['input']>;
  longest_run?: InputMaybe<Scalars['Int']['input']>;
  offensive_rebounds?: InputMaybe<Scalars['Int']['input']>;
  personal_fouls?: InputMaybe<Scalars['Int']['input']>;
  points?: InputMaybe<Scalars['Int']['input']>;
  points_in_paint?: InputMaybe<Scalars['Int']['input']>;
  points_off_turnovers?: InputMaybe<Scalars['Int']['input']>;
  second_chance_points?: InputMaybe<Scalars['Int']['input']>;
  steals?: InputMaybe<Scalars['Int']['input']>;
  three_pointer_percentage?: InputMaybe<Scalars['Float']['input']>;
  three_pointers_attempted?: InputMaybe<Scalars['Int']['input']>;
  three_pointers_made?: InputMaybe<Scalars['Int']['input']>;
  total_rebounds?: InputMaybe<Scalars['Int']['input']>;
  turnovers?: InputMaybe<Scalars['Int']['input']>;
};

export type TeamScore = {
  __typename?: 'TeamScore';
  linescore: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
  loss: Maybe<Scalars['Int']['output']>;
  points: Maybe<Scalars['Int']['output']>;
  series: Maybe<SeriesScore>;
  win: Maybe<Scalars['Int']['output']>;
};

export type TeamSortInput = {
  direction: SortDirection;
  field: Scalars['String']['input'];
};

export type TeamStats = {
  __typename?: 'TeamStats';
  assists: Scalars['Int']['output'];
  blocks: Scalars['Int']['output'];
  created_at: Scalars['DateTime']['output'];
  defReb: Maybe<Scalars['Int']['output']>;
  defensive_rebounds: Scalars['Int']['output'];
  fga: Maybe<Scalars['Int']['output']>;
  fgm: Maybe<Scalars['Int']['output']>;
  fgp: Maybe<Scalars['String']['output']>;
  field_goal_percentage: Scalars['Float']['output'];
  field_goals_attempted: Scalars['Int']['output'];
  field_goals_made: Scalars['Int']['output'];
  free_throw_percentage: Scalars['Float']['output'];
  free_throws_attempted: Scalars['Int']['output'];
  free_throws_made: Scalars['Int']['output'];
  fta: Maybe<Scalars['Int']['output']>;
  ftm: Maybe<Scalars['Int']['output']>;
  ftp: Maybe<Scalars['String']['output']>;
  games_played: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  losses: Scalars['Int']['output'];
  offReb: Maybe<Scalars['Int']['output']>;
  offensive_rebounds: Scalars['Int']['output'];
  pFouls: Maybe<Scalars['Int']['output']>;
  personal_fouls: Scalars['Int']['output'];
  plus_minus: Maybe<Scalars['Int']['output']>;
  points: Scalars['Int']['output'];
  season: Scalars['Int']['output'];
  steals: Scalars['Int']['output'];
  team: Team;
  three_pointer_percentage: Scalars['Float']['output'];
  three_pointers_attempted: Scalars['Int']['output'];
  three_pointers_made: Scalars['Int']['output'];
  totReb: Maybe<Scalars['Int']['output']>;
  total_rebounds: Scalars['Int']['output'];
  tpa: Maybe<Scalars['Int']['output']>;
  tpm: Maybe<Scalars['Int']['output']>;
  tpp: Maybe<Scalars['String']['output']>;
  turnovers: Scalars['Int']['output'];
  updated_at: Scalars['DateTime']['output'];
  wins: Scalars['Int']['output'];
};

export type TeamStatsConnection = {
  __typename?: 'TeamStatsConnection';
  edges: Array<TeamStatsEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type TeamStatsEdge = {
  __typename?: 'TeamStatsEdge';
  cursor: Scalars['String']['output'];
  node: TeamStats;
};

export type TeamSummary = {
  __typename?: 'TeamSummary';
  code: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['String']['output']>;
  logo: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  nickname: Maybe<Scalars['String']['output']>;
};

export type Teams = {
  __typename?: 'Teams';
  home: Maybe<TeamSummary>;
  visitors: Maybe<TeamSummary>;
};

export type ThreePointerStats = {
  __typename?: 'ThreePointerStats';
  attempted: Scalars['Int']['output'];
  made: Scalars['Int']['output'];
  percentage: Scalars['String']['output'];
};

export type UpdateCommentInput = {
  content: Scalars['String']['input'];
};

export type UpdateCommentResponse = {
  __typename?: 'UpdateCommentResponse';
  comment: Maybe<Comment>;
  errors: Maybe<Array<ErrorResult>>;
};

export type UpdateFriendshipStatusInput = {
  friendshipId: Scalars['ID']['input'];
  status: FriendshipStatus;
};

export type UpdateFriendshipStatusResponse = {
  __typename?: 'UpdateFriendshipStatusResponse';
  errors: Maybe<Array<ErrorResult>>;
  friendship: Maybe<Friendship>;
};

export type UpdateGameInput = {
  away_score?: InputMaybe<Scalars['Int']['input']>;
  date?: InputMaybe<Scalars['DateTime']['input']>;
  home_score?: InputMaybe<Scalars['Int']['input']>;
  status: GAME_STATUS;
};

export type UpdateGameLogInput = {
  classification?: InputMaybe<Classification>;
  notes?: InputMaybe<Scalars['String']['input']>;
  rating_for_game?: InputMaybe<Scalars['Int']['input']>;
  rating_stars?: InputMaybe<Scalars['Int']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  watched_count?: InputMaybe<Scalars['Int']['input']>;
  watched_date?: InputMaybe<Scalars['DateTime']['input']>;
  watched_location?: InputMaybe<Scalars['String']['input']>;
  watched_setting?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGameLogResponse = {
  __typename?: 'UpdateGameLogResponse';
  errors: Maybe<Array<ErrorResult>>;
  gameLog: Maybe<GameLog>;
};

export type UpdateGameResponse = {
  __typename?: 'UpdateGameResponse';
  errors: Maybe<Array<ErrorResult>>;
  game: Maybe<Game>;
};

export type UpdateGameStatsInput = {
  assists?: InputMaybe<Scalars['Int']['input']>;
  blocks?: InputMaybe<Scalars['Int']['input']>;
  field_goal_percentage?: InputMaybe<Scalars['Float']['input']>;
  field_goals_attempted?: InputMaybe<Scalars['Int']['input']>;
  field_goals_made?: InputMaybe<Scalars['Int']['input']>;
  fouls?: InputMaybe<Scalars['Int']['input']>;
  free_throw_percentage?: InputMaybe<Scalars['Float']['input']>;
  free_throws_attempted?: InputMaybe<Scalars['Int']['input']>;
  free_throws_made?: InputMaybe<Scalars['Int']['input']>;
  points?: InputMaybe<Scalars['Int']['input']>;
  rebounds?: InputMaybe<Scalars['Int']['input']>;
  steals?: InputMaybe<Scalars['Int']['input']>;
  three_pointer_percentage?: InputMaybe<Scalars['Float']['input']>;
  three_pointers_attempted?: InputMaybe<Scalars['Int']['input']>;
  three_pointers_made?: InputMaybe<Scalars['Int']['input']>;
  turnovers?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateGameStatsResponse = {
  __typename?: 'UpdateGameStatsResponse';
  errors: Maybe<Array<ErrorResult>>;
  gameStats: Maybe<GameStats>;
};

export type UpdatePlayerInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
  team_id?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdatePlayerResponse = {
  __typename?: 'UpdatePlayerResponse';
  errors: Maybe<Array<ErrorResult>>;
  player: Maybe<Player>;
};

export type UpdatePlayerStatsInput = {
  assists?: InputMaybe<Scalars['Int']['input']>;
  blocks?: InputMaybe<Scalars['Int']['input']>;
  defReb?: InputMaybe<Scalars['Int']['input']>;
  fga?: InputMaybe<Scalars['Int']['input']>;
  fgm?: InputMaybe<Scalars['Int']['input']>;
  fgp?: InputMaybe<Scalars['String']['input']>;
  fta?: InputMaybe<Scalars['Int']['input']>;
  ftm?: InputMaybe<Scalars['Int']['input']>;
  ftp?: InputMaybe<Scalars['String']['input']>;
  min?: InputMaybe<Scalars['String']['input']>;
  offReb?: InputMaybe<Scalars['Int']['input']>;
  pFouls?: InputMaybe<Scalars['Int']['input']>;
  plusMinus?: InputMaybe<Scalars['Int']['input']>;
  points?: InputMaybe<Scalars['Int']['input']>;
  pos?: InputMaybe<Scalars['String']['input']>;
  steals?: InputMaybe<Scalars['Int']['input']>;
  totReb?: InputMaybe<Scalars['Int']['input']>;
  tpa?: InputMaybe<Scalars['Int']['input']>;
  tpm?: InputMaybe<Scalars['Int']['input']>;
  tpp?: InputMaybe<Scalars['String']['input']>;
  turnovers?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdatePlayerStatsResponse = {
  __typename?: 'UpdatePlayerStatsResponse';
  errors: Maybe<Array<ErrorResult>>;
  playerStats: Maybe<PlayerStats>;
};

export type UpdateTeamInput = {
  __typename?: 'UpdateTeamInput';
  all_star: Maybe<Scalars['Boolean']['output']>;
  city: Maybe<Scalars['String']['output']>;
  conference: Maybe<Scalars['String']['output']>;
  division: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logo: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  nba_franchise: Maybe<Scalars['Boolean']['output']>;
  nickname: Maybe<Scalars['String']['output']>;
};

export type UpdateTeamResponse = {
  __typename?: 'UpdateTeamResponse';
  errors: Maybe<Array<ErrorResult>>;
  team: Maybe<Team>;
};

export type User = {
  __typename?: 'User';
  avatar_url: Maybe<Scalars['String']['output']>;
  comments: Array<Comment>;
  created_at: Scalars['DateTime']['output'];
  deleted_at: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  email_address: Maybe<Scalars['String']['output']>;
  first_name: Maybe<Scalars['String']['output']>;
  friendships: Array<Friendship>;
  gameLogs: Array<GameLog>;
  id: Scalars['ID']['output'];
  imageUrl: Maybe<Scalars['String']['output']>;
  initiated_friendships: Array<Friendship>;
  last_name: Maybe<Scalars['String']['output']>;
  reactions: Array<Reaction>;
  updated_at: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type UserBase = {
  __typename?: 'UserBase';
  avatar_url: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  email_address: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
};

export type UserBaseConnection = {
  __typename?: 'UserBaseConnection';
  edges: Array<UserBaseEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type UserBaseEdge = {
  __typename?: 'UserBaseEdge';
  cursor: Scalars['String']['output'];
  node: UserBase;
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
  node: User;
};

export type UserSummary = {
  __typename?: 'UserSummary';
  email_address: Maybe<Scalars['String']['output']>;
  first_name: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl: Maybe<Scalars['String']['output']>;
  last_name: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
};

export type ValidationError = {
  __typename?: 'ValidationError';
  field: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
};

export type WeightInfo = {
  __typename?: 'WeightInfo';
  kilograms: Maybe<Scalars['Float']['output']>;
  pounds: Maybe<Scalars['Int']['output']>;
};

export type WinLossRecord = {
  __typename?: 'WinLossRecord';
  away: Maybe<Scalars['Int']['output']>;
  home: Maybe<Scalars['Int']['output']>;
  lastTen: Maybe<Scalars['Int']['output']>;
  percentage: Maybe<Scalars['String']['output']>;
  total: Maybe<Scalars['Int']['output']>;
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

/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
  ErrorResult: ( AuthenticationError ) | ( AuthorizationError ) | ( BusinessLogicError ) | ( NotFoundError ) | ( RateLimitError ) | ( ValidationError );
  PaginatedItem: ( Comment ) | ( Game ) | ( GameLog ) | ( Player ) | ( PlayerStats ) | ( UserBase );
};


/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AcceptFriendRequestResponse: ResolverTypeWrapper<Omit<AcceptFriendRequestResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  Any: ResolverTypeWrapper<Scalars['Any']['output']>;
  Arena: ResolverTypeWrapper<Arena>;
  AuthenticationError: ResolverTypeWrapper<AuthenticationError>;
  AuthorizationError: ResolverTypeWrapper<AuthorizationError>;
  BirthInfo: ResolverTypeWrapper<BirthInfo>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BusinessLogicError: ResolverTypeWrapper<BusinessLogicError>;
  Classification: Classification;
  Comment: ResolverTypeWrapper<Comment>;
  CommentConnection: ResolverTypeWrapper<CommentConnection>;
  CommentEdge: ResolverTypeWrapper<CommentEdge>;
  CommentFilters: CommentFilters;
  ConferenceStanding: ResolverTypeWrapper<ConferenceStanding>;
  CreateCommentInput: CreateCommentInput;
  CreateCommentResponse: ResolverTypeWrapper<Omit<CreateCommentResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  CreateGameInput: CreateGameInput;
  CreateGameLogInput: CreateGameLogInput;
  CreateGameLogResponse: ResolverTypeWrapper<Omit<CreateGameLogResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  CreateGameResponse: ResolverTypeWrapper<Omit<CreateGameResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  CreateGameStatsInput: CreateGameStatsInput;
  CreateGameStatsResponse: ResolverTypeWrapper<Omit<CreateGameStatsResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  CreateReactionInput: CreateReactionInput;
  CreateReactionResponse: ResolverTypeWrapper<Omit<CreateReactionResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  DateRangeInput: DateRangeInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DeleteCommentResponse: ResolverTypeWrapper<Omit<DeleteCommentResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  DeleteGameLogResponse: ResolverTypeWrapper<Omit<DeleteGameLogResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  DeleteGameResponse: ResolverTypeWrapper<Omit<DeleteGameResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  DeleteGameStatsResponse: ResolverTypeWrapper<Omit<DeleteGameStatsResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  DeletePlayerStatsResponse: ResolverTypeWrapper<Omit<DeletePlayerStatsResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  DeleteReactionResponse: ResolverTypeWrapper<Omit<DeleteReactionResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  DeleteUserResponse: ResolverTypeWrapper<Omit<DeleteUserResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  DivisionStanding: ResolverTypeWrapper<DivisionStanding>;
  ErrorResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ErrorResult']>;
  FavoritePlayerResponse: ResolverTypeWrapper<Omit<FavoritePlayerResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  FavoriteTeamResponse: ResolverTypeWrapper<Omit<FavoriteTeamResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  FieldGoalStats: ResolverTypeWrapper<FieldGoalStats>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FreeThrowStats: ResolverTypeWrapper<FreeThrowStats>;
  Friendship: ResolverTypeWrapper<Friendship>;
  FriendshipStatus: FriendshipStatus;
  GAME_STATUS: GAME_STATUS;
  Game: ResolverTypeWrapper<Game>;
  GameConnection: ResolverTypeWrapper<GameConnection>;
  GameDate: ResolverTypeWrapper<GameDate>;
  GameEdge: ResolverTypeWrapper<GameEdge>;
  GameFilters: GameFilters;
  GameLog: ResolverTypeWrapper<GameLog>;
  GameLogConnection: ResolverTypeWrapper<GameLogConnection>;
  GameLogEdge: ResolverTypeWrapper<GameLogEdge>;
  GameLogFilters: GameLogFilters;
  GameLogStats: ResolverTypeWrapper<GameLogStats>;
  GamePeriods: ResolverTypeWrapper<GamePeriods>;
  GameStats: ResolverTypeWrapper<GameStats>;
  GameStatus: ResolverTypeWrapper<GameStatus>;
  HeightInfo: ResolverTypeWrapper<HeightInfo>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  League: ResolverTypeWrapper<League>;
  LeagueConnection: ResolverTypeWrapper<LeagueConnection>;
  LeagueDetails: ResolverTypeWrapper<LeagueDetails>;
  LeagueEdge: ResolverTypeWrapper<LeagueEdge>;
  LeaguesInfo: ResolverTypeWrapper<LeaguesInfo>;
  Mutation: ResolverTypeWrapper<{}>;
  MutationResponse: ResolverTypeWrapper<Omit<MutationResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  NbaInfo: ResolverTypeWrapper<NbaInfo>;
  NotFoundError: ResolverTypeWrapper<NotFoundError>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PaginatedItem: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['PaginatedItem']>;
  PaginatedResponse: ResolverTypeWrapper<Omit<PaginatedResponse, 'items'> & { items: Array<ResolversTypes['PaginatedItem']> }>;
  PaginationInput: PaginationInput;
  ParentType: ParentType;
  Player: ResolverTypeWrapper<Player>;
  PlayerConnection: ResolverTypeWrapper<PlayerConnection>;
  PlayerEdge: ResolverTypeWrapper<PlayerEdge>;
  PlayerFilters: PlayerFilters;
  PlayerGameStats: ResolverTypeWrapper<PlayerGameStats>;
  PlayerStats: ResolverTypeWrapper<PlayerStats>;
  PlayerStatsConnection: ResolverTypeWrapper<PlayerStatsConnection>;
  PlayerStatsEdge: ResolverTypeWrapper<PlayerStatsEdge>;
  Query: ResolverTypeWrapper<{}>;
  RateLimitError: ResolverTypeWrapper<RateLimitError>;
  Reaction: ResolverTypeWrapper<Reaction>;
  ReactionConnection: ResolverTypeWrapper<ReactionConnection>;
  ReactionEdge: ResolverTypeWrapper<ReactionEdge>;
  ReactionEmojiType: ReactionEmojiType;
  RejectFriendRequestResponse: ResolverTypeWrapper<Omit<RejectFriendRequestResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  RemoveFriendResponse: ResolverTypeWrapper<Omit<RemoveFriendResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  Scores: ResolverTypeWrapper<Scores>;
  Season: ResolverTypeWrapper<Season>;
  SeasonActive: ResolverTypeWrapper<SeasonActive>;
  SeasonConnection: ResolverTypeWrapper<SeasonConnection>;
  SeasonEdge: ResolverTypeWrapper<SeasonEdge>;
  SendFriendRequestResponse: ResolverTypeWrapper<Omit<SendFriendRequestResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  SeriesScore: ResolverTypeWrapper<SeriesScore>;
  SharedGameLog: ResolverTypeWrapper<SharedGameLog>;
  SortDirection: SortDirection;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  TargetType: TargetType;
  Team: ResolverTypeWrapper<Team>;
  TeamConnection: ResolverTypeWrapper<TeamConnection>;
  TeamEdge: ResolverTypeWrapper<TeamEdge>;
  TeamFilters: TeamFilters;
  TeamGameStats: ResolverTypeWrapper<TeamGameStats>;
  TeamGameStatsInput: TeamGameStatsInput;
  TeamScore: ResolverTypeWrapper<TeamScore>;
  TeamSortInput: TeamSortInput;
  TeamStats: ResolverTypeWrapper<TeamStats>;
  TeamStatsConnection: ResolverTypeWrapper<TeamStatsConnection>;
  TeamStatsEdge: ResolverTypeWrapper<TeamStatsEdge>;
  TeamSummary: ResolverTypeWrapper<TeamSummary>;
  Teams: ResolverTypeWrapper<Teams>;
  ThreePointerStats: ResolverTypeWrapper<ThreePointerStats>;
  UpdateCommentInput: UpdateCommentInput;
  UpdateCommentResponse: ResolverTypeWrapper<Omit<UpdateCommentResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  UpdateFriendshipStatusInput: UpdateFriendshipStatusInput;
  UpdateFriendshipStatusResponse: ResolverTypeWrapper<Omit<UpdateFriendshipStatusResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  UpdateGameInput: UpdateGameInput;
  UpdateGameLogInput: UpdateGameLogInput;
  UpdateGameLogResponse: ResolverTypeWrapper<Omit<UpdateGameLogResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  UpdateGameResponse: ResolverTypeWrapper<Omit<UpdateGameResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  UpdateGameStatsInput: UpdateGameStatsInput;
  UpdateGameStatsResponse: ResolverTypeWrapper<Omit<UpdateGameStatsResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  UpdatePlayerInput: UpdatePlayerInput;
  UpdatePlayerResponse: ResolverTypeWrapper<Omit<UpdatePlayerResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  UpdatePlayerStatsInput: UpdatePlayerStatsInput;
  UpdatePlayerStatsResponse: ResolverTypeWrapper<Omit<UpdatePlayerStatsResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  UpdateTeamInput: ResolverTypeWrapper<UpdateTeamInput>;
  UpdateTeamResponse: ResolverTypeWrapper<Omit<UpdateTeamResponse, 'errors'> & { errors?: Maybe<Array<ResolversTypes['ErrorResult']>> }>;
  User: ResolverTypeWrapper<User>;
  UserBase: ResolverTypeWrapper<UserBase>;
  UserBaseConnection: ResolverTypeWrapper<UserBaseConnection>;
  UserBaseEdge: ResolverTypeWrapper<UserBaseEdge>;
  UserConnection: ResolverTypeWrapper<UserConnection>;
  UserEdge: ResolverTypeWrapper<UserEdge>;
  UserSummary: ResolverTypeWrapper<UserSummary>;
  ValidationError: ResolverTypeWrapper<ValidationError>;
  WeightInfo: ResolverTypeWrapper<WeightInfo>;
  WinLossRecord: ResolverTypeWrapper<WinLossRecord>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AcceptFriendRequestResponse: Omit<AcceptFriendRequestResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  Any: Scalars['Any']['output'];
  Arena: Arena;
  AuthenticationError: AuthenticationError;
  AuthorizationError: AuthorizationError;
  BirthInfo: BirthInfo;
  Boolean: Scalars['Boolean']['output'];
  BusinessLogicError: BusinessLogicError;
  Comment: Comment;
  CommentConnection: CommentConnection;
  CommentEdge: CommentEdge;
  CommentFilters: CommentFilters;
  ConferenceStanding: ConferenceStanding;
  CreateCommentInput: CreateCommentInput;
  CreateCommentResponse: Omit<CreateCommentResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  CreateGameInput: CreateGameInput;
  CreateGameLogInput: CreateGameLogInput;
  CreateGameLogResponse: Omit<CreateGameLogResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  CreateGameResponse: Omit<CreateGameResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  CreateGameStatsInput: CreateGameStatsInput;
  CreateGameStatsResponse: Omit<CreateGameStatsResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  CreateReactionInput: CreateReactionInput;
  CreateReactionResponse: Omit<CreateReactionResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  DateRangeInput: DateRangeInput;
  DateTime: Scalars['DateTime']['output'];
  DeleteCommentResponse: Omit<DeleteCommentResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  DeleteGameLogResponse: Omit<DeleteGameLogResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  DeleteGameResponse: Omit<DeleteGameResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  DeleteGameStatsResponse: Omit<DeleteGameStatsResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  DeletePlayerStatsResponse: Omit<DeletePlayerStatsResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  DeleteReactionResponse: Omit<DeleteReactionResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  DeleteUserResponse: Omit<DeleteUserResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  DivisionStanding: DivisionStanding;
  ErrorResult: ResolversUnionTypes<ResolversParentTypes>['ErrorResult'];
  FavoritePlayerResponse: Omit<FavoritePlayerResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  FavoriteTeamResponse: Omit<FavoriteTeamResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  FieldGoalStats: FieldGoalStats;
  Float: Scalars['Float']['output'];
  FreeThrowStats: FreeThrowStats;
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
  GameLogStats: GameLogStats;
  GamePeriods: GamePeriods;
  GameStats: GameStats;
  GameStatus: GameStatus;
  HeightInfo: HeightInfo;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  League: League;
  LeagueConnection: LeagueConnection;
  LeagueDetails: LeagueDetails;
  LeagueEdge: LeagueEdge;
  LeaguesInfo: LeaguesInfo;
  Mutation: {};
  MutationResponse: Omit<MutationResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  NbaInfo: NbaInfo;
  NotFoundError: NotFoundError;
  PageInfo: PageInfo;
  PaginatedItem: ResolversUnionTypes<ResolversParentTypes>['PaginatedItem'];
  PaginatedResponse: Omit<PaginatedResponse, 'items'> & { items: Array<ResolversParentTypes['PaginatedItem']> };
  PaginationInput: PaginationInput;
  Player: Player;
  PlayerConnection: PlayerConnection;
  PlayerEdge: PlayerEdge;
  PlayerFilters: PlayerFilters;
  PlayerGameStats: PlayerGameStats;
  PlayerStats: PlayerStats;
  PlayerStatsConnection: PlayerStatsConnection;
  PlayerStatsEdge: PlayerStatsEdge;
  Query: {};
  RateLimitError: RateLimitError;
  Reaction: Reaction;
  ReactionConnection: ReactionConnection;
  ReactionEdge: ReactionEdge;
  RejectFriendRequestResponse: Omit<RejectFriendRequestResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  RemoveFriendResponse: Omit<RemoveFriendResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  Scores: Scores;
  Season: Season;
  SeasonActive: SeasonActive;
  SeasonConnection: SeasonConnection;
  SeasonEdge: SeasonEdge;
  SendFriendRequestResponse: Omit<SendFriendRequestResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  SeriesScore: SeriesScore;
  SharedGameLog: SharedGameLog;
  String: Scalars['String']['output'];
  Team: Team;
  TeamConnection: TeamConnection;
  TeamEdge: TeamEdge;
  TeamFilters: TeamFilters;
  TeamGameStats: TeamGameStats;
  TeamGameStatsInput: TeamGameStatsInput;
  TeamScore: TeamScore;
  TeamSortInput: TeamSortInput;
  TeamStats: TeamStats;
  TeamStatsConnection: TeamStatsConnection;
  TeamStatsEdge: TeamStatsEdge;
  TeamSummary: TeamSummary;
  Teams: Teams;
  ThreePointerStats: ThreePointerStats;
  UpdateCommentInput: UpdateCommentInput;
  UpdateCommentResponse: Omit<UpdateCommentResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  UpdateFriendshipStatusInput: UpdateFriendshipStatusInput;
  UpdateFriendshipStatusResponse: Omit<UpdateFriendshipStatusResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  UpdateGameInput: UpdateGameInput;
  UpdateGameLogInput: UpdateGameLogInput;
  UpdateGameLogResponse: Omit<UpdateGameLogResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  UpdateGameResponse: Omit<UpdateGameResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  UpdateGameStatsInput: UpdateGameStatsInput;
  UpdateGameStatsResponse: Omit<UpdateGameStatsResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  UpdatePlayerInput: UpdatePlayerInput;
  UpdatePlayerResponse: Omit<UpdatePlayerResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  UpdatePlayerStatsInput: UpdatePlayerStatsInput;
  UpdatePlayerStatsResponse: Omit<UpdatePlayerStatsResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  UpdateTeamInput: UpdateTeamInput;
  UpdateTeamResponse: Omit<UpdateTeamResponse, 'errors'> & { errors?: Maybe<Array<ResolversParentTypes['ErrorResult']>> };
  User: User;
  UserBase: UserBase;
  UserBaseConnection: UserBaseConnection;
  UserBaseEdge: UserBaseEdge;
  UserConnection: UserConnection;
  UserEdge: UserEdge;
  UserSummary: UserSummary;
  ValidationError: ValidationError;
  WeightInfo: WeightInfo;
  WinLossRecord: WinLossRecord;
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
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type BirthInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BirthInfo'] = ResolversParentTypes['BirthInfo']> = {
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BusinessLogicErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BusinessLogicError'] = ResolversParentTypes['BusinessLogicError']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  details?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']> = {
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parent_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parent_type?: Resolver<ResolversTypes['ParentType'], ParentType, ContextType>;
  reactions?: Resolver<Array<ResolversTypes['Reaction']>, ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
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

export type CreateGameStatsResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateGameStatsResponse'] = ResolversParentTypes['CreateGameStatsResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  gameStats?: Resolver<Maybe<ResolversTypes['GameStats']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateReactionResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateReactionResponse'] = ResolversParentTypes['CreateReactionResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  reaction?: Resolver<Maybe<ResolversTypes['Reaction']>, ParentType, ContextType>;
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

export type DeleteGameResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteGameResponse'] = ResolversParentTypes['DeleteGameResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteGameStatsResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteGameStatsResponse'] = ResolversParentTypes['DeleteGameStatsResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeletePlayerStatsResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeletePlayerStatsResponse'] = ResolversParentTypes['DeletePlayerStatsResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteReactionResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteReactionResponse'] = ResolversParentTypes['DeleteReactionResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteUserResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteUserResponse'] = ResolversParentTypes['DeleteUserResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DivisionStandingResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DivisionStanding'] = ResolversParentTypes['DivisionStanding']> = {
  gamesBehind?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  loss?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  win?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ErrorResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ErrorResult'] = ResolversParentTypes['ErrorResult']> = {
  __resolveType: TypeResolveFn<'AuthenticationError' | 'AuthorizationError' | 'BusinessLogicError' | 'NotFoundError' | 'RateLimitError' | 'ValidationError', ParentType, ContextType>;
};

export type FavoritePlayerResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FavoritePlayerResponse'] = ResolversParentTypes['FavoritePlayerResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  player?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FavoriteTeamResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FavoriteTeamResponse'] = ResolversParentTypes['FavoriteTeamResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  team?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FieldGoalStatsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FieldGoalStats'] = ResolversParentTypes['FieldGoalStats']> = {
  attempted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  made?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  percentage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FreeThrowStatsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FreeThrowStats'] = ResolversParentTypes['FreeThrowStats']> = {
  attempted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  made?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  percentage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FriendshipResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Friendship'] = ResolversParentTypes['Friendship']> = {
  created_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  initiator?: Resolver<ResolversTypes['UserSummary'], ParentType, ContextType>;
  recipient?: Resolver<ResolversTypes['UserSummary'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['FriendshipStatus'], ParentType, ContextType>;
  subscriberId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Game'] = ResolversParentTypes['Game']> = {
  arena?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  awayTeamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  away_score?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['GameDate'], ParentType, ContextType>;
  game_type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  homeTeamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  home_score?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  leadChanges?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  league?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nba_game_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  nugget?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  officials?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  periods?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  scores?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  season?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  stage?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['GameStatus'], ParentType, ContextType>;
  teams?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  timesTied?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GameConnection'] = ResolversParentTypes['GameConnection']> = {
  edges?: Resolver<Array<ResolversTypes['GameEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameDateResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GameDate'] = ResolversParentTypes['GameDate']> = {
  duration?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  comments?: Resolver<ResolversTypes['CommentConnection'], ParentType, ContextType, Partial<GameLogcommentsArgs>>;
  created_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  game?: Resolver<ResolversTypes['Game'], ParentType, ContextType>;
  gameId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rating?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  ratingForGame?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  ratingStars?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  reactions?: Resolver<ResolversTypes['ReactionConnection'], ParentType, ContextType, Partial<GameLogreactionsArgs>>;
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['UserSummary'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  watchedCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  watchedDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  watchedLocation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type GameLogStatsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GameLogStats'] = ResolversParentTypes['GameLogStats']> = {
  averageRating?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  byClassification?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  byMonth?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GamePeriodsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GamePeriods'] = ResolversParentTypes['GamePeriods']> = {
  current?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  endOfPeriod?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameStatsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GameStats'] = ResolversParentTypes['GameStats']> = {
  assists?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  blocks?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  fieldGoals?: Resolver<ResolversTypes['FieldGoalStats'], ParentType, ContextType>;
  fouls?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  freeThrows?: Resolver<ResolversTypes['FreeThrowStats'], ParentType, ContextType>;
  game?: Resolver<ResolversTypes['Game'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  rebounds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  steals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  threePointers?: Resolver<ResolversTypes['ThreePointerStats'], ParentType, ContextType>;
  turnovers?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameStatusResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GameStatus'] = ResolversParentTypes['GameStatus']> = {
  clock?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  halftime?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  long?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  short?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HeightInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['HeightInfo'] = ResolversParentTypes['HeightInfo']> = {
  feets?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  inches?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  meters?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JSONScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type LeagueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['League'] = ResolversParentTypes['League']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  logo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LeagueConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LeagueConnection'] = ResolversParentTypes['LeagueConnection']> = {
  edges?: Resolver<Array<ResolversTypes['LeagueEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LeagueDetailsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LeagueDetails'] = ResolversParentTypes['LeagueDetails']> = {
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  conference?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  division?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  jersey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pos?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LeagueEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LeagueEdge'] = ResolversParentTypes['LeagueEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['League'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LeaguesInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LeaguesInfo'] = ResolversParentTypes['LeaguesInfo']> = {
  sacramento?: Resolver<Maybe<ResolversTypes['LeagueDetails']>, ParentType, ContextType>;
  standard?: Resolver<Maybe<ResolversTypes['LeagueDetails']>, ParentType, ContextType>;
  utah?: Resolver<Maybe<ResolversTypes['LeagueDetails']>, ParentType, ContextType>;
  vegas?: Resolver<Maybe<ResolversTypes['LeagueDetails']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  acceptFriendRequest?: Resolver<ResolversTypes['AcceptFriendRequestResponse'], ParentType, ContextType, RequireFields<MutationacceptFriendRequestArgs, 'friendshipId'>>;
  createComment?: Resolver<ResolversTypes['CreateCommentResponse'], ParentType, ContextType, RequireFields<MutationcreateCommentArgs, 'input'>>;
  createGame?: Resolver<ResolversTypes['CreateGameResponse'], ParentType, ContextType, RequireFields<MutationcreateGameArgs, 'input'>>;
  createGameLog?: Resolver<ResolversTypes['CreateGameLogResponse'], ParentType, ContextType, RequireFields<MutationcreateGameLogArgs, 'input'>>;
  createGameStats?: Resolver<ResolversTypes['CreateGameStatsResponse'], ParentType, ContextType, RequireFields<MutationcreateGameStatsArgs, 'input'>>;
  createReaction?: Resolver<ResolversTypes['CreateReactionResponse'], ParentType, ContextType, RequireFields<MutationcreateReactionArgs, 'input'>>;
  deleteComment?: Resolver<ResolversTypes['DeleteCommentResponse'], ParentType, ContextType, RequireFields<MutationdeleteCommentArgs, 'id'>>;
  deleteGame?: Resolver<ResolversTypes['DeleteGameResponse'], ParentType, ContextType, RequireFields<MutationdeleteGameArgs, 'id'>>;
  deleteGameLog?: Resolver<ResolversTypes['DeleteGameLogResponse'], ParentType, ContextType, RequireFields<MutationdeleteGameLogArgs, 'id'>>;
  deleteGameStats?: Resolver<ResolversTypes['DeleteGameStatsResponse'], ParentType, ContextType, RequireFields<MutationdeleteGameStatsArgs, 'id'>>;
  deletePlayerStats?: Resolver<ResolversTypes['DeletePlayerStatsResponse'], ParentType, ContextType, RequireFields<MutationdeletePlayerStatsArgs, 'id'>>;
  deleteReaction?: Resolver<ResolversTypes['DeleteReactionResponse'], ParentType, ContextType, RequireFields<MutationdeleteReactionArgs, 'id'>>;
  deleteUser?: Resolver<ResolversTypes['DeleteUserResponse'], ParentType, ContextType, RequireFields<MutationdeleteUserArgs, 'id'>>;
  favoritePlayer?: Resolver<ResolversTypes['FavoritePlayerResponse'], ParentType, ContextType, RequireFields<MutationfavoritePlayerArgs, 'id'>>;
  favoriteTeam?: Resolver<ResolversTypes['FavoriteTeamResponse'], ParentType, ContextType, RequireFields<MutationfavoriteTeamArgs, 'id'>>;
  rejectFriendRequest?: Resolver<ResolversTypes['RejectFriendRequestResponse'], ParentType, ContextType, RequireFields<MutationrejectFriendRequestArgs, 'friendshipId'>>;
  removeFriend?: Resolver<ResolversTypes['RemoveFriendResponse'], ParentType, ContextType, RequireFields<MutationremoveFriendArgs, 'friendshipId'>>;
  sendFriendRequest?: Resolver<ResolversTypes['SendFriendRequestResponse'], ParentType, ContextType, RequireFields<MutationsendFriendRequestArgs, 'userId'>>;
  updateComment?: Resolver<ResolversTypes['UpdateCommentResponse'], ParentType, ContextType, RequireFields<MutationupdateCommentArgs, 'id' | 'input'>>;
  updateFriendshipStatus?: Resolver<ResolversTypes['UpdateFriendshipStatusResponse'], ParentType, ContextType, RequireFields<MutationupdateFriendshipStatusArgs, 'input'>>;
  updateGame?: Resolver<ResolversTypes['UpdateGameResponse'], ParentType, ContextType, RequireFields<MutationupdateGameArgs, 'id' | 'input'>>;
  updateGameLog?: Resolver<ResolversTypes['UpdateGameLogResponse'], ParentType, ContextType, RequireFields<MutationupdateGameLogArgs, 'id' | 'input'>>;
  updateGameStats?: Resolver<ResolversTypes['UpdateGameStatsResponse'], ParentType, ContextType, RequireFields<MutationupdateGameStatsArgs, 'id' | 'input'>>;
  updatePlayer?: Resolver<ResolversTypes['UpdatePlayerResponse'], ParentType, ContextType, RequireFields<MutationupdatePlayerArgs, 'id' | 'input'>>;
  updatePlayerStats?: Resolver<ResolversTypes['UpdatePlayerStatsResponse'], ParentType, ContextType, RequireFields<MutationupdatePlayerStatsArgs, 'id' | 'input'>>;
};

export type MutationResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MutationResponse'] = ResolversParentTypes['MutationResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NbaInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NbaInfo'] = ResolversParentTypes['NbaInfo']> = {
  pro?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  start?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NotFoundErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NotFoundError'] = ResolversParentTypes['NotFoundError']> = {
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  resource?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PageInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaginatedItem'] = ResolversParentTypes['PaginatedItem']> = {
  __resolveType: TypeResolveFn<'Comment' | 'Game' | 'GameLog' | 'Player' | 'PlayerStats' | 'UserBase', ParentType, ContextType>;
};

export type PaginatedResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PaginatedResponse'] = ResolversParentTypes['PaginatedResponse']> = {
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['PaginatedItem']>, ParentType, ContextType>;
  nextCursor?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Player'] = ResolversParentTypes['Player']> = {
  affiliation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  birth?: Resolver<Maybe<ResolversTypes['BirthInfo']>, ParentType, ContextType>;
  college?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  first_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['HeightInfo']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  last_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  leagues?: Resolver<Maybe<ResolversTypes['LeaguesInfo']>, ParentType, ContextType>;
  nba?: Resolver<Maybe<ResolversTypes['NbaInfo']>, ParentType, ContextType>;
  seasons_active?: Resolver<Maybe<Array<Maybe<ResolversTypes['SeasonActive']>>>, ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  weight?: Resolver<Maybe<ResolversTypes['WeightInfo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerConnection'] = ResolversParentTypes['PlayerConnection']> = {
  edges?: Resolver<Array<ResolversTypes['PlayerEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerEdge'] = ResolversParentTypes['PlayerEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Player'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerGameStatsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerGameStats'] = ResolversParentTypes['PlayerGameStats']> = {
  assists?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  blocks?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  comment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  defReb?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fga?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fgm?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fgp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fieldGoals?: Resolver<ResolversTypes['FieldGoalStats'], ParentType, ContextType>;
  fouls?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  freeThrows?: Resolver<ResolversTypes['FreeThrowStats'], ParentType, ContextType>;
  fta?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  ftm?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  ftp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  game?: Resolver<ResolversTypes['Game'], ParentType, ContextType>;
  min?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  minutes?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  offReb?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  pFouls?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  player?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType>;
  plusMinus?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pos?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rebounds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  steals?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  threePointers?: Resolver<ResolversTypes['ThreePointerStats'], ParentType, ContextType>;
  totReb?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tpa?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tpm?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tpp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  turnovers?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerStatsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerStats'] = ResolversParentTypes['PlayerStats']> = {
  assists?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  blocks?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  comment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  defReb?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fga?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fgm?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fgp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fta?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  ftm?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  ftp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  game?: Resolver<ResolversTypes['Game'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  min?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  offReb?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  pFouls?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>;
  playerId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  plusMinus?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  points?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  pos?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  season?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  steals?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  totReb?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tpa?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tpm?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tpp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  turnovers?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerStatsConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerStatsConnection'] = ResolversParentTypes['PlayerStatsConnection']> = {
  edges?: Resolver<Array<ResolversTypes['PlayerStatsEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlayerStatsEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlayerStatsEdge'] = ResolversParentTypes['PlayerStatsEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['PlayerStats'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  allPlayerStats?: Resolver<ResolversTypes['PlayerStatsConnection'], ParentType, ContextType, RequireFields<QueryallPlayerStatsArgs, 'season'>>;
  allTeamStats?: Resolver<ResolversTypes['TeamStatsConnection'], ParentType, ContextType, RequireFields<QueryallTeamStatsArgs, 'season'>>;
  comments?: Resolver<ResolversTypes['CommentConnection'], ParentType, ContextType, RequireFields<QuerycommentsArgs, 'parent_id'>>;
  friendship?: Resolver<Maybe<ResolversTypes['Friendship']>, ParentType, ContextType, RequireFields<QueryfriendshipArgs, 'id'>>;
  friendships?: Resolver<ResolversTypes['UserBaseConnection'], ParentType, ContextType, RequireFields<QueryfriendshipsArgs, 'userId'>>;
  game?: Resolver<Maybe<ResolversTypes['Game']>, ParentType, ContextType, RequireFields<QuerygameArgs, 'id'>>;
  gameLog?: Resolver<Maybe<ResolversTypes['GameLog']>, ParentType, ContextType, RequireFields<QuerygameLogArgs, 'gameId' | 'userId'>>;
  gameLogStats?: Resolver<ResolversTypes['GameLogStats'], ParentType, ContextType, Partial<QuerygameLogStatsArgs>>;
  gameLogs?: Resolver<ResolversTypes['GameLogConnection'], ParentType, ContextType, Partial<QuerygameLogsArgs>>;
  gameStats?: Resolver<Maybe<ResolversTypes['GameStats']>, ParentType, ContextType, RequireFields<QuerygameStatsArgs, 'id'>>;
  games?: Resolver<ResolversTypes['GameConnection'], ParentType, ContextType, Partial<QuerygamesArgs>>;
  leagues?: Resolver<ResolversTypes['LeagueConnection'], ParentType, ContextType, Partial<QueryleaguesArgs>>;
  liveGames?: Resolver<ResolversTypes['GameConnection'], ParentType, ContextType, Partial<QueryliveGamesArgs>>;
  player?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType, RequireFields<QueryplayerArgs, 'id'>>;
  playerGameStats?: Resolver<Maybe<ResolversTypes['PlayerStats']>, ParentType, ContextType, RequireFields<QueryplayerGameStatsArgs, 'game_id' | 'player_id'>>;
  playerSeasonStats?: Resolver<Maybe<ResolversTypes['PlayerStats']>, ParentType, ContextType, RequireFields<QueryplayerSeasonStatsArgs, 'playerId' | 'season'>>;
  playerSeasonStatsList?: Resolver<ResolversTypes['PlayerStatsConnection'], ParentType, ContextType, RequireFields<QueryplayerSeasonStatsListArgs, 'playerId'>>;
  playerStats?: Resolver<Maybe<ResolversTypes['PlayerStats']>, ParentType, ContextType, RequireFields<QueryplayerStatsArgs, 'playerId' | 'season'>>;
  playerStatsByTeam?: Resolver<ResolversTypes['PlayerStatsConnection'], ParentType, ContextType, RequireFields<QueryplayerStatsByTeamArgs, 'season' | 'team'>>;
  players?: Resolver<ResolversTypes['PlayerConnection'], ParentType, ContextType, Partial<QueryplayersArgs>>;
  reactions?: Resolver<ResolversTypes['ReactionConnection'], ParentType, ContextType, RequireFields<QueryreactionsArgs, 'targetId'>>;
  seasons?: Resolver<ResolversTypes['SeasonConnection'], ParentType, ContextType, Partial<QueryseasonsArgs>>;
  team?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType, RequireFields<QueryteamArgs, 'id'>>;
  teamGameStats?: Resolver<Maybe<ResolversTypes['TeamStats']>, ParentType, ContextType, RequireFields<QueryteamGameStatsArgs, 'game_id' | 'team'>>;
  teamStats?: Resolver<ResolversTypes['TeamStatsConnection'], ParentType, ContextType, RequireFields<QueryteamStatsArgs, 'teamId'>>;
  teams?: Resolver<ResolversTypes['TeamConnection'], ParentType, ContextType, Partial<QueryteamsArgs>>;
  topPlayers?: Resolver<ResolversTypes['PlayerConnection'], ParentType, ContextType, RequireFields<QuerytopPlayersArgs, 'season'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryuserArgs, 'id'>>;
  users?: Resolver<ResolversTypes['UserConnection'], ParentType, ContextType, Partial<QueryusersArgs>>;
};

export type RateLimitErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RateLimitError'] = ResolversParentTypes['RateLimitError']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  retryAfter?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReactionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Reaction'] = ResolversParentTypes['Reaction']> = {
  created_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  emoji?: Resolver<ResolversTypes['ReactionEmojiType'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  targetId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  targetType?: Resolver<ResolversTypes['ParentType'], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['UserSummary'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReactionConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReactionConnection'] = ResolversParentTypes['ReactionConnection']> = {
  edges?: Resolver<Array<ResolversTypes['ReactionEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReactionEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReactionEdge'] = ResolversParentTypes['ReactionEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Reaction'], ParentType, ContextType>;
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

export type ScoresResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Scores'] = ResolversParentTypes['Scores']> = {
  home?: Resolver<Maybe<ResolversTypes['TeamScore']>, ParentType, ContextType>;
  visitors?: Resolver<Maybe<ResolversTypes['TeamScore']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SeasonResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Season'] = ResolversParentTypes['Season']> = {
  display_year?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  end_date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  is_current?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  is_playoffs?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  start_date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  year?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SeasonActiveResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SeasonActive'] = ResolversParentTypes['SeasonActive']> = {
  season?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  teams?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SeasonConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SeasonConnection'] = ResolversParentTypes['SeasonConnection']> = {
  edges?: Resolver<Array<ResolversTypes['SeasonEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SeasonEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SeasonEdge'] = ResolversParentTypes['SeasonEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Season'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SendFriendRequestResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SendFriendRequestResponse'] = ResolversParentTypes['SendFriendRequestResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  friendship?: Resolver<Maybe<ResolversTypes['Friendship']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SeriesScoreResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SeriesScore'] = ResolversParentTypes['SeriesScore']> = {
  loss?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  win?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SharedGameLogResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SharedGameLog'] = ResolversParentTypes['SharedGameLog']> = {
  classification?: Resolver<ResolversTypes['Classification'], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  game?: Resolver<ResolversTypes['Game'], ParentType, ContextType>;
  gameId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rating?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['UserSummary'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  watchedCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  watchedDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  watchedLocation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  watchedSetting?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Team'] = ResolversParentTypes['Team']> = {
  abbreviation?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  city?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  conference?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  division?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  logo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  logo_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nickname?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  primary_color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  secondary_color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
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

export type TeamGameStatsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamGameStats'] = ResolversParentTypes['TeamGameStats']> = {
  assists?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  blocks?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fieldGoals?: Resolver<ResolversTypes['FieldGoalStats'], ParentType, ContextType>;
  fouls?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  freeThrows?: Resolver<ResolversTypes['FreeThrowStats'], ParentType, ContextType>;
  game?: Resolver<ResolversTypes['Game'], ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  rebounds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  steals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  threePointers?: Resolver<ResolversTypes['ThreePointerStats'], ParentType, ContextType>;
  turnovers?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamScoreResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamScore'] = ResolversParentTypes['TeamScore']> = {
  linescore?: Resolver<Maybe<Array<Maybe<ResolversTypes['Int']>>>, ParentType, ContextType>;
  loss?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  points?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  series?: Resolver<Maybe<ResolversTypes['SeriesScore']>, ParentType, ContextType>;
  win?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamStatsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamStats'] = ResolversParentTypes['TeamStats']> = {
  assists?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  blocks?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  defReb?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  defensive_rebounds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fga?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fgm?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fgp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  field_goal_percentage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  field_goals_attempted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  field_goals_made?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  free_throw_percentage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  free_throws_attempted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  free_throws_made?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fta?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  ftm?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  ftp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  games_played?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  losses?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  offReb?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  offensive_rebounds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pFouls?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  personal_fouls?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  plus_minus?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  season?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  steals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  three_pointer_percentage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  three_pointers_attempted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  three_pointers_made?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totReb?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  total_rebounds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tpa?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tpm?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tpp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  turnovers?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  wins?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamStatsConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamStatsConnection'] = ResolversParentTypes['TeamStatsConnection']> = {
  edges?: Resolver<Array<ResolversTypes['TeamStatsEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamStatsEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamStatsEdge'] = ResolversParentTypes['TeamStatsEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['TeamStats'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamSummaryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamSummary'] = ResolversParentTypes['TeamSummary']> = {
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  logo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nickname?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Teams'] = ResolversParentTypes['Teams']> = {
  home?: Resolver<Maybe<ResolversTypes['TeamSummary']>, ParentType, ContextType>;
  visitors?: Resolver<Maybe<ResolversTypes['TeamSummary']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ThreePointerStatsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ThreePointerStats'] = ResolversParentTypes['ThreePointerStats']> = {
  attempted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  made?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  percentage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateCommentResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateCommentResponse'] = ResolversParentTypes['UpdateCommentResponse']> = {
  comment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateFriendshipStatusResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateFriendshipStatusResponse'] = ResolversParentTypes['UpdateFriendshipStatusResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  friendship?: Resolver<Maybe<ResolversTypes['Friendship']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateGameLogResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateGameLogResponse'] = ResolversParentTypes['UpdateGameLogResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  gameLog?: Resolver<Maybe<ResolversTypes['GameLog']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateGameResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateGameResponse'] = ResolversParentTypes['UpdateGameResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  game?: Resolver<Maybe<ResolversTypes['Game']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateGameStatsResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateGameStatsResponse'] = ResolversParentTypes['UpdateGameStatsResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  gameStats?: Resolver<Maybe<ResolversTypes['GameStats']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdatePlayerResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdatePlayerResponse'] = ResolversParentTypes['UpdatePlayerResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  player?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdatePlayerStatsResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdatePlayerStatsResponse'] = ResolversParentTypes['UpdatePlayerStatsResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  playerStats?: Resolver<Maybe<ResolversTypes['PlayerStats']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateTeamInputResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateTeamInput'] = ResolversParentTypes['UpdateTeamInput']> = {
  all_star?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  conference?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  division?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  logo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nba_franchise?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  nickname?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateTeamResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateTeamResponse'] = ResolversParentTypes['UpdateTeamResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  team?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  avatar_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comments?: Resolver<Array<ResolversTypes['Comment']>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deleted_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email_address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  first_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  friendships?: Resolver<Array<ResolversTypes['Friendship']>, ParentType, ContextType>;
  gameLogs?: Resolver<Array<ResolversTypes['GameLog']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  initiated_friendships?: Resolver<Array<ResolversTypes['Friendship']>, ParentType, ContextType>;
  last_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reactions?: Resolver<Array<ResolversTypes['Reaction']>, ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserBaseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserBase'] = ResolversParentTypes['UserBase']> = {
  avatar_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email_address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserBaseConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserBaseConnection'] = ResolversParentTypes['UserBaseConnection']> = {
  edges?: Resolver<Array<ResolversTypes['UserBaseEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserBaseEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserBaseEdge'] = ResolversParentTypes['UserBaseEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['UserBase'], ParentType, ContextType>;
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
  node?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSummaryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserSummary'] = ResolversParentTypes['UserSummary']> = {
  email_address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  first_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  last_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ValidationErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ValidationError'] = ResolversParentTypes['ValidationError']> = {
  field?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WeightInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['WeightInfo'] = ResolversParentTypes['WeightInfo']> = {
  kilograms?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  pounds?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WinLossRecordResolvers<ContextType = Context, ParentType extends ResolversParentTypes['WinLossRecord'] = ResolversParentTypes['WinLossRecord']> = {
  away?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  home?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lastTen?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  percentage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  AcceptFriendRequestResponse?: AcceptFriendRequestResponseResolvers<ContextType>;
  Any?: GraphQLScalarType;
  Arena?: ArenaResolvers<ContextType>;
  AuthenticationError?: AuthenticationErrorResolvers<ContextType>;
  AuthorizationError?: AuthorizationErrorResolvers<ContextType>;
  BirthInfo?: BirthInfoResolvers<ContextType>;
  BusinessLogicError?: BusinessLogicErrorResolvers<ContextType>;
  Comment?: CommentResolvers<ContextType>;
  CommentConnection?: CommentConnectionResolvers<ContextType>;
  CommentEdge?: CommentEdgeResolvers<ContextType>;
  ConferenceStanding?: ConferenceStandingResolvers<ContextType>;
  CreateCommentResponse?: CreateCommentResponseResolvers<ContextType>;
  CreateGameLogResponse?: CreateGameLogResponseResolvers<ContextType>;
  CreateGameResponse?: CreateGameResponseResolvers<ContextType>;
  CreateGameStatsResponse?: CreateGameStatsResponseResolvers<ContextType>;
  CreateReactionResponse?: CreateReactionResponseResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DeleteCommentResponse?: DeleteCommentResponseResolvers<ContextType>;
  DeleteGameLogResponse?: DeleteGameLogResponseResolvers<ContextType>;
  DeleteGameResponse?: DeleteGameResponseResolvers<ContextType>;
  DeleteGameStatsResponse?: DeleteGameStatsResponseResolvers<ContextType>;
  DeletePlayerStatsResponse?: DeletePlayerStatsResponseResolvers<ContextType>;
  DeleteReactionResponse?: DeleteReactionResponseResolvers<ContextType>;
  DeleteUserResponse?: DeleteUserResponseResolvers<ContextType>;
  DivisionStanding?: DivisionStandingResolvers<ContextType>;
  ErrorResult?: ErrorResultResolvers<ContextType>;
  FavoritePlayerResponse?: FavoritePlayerResponseResolvers<ContextType>;
  FavoriteTeamResponse?: FavoriteTeamResponseResolvers<ContextType>;
  FieldGoalStats?: FieldGoalStatsResolvers<ContextType>;
  FreeThrowStats?: FreeThrowStatsResolvers<ContextType>;
  Friendship?: FriendshipResolvers<ContextType>;
  Game?: GameResolvers<ContextType>;
  GameConnection?: GameConnectionResolvers<ContextType>;
  GameDate?: GameDateResolvers<ContextType>;
  GameEdge?: GameEdgeResolvers<ContextType>;
  GameLog?: GameLogResolvers<ContextType>;
  GameLogConnection?: GameLogConnectionResolvers<ContextType>;
  GameLogEdge?: GameLogEdgeResolvers<ContextType>;
  GameLogStats?: GameLogStatsResolvers<ContextType>;
  GamePeriods?: GamePeriodsResolvers<ContextType>;
  GameStats?: GameStatsResolvers<ContextType>;
  GameStatus?: GameStatusResolvers<ContextType>;
  HeightInfo?: HeightInfoResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  League?: LeagueResolvers<ContextType>;
  LeagueConnection?: LeagueConnectionResolvers<ContextType>;
  LeagueDetails?: LeagueDetailsResolvers<ContextType>;
  LeagueEdge?: LeagueEdgeResolvers<ContextType>;
  LeaguesInfo?: LeaguesInfoResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  MutationResponse?: MutationResponseResolvers<ContextType>;
  NbaInfo?: NbaInfoResolvers<ContextType>;
  NotFoundError?: NotFoundErrorResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PaginatedItem?: PaginatedItemResolvers<ContextType>;
  PaginatedResponse?: PaginatedResponseResolvers<ContextType>;
  Player?: PlayerResolvers<ContextType>;
  PlayerConnection?: PlayerConnectionResolvers<ContextType>;
  PlayerEdge?: PlayerEdgeResolvers<ContextType>;
  PlayerGameStats?: PlayerGameStatsResolvers<ContextType>;
  PlayerStats?: PlayerStatsResolvers<ContextType>;
  PlayerStatsConnection?: PlayerStatsConnectionResolvers<ContextType>;
  PlayerStatsEdge?: PlayerStatsEdgeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RateLimitError?: RateLimitErrorResolvers<ContextType>;
  Reaction?: ReactionResolvers<ContextType>;
  ReactionConnection?: ReactionConnectionResolvers<ContextType>;
  ReactionEdge?: ReactionEdgeResolvers<ContextType>;
  RejectFriendRequestResponse?: RejectFriendRequestResponseResolvers<ContextType>;
  RemoveFriendResponse?: RemoveFriendResponseResolvers<ContextType>;
  Scores?: ScoresResolvers<ContextType>;
  Season?: SeasonResolvers<ContextType>;
  SeasonActive?: SeasonActiveResolvers<ContextType>;
  SeasonConnection?: SeasonConnectionResolvers<ContextType>;
  SeasonEdge?: SeasonEdgeResolvers<ContextType>;
  SendFriendRequestResponse?: SendFriendRequestResponseResolvers<ContextType>;
  SeriesScore?: SeriesScoreResolvers<ContextType>;
  SharedGameLog?: SharedGameLogResolvers<ContextType>;
  Team?: TeamResolvers<ContextType>;
  TeamConnection?: TeamConnectionResolvers<ContextType>;
  TeamEdge?: TeamEdgeResolvers<ContextType>;
  TeamGameStats?: TeamGameStatsResolvers<ContextType>;
  TeamScore?: TeamScoreResolvers<ContextType>;
  TeamStats?: TeamStatsResolvers<ContextType>;
  TeamStatsConnection?: TeamStatsConnectionResolvers<ContextType>;
  TeamStatsEdge?: TeamStatsEdgeResolvers<ContextType>;
  TeamSummary?: TeamSummaryResolvers<ContextType>;
  Teams?: TeamsResolvers<ContextType>;
  ThreePointerStats?: ThreePointerStatsResolvers<ContextType>;
  UpdateCommentResponse?: UpdateCommentResponseResolvers<ContextType>;
  UpdateFriendshipStatusResponse?: UpdateFriendshipStatusResponseResolvers<ContextType>;
  UpdateGameLogResponse?: UpdateGameLogResponseResolvers<ContextType>;
  UpdateGameResponse?: UpdateGameResponseResolvers<ContextType>;
  UpdateGameStatsResponse?: UpdateGameStatsResponseResolvers<ContextType>;
  UpdatePlayerResponse?: UpdatePlayerResponseResolvers<ContextType>;
  UpdatePlayerStatsResponse?: UpdatePlayerStatsResponseResolvers<ContextType>;
  UpdateTeamInput?: UpdateTeamInputResolvers<ContextType>;
  UpdateTeamResponse?: UpdateTeamResponseResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserBase?: UserBaseResolvers<ContextType>;
  UserBaseConnection?: UserBaseConnectionResolvers<ContextType>;
  UserBaseEdge?: UserBaseEdgeResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  UserEdge?: UserEdgeResolvers<ContextType>;
  UserSummary?: UserSummaryResolvers<ContextType>;
  ValidationError?: ValidationErrorResolvers<ContextType>;
  WeightInfo?: WeightInfoResolvers<ContextType>;
  WinLossRecord?: WinLossRecordResolvers<ContextType>;
};

