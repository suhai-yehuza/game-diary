import type { IAnyScalar } from '@src/lib/types/declarations.d';
import type { IDateTimeScalar } from '@src/lib/types/declarations.d';
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Any: { input: IAnyScalar; output: IAnyScalar; }
  DateTime: { input: IDateTimeScalar; output: IDateTimeScalar; }
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
  first_name: Maybe<Scalars['String']['output']>;
  friendships: Array<Friendship>;
  gameLogs: Array<GameLog>;
  id: Scalars['ID']['output'];
  image_url: Maybe<Scalars['String']['output']>;
  inboundFriendshipIds: Maybe<Array<Scalars['String']['output']>>;
  initiatedFriendships: Array<Friendship>;
  last_name: Maybe<Scalars['String']['output']>;
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
  | 'Accepted'
  | 'Blocked'
  | 'Pending'
  | 'Rejected';

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
  season: Maybe<Scalars['Int']['output']>;
  stage: Maybe<Scalars['Int']['output']>;
  status: GameStatus;
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
  deletedAt: Maybe<Scalars['DateTime']['output']>;
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
  watchedScope: Maybe<Scalars['String']['output']>;
  watchedSetting: Maybe<Scalars['String']['output']>;
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

export type GameStatus = {
  clock: Maybe<Scalars['String']['output']>;
  halftime: Scalars['Boolean']['output'];
  long: Scalars['String']['output'];
  short: Scalars['String']['output'];
};

export type GameStatusEnum =
  | 'Cancelled'
  | 'Finished'
  | 'Live'
  | 'Scheduled';

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

export type Query = {
  comments: CommentConnection;
  game: Maybe<Game>;
  gameLog: Maybe<GameLog>;
  gameLogs: GameLogConnection;
  games: GameConnection;
  liveGames: GameConnection;
  me: Maybe<UserSummary>;
  reactions: Array<Reaction>;
  searchUsers: UserConnection;
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
  | 'LOVE'
  | 'MUSCLE'
  | 'ROCKET'
  | 'SAD'
  | 'SOCCER'
  | 'TENNIS'
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

export type UpdateCommentInput = {
  content: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};

export type UpdateCommentResponse = {
  comment: Maybe<Comment>;
  errors: Maybe<Array<ErrorResult>>;
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
  errors: Maybe<Array<ErrorResult>>;
  gameLog: Maybe<GameLog>;
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
  first_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  image_url: Maybe<Scalars['String']['output']>;
  last_name: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type CreateGameMutationVariables = Exact<{
  input: CreateGameInput;
}>;


export type CreateGameMutation = { createGame: { game: { id: string, league: string | null | undefined, season: number | null | undefined, stage: number | null | undefined, officials: Array<string>, timesTied: number | null | undefined, leadChanges: number | null | undefined, nugget: string | null | undefined, homeTeamId: string, awayTeamId: string, isCompleted: boolean, awayTeamScore: number | null | undefined, homeTeamScore: number | null | undefined, gameType: string, nbaGameId: string | null | undefined, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, date: { start: IDateTimeScalar, end: IDateTimeScalar | null | undefined, duration: number | null | undefined }, status: { clock: string | null | undefined, halftime: boolean, short: string, long: string }, periods: { current: number, total: number, endOfPeriod: boolean }, arena: { name: string, city: string | null | undefined, state: string | null | undefined, country: string | null | undefined } | null | undefined } | null | undefined, errors: Array<{ message: string, code: string | null | undefined, field: string | null | undefined }> | null | undefined } };

export type CreateGameLogMutationVariables = Exact<{
  input: CreateGameLogInput;
}>;


export type CreateGameLogMutation = { createGameLog: { gameLog: { id: string, ratingForGame: number, notes: string | null | undefined, tags: Array<string> | null | undefined, watchedDate: IDateTimeScalar | null | undefined, watchedSetting: string | null | undefined, watchedLocation: string | null | undefined, watchedScope: string | null | undefined, classification: Classification, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, deletedAt: IDateTimeScalar | null | undefined, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, game: { id: string, league: string | null | undefined, season: number | null | undefined, stage: number | null | undefined, officials: Array<string>, timesTied: number | null | undefined, leadChanges: number | null | undefined, nugget: string | null | undefined, homeTeamId: string, awayTeamId: string, isCompleted: boolean, awayTeamScore: number | null | undefined, homeTeamScore: number | null | undefined, gameType: string, nbaGameId: string | null | undefined, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, date: { start: IDateTimeScalar, end: IDateTimeScalar | null | undefined, duration: number | null | undefined }, status: { clock: string | null | undefined, halftime: boolean, long: string, short: string }, arena: { name: string, city: string | null | undefined, state: string | null | undefined, country: string | null | undefined } | null | undefined, periods: { current: number, total: number, endOfPeriod: boolean } }, comments: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, userId: string, parentId: string, parentType: ParentType, content: string, depth: number, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, reactions: Array<{ id: string, emoji: ReactionEmojiType, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }> } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null | undefined } }, reactions: Array<{ id: string, emoji: ReactionEmojiType, userId: string, targetId: string, targetType: ParentType, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }> } | null | undefined, errors: Array<{ message: string, code: string | null | undefined, field: string | null | undefined }> | null | undefined } };

