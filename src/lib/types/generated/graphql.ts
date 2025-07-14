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
  Private = 'PRIVATE',
  Protected = 'PROTECTED',
  Public = 'PUBLIC'
}

export type Comment = {
  __typename?: 'Comment';
  childComments: CommentConnection;
  content: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
  depth: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  parent_id: Scalars['ID']['output'];
  parent_type: ParentType;
  reactions: Array<Reaction>;
  updated_at: Scalars['DateTime']['output'];
  user: UserSummary;
  user_id: Scalars['ID']['output'];
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
  away_team_id: Scalars['String']['input'];
  away_team_score?: InputMaybe<Scalars['Int']['input']>;
  date: Scalars['DateTime']['input'];
  game_type: Scalars['String']['input'];
  home_team_id: Scalars['String']['input'];
  home_team_score?: InputMaybe<Scalars['Int']['input']>;
  nba_game_id?: InputMaybe<Scalars['ID']['input']>;
  status: Scalars['String']['input'];
};

export type CreateGameLogInput = {
  classification: Classification;
  gameId: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  rating_for_game: Scalars['Int']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  watched_date?: InputMaybe<Scalars['DateTime']['input']>;
  watched_location?: InputMaybe<Scalars['String']['input']>;
  watched_scope?: InputMaybe<Scalars['String']['input']>;
  watched_setting?: InputMaybe<Scalars['String']['input']>;
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
  emoji: Scalars['String']['input'];
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
  bio?: Maybe<Scalars['String']['output']>;
  comments: Array<Comment>;
  created_at: Scalars['DateTime']['output'];
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
  email_address?: Maybe<Scalars['String']['output']>;
  external_id?: Maybe<Scalars['String']['output']>;
  first_name?: Maybe<Scalars['String']['output']>;
  friendships: Array<Friendship>;
  gameLogs: Array<GameLog>;
  has_image: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  inbound_friendship_ids?: Maybe<Array<Scalars['String']['output']>>;
  initiatedFriendships: Array<Friendship>;
  last_active_at?: Maybe<Scalars['DateTime']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  last_sign_in_at?: Maybe<Scalars['DateTime']['output']>;
  object: Scalars['String']['output'];
  outbound_friendship_ids?: Maybe<Array<Scalars['String']['output']>>;
  phone_number?: Maybe<Scalars['String']['output']>;
  preferred_language?: Maybe<Scalars['String']['output']>;
  primary_email_address_id?: Maybe<Scalars['String']['output']>;
  primary_phone_number_id?: Maybe<Scalars['String']['output']>;
  profile_image_url?: Maybe<Scalars['String']['output']>;
  reactions: Array<Reaction>;
  timezone?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['DateTime']['output'];
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
  created_at: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  initiator: UserSummary;
  recipient: UserSummary;
  status: FriendshipStatus;
  updated_at: Scalars['DateTime']['output'];
};

export enum FriendshipStatus {
  Accepted = 'ACCEPTED',
  Blocked = 'BLOCKED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type Game = {
  __typename?: 'Game';
  average_rating?: Maybe<Scalars['Float']['output']>;
  away_team_id: Scalars['String']['output'];
  away_team_score?: Maybe<Scalars['Int']['output']>;
  created_at: Scalars['DateTime']['output'];
  date: Scalars['DateTime']['output'];
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
  game_type: Scalars['String']['output'];
  home_team_id: Scalars['String']['output'];
  home_team_score?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  nba_game_id?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  total_ratings?: Maybe<Scalars['Int']['output']>;
  updated_at: Scalars['DateTime']['output'];
};

export type GameConnection = {
  __typename?: 'GameConnection';
  edges: Array<GameEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
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
  created_at: Scalars['DateTime']['output'];
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
  game_id: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  rating_for_game: Scalars['Int']['output'];
  reactions: Array<Reaction>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  updated_at: Scalars['DateTime']['output'];
  user: UserSummary;
  watched_date?: Maybe<Scalars['DateTime']['output']>;
  watched_location?: Maybe<Scalars['String']['output']>;
  watched_scope?: Maybe<Scalars['String']['output']>;
  watched_setting?: Maybe<Scalars['String']['output']>;
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

export enum GameStatusEnum {
  Cancelled = 'CANCELLED',
  Finished = 'FINISHED',
  Live = 'LIVE',
  Scheduled = 'SCHEDULED'
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
  input: UpdateCommentInput;
};


export type MutationUpdateGameLogArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGameLogInput;
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
  Comment = 'COMMENT',
  GameLog = 'GAME_LOG'
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
  created_at: Scalars['DateTime']['output'];
  emoji: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  target_id: Scalars['ID']['output'];
  target_type: ParentType;
  updated_at: Scalars['DateTime']['output'];
  user: UserSummary;
  user_id: Scalars['ID']['output'];
};

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
};

export type UpdateCommentResponse = {
  __typename?: 'UpdateCommentResponse';
  comment?: Maybe<Comment>;
  errors?: Maybe<Array<ErrorResult>>;
};

export type UpdateGameLogInput = {
  classification?: InputMaybe<Classification>;
  notes?: InputMaybe<Scalars['String']['input']>;
  rating_for_game?: InputMaybe<Scalars['Int']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  watched_date?: InputMaybe<Scalars['DateTime']['input']>;
  watched_location?: InputMaybe<Scalars['String']['input']>;
  watched_scope?: InputMaybe<Scalars['String']['input']>;
  watched_setting?: InputMaybe<Scalars['String']['input']>;
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
  email_address?: Maybe<Scalars['String']['output']>;
  first_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  last_name: Scalars['String']['output'];
  phone_number?: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
};
