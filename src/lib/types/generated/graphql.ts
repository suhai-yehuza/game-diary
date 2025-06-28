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
  Private = 'Private',
  Protected = 'Protected',
  Public = 'Public'
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
  first_name?: Maybe<Scalars['String']['output']>;
  friendships: Array<Friendship>;
  gameLogs: Array<GameLog>;
  id: Scalars['ID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  inboundFriendshipIds?: Maybe<Array<Scalars['String']['output']>>;
  initiatedFriendships: Array<Friendship>;
  last_name?: Maybe<Scalars['String']['output']>;
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
  Accepted = 'Accepted',
  Blocked = 'Blocked',
  Pending = 'Pending',
  Rejected = 'Rejected'
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
  season?: Maybe<Scalars['Int']['output']>;
  stage?: Maybe<Scalars['Int']['output']>;
  status: GameStatus;
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

export type GameStatus = {
  __typename?: 'GameStatus';
  clock?: Maybe<Scalars['String']['output']>;
  halftime: Scalars['Boolean']['output'];
  long: Scalars['String']['output'];
  short: Scalars['String']['output'];
};

export enum GameStatusEnum {
  Cancelled = 'Cancelled',
  Finished = 'Finished',
  Live = 'Live',
  Scheduled = 'Scheduled'
}

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

export type Query = {
  __typename?: 'Query';
  comments: CommentConnection;
  game?: Maybe<Game>;
  gameLog?: Maybe<GameLog>;
  gameLogs: GameLogConnection;
  games: GameConnection;
  liveGames: GameConnection;
  me?: Maybe<UserSummary>;
  reactions: Array<Reaction>;
  searchUsers: UserConnection;
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
  Laugh = 'LAUGH',
  Love = 'LOVE',
  Muscle = 'MUSCLE',
  Rocket = 'ROCKET',
  Sad = 'SAD',
  Soccer = 'SOCCER',
  Tennis = 'TENNIS',
  ThumbsDown = 'THUMBS_DOWN',
  ThumbsUp = 'THUMBS_UP',
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
  first_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  last_name: Scalars['String']['output'];
  username: Scalars['String']['output'];
};