export type UpdateGameLogMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: CreateGameLogInput;
}>;


export type UpdateGameLogMutation = { updateGameLog: { gameLog: { id: string, ratingForGame: number, notes: string | null | undefined, tags: Array<string> | null | undefined, watchedDate: IDateTimeScalar | null | undefined, watchedSetting: string | null | undefined, watchedLocation: string | null | undefined, watchedScope: string | null | undefined, classification: Classification, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, deletedAt: IDateTimeScalar | null | undefined, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, game: { id: string, league: string | null | undefined, season: number | null | undefined, stage: number | null | undefined, officials: Array<string>, timesTied: number | null | undefined, leadChanges: number | null | undefined, nugget: string | null | undefined, homeTeamId: string, awayTeamId: string, isCompleted: boolean, awayTeamScore: number | null | undefined, homeTeamScore: number | null | undefined, gameType: string, nbaGameId: string | null | undefined, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, date: { start: IDateTimeScalar, end: IDateTimeScalar | null | undefined, duration: number | null | undefined }, status: { clock: string | null | undefined, halftime: boolean, long: string, short: string }, arena: { name: string, city: string | null | undefined, state: string | null | undefined, country: string | null | undefined } | null | undefined, periods: { current: number, total: number, endOfPeriod: boolean } }, comments: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, userId: string, parentId: string, parentType: ParentType, content: string, depth: number, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, reactions: Array<{ id: string, emoji: ReactionEmojiType, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }> } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null | undefined } }, reactions: Array<{ id: string, emoji: ReactionEmojiType, userId: string, targetId: string, targetType: ParentType, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }> } | null | undefined, errors: Array<{ message: string, code: string | null | undefined, field: string | null | undefined }> | null | undefined } };

export type DeleteGameLogMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteGameLogMutation = { deleteGameLog: { success: boolean, errors: Array<{ message: string, code: string | null | undefined, field: string | null | undefined }> | null | undefined } };

export type CreateCommentMutationVariables = Exact<{
  input: CreateCommentInput;
}>;


export type CreateCommentMutation = { createComment: { comment: { id: string, userId: string, parentId: string, parentType: ParentType, content: string, depth: number, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, reactions: Array<{ id: string, emoji: ReactionEmojiType, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }> } | null | undefined, errors: Array<{ message: string, code: string | null | undefined, field: string | null | undefined }> | null | undefined } };

export type UpdateCommentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: CreateCommentInput;
}>;


export type UpdateCommentMutation = { updateComment: { comment: { id: string, userId: string, parentId: string, parentType: ParentType, content: string, depth: number, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, reactions: Array<{ id: string, emoji: ReactionEmojiType, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }> } | null | undefined, errors: Array<{ message: string, code: string | null | undefined, field: string | null | undefined }> | null | undefined } };

