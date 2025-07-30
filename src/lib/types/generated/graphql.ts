import { gql } from 'graphql-tag';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Any: { input: any; output: any; }
  DateTime: { input: string; output: string; }
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

export type FriendshipConnection = {
  __typename?: 'FriendshipConnection';
  edges: Array<FriendshipEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type FriendshipEdge = {
  __typename?: 'FriendshipEdge';
  cursor: Scalars['String']['output'];
  node: Friendship;
};

export type FriendshipFilters = {
  createdAfter?: InputMaybe<Scalars['DateTime']['input']>;
  createdBefore?: InputMaybe<Scalars['DateTime']['input']>;
  friendId?: InputMaybe<Scalars['ID']['input']>;
  isInitiator?: InputMaybe<Scalars['Boolean']['input']>;
  isRecipient?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<FriendshipStatus>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export enum FriendshipStatus {
  Accepted = 'ACCEPTED',
  Blocked = 'BLOCKED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type FriendshipStatusResponse = {
  __typename?: 'FriendshipStatusResponse';
  friendshipId?: Maybe<Scalars['ID']['output']>;
  isInitiator?: Maybe<Scalars['Boolean']['output']>;
  status?: Maybe<FriendshipStatus>;
};

export type Game = {
  __typename?: 'Game';
  average_rating?: Maybe<Scalars['Float']['output']>;
  away_team: Team;
  away_team_id: Scalars['String']['output'];
  away_team_score?: Maybe<Scalars['Int']['output']>;
  created_at: Scalars['DateTime']['output'];
  date: Scalars['DateTime']['output'];
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
  game_type: Scalars['String']['output'];
  home_team: Team;
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
  game: Game;
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

export type GameLogSearchFilters = {
  classification?: InputMaybe<Classification>;
  dateRange?: InputMaybe<DateRangeInput>;
  gameId?: InputMaybe<Scalars['ID']['input']>;
  maxRating?: InputMaybe<Scalars['Int']['input']>;
  minRating?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
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
  friendsGameLogs: GameLogConnection;
  friendshipRequests: FriendshipConnection;
  friendshipStatus: FriendshipStatusResponse;
  game?: Maybe<Game>;
  gameLog?: Maybe<GameLog>;
  gameLogs: GameLogConnection;
  games: GameConnection;
  liveGames: GameConnection;
  me?: Maybe<UserSummary>;
  reactions: Array<Reaction>;
  searchGameLogs: GameLogConnection;
  searchUsers: UserConnection;
  user?: Maybe<UserSummary>;
  userFriendships: FriendshipConnection;
  users: Array<UserSummary>;
};


export type QueryCommentsArgs = {
  filters?: InputMaybe<CommentFilters>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryFriendsGameLogsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryFriendshipRequestsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryFriendshipStatusArgs = {
  userId: Scalars['ID']['input'];
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


export type QuerySearchGameLogsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<GameLogSearchFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  searchField?: InputMaybe<Scalars['String']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySearchUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<UserSearchFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  pagination?: InputMaybe<PaginationInput>;
  searchField?: InputMaybe<Scalars['String']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserFriendshipsArgs = {
  filters?: InputMaybe<FriendshipFilters>;
  pagination?: InputMaybe<PaginationInput>;
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

export type Team = {
  __typename?: 'Team';
  all_star: Scalars['Boolean']['output'];
  city?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  conference?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nba_franchise: Scalars['Boolean']['output'];
  nickname?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['DateTime']['output'];
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
  created_at?: Maybe<Scalars['DateTime']['output']>;
  email_address?: Maybe<Scalars['String']['output']>;
  first_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  last_name: Scalars['String']['output'];
  phone_number?: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
};

export type CreateGameMutationVariables = Exact<{
  input: CreateGameInput;
}>;


export type CreateGameMutation = { __typename?: 'Mutation', createGame: { __typename?: 'CreateGameResponse', game?: { __typename?: 'Game', id: string, date: string, status: string, game_type: string, nba_game_id?: string | null, home_team_id: string, away_team_id: string, home_team_score?: number | null, away_team_score?: number | null, created_at: string, updated_at: string } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type CreateGameLogMutationVariables = Exact<{
  input: CreateGameLogInput;
}>;


export type CreateGameLogMutation = { __typename?: 'Mutation', createGameLog: { __typename?: 'CreateGameLogResponse', gameLog?: { __typename?: 'GameLog', id: string, game_id: string, rating_for_game: number, notes?: string | null, tags?: Array<string> | null, watched_date?: string | null, watched_setting?: string | null, watched_location?: string | null, watched_scope?: string | null, classification: Classification, created_at: string, updated_at: string, deleted_at?: string | null, game: { __typename?: 'Game', id: string, date: string, status: string, game_type: string, nba_game_id?: string | null, home_team_id: string, away_team_id: string, home_team_score?: number | null, away_team_score?: number | null, average_rating?: number | null, total_ratings?: number | null, created_at: string, updated_at: string, home_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string }, away_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string } }, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, comments: { __typename?: 'CommentConnection', totalCount: number, edges: Array<{ __typename?: 'CommentEdge', cursor: string, node: { __typename?: 'Comment', id: string, user_id: string, parent_id: string, parent_type: ParentType, content: string, depth: number, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user_id: string, target_id: string, target_type: ParentType, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type UpdateGameLogMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateGameLogInput;
}>;


export type UpdateGameLogMutation = { __typename?: 'Mutation', updateGameLog: { __typename?: 'UpdateGameLogResponse', gameLog?: { __typename?: 'GameLog', id: string, game_id: string, rating_for_game: number, notes?: string | null, tags?: Array<string> | null, watched_date?: string | null, watched_setting?: string | null, watched_location?: string | null, watched_scope?: string | null, classification: Classification, created_at: string, updated_at: string, deleted_at?: string | null, game: { __typename?: 'Game', id: string, date: string, status: string, game_type: string, nba_game_id?: string | null, home_team_id: string, away_team_id: string, home_team_score?: number | null, away_team_score?: number | null, average_rating?: number | null, total_ratings?: number | null, created_at: string, updated_at: string, home_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string }, away_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string } }, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, comments: { __typename?: 'CommentConnection', totalCount: number, edges: Array<{ __typename?: 'CommentEdge', cursor: string, node: { __typename?: 'Comment', id: string, user_id: string, parent_id: string, parent_type: ParentType, content: string, depth: number, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user_id: string, target_id: string, target_type: ParentType, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type DeleteGameLogMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteGameLogMutation = { __typename?: 'Mutation', deleteGameLog: { __typename?: 'DeleteGameLogResponse', success: boolean, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type CreateCommentMutationVariables = Exact<{
  input: CreateCommentInput;
}>;


export type CreateCommentMutation = { __typename?: 'Mutation', createComment: { __typename?: 'CreateCommentResponse', comment?: { __typename?: 'Comment', id: string, user_id: string, parent_id: string, parent_type: ParentType, content: string, depth: number, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type UpdateCommentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateCommentInput;
}>;


export type UpdateCommentMutation = { __typename?: 'Mutation', updateComment: { __typename?: 'UpdateCommentResponse', comment?: { __typename?: 'Comment', id: string, user_id: string, parent_id: string, parent_type: ParentType, content: string, depth: number, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type DeleteCommentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteCommentMutation = { __typename?: 'Mutation', deleteComment: { __typename?: 'DeleteCommentResponse', success: boolean, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type CreateReactionMutationVariables = Exact<{
  input: CreateReactionInput;
}>;


export type CreateReactionMutation = { __typename?: 'Mutation', createReaction: { __typename?: 'CreateReactionResponse', reaction?: { __typename?: 'Reaction', id: string, emoji: string, user_id: string, target_id: string, target_type: ParentType, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type DeleteReactionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteReactionMutation = { __typename?: 'Mutation', deleteReaction: { __typename?: 'DeleteReactionResponse', success: boolean, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type SendFriendRequestMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type SendFriendRequestMutation = { __typename?: 'Mutation', sendFriendRequest: { __typename?: 'SendFriendRequestResponse', friendship?: { __typename?: 'Friendship', id: string, status: FriendshipStatus, created_at: string, updated_at: string, initiator: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, recipient: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type AcceptFriendRequestMutationVariables = Exact<{
  friendshipId: Scalars['ID']['input'];
}>;


export type AcceptFriendRequestMutation = { __typename?: 'Mutation', acceptFriendRequest: { __typename?: 'AcceptFriendRequestResponse', friendship?: { __typename?: 'Friendship', id: string, status: FriendshipStatus, created_at: string, updated_at: string, initiator: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, recipient: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type RejectFriendRequestMutationVariables = Exact<{
  friendshipId: Scalars['ID']['input'];
}>;


export type RejectFriendRequestMutation = { __typename?: 'Mutation', rejectFriendRequest: { __typename?: 'RejectFriendRequestResponse', friendship?: { __typename?: 'Friendship', id: string, status: FriendshipStatus, created_at: string, updated_at: string, initiator: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, recipient: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } } | null, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type RemoveFriendMutationVariables = Exact<{
  friendshipId: Scalars['ID']['input'];
}>;


export type RemoveFriendMutation = { __typename?: 'Mutation', removeFriend: { __typename?: 'RemoveFriendResponse', success: boolean, errors?: Array<{ __typename?: 'ErrorResult', message: string, code?: string | null, field?: string | null }> | null } };

export type GameFragmentFragment = { __typename?: 'Game', id: string, date: string, status: string, game_type: string, nba_game_id?: string | null, home_team_id: string, away_team_id: string, home_team_score?: number | null, away_team_score?: number | null, average_rating?: number | null, total_ratings?: number | null, created_at: string, updated_at: string, home_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string }, away_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string } };

export type BasicUserFragmentFragment = { __typename?: 'DBUser', id: string, username: string, first_name?: string | null, last_name?: string | null, email_address?: string | null, phone_number?: string | null, image_url?: string | null, object: string, has_image: boolean, profile_image_url?: string | null, primary_email_address_id?: string | null, primary_phone_number_id?: string | null, external_id?: string | null, last_active_at?: string | null, last_sign_in_at?: string | null, bio?: string | null, timezone?: string | null, preferred_language?: string | null, created_at: string, updated_at: string, deleted_at?: string | null, comments: Array<{ __typename?: 'Comment', id: string, parent_id: string, parent_type: ParentType, content: string }>, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, target_id: string, target_type: ParentType }>, gameLogs: Array<{ __typename?: 'GameLog', id: string }>, initiatedFriendships: Array<{ __typename?: 'Friendship', id: string, status: FriendshipStatus }> };

export type UserSummaryFragmentFragment = { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null };

export type CommentFragmentFragment = { __typename?: 'Comment', id: string, user_id: string, parent_id: string, parent_type: ParentType, content: string, depth: number, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> };

export type ReactionFragmentFragment = { __typename?: 'Reaction', id: string, emoji: string, user_id: string, target_id: string, target_type: ParentType, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } };

export type GameLogFragmentFragment = { __typename?: 'GameLog', id: string, game_id: string, rating_for_game: number, notes?: string | null, tags?: Array<string> | null, watched_date?: string | null, watched_setting?: string | null, watched_location?: string | null, watched_scope?: string | null, classification: Classification, created_at: string, updated_at: string, deleted_at?: string | null, game: { __typename?: 'Game', id: string, date: string, status: string, game_type: string, nba_game_id?: string | null, home_team_id: string, away_team_id: string, home_team_score?: number | null, away_team_score?: number | null, average_rating?: number | null, total_ratings?: number | null, created_at: string, updated_at: string, home_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string }, away_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string } }, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, comments: { __typename?: 'CommentConnection', totalCount: number, edges: Array<{ __typename?: 'CommentEdge', cursor: string, node: { __typename?: 'Comment', id: string, user_id: string, parent_id: string, parent_type: ParentType, content: string, depth: number, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user_id: string, target_id: string, target_type: ParentType, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> };

export type FriendshipFragmentFragment = { __typename?: 'Friendship', id: string, status: FriendshipStatus, created_at: string, updated_at: string, initiator: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, recipient: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } };

export type GetGamesQueryVariables = Exact<{
  filters?: InputMaybe<GameFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetGamesQuery = { __typename?: 'Query', games: { __typename?: 'GameConnection', totalCount: number, edges: Array<{ __typename?: 'GameEdge', cursor: string, node: { __typename?: 'Game', id: string, date: string, status: string, game_type: string, nba_game_id?: string | null, home_team_id: string, away_team_id: string, home_team_score?: number | null, away_team_score?: number | null, average_rating?: number | null, total_ratings?: number | null, created_at: string, updated_at: string, home_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string }, away_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export type GetGameQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetGameQuery = { __typename?: 'Query', game?: { __typename?: 'Game', id: string, date: string, status: string, game_type: string, nba_game_id?: string | null, home_team_id: string, away_team_id: string, home_team_score?: number | null, away_team_score?: number | null, average_rating?: number | null, total_ratings?: number | null, created_at: string, updated_at: string, home_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string }, away_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string } } | null };

export type GetLiveGamesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetLiveGamesQuery = { __typename?: 'Query', liveGames: { __typename?: 'GameConnection', totalCount: number, edges: Array<{ __typename?: 'GameEdge', cursor: string, node: { __typename?: 'Game', id: string, date: string, status: string, game_type: string, nba_game_id?: string | null, home_team_id: string, away_team_id: string, home_team_score?: number | null, away_team_score?: number | null, average_rating?: number | null, total_ratings?: number | null, created_at: string, updated_at: string, home_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string }, away_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export type GetGameLogsQueryVariables = Exact<{
  filters?: InputMaybe<GameLogFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetGameLogsQuery = { __typename?: 'Query', gameLogs: { __typename?: 'GameLogConnection', totalCount: number, edges: Array<{ __typename?: 'GameLogEdge', cursor: string, node: { __typename?: 'GameLog', id: string, game_id: string, rating_for_game: number, notes?: string | null, tags?: Array<string> | null, watched_date?: string | null, watched_setting?: string | null, watched_location?: string | null, watched_scope?: string | null, classification: Classification, created_at: string, updated_at: string, deleted_at?: string | null, game: { __typename?: 'Game', id: string, date: string, status: string, game_type: string, nba_game_id?: string | null, home_team_id: string, away_team_id: string, home_team_score?: number | null, away_team_score?: number | null, average_rating?: number | null, total_ratings?: number | null, created_at: string, updated_at: string, home_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string }, away_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string } }, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, comments: { __typename?: 'CommentConnection', totalCount: number, edges: Array<{ __typename?: 'CommentEdge', cursor: string, node: { __typename?: 'Comment', id: string, user_id: string, parent_id: string, parent_type: ParentType, content: string, depth: number, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user_id: string, target_id: string, target_type: ParentType, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export type GetGameLogQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetGameLogQuery = { __typename?: 'Query', gameLog?: { __typename?: 'GameLog', id: string, game_id: string, rating_for_game: number, notes?: string | null, tags?: Array<string> | null, watched_date?: string | null, watched_setting?: string | null, watched_location?: string | null, watched_scope?: string | null, classification: Classification, created_at: string, updated_at: string, deleted_at?: string | null, game: { __typename?: 'Game', id: string, date: string, status: string, game_type: string, nba_game_id?: string | null, home_team_id: string, away_team_id: string, home_team_score?: number | null, away_team_score?: number | null, average_rating?: number | null, total_ratings?: number | null, created_at: string, updated_at: string, home_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string }, away_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string } }, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, comments: { __typename?: 'CommentConnection', totalCount: number, edges: Array<{ __typename?: 'CommentEdge', cursor: string, node: { __typename?: 'Comment', id: string, user_id: string, parent_id: string, parent_type: ParentType, content: string, depth: number, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user_id: string, target_id: string, target_type: ParentType, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> } | null };

export type GetUsersQueryVariables = Exact<{
  filters?: InputMaybe<UserFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetUsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }> };

export type GetUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', user?: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } | null };

export type SearchUsersQueryVariables = Exact<{
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  searchField?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<UserSearchFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type SearchUsersQuery = { __typename?: 'Query', searchUsers: { __typename?: 'UserConnection', totalCount: number, edges: Array<{ __typename?: 'UserEdge', cursor: string, node: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export type GetCommentsQueryVariables = Exact<{
  filters?: InputMaybe<CommentFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetCommentsQuery = { __typename?: 'Query', comments: { __typename?: 'CommentConnection', totalCount: number, edges: Array<{ __typename?: 'CommentEdge', cursor: string, node: { __typename?: 'Comment', id: string, user_id: string, parent_id: string, parent_type: ParentType, content: string, depth: number, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export type GetReactionsQueryVariables = Exact<{
  targetId: Scalars['ID']['input'];
  targetType: ParentType;
}>;


export type GetReactionsQuery = { __typename?: 'Query', reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user_id: string, target_id: string, target_type: ParentType, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> };

export type SearchUsersAdminQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  searchField?: InputMaybe<Scalars['String']['input']>;
}>;


export type SearchUsersAdminQuery = { __typename?: 'Query', searchUsers: { __typename?: 'UserConnection', totalCount: number, edges: Array<{ __typename?: 'UserEdge', cursor: string, node: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, phone_number?: string | null, image_url?: string | null, created_at?: string | null } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type SearchGameLogsAdminQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  searchField?: InputMaybe<Scalars['String']['input']>;
}>;


export type SearchGameLogsAdminQuery = { __typename?: 'Query', searchGameLogs: { __typename?: 'GameLogConnection', totalCount: number, edges: Array<{ __typename?: 'GameLogEdge', cursor: string, node: { __typename?: 'GameLog', id: string, game_id: string, classification: Classification, rating_for_game: number, watched_setting?: string | null, watched_location?: string | null, watched_scope?: string | null, watched_date?: string | null, created_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type GetFriendsGameLogsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetFriendsGameLogsQuery = { __typename?: 'Query', friendsGameLogs: { __typename?: 'GameLogConnection', totalCount: number, edges: Array<{ __typename?: 'GameLogEdge', cursor: string, node: { __typename?: 'GameLog', id: string, game_id: string, rating_for_game: number, notes?: string | null, tags?: Array<string> | null, watched_date?: string | null, watched_setting?: string | null, watched_location?: string | null, watched_scope?: string | null, classification: Classification, created_at: string, updated_at: string, deleted_at?: string | null, game: { __typename?: 'Game', id: string, date: string, status: string, game_type: string, nba_game_id?: string | null, home_team_id: string, away_team_id: string, home_team_score?: number | null, away_team_score?: number | null, average_rating?: number | null, total_ratings?: number | null, created_at: string, updated_at: string, home_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string }, away_team: { __typename?: 'Team', id: string, name: string, nickname?: string | null, code?: string | null, city?: string | null, logo?: string | null, all_star: boolean, nba_franchise: boolean, conference?: string | null, created_at: string, updated_at: string } }, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, comments: { __typename?: 'CommentConnection', totalCount: number, edges: Array<{ __typename?: 'CommentEdge', cursor: string, node: { __typename?: 'Comment', id: string, user_id: string, parent_id: string, parent_type: ParentType, content: string, depth: number, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } }, reactions: Array<{ __typename?: 'Reaction', id: string, emoji: string, user_id: string, target_id: string, target_type: ParentType, created_at: string, updated_at: string, user: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export type GetUserFriendshipsQueryVariables = Exact<{
  filters?: InputMaybe<FriendshipFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetUserFriendshipsQuery = { __typename?: 'Query', userFriendships: { __typename?: 'FriendshipConnection', totalCount: number, edges: Array<{ __typename?: 'FriendshipEdge', cursor: string, node: { __typename?: 'Friendship', id: string, status: FriendshipStatus, created_at: string, updated_at: string, initiator: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, recipient: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export type GetFriendshipRequestsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetFriendshipRequestsQuery = { __typename?: 'Query', friendshipRequests: { __typename?: 'FriendshipConnection', totalCount: number, edges: Array<{ __typename?: 'FriendshipEdge', cursor: string, node: { __typename?: 'Friendship', id: string, status: FriendshipStatus, created_at: string, updated_at: string, initiator: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null }, recipient: { __typename?: 'UserSummary', id: string, username: string, first_name: string, last_name: string, email_address?: string | null, image_url?: string | null } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export type GetFriendshipStatusQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GetFriendshipStatusQuery = { __typename?: 'Query', friendshipStatus: { __typename?: 'FriendshipStatusResponse', status?: FriendshipStatus | null, friendshipId?: string | null, isInitiator?: boolean | null } };

export const BasicUserFragmentFragmentDoc = gql`
    fragment BasicUserFragment on DBUser {
  id
  username
  first_name
  last_name
  email_address
  phone_number
  image_url
  object
  has_image
  profile_image_url
  primary_email_address_id
  primary_phone_number_id
  external_id
  last_active_at
  last_sign_in_at
  bio
  timezone
  preferred_language
  comments {
    id
    parent_id
    parent_type
    content
  }
  reactions {
    id
    emoji
    target_id
    target_type
  }
  gameLogs {
    id
  }
  initiatedFriendships {
    id
    status
  }
  created_at
  updated_at
  deleted_at
}
    `;
export const GameFragmentFragmentDoc = gql`
    fragment GameFragment on Game {
  id
  date
  status
  game_type
  nba_game_id
  home_team_id
  away_team_id
  home_team {
    id
    name
    nickname
    code
    city
    logo
    all_star
    nba_franchise
    conference
    created_at
    updated_at
  }
  away_team {
    id
    name
    nickname
    code
    city
    logo
    all_star
    nba_franchise
    conference
    created_at
    updated_at
  }
  home_team_score
  away_team_score
  average_rating
  total_ratings
  created_at
  updated_at
}
    `;
export const UserSummaryFragmentFragmentDoc = gql`
    fragment UserSummaryFragment on UserSummary {
  id
  username
  first_name
  last_name
  email_address
  image_url
}
    `;
export const CommentFragmentFragmentDoc = gql`
    fragment CommentFragment on Comment {
  id
  user_id
  parent_id
  parent_type
  content
  depth
  created_at
  updated_at
  user {
    ...UserSummaryFragment
  }
  reactions {
    id
    emoji
    user {
      ...UserSummaryFragment
    }
  }
}
    ${UserSummaryFragmentFragmentDoc}`;
export const ReactionFragmentFragmentDoc = gql`
    fragment ReactionFragment on Reaction {
  id
  emoji
  user_id
  target_id
  target_type
  created_at
  updated_at
  user {
    ...UserSummaryFragment
  }
}
    ${UserSummaryFragmentFragmentDoc}`;
export const GameLogFragmentFragmentDoc = gql`
    fragment GameLogFragment on GameLog {
  id
  game_id
  game {
    ...GameFragment
  }
  rating_for_game
  notes
  tags
  watched_date
  watched_setting
  watched_location
  watched_scope
  classification
  created_at
  updated_at
  deleted_at
  user {
    ...UserSummaryFragment
  }
  comments {
    edges {
      node {
        ...CommentFragment
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
  reactions {
    ...ReactionFragment
  }
}
    ${GameFragmentFragmentDoc}
${UserSummaryFragmentFragmentDoc}
${CommentFragmentFragmentDoc}
${ReactionFragmentFragmentDoc}`;
export const FriendshipFragmentFragmentDoc = gql`
    fragment FriendshipFragment on Friendship {
  id
  status
  created_at
  updated_at
  initiator {
    ...UserSummaryFragment
  }
  recipient {
    ...UserSummaryFragment
  }
}
    ${UserSummaryFragmentFragmentDoc}`;
export const CreateGameDocument = gql`
    mutation CreateGame($input: CreateGameInput!) {
  createGame(input: $input) {
    game {
      id
      date
      status
      game_type
      nba_game_id
      home_team_id
      away_team_id
      home_team_score
      away_team_score
      created_at
      updated_at
    }
    errors {
      message
      code
      field
    }
  }
}
    `;
export type CreateGameMutationFn = Apollo.MutationFunction<CreateGameMutation, CreateGameMutationVariables>;

/**
 * __useCreateGameMutation__
 *
 * To run a mutation, you first call `useCreateGameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGameMutation, { data, loading, error }] = useCreateGameMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateGameMutation(baseOptions?: Apollo.MutationHookOptions<CreateGameMutation, CreateGameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGameMutation, CreateGameMutationVariables>(CreateGameDocument, options);
      }
export type CreateGameMutationHookResult = ReturnType<typeof useCreateGameMutation>;
export type CreateGameMutationResult = Apollo.MutationResult<CreateGameMutation>;
export type CreateGameMutationOptions = Apollo.BaseMutationOptions<CreateGameMutation, CreateGameMutationVariables>;
export const CreateGameLogDocument = gql`
    mutation CreateGameLog($input: CreateGameLogInput!) {
  createGameLog(input: $input) {
    gameLog {
      ...GameLogFragment
    }
    errors {
      message
      code
      field
    }
  }
}
    ${GameLogFragmentFragmentDoc}`;
export type CreateGameLogMutationFn = Apollo.MutationFunction<CreateGameLogMutation, CreateGameLogMutationVariables>;

/**
 * __useCreateGameLogMutation__
 *
 * To run a mutation, you first call `useCreateGameLogMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGameLogMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGameLogMutation, { data, loading, error }] = useCreateGameLogMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateGameLogMutation(baseOptions?: Apollo.MutationHookOptions<CreateGameLogMutation, CreateGameLogMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGameLogMutation, CreateGameLogMutationVariables>(CreateGameLogDocument, options);
      }
export type CreateGameLogMutationHookResult = ReturnType<typeof useCreateGameLogMutation>;
export type CreateGameLogMutationResult = Apollo.MutationResult<CreateGameLogMutation>;
export type CreateGameLogMutationOptions = Apollo.BaseMutationOptions<CreateGameLogMutation, CreateGameLogMutationVariables>;
export const UpdateGameLogDocument = gql`
    mutation UpdateGameLog($id: ID!, $input: UpdateGameLogInput!) {
  updateGameLog(id: $id, input: $input) {
    gameLog {
      ...GameLogFragment
    }
    errors {
      message
      code
      field
    }
  }
}
    ${GameLogFragmentFragmentDoc}`;
export type UpdateGameLogMutationFn = Apollo.MutationFunction<UpdateGameLogMutation, UpdateGameLogMutationVariables>;

/**
 * __useUpdateGameLogMutation__
 *
 * To run a mutation, you first call `useUpdateGameLogMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGameLogMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGameLogMutation, { data, loading, error }] = useUpdateGameLogMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateGameLogMutation(baseOptions?: Apollo.MutationHookOptions<UpdateGameLogMutation, UpdateGameLogMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateGameLogMutation, UpdateGameLogMutationVariables>(UpdateGameLogDocument, options);
      }
export type UpdateGameLogMutationHookResult = ReturnType<typeof useUpdateGameLogMutation>;
export type UpdateGameLogMutationResult = Apollo.MutationResult<UpdateGameLogMutation>;
export type UpdateGameLogMutationOptions = Apollo.BaseMutationOptions<UpdateGameLogMutation, UpdateGameLogMutationVariables>;
export const DeleteGameLogDocument = gql`
    mutation DeleteGameLog($id: ID!) {
  deleteGameLog(id: $id) {
    success
    errors {
      message
      code
      field
    }
  }
}
    `;
export type DeleteGameLogMutationFn = Apollo.MutationFunction<DeleteGameLogMutation, DeleteGameLogMutationVariables>;

/**
 * __useDeleteGameLogMutation__
 *
 * To run a mutation, you first call `useDeleteGameLogMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGameLogMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGameLogMutation, { data, loading, error }] = useDeleteGameLogMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteGameLogMutation(baseOptions?: Apollo.MutationHookOptions<DeleteGameLogMutation, DeleteGameLogMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteGameLogMutation, DeleteGameLogMutationVariables>(DeleteGameLogDocument, options);
      }
export type DeleteGameLogMutationHookResult = ReturnType<typeof useDeleteGameLogMutation>;
export type DeleteGameLogMutationResult = Apollo.MutationResult<DeleteGameLogMutation>;
export type DeleteGameLogMutationOptions = Apollo.BaseMutationOptions<DeleteGameLogMutation, DeleteGameLogMutationVariables>;
export const CreateCommentDocument = gql`
    mutation CreateComment($input: CreateCommentInput!) {
  createComment(input: $input) {
    comment {
      ...CommentFragment
    }
    errors {
      message
      code
      field
    }
  }
}
    ${CommentFragmentFragmentDoc}`;
export type CreateCommentMutationFn = Apollo.MutationFunction<CreateCommentMutation, CreateCommentMutationVariables>;

/**
 * __useCreateCommentMutation__
 *
 * To run a mutation, you first call `useCreateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCommentMutation, { data, loading, error }] = useCreateCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCommentMutation(baseOptions?: Apollo.MutationHookOptions<CreateCommentMutation, CreateCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCommentMutation, CreateCommentMutationVariables>(CreateCommentDocument, options);
      }
export type CreateCommentMutationHookResult = ReturnType<typeof useCreateCommentMutation>;
export type CreateCommentMutationResult = Apollo.MutationResult<CreateCommentMutation>;
export type CreateCommentMutationOptions = Apollo.BaseMutationOptions<CreateCommentMutation, CreateCommentMutationVariables>;
export const UpdateCommentDocument = gql`
    mutation UpdateComment($id: ID!, $input: UpdateCommentInput!) {
  updateComment(id: $id, input: $input) {
    comment {
      ...CommentFragment
    }
    errors {
      message
      code
      field
    }
  }
}
    ${CommentFragmentFragmentDoc}`;
export type UpdateCommentMutationFn = Apollo.MutationFunction<UpdateCommentMutation, UpdateCommentMutationVariables>;

/**
 * __useUpdateCommentMutation__
 *
 * To run a mutation, you first call `useUpdateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCommentMutation, { data, loading, error }] = useUpdateCommentMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCommentMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCommentMutation, UpdateCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCommentMutation, UpdateCommentMutationVariables>(UpdateCommentDocument, options);
      }
export type UpdateCommentMutationHookResult = ReturnType<typeof useUpdateCommentMutation>;
export type UpdateCommentMutationResult = Apollo.MutationResult<UpdateCommentMutation>;
export type UpdateCommentMutationOptions = Apollo.BaseMutationOptions<UpdateCommentMutation, UpdateCommentMutationVariables>;
export const DeleteCommentDocument = gql`
    mutation DeleteComment($id: ID!) {
  deleteComment(id: $id) {
    success
    errors {
      message
      code
      field
    }
  }
}
    `;
export type DeleteCommentMutationFn = Apollo.MutationFunction<DeleteCommentMutation, DeleteCommentMutationVariables>;

/**
 * __useDeleteCommentMutation__
 *
 * To run a mutation, you first call `useDeleteCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCommentMutation, { data, loading, error }] = useDeleteCommentMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCommentMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCommentMutation, DeleteCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCommentMutation, DeleteCommentMutationVariables>(DeleteCommentDocument, options);
      }
export type DeleteCommentMutationHookResult = ReturnType<typeof useDeleteCommentMutation>;
export type DeleteCommentMutationResult = Apollo.MutationResult<DeleteCommentMutation>;
export type DeleteCommentMutationOptions = Apollo.BaseMutationOptions<DeleteCommentMutation, DeleteCommentMutationVariables>;
export const CreateReactionDocument = gql`
    mutation CreateReaction($input: CreateReactionInput!) {
  createReaction(input: $input) {
    reaction {
      ...ReactionFragment
    }
    errors {
      message
      code
      field
    }
  }
}
    ${ReactionFragmentFragmentDoc}`;
export type CreateReactionMutationFn = Apollo.MutationFunction<CreateReactionMutation, CreateReactionMutationVariables>;

/**
 * __useCreateReactionMutation__
 *
 * To run a mutation, you first call `useCreateReactionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateReactionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createReactionMutation, { data, loading, error }] = useCreateReactionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateReactionMutation(baseOptions?: Apollo.MutationHookOptions<CreateReactionMutation, CreateReactionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateReactionMutation, CreateReactionMutationVariables>(CreateReactionDocument, options);
      }
export type CreateReactionMutationHookResult = ReturnType<typeof useCreateReactionMutation>;
export type CreateReactionMutationResult = Apollo.MutationResult<CreateReactionMutation>;
export type CreateReactionMutationOptions = Apollo.BaseMutationOptions<CreateReactionMutation, CreateReactionMutationVariables>;
export const DeleteReactionDocument = gql`
    mutation DeleteReaction($id: ID!) {
  deleteReaction(id: $id) {
    success
    errors {
      message
      code
      field
    }
  }
}
    `;
export type DeleteReactionMutationFn = Apollo.MutationFunction<DeleteReactionMutation, DeleteReactionMutationVariables>;

/**
 * __useDeleteReactionMutation__
 *
 * To run a mutation, you first call `useDeleteReactionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteReactionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteReactionMutation, { data, loading, error }] = useDeleteReactionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteReactionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteReactionMutation, DeleteReactionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteReactionMutation, DeleteReactionMutationVariables>(DeleteReactionDocument, options);
      }
export type DeleteReactionMutationHookResult = ReturnType<typeof useDeleteReactionMutation>;
export type DeleteReactionMutationResult = Apollo.MutationResult<DeleteReactionMutation>;
export type DeleteReactionMutationOptions = Apollo.BaseMutationOptions<DeleteReactionMutation, DeleteReactionMutationVariables>;
export const SendFriendRequestDocument = gql`
    mutation SendFriendRequest($userId: ID!) {
  sendFriendRequest(userId: $userId) {
    friendship {
      ...FriendshipFragment
    }
    errors {
      message
      code
      field
    }
  }
}
    ${FriendshipFragmentFragmentDoc}`;
export type SendFriendRequestMutationFn = Apollo.MutationFunction<SendFriendRequestMutation, SendFriendRequestMutationVariables>;

/**
 * __useSendFriendRequestMutation__
 *
 * To run a mutation, you first call `useSendFriendRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendFriendRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendFriendRequestMutation, { data, loading, error }] = useSendFriendRequestMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useSendFriendRequestMutation(baseOptions?: Apollo.MutationHookOptions<SendFriendRequestMutation, SendFriendRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendFriendRequestMutation, SendFriendRequestMutationVariables>(SendFriendRequestDocument, options);
      }
export type SendFriendRequestMutationHookResult = ReturnType<typeof useSendFriendRequestMutation>;
export type SendFriendRequestMutationResult = Apollo.MutationResult<SendFriendRequestMutation>;
export type SendFriendRequestMutationOptions = Apollo.BaseMutationOptions<SendFriendRequestMutation, SendFriendRequestMutationVariables>;
export const AcceptFriendRequestDocument = gql`
    mutation AcceptFriendRequest($friendshipId: ID!) {
  acceptFriendRequest(friendshipId: $friendshipId) {
    friendship {
      ...FriendshipFragment
    }
    errors {
      message
      code
      field
    }
  }
}
    ${FriendshipFragmentFragmentDoc}`;
export type AcceptFriendRequestMutationFn = Apollo.MutationFunction<AcceptFriendRequestMutation, AcceptFriendRequestMutationVariables>;

/**
 * __useAcceptFriendRequestMutation__
 *
 * To run a mutation, you first call `useAcceptFriendRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAcceptFriendRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [acceptFriendRequestMutation, { data, loading, error }] = useAcceptFriendRequestMutation({
 *   variables: {
 *      friendshipId: // value for 'friendshipId'
 *   },
 * });
 */
export function useAcceptFriendRequestMutation(baseOptions?: Apollo.MutationHookOptions<AcceptFriendRequestMutation, AcceptFriendRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AcceptFriendRequestMutation, AcceptFriendRequestMutationVariables>(AcceptFriendRequestDocument, options);
      }
export type AcceptFriendRequestMutationHookResult = ReturnType<typeof useAcceptFriendRequestMutation>;
export type AcceptFriendRequestMutationResult = Apollo.MutationResult<AcceptFriendRequestMutation>;
export type AcceptFriendRequestMutationOptions = Apollo.BaseMutationOptions<AcceptFriendRequestMutation, AcceptFriendRequestMutationVariables>;
export const RejectFriendRequestDocument = gql`
    mutation RejectFriendRequest($friendshipId: ID!) {
  rejectFriendRequest(friendshipId: $friendshipId) {
    friendship {
      ...FriendshipFragment
    }
    errors {
      message
      code
      field
    }
  }
}
    ${FriendshipFragmentFragmentDoc}`;
export type RejectFriendRequestMutationFn = Apollo.MutationFunction<RejectFriendRequestMutation, RejectFriendRequestMutationVariables>;

/**
 * __useRejectFriendRequestMutation__
 *
 * To run a mutation, you first call `useRejectFriendRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRejectFriendRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [rejectFriendRequestMutation, { data, loading, error }] = useRejectFriendRequestMutation({
 *   variables: {
 *      friendshipId: // value for 'friendshipId'
 *   },
 * });
 */
export function useRejectFriendRequestMutation(baseOptions?: Apollo.MutationHookOptions<RejectFriendRequestMutation, RejectFriendRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RejectFriendRequestMutation, RejectFriendRequestMutationVariables>(RejectFriendRequestDocument, options);
      }
export type RejectFriendRequestMutationHookResult = ReturnType<typeof useRejectFriendRequestMutation>;
export type RejectFriendRequestMutationResult = Apollo.MutationResult<RejectFriendRequestMutation>;
export type RejectFriendRequestMutationOptions = Apollo.BaseMutationOptions<RejectFriendRequestMutation, RejectFriendRequestMutationVariables>;
export const RemoveFriendDocument = gql`
    mutation RemoveFriend($friendshipId: ID!) {
  removeFriend(friendshipId: $friendshipId) {
    success
    errors {
      message
      code
      field
    }
  }
}
    `;
export type RemoveFriendMutationFn = Apollo.MutationFunction<RemoveFriendMutation, RemoveFriendMutationVariables>;

/**
 * __useRemoveFriendMutation__
 *
 * To run a mutation, you first call `useRemoveFriendMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveFriendMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeFriendMutation, { data, loading, error }] = useRemoveFriendMutation({
 *   variables: {
 *      friendshipId: // value for 'friendshipId'
 *   },
 * });
 */
export function useRemoveFriendMutation(baseOptions?: Apollo.MutationHookOptions<RemoveFriendMutation, RemoveFriendMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveFriendMutation, RemoveFriendMutationVariables>(RemoveFriendDocument, options);
      }
export type RemoveFriendMutationHookResult = ReturnType<typeof useRemoveFriendMutation>;
export type RemoveFriendMutationResult = Apollo.MutationResult<RemoveFriendMutation>;
export type RemoveFriendMutationOptions = Apollo.BaseMutationOptions<RemoveFriendMutation, RemoveFriendMutationVariables>;
export const GetGamesDocument = gql`
    query GetGames($filters: GameFilters, $pagination: PaginationInput) {
  games(filters: $filters, pagination: $pagination) {
    edges {
      node {
        ...GameFragment
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
    ${GameFragmentFragmentDoc}`;

/**
 * __useGetGamesQuery__
 *
 * To run a query within a React component, call `useGetGamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGamesQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetGamesQuery(baseOptions?: Apollo.QueryHookOptions<GetGamesQuery, GetGamesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGamesQuery, GetGamesQueryVariables>(GetGamesDocument, options);
      }
export function useGetGamesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGamesQuery, GetGamesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGamesQuery, GetGamesQueryVariables>(GetGamesDocument, options);
        }
export function useGetGamesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGamesQuery, GetGamesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGamesQuery, GetGamesQueryVariables>(GetGamesDocument, options);
        }
export type GetGamesQueryHookResult = ReturnType<typeof useGetGamesQuery>;
export type GetGamesLazyQueryHookResult = ReturnType<typeof useGetGamesLazyQuery>;
export type GetGamesSuspenseQueryHookResult = ReturnType<typeof useGetGamesSuspenseQuery>;
export type GetGamesQueryResult = Apollo.QueryResult<GetGamesQuery, GetGamesQueryVariables>;
export const GetGameDocument = gql`
    query GetGame($id: ID!) {
  game(id: $id) {
    ...GameFragment
  }
}
    ${GameFragmentFragmentDoc}`;

/**
 * __useGetGameQuery__
 *
 * To run a query within a React component, call `useGetGameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGameQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetGameQuery(baseOptions: Apollo.QueryHookOptions<GetGameQuery, GetGameQueryVariables> & ({ variables: GetGameQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGameQuery, GetGameQueryVariables>(GetGameDocument, options);
      }
export function useGetGameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGameQuery, GetGameQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGameQuery, GetGameQueryVariables>(GetGameDocument, options);
        }
export function useGetGameSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGameQuery, GetGameQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGameQuery, GetGameQueryVariables>(GetGameDocument, options);
        }
export type GetGameQueryHookResult = ReturnType<typeof useGetGameQuery>;
export type GetGameLazyQueryHookResult = ReturnType<typeof useGetGameLazyQuery>;
export type GetGameSuspenseQueryHookResult = ReturnType<typeof useGetGameSuspenseQuery>;
export type GetGameQueryResult = Apollo.QueryResult<GetGameQuery, GetGameQueryVariables>;
export const GetLiveGamesDocument = gql`
    query GetLiveGames($first: Int, $after: String) {
  liveGames(first: $first, after: $after) {
    edges {
      node {
        ...GameFragment
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
    ${GameFragmentFragmentDoc}`;

/**
 * __useGetLiveGamesQuery__
 *
 * To run a query within a React component, call `useGetLiveGamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLiveGamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLiveGamesQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useGetLiveGamesQuery(baseOptions?: Apollo.QueryHookOptions<GetLiveGamesQuery, GetLiveGamesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLiveGamesQuery, GetLiveGamesQueryVariables>(GetLiveGamesDocument, options);
      }
export function useGetLiveGamesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLiveGamesQuery, GetLiveGamesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLiveGamesQuery, GetLiveGamesQueryVariables>(GetLiveGamesDocument, options);
        }
export function useGetLiveGamesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLiveGamesQuery, GetLiveGamesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLiveGamesQuery, GetLiveGamesQueryVariables>(GetLiveGamesDocument, options);
        }
export type GetLiveGamesQueryHookResult = ReturnType<typeof useGetLiveGamesQuery>;
export type GetLiveGamesLazyQueryHookResult = ReturnType<typeof useGetLiveGamesLazyQuery>;
export type GetLiveGamesSuspenseQueryHookResult = ReturnType<typeof useGetLiveGamesSuspenseQuery>;
export type GetLiveGamesQueryResult = Apollo.QueryResult<GetLiveGamesQuery, GetLiveGamesQueryVariables>;
export const GetGameLogsDocument = gql`
    query GetGameLogs($filters: GameLogFilters, $pagination: PaginationInput) {
  gameLogs(filters: $filters, pagination: $pagination) {
    edges {
      node {
        ...GameLogFragment
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
    ${GameLogFragmentFragmentDoc}`;

/**
 * __useGetGameLogsQuery__
 *
 * To run a query within a React component, call `useGetGameLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGameLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGameLogsQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetGameLogsQuery(baseOptions?: Apollo.QueryHookOptions<GetGameLogsQuery, GetGameLogsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGameLogsQuery, GetGameLogsQueryVariables>(GetGameLogsDocument, options);
      }
export function useGetGameLogsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGameLogsQuery, GetGameLogsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGameLogsQuery, GetGameLogsQueryVariables>(GetGameLogsDocument, options);
        }
export function useGetGameLogsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGameLogsQuery, GetGameLogsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGameLogsQuery, GetGameLogsQueryVariables>(GetGameLogsDocument, options);
        }
export type GetGameLogsQueryHookResult = ReturnType<typeof useGetGameLogsQuery>;
export type GetGameLogsLazyQueryHookResult = ReturnType<typeof useGetGameLogsLazyQuery>;
export type GetGameLogsSuspenseQueryHookResult = ReturnType<typeof useGetGameLogsSuspenseQuery>;
export type GetGameLogsQueryResult = Apollo.QueryResult<GetGameLogsQuery, GetGameLogsQueryVariables>;
export const GetGameLogDocument = gql`
    query GetGameLog($id: ID!) {
  gameLog(id: $id) {
    ...GameLogFragment
  }
}
    ${GameLogFragmentFragmentDoc}`;

/**
 * __useGetGameLogQuery__
 *
 * To run a query within a React component, call `useGetGameLogQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGameLogQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGameLogQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetGameLogQuery(baseOptions: Apollo.QueryHookOptions<GetGameLogQuery, GetGameLogQueryVariables> & ({ variables: GetGameLogQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGameLogQuery, GetGameLogQueryVariables>(GetGameLogDocument, options);
      }
export function useGetGameLogLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGameLogQuery, GetGameLogQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGameLogQuery, GetGameLogQueryVariables>(GetGameLogDocument, options);
        }
export function useGetGameLogSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGameLogQuery, GetGameLogQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGameLogQuery, GetGameLogQueryVariables>(GetGameLogDocument, options);
        }
export type GetGameLogQueryHookResult = ReturnType<typeof useGetGameLogQuery>;
export type GetGameLogLazyQueryHookResult = ReturnType<typeof useGetGameLogLazyQuery>;
export type GetGameLogSuspenseQueryHookResult = ReturnType<typeof useGetGameLogSuspenseQuery>;
export type GetGameLogQueryResult = Apollo.QueryResult<GetGameLogQuery, GetGameLogQueryVariables>;
export const GetUsersDocument = gql`
    query GetUsers($filters: UserFilters, $pagination: PaginationInput) {
  users(filters: $filters, pagination: $pagination) {
    ...UserSummaryFragment
  }
}
    ${UserSummaryFragmentFragmentDoc}`;

/**
 * __useGetUsersQuery__
 *
 * To run a query within a React component, call `useGetUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetUsersQuery(baseOptions?: Apollo.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
      }
export function useGetUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export function useGetUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export type GetUsersQueryHookResult = ReturnType<typeof useGetUsersQuery>;
export type GetUsersLazyQueryHookResult = ReturnType<typeof useGetUsersLazyQuery>;
export type GetUsersSuspenseQueryHookResult = ReturnType<typeof useGetUsersSuspenseQuery>;
export type GetUsersQueryResult = Apollo.QueryResult<GetUsersQuery, GetUsersQueryVariables>;
export const GetUserDocument = gql`
    query GetUser($id: ID!) {
  user(id: $id) {
    ...UserSummaryFragment
  }
}
    ${UserSummaryFragmentFragmentDoc}`;

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserQuery(baseOptions: Apollo.QueryHookOptions<GetUserQuery, GetUserQueryVariables> & ({ variables: GetUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
      }
export function useGetUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
        }
export function useGetUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
        }
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserSuspenseQueryHookResult = ReturnType<typeof useGetUserSuspenseQuery>;
export type GetUserQueryResult = Apollo.QueryResult<GetUserQuery, GetUserQueryVariables>;
export const SearchUsersDocument = gql`
    query SearchUsers($searchTerm: String, $searchField: String, $filters: UserSearchFilters, $pagination: PaginationInput) {
  searchUsers(
    searchTerm: $searchTerm
    searchField: $searchField
    filters: $filters
    pagination: $pagination
  ) {
    edges {
      node {
        ...UserSummaryFragment
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
    ${UserSummaryFragmentFragmentDoc}`;

/**
 * __useSearchUsersQuery__
 *
 * To run a query within a React component, call `useSearchUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchUsersQuery({
 *   variables: {
 *      searchTerm: // value for 'searchTerm'
 *      searchField: // value for 'searchField'
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useSearchUsersQuery(baseOptions?: Apollo.QueryHookOptions<SearchUsersQuery, SearchUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchUsersQuery, SearchUsersQueryVariables>(SearchUsersDocument, options);
      }
export function useSearchUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchUsersQuery, SearchUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchUsersQuery, SearchUsersQueryVariables>(SearchUsersDocument, options);
        }
export function useSearchUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchUsersQuery, SearchUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchUsersQuery, SearchUsersQueryVariables>(SearchUsersDocument, options);
        }
export type SearchUsersQueryHookResult = ReturnType<typeof useSearchUsersQuery>;
export type SearchUsersLazyQueryHookResult = ReturnType<typeof useSearchUsersLazyQuery>;
export type SearchUsersSuspenseQueryHookResult = ReturnType<typeof useSearchUsersSuspenseQuery>;
export type SearchUsersQueryResult = Apollo.QueryResult<SearchUsersQuery, SearchUsersQueryVariables>;
export const GetCommentsDocument = gql`
    query GetComments($filters: CommentFilters, $pagination: PaginationInput) {
  comments(filters: $filters, pagination: $pagination) {
    edges {
      node {
        ...CommentFragment
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
    ${CommentFragmentFragmentDoc}`;

/**
 * __useGetCommentsQuery__
 *
 * To run a query within a React component, call `useGetCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentsQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetCommentsQuery(baseOptions?: Apollo.QueryHookOptions<GetCommentsQuery, GetCommentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCommentsQuery, GetCommentsQueryVariables>(GetCommentsDocument, options);
      }
export function useGetCommentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCommentsQuery, GetCommentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCommentsQuery, GetCommentsQueryVariables>(GetCommentsDocument, options);
        }
export function useGetCommentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCommentsQuery, GetCommentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCommentsQuery, GetCommentsQueryVariables>(GetCommentsDocument, options);
        }
export type GetCommentsQueryHookResult = ReturnType<typeof useGetCommentsQuery>;
export type GetCommentsLazyQueryHookResult = ReturnType<typeof useGetCommentsLazyQuery>;
export type GetCommentsSuspenseQueryHookResult = ReturnType<typeof useGetCommentsSuspenseQuery>;
export type GetCommentsQueryResult = Apollo.QueryResult<GetCommentsQuery, GetCommentsQueryVariables>;
export const GetReactionsDocument = gql`
    query GetReactions($targetId: ID!, $targetType: ParentType!) {
  reactions(targetId: $targetId, targetType: $targetType) {
    ...ReactionFragment
  }
}
    ${ReactionFragmentFragmentDoc}`;

/**
 * __useGetReactionsQuery__
 *
 * To run a query within a React component, call `useGetReactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetReactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetReactionsQuery({
 *   variables: {
 *      targetId: // value for 'targetId'
 *      targetType: // value for 'targetType'
 *   },
 * });
 */
export function useGetReactionsQuery(baseOptions: Apollo.QueryHookOptions<GetReactionsQuery, GetReactionsQueryVariables> & ({ variables: GetReactionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetReactionsQuery, GetReactionsQueryVariables>(GetReactionsDocument, options);
      }
export function useGetReactionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetReactionsQuery, GetReactionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetReactionsQuery, GetReactionsQueryVariables>(GetReactionsDocument, options);
        }
export function useGetReactionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetReactionsQuery, GetReactionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetReactionsQuery, GetReactionsQueryVariables>(GetReactionsDocument, options);
        }
export type GetReactionsQueryHookResult = ReturnType<typeof useGetReactionsQuery>;
export type GetReactionsLazyQueryHookResult = ReturnType<typeof useGetReactionsLazyQuery>;
export type GetReactionsSuspenseQueryHookResult = ReturnType<typeof useGetReactionsSuspenseQuery>;
export type GetReactionsQueryResult = Apollo.QueryResult<GetReactionsQuery, GetReactionsQueryVariables>;
export const SearchUsersAdminDocument = gql`
    query SearchUsersAdmin($first: Int, $after: String, $searchTerm: String, $searchField: String) {
  searchUsers(
    first: $first
    after: $after
    searchTerm: $searchTerm
    searchField: $searchField
  ) {
    edges {
      node {
        id
        username
        first_name
        last_name
        email_address
        phone_number
        image_url
        created_at
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `;

/**
 * __useSearchUsersAdminQuery__
 *
 * To run a query within a React component, call `useSearchUsersAdminQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchUsersAdminQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchUsersAdminQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      searchTerm: // value for 'searchTerm'
 *      searchField: // value for 'searchField'
 *   },
 * });
 */
export function useSearchUsersAdminQuery(baseOptions?: Apollo.QueryHookOptions<SearchUsersAdminQuery, SearchUsersAdminQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchUsersAdminQuery, SearchUsersAdminQueryVariables>(SearchUsersAdminDocument, options);
      }
export function useSearchUsersAdminLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchUsersAdminQuery, SearchUsersAdminQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchUsersAdminQuery, SearchUsersAdminQueryVariables>(SearchUsersAdminDocument, options);
        }
export function useSearchUsersAdminSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchUsersAdminQuery, SearchUsersAdminQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchUsersAdminQuery, SearchUsersAdminQueryVariables>(SearchUsersAdminDocument, options);
        }
export type SearchUsersAdminQueryHookResult = ReturnType<typeof useSearchUsersAdminQuery>;
export type SearchUsersAdminLazyQueryHookResult = ReturnType<typeof useSearchUsersAdminLazyQuery>;
export type SearchUsersAdminSuspenseQueryHookResult = ReturnType<typeof useSearchUsersAdminSuspenseQuery>;
export type SearchUsersAdminQueryResult = Apollo.QueryResult<SearchUsersAdminQuery, SearchUsersAdminQueryVariables>;
export const SearchGameLogsAdminDocument = gql`
    query SearchGameLogsAdmin($first: Int, $after: String, $searchTerm: String, $searchField: String) {
  searchGameLogs(
    first: $first
    after: $after
    searchTerm: $searchTerm
    searchField: $searchField
  ) {
    edges {
      node {
        id
        game_id
        classification
        rating_for_game
        watched_setting
        watched_location
        watched_scope
        watched_date
        created_at
        user {
          id
          username
          first_name
          last_name
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `;

/**
 * __useSearchGameLogsAdminQuery__
 *
 * To run a query within a React component, call `useSearchGameLogsAdminQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchGameLogsAdminQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchGameLogsAdminQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      searchTerm: // value for 'searchTerm'
 *      searchField: // value for 'searchField'
 *   },
 * });
 */
export function useSearchGameLogsAdminQuery(baseOptions?: Apollo.QueryHookOptions<SearchGameLogsAdminQuery, SearchGameLogsAdminQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchGameLogsAdminQuery, SearchGameLogsAdminQueryVariables>(SearchGameLogsAdminDocument, options);
      }
export function useSearchGameLogsAdminLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchGameLogsAdminQuery, SearchGameLogsAdminQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchGameLogsAdminQuery, SearchGameLogsAdminQueryVariables>(SearchGameLogsAdminDocument, options);
        }
export function useSearchGameLogsAdminSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchGameLogsAdminQuery, SearchGameLogsAdminQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchGameLogsAdminQuery, SearchGameLogsAdminQueryVariables>(SearchGameLogsAdminDocument, options);
        }
export type SearchGameLogsAdminQueryHookResult = ReturnType<typeof useSearchGameLogsAdminQuery>;
export type SearchGameLogsAdminLazyQueryHookResult = ReturnType<typeof useSearchGameLogsAdminLazyQuery>;
export type SearchGameLogsAdminSuspenseQueryHookResult = ReturnType<typeof useSearchGameLogsAdminSuspenseQuery>;
export type SearchGameLogsAdminQueryResult = Apollo.QueryResult<SearchGameLogsAdminQuery, SearchGameLogsAdminQueryVariables>;
export const GetFriendsGameLogsDocument = gql`
    query GetFriendsGameLogs($pagination: PaginationInput) {
  friendsGameLogs(pagination: $pagination) {
    edges {
      node {
        ...GameLogFragment
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
    ${GameLogFragmentFragmentDoc}`;

/**
 * __useGetFriendsGameLogsQuery__
 *
 * To run a query within a React component, call `useGetFriendsGameLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFriendsGameLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFriendsGameLogsQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetFriendsGameLogsQuery(baseOptions?: Apollo.QueryHookOptions<GetFriendsGameLogsQuery, GetFriendsGameLogsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFriendsGameLogsQuery, GetFriendsGameLogsQueryVariables>(GetFriendsGameLogsDocument, options);
      }
export function useGetFriendsGameLogsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFriendsGameLogsQuery, GetFriendsGameLogsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFriendsGameLogsQuery, GetFriendsGameLogsQueryVariables>(GetFriendsGameLogsDocument, options);
        }
export function useGetFriendsGameLogsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFriendsGameLogsQuery, GetFriendsGameLogsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFriendsGameLogsQuery, GetFriendsGameLogsQueryVariables>(GetFriendsGameLogsDocument, options);
        }
export type GetFriendsGameLogsQueryHookResult = ReturnType<typeof useGetFriendsGameLogsQuery>;
export type GetFriendsGameLogsLazyQueryHookResult = ReturnType<typeof useGetFriendsGameLogsLazyQuery>;
export type GetFriendsGameLogsSuspenseQueryHookResult = ReturnType<typeof useGetFriendsGameLogsSuspenseQuery>;
export type GetFriendsGameLogsQueryResult = Apollo.QueryResult<GetFriendsGameLogsQuery, GetFriendsGameLogsQueryVariables>;
export const GetUserFriendshipsDocument = gql`
    query GetUserFriendships($filters: FriendshipFilters, $pagination: PaginationInput) {
  userFriendships(filters: $filters, pagination: $pagination) {
    edges {
      node {
        ...FriendshipFragment
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
    ${FriendshipFragmentFragmentDoc}`;

/**
 * __useGetUserFriendshipsQuery__
 *
 * To run a query within a React component, call `useGetUserFriendshipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserFriendshipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserFriendshipsQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetUserFriendshipsQuery(baseOptions?: Apollo.QueryHookOptions<GetUserFriendshipsQuery, GetUserFriendshipsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserFriendshipsQuery, GetUserFriendshipsQueryVariables>(GetUserFriendshipsDocument, options);
      }
export function useGetUserFriendshipsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserFriendshipsQuery, GetUserFriendshipsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserFriendshipsQuery, GetUserFriendshipsQueryVariables>(GetUserFriendshipsDocument, options);
        }
export function useGetUserFriendshipsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserFriendshipsQuery, GetUserFriendshipsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserFriendshipsQuery, GetUserFriendshipsQueryVariables>(GetUserFriendshipsDocument, options);
        }
export type GetUserFriendshipsQueryHookResult = ReturnType<typeof useGetUserFriendshipsQuery>;
export type GetUserFriendshipsLazyQueryHookResult = ReturnType<typeof useGetUserFriendshipsLazyQuery>;
export type GetUserFriendshipsSuspenseQueryHookResult = ReturnType<typeof useGetUserFriendshipsSuspenseQuery>;
export type GetUserFriendshipsQueryResult = Apollo.QueryResult<GetUserFriendshipsQuery, GetUserFriendshipsQueryVariables>;
export const GetFriendshipRequestsDocument = gql`
    query GetFriendshipRequests($pagination: PaginationInput) {
  friendshipRequests(pagination: $pagination) {
    edges {
      node {
        ...FriendshipFragment
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
    ${FriendshipFragmentFragmentDoc}`;

/**
 * __useGetFriendshipRequestsQuery__
 *
 * To run a query within a React component, call `useGetFriendshipRequestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFriendshipRequestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFriendshipRequestsQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetFriendshipRequestsQuery(baseOptions?: Apollo.QueryHookOptions<GetFriendshipRequestsQuery, GetFriendshipRequestsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFriendshipRequestsQuery, GetFriendshipRequestsQueryVariables>(GetFriendshipRequestsDocument, options);
      }
export function useGetFriendshipRequestsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFriendshipRequestsQuery, GetFriendshipRequestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFriendshipRequestsQuery, GetFriendshipRequestsQueryVariables>(GetFriendshipRequestsDocument, options);
        }
export function useGetFriendshipRequestsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFriendshipRequestsQuery, GetFriendshipRequestsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFriendshipRequestsQuery, GetFriendshipRequestsQueryVariables>(GetFriendshipRequestsDocument, options);
        }
export type GetFriendshipRequestsQueryHookResult = ReturnType<typeof useGetFriendshipRequestsQuery>;
export type GetFriendshipRequestsLazyQueryHookResult = ReturnType<typeof useGetFriendshipRequestsLazyQuery>;
export type GetFriendshipRequestsSuspenseQueryHookResult = ReturnType<typeof useGetFriendshipRequestsSuspenseQuery>;
export type GetFriendshipRequestsQueryResult = Apollo.QueryResult<GetFriendshipRequestsQuery, GetFriendshipRequestsQueryVariables>;
export const GetFriendshipStatusDocument = gql`
    query GetFriendshipStatus($userId: ID!) {
  friendshipStatus(userId: $userId) {
    status
    friendshipId
    isInitiator
  }
}
    `;

/**
 * __useGetFriendshipStatusQuery__
 *
 * To run a query within a React component, call `useGetFriendshipStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFriendshipStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFriendshipStatusQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetFriendshipStatusQuery(baseOptions: Apollo.QueryHookOptions<GetFriendshipStatusQuery, GetFriendshipStatusQueryVariables> & ({ variables: GetFriendshipStatusQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFriendshipStatusQuery, GetFriendshipStatusQueryVariables>(GetFriendshipStatusDocument, options);
      }
export function useGetFriendshipStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFriendshipStatusQuery, GetFriendshipStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFriendshipStatusQuery, GetFriendshipStatusQueryVariables>(GetFriendshipStatusDocument, options);
        }
export function useGetFriendshipStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFriendshipStatusQuery, GetFriendshipStatusQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFriendshipStatusQuery, GetFriendshipStatusQueryVariables>(GetFriendshipStatusDocument, options);
        }
export type GetFriendshipStatusQueryHookResult = ReturnType<typeof useGetFriendshipStatusQuery>;
export type GetFriendshipStatusLazyQueryHookResult = ReturnType<typeof useGetFriendshipStatusLazyQuery>;
export type GetFriendshipStatusSuspenseQueryHookResult = ReturnType<typeof useGetFriendshipStatusSuspenseQuery>;
export type GetFriendshipStatusQueryResult = Apollo.QueryResult<GetFriendshipStatusQuery, GetFriendshipStatusQueryVariables>;