export type DeleteCommentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteCommentMutation = { deleteComment: { success: boolean, errors: Array<{ message: string, code: string | null | undefined, field: string | null | undefined }> | null | undefined } };

export type CreateReactionMutationVariables = Exact<{
  input: CreateReactionInput;
}>;


export type CreateReactionMutation = { createReaction: { reaction: { id: string, emoji: ReactionEmojiType, userId: string, targetId: string, targetType: ParentType, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } } | null | undefined, errors: Array<{ message: string, code: string | null | undefined, field: string | null | undefined }> | null | undefined } };

export type DeleteReactionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteReactionMutation = { deleteReaction: { success: boolean, errors: Array<{ message: string, code: string | null | undefined, field: string | null | undefined }> | null | undefined } };

export type SendFriendRequestMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type SendFriendRequestMutation = { sendFriendRequest: { friendship: { id: string, status: FriendshipStatus, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, initiator: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, recipient: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } } | null | undefined, errors: Array<{ message: string, code: string | null | undefined, field: string | null | undefined }> | null | undefined } };

export type AcceptFriendRequestMutationVariables = Exact<{
  friendshipId: Scalars['ID']['input'];
}>;


export type AcceptFriendRequestMutation = { acceptFriendRequest: { friendship: { id: string, status: FriendshipStatus, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, initiator: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, recipient: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } } | null | undefined, errors: Array<{ message: string, code: string | null | undefined, field: string | null | undefined }> | null | undefined } };

export type RejectFriendRequestMutationVariables = Exact<{
  friendshipId: Scalars['ID']['input'];
}>;


export type RejectFriendRequestMutation = { rejectFriendRequest: { friendship: { id: string, status: FriendshipStatus, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, initiator: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, recipient: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } } | null | undefined, errors: Array<{ message: string, code: string | null | undefined, field: string | null | undefined }> | null | undefined } };

export type RemoveFriendMutationVariables = Exact<{
  friendshipId: Scalars['ID']['input'];
}>;


export type RemoveFriendMutation = { removeFriend: { success: boolean, errors: Array<{ message: string, code: string | null | undefined, field: string | null | undefined }> | null | undefined } };

export type GameFragmentFragment = { id: string, league: string | null | undefined, season: number | null | undefined, stage: number | null | undefined, officials: Array<string>, timesTied: number | null | undefined, leadChanges: number | null | undefined, nugget: string | null | undefined, homeTeamId: string, awayTeamId: string, isCompleted: boolean, awayTeamScore: number | null | undefined, homeTeamScore: number | null | undefined, gameType: string, nbaGameId: string | null | undefined, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, date: { start: IDateTimeScalar, end: IDateTimeScalar | null | undefined, duration: number | null | undefined }, status: { clock: string | null | undefined, halftime: boolean, long: string, short: string }, arena: { name: string, city: string | null | undefined, state: string | null | undefined, country: string | null | undefined } | null | undefined, periods: { current: number, total: number, endOfPeriod: boolean } };

export type BasicUserFragmentFragment = { id: string, username: string, first_name: string | null | undefined, last_name: string | null | undefined, emailAddress: string | null | undefined, image_url: string | null | undefined, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, deletedAt: IDateTimeScalar | null | undefined, comments: Array<{ id: string, parentId: string, parentType: ParentType, content: string }>, reactions: Array<{ id: string, emoji: ReactionEmojiType, targetId: string, targetType: ParentType }>, gameLogs: Array<{ id: string }>, initiatedFriendships: Array<{ id: string, status: FriendshipStatus }> };

export type UserSummaryFragmentFragment = { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined };

export type CommentFragmentFragment = { id: string, userId: string, parentId: string, parentType: ParentType, content: string, depth: number, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, reactions: Array<{ id: string, emoji: ReactionEmojiType, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }> };

export type ReactionFragmentFragment = { id: string, emoji: ReactionEmojiType, userId: string, targetId: string, targetType: ParentType, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } };

export type GameLogFragmentFragment = { id: string, ratingForGame: number, notes: string | null | undefined, tags: Array<string> | null | undefined, watchedDate: IDateTimeScalar | null | undefined, watchedSetting: string | null | undefined, watchedLocation: string | null | undefined, watchedScope: string | null | undefined, classification: Classification, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, deletedAt: IDateTimeScalar | null | undefined, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, game: { id: string, league: string | null | undefined, season: number | null | undefined, stage: number | null | undefined, officials: Array<string>, timesTied: number | null | undefined, leadChanges: number | null | undefined, nugget: string | null | undefined, homeTeamId: string, awayTeamId: string, isCompleted: boolean, awayTeamScore: number | null | undefined, homeTeamScore: number | null | undefined, gameType: string, nbaGameId: string | null | undefined, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, date: { start: IDateTimeScalar, end: IDateTimeScalar | null | undefined, duration: number | null | undefined }, status: { clock: string | null | undefined, halftime: boolean, long: string, short: string }, arena: { name: string, city: string | null | undefined, state: string | null | undefined, country: string | null | undefined } | null | undefined, periods: { current: number, total: number, endOfPeriod: boolean } }, comments: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, userId: string, parentId: string, parentType: ParentType, content: string, depth: number, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, reactions: Array<{ id: string, emoji: ReactionEmojiType, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }> } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null | undefined } }, reactions: Array<{ id: string, emoji: ReactionEmojiType, userId: string, targetId: string, targetType: ParentType, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }> };

export type FriendshipFragmentFragment = { id: string, status: FriendshipStatus, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, initiator: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, recipient: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } };

export type GetGamesQueryVariables = Exact<{
  filters: InputMaybe<GameFilters>;
  pagination: InputMaybe<PaginationInput>;
}>;


export type GetGamesQuery = { games: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, league: string | null | undefined, season: number | null | undefined, stage: number | null | undefined, officials: Array<string>, timesTied: number | null | undefined, leadChanges: number | null | undefined, nugget: string | null | undefined, homeTeamId: string, awayTeamId: string, isCompleted: boolean, awayTeamScore: number | null | undefined, homeTeamScore: number | null | undefined, gameType: string, nbaGameId: string | null | undefined, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, date: { start: IDateTimeScalar, end: IDateTimeScalar | null | undefined, duration: number | null | undefined }, status: { clock: string | null | undefined, halftime: boolean, long: string, short: string }, arena: { name: string, city: string | null | undefined, state: string | null | undefined, country: string | null | undefined } | null | undefined, periods: { current: number, total: number, endOfPeriod: boolean } } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null | undefined } } };

export type GetGameQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetGameQuery = { game: { id: string, league: string | null | undefined, season: number | null | undefined, stage: number | null | undefined, officials: Array<string>, timesTied: number | null | undefined, leadChanges: number | null | undefined, nugget: string | null | undefined, homeTeamId: string, awayTeamId: string, isCompleted: boolean, awayTeamScore: number | null | undefined, homeTeamScore: number | null | undefined, gameType: string, nbaGameId: string | null | undefined, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, date: { start: IDateTimeScalar, end: IDateTimeScalar | null | undefined, duration: number | null | undefined }, status: { clock: string | null | undefined, halftime: boolean, long: string, short: string }, arena: { name: string, city: string | null | undefined, state: string | null | undefined, country: string | null | undefined } | null | undefined, periods: { current: number, total: number, endOfPeriod: boolean } } | null | undefined };

export type GetLiveGamesQueryVariables = Exact<{
  first: InputMaybe<Scalars['Int']['input']>;
  after: InputMaybe<Scalars['String']['input']>;
}>;


export type GetLiveGamesQuery = { liveGames: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, league: string | null | undefined, season: number | null | undefined, stage: number | null | undefined, officials: Array<string>, timesTied: number | null | undefined, leadChanges: number | null | undefined, nugget: string | null | undefined, homeTeamId: string, awayTeamId: string, isCompleted: boolean, awayTeamScore: number | null | undefined, homeTeamScore: number | null | undefined, gameType: string, nbaGameId: string | null | undefined, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, date: { start: IDateTimeScalar, end: IDateTimeScalar | null | undefined, duration: number | null | undefined }, status: { clock: string | null | undefined, halftime: boolean, long: string, short: string }, arena: { name: string, city: string | null | undefined, state: string | null | undefined, country: string | null | undefined } | null | undefined, periods: { current: number, total: number, endOfPeriod: boolean } } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null | undefined } } };

export type GetGameLogsQueryVariables = Exact<{
  filters: InputMaybe<GameLogFilters>;
  pagination: InputMaybe<PaginationInput>;
}>;


export type GetGameLogsQuery = { gameLogs: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, ratingForGame: number, notes: string | null | undefined, tags: Array<string> | null | undefined, watchedDate: IDateTimeScalar | null | undefined, watchedSetting: string | null | undefined, watchedLocation: string | null | undefined, watchedScope: string | null | undefined, classification: Classification, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, deletedAt: IDateTimeScalar | null | undefined, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, game: { id: string, league: string | null | undefined, season: number | null | undefined, stage: number | null | undefined, officials: Array<string>, timesTied: number | null | undefined, leadChanges: number | null | undefined, nugget: string | null | undefined, homeTeamId: string, awayTeamId: string, isCompleted: boolean, awayTeamScore: number | null | undefined, homeTeamScore: number | null | undefined, gameType: string, nbaGameId: string | null | undefined, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, date: { start: IDateTimeScalar, end: IDateTimeScalar | null | undefined, duration: number | null | undefined }, status: { clock: string | null | undefined, halftime: boolean, long: string, short: string }, arena: { name: string, city: string | null | undefined, state: string | null | undefined, country: string | null | undefined } | null | undefined, periods: { current: number, total: number, endOfPeriod: boolean } }, comments: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, userId: string, parentId: string, parentType: ParentType, content: string, depth: number, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, reactions: Array<{ id: string, emoji: ReactionEmojiType, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }> } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null | undefined } }, reactions: Array<{ id: string, emoji: ReactionEmojiType, userId: string, targetId: string, targetType: ParentType, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }> } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null | undefined } } };

export type GetGameLogQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetGameLogQuery = { gameLog: { id: string, ratingForGame: number, notes: string | null | undefined, tags: Array<string> | null | undefined, watchedDate: IDateTimeScalar | null | undefined, watchedSetting: string | null | undefined, watchedLocation: string | null | undefined, watchedScope: string | null | undefined, classification: Classification, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, deletedAt: IDateTimeScalar | null | undefined, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, game: { id: string, league: string | null | undefined, season: number | null | undefined, stage: number | null | undefined, officials: Array<string>, timesTied: number | null | undefined, leadChanges: number | null | undefined, nugget: string | null | undefined, homeTeamId: string, awayTeamId: string, isCompleted: boolean, awayTeamScore: number | null | undefined, homeTeamScore: number | null | undefined, gameType: string, nbaGameId: string | null | undefined, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, date: { start: IDateTimeScalar, end: IDateTimeScalar | null | undefined, duration: number | null | undefined }, status: { clock: string | null | undefined, halftime: boolean, long: string, short: string }, arena: { name: string, city: string | null | undefined, state: string | null | undefined, country: string | null | undefined } | null | undefined, periods: { current: number, total: number, endOfPeriod: boolean } }, comments: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, userId: string, parentId: string, parentType: ParentType, content: string, depth: number, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, reactions: Array<{ id: string, emoji: ReactionEmojiType, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }> } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null | undefined } }, reactions: Array<{ id: string, emoji: ReactionEmojiType, userId: string, targetId: string, targetType: ParentType, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }> } | null | undefined };

export type GetUsersQueryVariables = Exact<{
  filters: InputMaybe<UserFilters>;
  pagination: InputMaybe<PaginationInput>;
}>;


export type GetUsersQuery = { users: Array<{ id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }> };

export type GetUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetUserQuery = { user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } | null | undefined };

export type SearchUsersQueryVariables = Exact<{
  first: InputMaybe<Scalars['Int']['input']>;
  after: InputMaybe<Scalars['String']['input']>;
  searchTerm: InputMaybe<Scalars['String']['input']>;
  filters: InputMaybe<UserSearchFilters>;
}>;


export type SearchUsersQuery = { searchUsers: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null | undefined } } };

export type GetCommentsQueryVariables = Exact<{
  filters: InputMaybe<CommentFilters>;
  pagination: InputMaybe<PaginationInput>;
}>;


export type GetCommentsQuery = { comments: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, userId: string, parentId: string, parentType: ParentType, content: string, depth: number, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined }, reactions: Array<{ id: string, emoji: ReactionEmojiType, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }> } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null | undefined } } };

export type GetReactionsQueryVariables = Exact<{
  targetId: Scalars['ID']['input'];
  targetType: ParentType;
}>;


export type GetReactionsQuery = { reactions: Array<{ id: string, emoji: ReactionEmojiType, userId: string, targetId: string, targetType: ParentType, createdAt: IDateTimeScalar, updatedAt: IDateTimeScalar, user: { id: string, username: string, first_name: string, last_name: string, emailAddress: string | null | undefined, image_url: string | null | undefined } }> };



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
  GameStatus: ResolverTypeWrapper<GameStatus>;
  GameStatusEnum: GameStatusEnum;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PaginationInput: PaginationInput;
  ParentType: ParentType;
  Query: ResolverTypeWrapper<{}>;
  Reaction: ResolverTypeWrapper<Reaction>;
  ReactionEmojiType: ReactionEmojiType;
  RejectFriendRequestResponse: ResolverTypeWrapper<RejectFriendRequestResponse>;
  RemoveFriendResponse: ResolverTypeWrapper<RemoveFriendResponse>;
  SendFriendRequestResponse: ResolverTypeWrapper<SendFriendRequestResponse>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateCommentInput: UpdateCommentInput;
  UpdateCommentResponse: ResolverTypeWrapper<UpdateCommentResponse>;
  UpdateGameLogInput: UpdateGameLogInput;
  UpdateGameLogResponse: ResolverTypeWrapper<UpdateGameLogResponse>;
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
  GameStatus: GameStatus;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  PageInfo: PageInfo;
  PaginationInput: PaginationInput;
  Query: {};
  Reaction: Reaction;
  RejectFriendRequestResponse: RejectFriendRequestResponse;
  RemoveFriendResponse: RemoveFriendResponse;
  SendFriendRequestResponse: SendFriendRequestResponse;
  String: Scalars['String']['output'];
  UpdateCommentInput: UpdateCommentInput;
  UpdateCommentResponse: UpdateCommentResponse;
  UpdateGameLogInput: UpdateGameLogInput;
  UpdateGameLogResponse: UpdateGameLogResponse;
  UpdateUserProfileResponse: UpdateUserProfileResponse;
  UserConnection: UserConnection;
  UserEdge: UserEdge;
  UserFilters: UserFilters;
  UserSearchFilters: UserSearchFilters;
  UserSummary: UserSummary;
};

export type AcceptFriendRequestResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['AcceptFriendRequestResponse'] = ResolversParentTypes['AcceptFriendRequestResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  friendship?: Resolver<Maybe<ResolversTypes['Friendship']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface AnyScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Any'], any> {
  name: 'Any';
}

export type ArenaResolvers<ContextType = any, ParentType extends ResolversParentTypes['Arena'] = ResolversParentTypes['Arena']> = {
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthenticationErrorResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuthenticationError'] = ResolversParentTypes['AuthenticationError']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthorizationErrorResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuthorizationError'] = ResolversParentTypes['AuthorizationError']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requiredRole?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BusinessLogicErrorResolvers<ContextType = any, ParentType extends ResolversParentTypes['BusinessLogicError'] = ResolversParentTypes['BusinessLogicError']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  details?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']> = {
  childComments?: Resolver<ResolversTypes['CommentConnection'], ParentType, ContextType>;
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

export type CommentConnectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['CommentConnection'] = ResolversParentTypes['CommentConnection']> = {
  edges?: Resolver<Array<ResolversTypes['CommentEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['CommentEdge'] = ResolversParentTypes['CommentEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Comment'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateCommentResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateCommentResponse'] = ResolversParentTypes['CreateCommentResponse']> = {
  comment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateGameLogResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateGameLogResponse'] = ResolversParentTypes['CreateGameLogResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  gameLog?: Resolver<Maybe<ResolversTypes['GameLog']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateGameResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateGameResponse'] = ResolversParentTypes['CreateGameResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  game?: Resolver<Maybe<ResolversTypes['Game']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateReactionResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateReactionResponse'] = ResolversParentTypes['CreateReactionResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  reaction?: Resolver<Maybe<ResolversTypes['Reaction']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DbUserResolvers<ContextType = any, ParentType extends ResolversParentTypes['DBUser'] = ResolversParentTypes['DBUser']> = {
  banned?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  comments?: Resolver<Array<ResolversTypes['Comment']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  emailAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email_verification_strategy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email_verified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  external_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  first_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  friendships?: Resolver<Array<ResolversTypes['Friendship']>, ParentType, ContextType>;
  gameLogs?: Resolver<Array<ResolversTypes['GameLog']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  inboundFriendshipIds?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  initiatedFriendships?: Resolver<Array<ResolversTypes['Friendship']>, ParentType, ContextType>;
  last_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type DeleteCommentResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteCommentResponse'] = ResolversParentTypes['DeleteCommentResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteGameLogResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteGameLogResponse'] = ResolversParentTypes['DeleteGameLogResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteReactionResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteReactionResponse'] = ResolversParentTypes['DeleteReactionResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ErrorResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['ErrorResult'] = ResolversParentTypes['ErrorResult']> = {
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  field?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FriendshipResolvers<ContextType = any, ParentType extends ResolversParentTypes['Friendship'] = ResolversParentTypes['Friendship']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  initiator?: Resolver<ResolversTypes['UserSummary'], ParentType, ContextType>;
  recipient?: Resolver<ResolversTypes['UserSummary'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['FriendshipStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameResolvers<ContextType = any, ParentType extends ResolversParentTypes['Game'] = ResolversParentTypes['Game']> = {
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
  season?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  stage?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['GameStatus'], ParentType, ContextType>;
  timesTied?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameConnectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['GameConnection'] = ResolversParentTypes['GameConnection']> = {
  edges?: Resolver<Array<ResolversTypes['GameEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameDateResolvers<ContextType = any, ParentType extends ResolversParentTypes['GameDate'] = ResolversParentTypes['GameDate']> = {
  duration?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  end?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  start?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['GameEdge'] = ResolversParentTypes['GameEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Game'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameLogResolvers<ContextType = any, ParentType extends ResolversParentTypes['GameLog'] = ResolversParentTypes['GameLog']> = {
  classification?: Resolver<ResolversTypes['Classification'], ParentType, ContextType>;
  comments?: Resolver<ResolversTypes['CommentConnection'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
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
  watchedScope?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  watchedSetting?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameLogConnectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['GameLogConnection'] = ResolversParentTypes['GameLogConnection']> = {
  edges?: Resolver<Array<ResolversTypes['GameLogEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameLogEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['GameLogEdge'] = ResolversParentTypes['GameLogEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['GameLog'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GamePeriodsResolvers<ContextType = any, ParentType extends ResolversParentTypes['GamePeriods'] = ResolversParentTypes['GamePeriods']> = {
  current?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  endOfPeriod?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GameStatusResolvers<ContextType = any, ParentType extends ResolversParentTypes['GameStatus'] = ResolversParentTypes['GameStatus']> = {
  clock?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  halftime?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  long?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  short?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
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
};

export type PageInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  comments?: Resolver<ResolversTypes['CommentConnection'], ParentType, ContextType, Partial<QueryCommentsArgs>>;
  game?: Resolver<Maybe<ResolversTypes['Game']>, ParentType, ContextType, RequireFields<QueryGameArgs, 'id'>>;
  gameLog?: Resolver<Maybe<ResolversTypes['GameLog']>, ParentType, ContextType, RequireFields<QueryGameLogArgs, 'id'>>;
  gameLogs?: Resolver<ResolversTypes['GameLogConnection'], ParentType, ContextType, Partial<QueryGameLogsArgs>>;
  games?: Resolver<ResolversTypes['GameConnection'], ParentType, ContextType, Partial<QueryGamesArgs>>;
  liveGames?: Resolver<ResolversTypes['GameConnection'], ParentType, ContextType, Partial<QueryLiveGamesArgs>>;
  me?: Resolver<Maybe<ResolversTypes['UserSummary']>, ParentType, ContextType>;
  reactions?: Resolver<Array<ResolversTypes['Reaction']>, ParentType, ContextType, RequireFields<QueryReactionsArgs, 'targetId' | 'targetType'>>;
  searchUsers?: Resolver<ResolversTypes['UserConnection'], ParentType, ContextType, Partial<QuerySearchUsersArgs>>;
  user?: Resolver<Maybe<ResolversTypes['UserSummary']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<Array<ResolversTypes['UserSummary']>, ParentType, ContextType, Partial<QueryUsersArgs>>;
};

export type ReactionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Reaction'] = ResolversParentTypes['Reaction']> = {
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

export type RejectFriendRequestResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['RejectFriendRequestResponse'] = ResolversParentTypes['RejectFriendRequestResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  friendship?: Resolver<Maybe<ResolversTypes['Friendship']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RemoveFriendResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['RemoveFriendResponse'] = ResolversParentTypes['RemoveFriendResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SendFriendRequestResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['SendFriendRequestResponse'] = ResolversParentTypes['SendFriendRequestResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  friendship?: Resolver<Maybe<ResolversTypes['Friendship']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateCommentResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpdateCommentResponse'] = ResolversParentTypes['UpdateCommentResponse']> = {
  comment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateGameLogResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpdateGameLogResponse'] = ResolversParentTypes['UpdateGameLogResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  gameLog?: Resolver<Maybe<ResolversTypes['GameLog']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateUserProfileResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpdateUserProfileResponse'] = ResolversParentTypes['UpdateUserProfileResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ErrorResult']>>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['UserSummary']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserConnectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserConnection'] = ResolversParentTypes['UserConnection']> = {
  edges?: Resolver<Array<ResolversTypes['UserEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserEdge'] = ResolversParentTypes['UserEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['UserSummary'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSummaryResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserSummary'] = ResolversParentTypes['UserSummary']> = {
  emailAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  first_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  last_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AcceptFriendRequestResponse?: AcceptFriendRequestResponseResolvers<ContextType>;
  Any?: GraphQLScalarType;
  Arena?: ArenaResolvers<ContextType>;
  AuthenticationError?: AuthenticationErrorResolvers<ContextType>;
  AuthorizationError?: AuthorizationErrorResolvers<ContextType>;
  BusinessLogicError?: BusinessLogicErrorResolvers<ContextType>;
  Comment?: CommentResolvers<ContextType>;
  CommentConnection?: CommentConnectionResolvers<ContextType>;
  CommentEdge?: CommentEdgeResolvers<ContextType>;
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
  GameStatus?: GameStatusResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Reaction?: ReactionResolvers<ContextType>;
  RejectFriendRequestResponse?: RejectFriendRequestResponseResolvers<ContextType>;
  RemoveFriendResponse?: RemoveFriendResponseResolvers<ContextType>;
  SendFriendRequestResponse?: SendFriendRequestResponseResolvers<ContextType>;
  UpdateCommentResponse?: UpdateCommentResponseResolvers<ContextType>;
  UpdateGameLogResponse?: UpdateGameLogResponseResolvers<ContextType>;
  UpdateUserProfileResponse?: UpdateUserProfileResponseResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  UserEdge?: UserEdgeResolvers<ContextType>;
  UserSummary?: UserSummaryResolvers<ContextType>;
};

