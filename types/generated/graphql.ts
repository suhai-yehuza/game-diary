import { gql } from 'graphql-tag';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Any: { input: any; output: any };
  DateTime: { input: string; output: string };
  JSON: { input: any; output: any };
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
  Public = 'PUBLIC',
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
  totalChildCommentCount: Scalars['Int']['output'];
  totalReactionCount: Scalars['Int']['output'];
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
  date: Scalars['DateTime']['input'];
  game_id?: InputMaybe<Scalars['ID']['input']>;
  scores?: InputMaybe<Scalars['JSON']['input']>;
  season?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
  teams?: InputMaybe<Scalars['JSON']['input']>;
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

export type CreatePublicCommentInput = {
  anonymousEmail?: InputMaybe<Scalars['String']['input']>;
  anonymousName?: InputMaybe<Scalars['String']['input']>;
  content: Scalars['String']['input'];
  parentId: Scalars['ID']['input'];
  parentType: ParentType;
};

export type CreatePublicCommentResponse = {
  __typename?: 'CreatePublicCommentResponse';
  comment?: Maybe<PublicComment>;
  errors?: Maybe<Array<ErrorResult>>;
};

export type CreatePublicReactionInput = {
  anonymousEmail?: InputMaybe<Scalars['String']['input']>;
  anonymousName?: InputMaybe<Scalars['String']['input']>;
  emoji: Scalars['String']['input'];
  targetId: Scalars['ID']['input'];
  targetType: ParentType;
};

export type CreatePublicReactionResponse = {
  __typename?: 'CreatePublicReactionResponse';
  errors?: Maybe<Array<ErrorResult>>;
  reaction?: Maybe<PublicReaction>;
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
  isAdmin: Scalars['Boolean']['output'];
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

export type DeletePublicCommentResponse = {
  __typename?: 'DeletePublicCommentResponse';
  errors?: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type DeletePublicReactionResponse = {
  __typename?: 'DeletePublicReactionResponse';
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
  Rejected = 'REJECTED',
}

export type FriendshipStatusResponse = {
  __typename?: 'FriendshipStatusResponse';
  friendshipId?: Maybe<Scalars['ID']['output']>;
  isInitiator?: Maybe<Scalars['Boolean']['output']>;
  status?: Maybe<FriendshipStatus>;
};

export type Game = {
  __typename?: 'Game';
  arena?: Maybe<Scalars['JSON']['output']>;
  average_rating?: Maybe<Scalars['Float']['output']>;
  away_team?: Maybe<Scalars['JSON']['output']>;
  created_at: Scalars['DateTime']['output'];
  date: Scalars['DateTime']['output'];
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
  game_id?: Maybe<Scalars['String']['output']>;
  home_team?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  periods?: Maybe<Scalars['JSON']['output']>;
  publicComments: PublicCommentConnection;
  publicReactions: Array<PublicReaction>;
  scores?: Maybe<Scalars['JSON']['output']>;
  season?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['JSON']['output']>;
  teams?: Maybe<Scalars['JSON']['output']>;
  totalPublicCommentCount: Scalars['Int']['output'];
  totalPublicReactionCount: Scalars['Int']['output'];
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
  totalCommentCount: Scalars['Int']['output'];
  totalReactionCount: Scalars['Int']['output'];
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
  InProgress = 'IN_PROGRESS',
  Live = 'LIVE',
  Scheduled = 'SCHEDULED',
}

export type MarkAllNotificationsAsReadResponse = {
  __typename?: 'MarkAllNotificationsAsReadResponse';
  errors?: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type MarkNotificationAsReadResponse = {
  __typename?: 'MarkNotificationAsReadResponse';
  errors?: Maybe<Array<ErrorResult>>;
  success: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptFriendRequest: AcceptFriendRequestResponse;
  createComment: CreateCommentResponse;
  createGame: CreateGameResponse;
  createGameLog: CreateGameLogResponse;
  createPublicComment: CreatePublicCommentResponse;
  createPublicReaction: CreatePublicReactionResponse;
  createReaction: CreateReactionResponse;
  deleteComment: DeleteCommentResponse;
  deleteGameLog: DeleteGameLogResponse;
  deletePublicComment: DeletePublicCommentResponse;
  deletePublicReaction: DeletePublicReactionResponse;
  deleteReaction: DeleteReactionResponse;
  markAllNotificationsAsRead: MarkAllNotificationsAsReadResponse;
  markNotificationAsRead: MarkNotificationAsReadResponse;
  rejectFriendRequest: RejectFriendRequestResponse;
  removeFriend: RemoveFriendResponse;
  sendFriendRequest: SendFriendRequestResponse;
  updateComment: UpdateCommentResponse;
  updateGameLog: UpdateGameLogResponse;
  updatePublicComment: UpdatePublicCommentResponse;
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

export type MutationCreatePublicCommentArgs = {
  input: CreatePublicCommentInput;
};

export type MutationCreatePublicReactionArgs = {
  input: CreatePublicReactionInput;
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

export type MutationDeletePublicCommentArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeletePublicReactionArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteReactionArgs = {
  id: Scalars['ID']['input'];
};

export type MutationMarkNotificationAsReadArgs = {
  notificationId: Scalars['ID']['input'];
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

export type MutationUpdatePublicCommentArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePublicCommentInput;
};

export type NbaPlayer = {
  __typename?: 'NBAPlayer';
  affiliation?: Maybe<Scalars['String']['output']>;
  birth?: Maybe<Scalars['JSON']['output']>;
  college?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
  first_name: Scalars['String']['output'];
  height?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  last_name: Scalars['String']['output'];
  leagues?: Maybe<Scalars['JSON']['output']>;
  nba?: Maybe<Scalars['JSON']['output']>;
  publicComments: PublicCommentConnection;
  publicReactions: Array<PublicReaction>;
  teams?: Maybe<Scalars['JSON']['output']>;
  totalPublicCommentCount: Scalars['Int']['output'];
  totalPublicReactionCount: Scalars['Int']['output'];
  updated_at: Scalars['DateTime']['output'];
  weight?: Maybe<Scalars['JSON']['output']>;
};

export type NbaPlayerConnection = {
  __typename?: 'NBAPlayerConnection';
  edges: Array<NbaPlayerEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type NbaPlayerEdge = {
  __typename?: 'NBAPlayerEdge';
  cursor: Scalars['String']['output'];
  node: NbaPlayer;
};

export type NbaPlayerFilters = {
  collegeFilter?: InputMaybe<Scalars['String']['input']>;
  countryFilter?: InputMaybe<Scalars['String']['input']>;
  positionFilter?: InputMaybe<Scalars['String']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['String']['input']>;
  teamFilter?: InputMaybe<Scalars['String']['input']>;
};

export type Notification = {
  __typename?: 'Notification';
  created_at: Scalars['DateTime']['output'];
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  read: Scalars['Boolean']['output'];
  resolved: Scalars['Boolean']['output'];
  target_id?: Maybe<Scalars['ID']['output']>;
  target_type?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
  user_id: Scalars['ID']['output'];
};

export type NotificationConnection = {
  __typename?: 'NotificationConnection';
  edges: Array<NotificationEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type NotificationEdge = {
  __typename?: 'NotificationEdge';
  cursor: Scalars['String']['output'];
  node: Notification;
};

export type NotificationFilters = {
  createdAfter?: InputMaybe<Scalars['DateTime']['input']>;
  createdBefore?: InputMaybe<Scalars['DateTime']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  read?: InputMaybe<Scalars['Boolean']['input']>;
  resolved?: InputMaybe<Scalars['Boolean']['input']>;
  targetType?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
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
  BasketballGame = 'BASKETBALL_GAME',
  BasketballPlayer = 'BASKETBALL_PLAYER',
  BasketballTeam = 'BASKETBALL_TEAM',
  Comment = 'COMMENT',
  GameLog = 'GAME_LOG',
  PublicComment = 'PUBLIC_COMMENT',
  PublicReaction = 'PUBLIC_REACTION',
}

export type PublicComment = {
  __typename?: 'PublicComment';
  anonymous_email?: Maybe<Scalars['String']['output']>;
  anonymous_name?: Maybe<Scalars['String']['output']>;
  childComments: PublicCommentConnection;
  content: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
  depth: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  is_approved: Scalars['Boolean']['output'];
  parent_id: Scalars['ID']['output'];
  parent_type: ParentType;
  reactions: Array<PublicReaction>;
  totalChildCommentCount: Scalars['Int']['output'];
  totalReactionCount: Scalars['Int']['output'];
  updated_at: Scalars['DateTime']['output'];
  user?: Maybe<UserSummary>;
  user_id?: Maybe<Scalars['ID']['output']>;
};

export type PublicCommentConnection = {
  __typename?: 'PublicCommentConnection';
  edges: Array<PublicCommentEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PublicCommentEdge = {
  __typename?: 'PublicCommentEdge';
  cursor: Scalars['String']['output'];
  node: PublicComment;
};

export type PublicCommentFilters = {
  anonymousName?: InputMaybe<Scalars['String']['input']>;
  isApproved?: InputMaybe<Scalars['Boolean']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  parentType?: InputMaybe<ParentType>;
  search?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type PublicReaction = {
  __typename?: 'PublicReaction';
  anonymous_email?: Maybe<Scalars['String']['output']>;
  anonymous_name?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
  emoji: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  is_approved: Scalars['Boolean']['output'];
  target_id: Scalars['ID']['output'];
  target_type: ParentType;
  updated_at: Scalars['DateTime']['output'];
  user?: Maybe<UserSummary>;
  user_id?: Maybe<Scalars['ID']['output']>;
};

export type Query = {
  __typename?: 'Query';
  basketball_teams: TeamConnection;
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
  nbaPlayer?: Maybe<NbaPlayer>;
  nbaPlayers: NbaPlayerConnection;
  publicComments: PublicCommentConnection;
  publicReactions: Array<PublicReaction>;
  reactions: Array<Reaction>;
  searchGameLogs: GameLogConnection;
  searchUsers: UserConnection;
  team?: Maybe<Team>;
  unreadNotificationsCount: Scalars['Int']['output'];
  user?: Maybe<UserSummary>;
  userFriendships: FriendshipConnection;
  userNotifications: NotificationConnection;
  users: Array<UserSummary>;
};

export type QueryBasketball_TeamsArgs = {
  filters?: InputMaybe<TeamFilters>;
  pagination?: InputMaybe<PaginationInput>;
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

export type QueryNbaPlayerArgs = {
  id: Scalars['ID']['input'];
};

export type QueryNbaPlayersArgs = {
  filters?: InputMaybe<NbaPlayerFilters>;
  pagination?: InputMaybe<PaginationInput>;
};

export type QueryPublicCommentsArgs = {
  filters?: InputMaybe<PublicCommentFilters>;
  pagination?: InputMaybe<PaginationInput>;
};

export type QueryPublicReactionsArgs = {
  targetId: Scalars['ID']['input'];
  targetType: ParentType;
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
  limit?: InputMaybe<Scalars['Int']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};

export type QueryTeamArgs = {
  id: Scalars['ID']['input'];
};

export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type QueryUserFriendshipsArgs = {
  filters?: InputMaybe<FriendshipFilters>;
  pagination?: InputMaybe<PaginationInput>;
};

export type QueryUserNotificationsArgs = {
  filters?: InputMaybe<NotificationFilters>;
  pagination?: InputMaybe<PaginationInput>;
};

export type QueryUsersArgs = {
  filters?: InputMaybe<UserFilters>;
  pagination?: InputMaybe<PaginationInput>;
};

export type Reaction = {
  __typename?: 'Reaction';
  created_at: Scalars['DateTime']['output'];
  deleted_at?: Maybe<Scalars['DateTime']['output']>;
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
  leagues?: Maybe<Scalars['JSON']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nba_franchise: Scalars['Boolean']['output'];
  nickname?: Maybe<Scalars['String']['output']>;
  publicComments: PublicCommentConnection;
  publicReactions: Array<PublicReaction>;
  totalPublicCommentCount: Scalars['Int']['output'];
  totalPublicReactionCount: Scalars['Int']['output'];
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
  conferenceFilter?: InputMaybe<Scalars['String']['input']>;
  divisionFilter?: InputMaybe<Scalars['String']['input']>;
  leagueFilter?: InputMaybe<Scalars['String']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['String']['input']>;
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

export type UpdatePublicCommentInput = {
  content: Scalars['String']['input'];
};

export type UpdatePublicCommentResponse = {
  __typename?: 'UpdatePublicCommentResponse';
  comment?: Maybe<PublicComment>;
  errors?: Maybe<Array<ErrorResult>>;
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
  isAdmin: Scalars['Boolean']['output'];
  last_name: Scalars['String']['output'];
  phone_number?: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
};

export type CreateGameMutationVariables = Exact<{
  input: CreateGameInput;
}>;

export type CreateGameMutation = {
  __typename?: 'Mutation';
  createGame: {
    __typename?: 'CreateGameResponse';
    game?: {
      __typename?: 'Game';
      id: string;
      date: string;
      status?: any | null;
      game_id?: string | null;
      teams?: any | null;
      scores?: any | null;
      created_at: string;
    } | null;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type CreateGameLogMutationVariables = Exact<{
  input: CreateGameLogInput;
}>;

export type CreateGameLogMutation = {
  __typename?: 'Mutation';
  createGameLog: {
    __typename?: 'CreateGameLogResponse';
    gameLog?: {
      __typename?: 'GameLog';
      id: string;
      game_id: string;
      rating_for_game: number;
      notes?: string | null;
      tags?: Array<string> | null;
      watched_date?: string | null;
      watched_setting?: string | null;
      watched_location?: string | null;
      watched_scope?: string | null;
      classification: Classification;
      created_at: string;
      user: { __typename?: 'UserSummary'; id: string; username: string };
      game: { __typename?: 'Game'; id: string; date: string; teams?: any | null };
    } | null;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type UpdateGameLogMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateGameLogInput;
}>;

export type UpdateGameLogMutation = {
  __typename?: 'Mutation';
  updateGameLog: {
    __typename?: 'UpdateGameLogResponse';
    gameLog?: {
      __typename?: 'GameLog';
      id: string;
      rating_for_game: number;
      notes?: string | null;
      tags?: Array<string> | null;
      watched_date?: string | null;
      watched_setting?: string | null;
      watched_location?: string | null;
      watched_scope?: string | null;
      classification: Classification;
      updated_at: string;
    } | null;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type DeleteGameLogMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteGameLogMutation = {
  __typename?: 'Mutation';
  deleteGameLog: {
    __typename?: 'DeleteGameLogResponse';
    success: boolean;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type CreateCommentMutationVariables = Exact<{
  input: CreateCommentInput;
}>;

export type CreateCommentMutation = {
  __typename?: 'Mutation';
  createComment: {
    __typename?: 'CreateCommentResponse';
    comment?: {
      __typename?: 'Comment';
      id: string;
      user_id: string;
      parent_id: string;
      parent_type: ParentType;
      content: string;
      depth: number;
      created_at: string;
      user: {
        __typename?: 'UserSummary';
        id: string;
        username: string;
        first_name: string;
        last_name: string;
        image_url?: string | null;
      };
    } | null;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type UpdateCommentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateCommentInput;
}>;

export type UpdateCommentMutation = {
  __typename?: 'Mutation';
  updateComment: {
    __typename?: 'UpdateCommentResponse';
    comment?: {
      __typename?: 'Comment';
      id: string;
      content: string;
      updated_at: string;
      user: { __typename?: 'UserSummary'; id: string; username: string };
    } | null;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type DeleteCommentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteCommentMutation = {
  __typename?: 'Mutation';
  deleteComment: {
    __typename?: 'DeleteCommentResponse';
    success: boolean;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type CreateReactionMutationVariables = Exact<{
  input: CreateReactionInput;
}>;

export type CreateReactionMutation = {
  __typename?: 'Mutation';
  createReaction: {
    __typename?: 'CreateReactionResponse';
    reaction?: {
      __typename?: 'Reaction';
      id: string;
      emoji: string;
      user_id: string;
      target_id: string;
      target_type: ParentType;
      created_at: string;
      user: {
        __typename?: 'UserSummary';
        id: string;
        username: string;
        first_name: string;
        last_name: string;
      };
    } | null;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type DeleteReactionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteReactionMutation = {
  __typename?: 'Mutation';
  deleteReaction: {
    __typename?: 'DeleteReactionResponse';
    success: boolean;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type SendFriendRequestMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;

export type SendFriendRequestMutation = {
  __typename?: 'Mutation';
  sendFriendRequest: {
    __typename?: 'SendFriendRequestResponse';
    friendship?: {
      __typename?: 'Friendship';
      id: string;
      status: FriendshipStatus;
      created_at: string;
      initiator: {
        __typename?: 'UserSummary';
        id: string;
        username: string;
        first_name: string;
        last_name: string;
      };
      recipient: {
        __typename?: 'UserSummary';
        id: string;
        username: string;
        first_name: string;
        last_name: string;
      };
    } | null;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type AcceptFriendRequestMutationVariables = Exact<{
  friendshipId: Scalars['ID']['input'];
}>;

export type AcceptFriendRequestMutation = {
  __typename?: 'Mutation';
  acceptFriendRequest: {
    __typename?: 'AcceptFriendRequestResponse';
    friendship?: {
      __typename?: 'Friendship';
      id: string;
      status: FriendshipStatus;
      created_at: string;
      initiator: {
        __typename?: 'UserSummary';
        id: string;
        username: string;
        first_name: string;
        last_name: string;
      };
      recipient: {
        __typename?: 'UserSummary';
        id: string;
        username: string;
        first_name: string;
        last_name: string;
      };
    } | null;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type RejectFriendRequestMutationVariables = Exact<{
  friendshipId: Scalars['ID']['input'];
}>;

export type RejectFriendRequestMutation = {
  __typename?: 'Mutation';
  rejectFriendRequest: {
    __typename?: 'RejectFriendRequestResponse';
    friendship?: {
      __typename?: 'Friendship';
      id: string;
      status: FriendshipStatus;
      created_at: string;
      initiator: {
        __typename?: 'UserSummary';
        id: string;
        username: string;
        first_name: string;
        last_name: string;
      };
      recipient: {
        __typename?: 'UserSummary';
        id: string;
        username: string;
        first_name: string;
        last_name: string;
      };
    } | null;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type RemoveFriendMutationVariables = Exact<{
  friendshipId: Scalars['ID']['input'];
}>;

export type RemoveFriendMutation = {
  __typename?: 'Mutation';
  removeFriend: {
    __typename?: 'RemoveFriendResponse';
    success: boolean;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type MarkNotificationAsReadMutationVariables = Exact<{
  notificationId: Scalars['ID']['input'];
}>;

export type MarkNotificationAsReadMutation = {
  __typename?: 'Mutation';
  markNotificationAsRead: {
    __typename?: 'MarkNotificationAsReadResponse';
    success: boolean;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type MarkAllNotificationsAsReadMutationVariables = Exact<{ [key: string]: never }>;

export type MarkAllNotificationsAsReadMutation = {
  __typename?: 'Mutation';
  markAllNotificationsAsRead: {
    __typename?: 'MarkAllNotificationsAsReadResponse';
    success: boolean;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type CreatePublicCommentMutationVariables = Exact<{
  input: CreatePublicCommentInput;
}>;

export type CreatePublicCommentMutation = {
  __typename?: 'Mutation';
  createPublicComment: {
    __typename?: 'CreatePublicCommentResponse';
    comment?: {
      __typename?: 'PublicComment';
      id: string;
      content: string;
      user_id?: string | null;
      anonymous_name?: string | null;
      anonymous_email?: string | null;
      parent_id: string;
      parent_type: ParentType;
      depth: number;
      is_approved: boolean;
      created_at: string;
      updated_at: string;
      totalChildCommentCount: number;
      totalReactionCount: number;
      user?: {
        __typename?: 'UserSummary';
        id: string;
        username: string;
        first_name: string;
        last_name: string;
        image_url?: string | null;
      } | null;
    } | null;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type UpdatePublicCommentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdatePublicCommentInput;
}>;

export type UpdatePublicCommentMutation = {
  __typename?: 'Mutation';
  updatePublicComment: {
    __typename?: 'UpdatePublicCommentResponse';
    comment?: {
      __typename?: 'PublicComment';
      id: string;
      content: string;
      user_id?: string | null;
      anonymous_name?: string | null;
      anonymous_email?: string | null;
      parent_id: string;
      parent_type: ParentType;
      depth: number;
      is_approved: boolean;
      created_at: string;
      updated_at: string;
      totalChildCommentCount: number;
      totalReactionCount: number;
      user?: {
        __typename?: 'UserSummary';
        id: string;
        username: string;
        first_name: string;
        last_name: string;
        image_url?: string | null;
      } | null;
    } | null;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type DeletePublicCommentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeletePublicCommentMutation = {
  __typename?: 'Mutation';
  deletePublicComment: {
    __typename?: 'DeletePublicCommentResponse';
    success: boolean;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type CreatePublicReactionMutationVariables = Exact<{
  input: CreatePublicReactionInput;
}>;

export type CreatePublicReactionMutation = {
  __typename?: 'Mutation';
  createPublicReaction: {
    __typename?: 'CreatePublicReactionResponse';
    reaction?: {
      __typename?: 'PublicReaction';
      id: string;
      emoji: string;
      user_id?: string | null;
      anonymous_name?: string | null;
      anonymous_email?: string | null;
      target_id: string;
      target_type: ParentType;
      is_approved: boolean;
      created_at: string;
      updated_at: string;
      user?: {
        __typename?: 'UserSummary';
        id: string;
        username: string;
        first_name: string;
        last_name: string;
        image_url?: string | null;
      } | null;
    } | null;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type DeletePublicReactionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeletePublicReactionMutation = {
  __typename?: 'Mutation';
  deletePublicReaction: {
    __typename?: 'DeletePublicReactionResponse';
    success: boolean;
    errors?: Array<{
      __typename?: 'ErrorResult';
      message: string;
      code?: string | null;
      field?: string | null;
    }> | null;
  };
};

export type GameFragmentFragment = {
  __typename?: 'Game';
  id: string;
  date: string;
  status?: any | null;
  game_id?: string | null;
  teams?: any | null;
  scores?: any | null;
  arena?: any | null;
  periods?: any | null;
  average_rating?: number | null;
  total_ratings?: number | null;
  created_at: string;
  updated_at: string;
};

export type BasicUserFragmentFragment = {
  __typename?: 'DBUser';
  id: string;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  email_address?: string | null;
  image_url?: string | null;
  last_active_at?: string | null;
  created_at: string;
};

export type UserSummaryFragmentFragment = {
  __typename?: 'UserSummary';
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email_address?: string | null;
  image_url?: string | null;
  isAdmin: boolean;
};

export type ReactionFragmentFragment = {
  __typename?: 'Reaction';
  id: string;
  emoji: string;
  user_id: string;
  target_id: string;
  target_type: ParentType;
  created_at: string;
  user: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
};

export type CommentFragmentFragment = {
  __typename?: 'Comment';
  id: string;
  user_id: string;
  parent_id: string;
  parent_type: ParentType;
  content: string;
  depth: number;
  created_at: string;
  updated_at: string;
  totalChildCommentCount: number;
  totalReactionCount: number;
  user: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url?: string | null;
  };
};

export type GameLogFragmentFragment = {
  __typename?: 'GameLog';
  id: string;
  game_id: string;
  rating_for_game: number;
  notes?: string | null;
  tags?: Array<string> | null;
  watched_date?: string | null;
  watched_setting?: string | null;
  watched_location?: string | null;
  watched_scope?: string | null;
  classification: Classification;
  created_at: string;
  updated_at: string;
  totalCommentCount: number;
  totalReactionCount: number;
  user: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url?: string | null;
  };
  game: {
    __typename?: 'Game';
    id: string;
    date: string;
    status?: any | null;
    teams?: any | null;
    scores?: any | null;
  };
};

export type FriendshipFragmentFragment = {
  __typename?: 'Friendship';
  id: string;
  status: FriendshipStatus;
  created_at: string;
  initiator: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url?: string | null;
  };
  recipient: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url?: string | null;
  };
};

export type FriendshipCountsFragmentFragment = {
  __typename?: 'Friendship';
  id: string;
  status: FriendshipStatus;
  created_at: string;
  initiator: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url?: string | null;
  };
  recipient: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url?: string | null;
  };
};

export type FriendshipTableFragmentFragment = {
  __typename?: 'Friendship';
  id: string;
  status: FriendshipStatus;
  created_at: string;
  initiator: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url?: string | null;
  };
  recipient: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url?: string | null;
  };
};

export type FriendshipDetailedFragmentFragment = {
  __typename?: 'Friendship';
  id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
  initiator: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email_address?: string | null;
    image_url?: string | null;
    isAdmin: boolean;
  };
  recipient: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email_address?: string | null;
    image_url?: string | null;
    isAdmin: boolean;
  };
};

export type NbaPlayerFragmentFragment = {
  __typename?: 'NBAPlayer';
  id: string;
  first_name: string;
  last_name: string;
  birth?: any | null;
  nba?: any | null;
  height?: any | null;
  weight?: any | null;
  college?: string | null;
  affiliation?: string | null;
  teams?: any | null;
  leagues?: any | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type TeamFragmentFragment = {
  __typename?: 'Team';
  id: string;
  name: string;
  nickname?: string | null;
  code?: string | null;
  city?: string | null;
  logo?: string | null;
  all_star: boolean;
  nba_franchise: boolean;
  conference?: string | null;
  leagues?: any | null;
  created_at: string;
  updated_at: string;
};

export type GetGamesQueryVariables = Exact<{
  filters?: InputMaybe<GameFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetGamesQuery = {
  __typename?: 'Query';
  games: {
    __typename?: 'GameConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'GameEdge';
      cursor: string;
      node: {
        __typename?: 'Game';
        id: string;
        date: string;
        status?: any | null;
        game_id?: string | null;
        teams?: any | null;
        scores?: any | null;
        arena?: any | null;
        periods?: any | null;
        average_rating?: number | null;
        total_ratings?: number | null;
        created_at: string;
        updated_at: string;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetNbaPlayersQueryVariables = Exact<{
  filters?: InputMaybe<NbaPlayerFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetNbaPlayersQuery = {
  __typename?: 'Query';
  nbaPlayers: {
    __typename?: 'NBAPlayerConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'NBAPlayerEdge';
      cursor: string;
      node: {
        __typename?: 'NBAPlayer';
        id: string;
        first_name: string;
        last_name: string;
        birth?: any | null;
        nba?: any | null;
        height?: any | null;
        weight?: any | null;
        college?: string | null;
        affiliation?: string | null;
        teams?: any | null;
        leagues?: any | null;
        image_url?: string | null;
        created_at: string;
        updated_at: string;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetNbaPlayerQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetNbaPlayerQuery = {
  __typename?: 'Query';
  nbaPlayer?: {
    __typename?: 'NBAPlayer';
    id: string;
    first_name: string;
    last_name: string;
    birth?: any | null;
    nba?: any | null;
    height?: any | null;
    weight?: any | null;
    college?: string | null;
    affiliation?: string | null;
    teams?: any | null;
    leagues?: any | null;
    image_url?: string | null;
    created_at: string;
    updated_at: string;
  } | null;
};

export type GetTeamsQueryVariables = Exact<{
  filters?: InputMaybe<TeamFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetTeamsQuery = {
  __typename?: 'Query';
  basketball_teams: {
    __typename?: 'TeamConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'TeamEdge';
      cursor: string;
      node: {
        __typename?: 'Team';
        id: string;
        name: string;
        nickname?: string | null;
        code?: string | null;
        city?: string | null;
        logo?: string | null;
        all_star: boolean;
        nba_franchise: boolean;
        conference?: string | null;
        leagues?: any | null;
        created_at: string;
        updated_at: string;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetTeamQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetTeamQuery = {
  __typename?: 'Query';
  team?: {
    __typename?: 'Team';
    id: string;
    name: string;
    nickname?: string | null;
    code?: string | null;
    city?: string | null;
    logo?: string | null;
    all_star: boolean;
    nba_franchise: boolean;
    conference?: string | null;
    leagues?: any | null;
    created_at: string;
    updated_at: string;
  } | null;
};

export type GetGameQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetGameQuery = {
  __typename?: 'Query';
  game?: {
    __typename?: 'Game';
    id: string;
    date: string;
    status?: any | null;
    game_id?: string | null;
    teams?: any | null;
    scores?: any | null;
    arena?: any | null;
    periods?: any | null;
    average_rating?: number | null;
    total_ratings?: number | null;
    created_at: string;
    updated_at: string;
  } | null;
};

export type GetLiveGamesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;

export type GetLiveGamesQuery = {
  __typename?: 'Query';
  liveGames: {
    __typename?: 'GameConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'GameEdge';
      cursor: string;
      node: {
        __typename?: 'Game';
        id: string;
        date: string;
        status?: any | null;
        game_id?: string | null;
        teams?: any | null;
        scores?: any | null;
        arena?: any | null;
        periods?: any | null;
        average_rating?: number | null;
        total_ratings?: number | null;
        created_at: string;
        updated_at: string;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetGameLogsQueryVariables = Exact<{
  filters?: InputMaybe<GameLogFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetGameLogsQuery = {
  __typename?: 'Query';
  gameLogs: {
    __typename?: 'GameLogConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'GameLogEdge';
      cursor: string;
      node: {
        __typename?: 'GameLog';
        id: string;
        game_id: string;
        rating_for_game: number;
        notes?: string | null;
        tags?: Array<string> | null;
        watched_date?: string | null;
        watched_setting?: string | null;
        watched_location?: string | null;
        watched_scope?: string | null;
        classification: Classification;
        created_at: string;
        updated_at: string;
        totalCommentCount: number;
        totalReactionCount: number;
        user: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
        game: {
          __typename?: 'Game';
          id: string;
          date: string;
          status?: any | null;
          teams?: any | null;
          scores?: any | null;
        };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetGameLogQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetGameLogQuery = {
  __typename?: 'Query';
  gameLog?: {
    __typename?: 'GameLog';
    id: string;
    game_id: string;
    rating_for_game: number;
    notes?: string | null;
    tags?: Array<string> | null;
    watched_date?: string | null;
    watched_setting?: string | null;
    watched_location?: string | null;
    watched_scope?: string | null;
    classification: Classification;
    created_at: string;
    updated_at: string;
    totalCommentCount: number;
    totalReactionCount: number;
    user: {
      __typename?: 'UserSummary';
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      image_url?: string | null;
    };
    game: {
      __typename?: 'Game';
      id: string;
      date: string;
      status?: any | null;
      teams?: any | null;
      scores?: any | null;
    };
  } | null;
};

export type GetUsersQueryVariables = Exact<{
  filters?: InputMaybe<UserFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetUsersQuery = {
  __typename?: 'Query';
  users: Array<{
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email_address?: string | null;
    image_url?: string | null;
    isAdmin: boolean;
  }>;
};

export type GetUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetUserQuery = {
  __typename?: 'Query';
  user?: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email_address?: string | null;
    image_url?: string | null;
    isAdmin: boolean;
  } | null;
};

export type SearchUsersQueryVariables = Exact<{
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;

export type SearchUsersQuery = {
  __typename?: 'Query';
  searchUsers: {
    __typename?: 'UserConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'UserEdge';
      cursor: string;
      node: {
        __typename?: 'UserSummary';
        id: string;
        username: string;
        first_name: string;
        last_name: string;
        email_address?: string | null;
        image_url?: string | null;
        isAdmin: boolean;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetCommentsQueryVariables = Exact<{
  filters?: InputMaybe<CommentFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetCommentsQuery = {
  __typename?: 'Query';
  comments: {
    __typename?: 'CommentConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'CommentEdge';
      cursor: string;
      node: {
        __typename?: 'Comment';
        id: string;
        user_id: string;
        parent_id: string;
        parent_type: ParentType;
        content: string;
        depth: number;
        created_at: string;
        updated_at: string;
        totalChildCommentCount: number;
        totalReactionCount: number;
        user: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetReactionsQueryVariables = Exact<{
  targetId: Scalars['ID']['input'];
  targetType: ParentType;
}>;

export type GetReactionsQuery = {
  __typename?: 'Query';
  reactions: Array<{
    __typename?: 'Reaction';
    id: string;
    emoji: string;
    user_id: string;
    target_id: string;
    target_type: ParentType;
    created_at: string;
    user: {
      __typename?: 'UserSummary';
      id: string;
      username: string;
      first_name: string;
      last_name: string;
    };
  }>;
};

export type SearchUsersAdminQueryVariables = Exact<{
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;

export type SearchUsersAdminQuery = {
  __typename?: 'Query';
  searchUsers: {
    __typename?: 'UserConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'UserEdge';
      cursor: string;
      node: {
        __typename?: 'UserSummary';
        id: string;
        username: string;
        first_name: string;
        last_name: string;
        email_address?: string | null;
        isAdmin: boolean;
        created_at?: string | null;
      };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
      endCursor?: string | null;
    };
  };
};

export type SearchGameLogsAdminQueryVariables = Exact<{
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;

export type SearchGameLogsAdminQuery = {
  __typename?: 'Query';
  searchGameLogs: {
    __typename?: 'GameLogConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'GameLogEdge';
      cursor: string;
      node: {
        __typename?: 'GameLog';
        id: string;
        game_id: string;
        classification: Classification;
        rating_for_game: number;
        watched_setting?: string | null;
        watched_location?: string | null;
        watched_scope?: string | null;
        watched_date?: string | null;
        created_at: string;
        user: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          isAdmin: boolean;
        };
      };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
      endCursor?: string | null;
    };
  };
};

export type GetFriendsGameLogsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetFriendsGameLogsQuery = {
  __typename?: 'Query';
  friendsGameLogs: {
    __typename?: 'GameLogConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'GameLogEdge';
      cursor: string;
      node: {
        __typename?: 'GameLog';
        id: string;
        game_id: string;
        rating_for_game: number;
        notes?: string | null;
        tags?: Array<string> | null;
        watched_date?: string | null;
        watched_setting?: string | null;
        watched_location?: string | null;
        watched_scope?: string | null;
        classification: Classification;
        created_at: string;
        updated_at: string;
        totalCommentCount: number;
        totalReactionCount: number;
        user: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
        game: {
          __typename?: 'Game';
          id: string;
          date: string;
          status?: any | null;
          teams?: any | null;
          scores?: any | null;
        };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GameLogTableFragmentFragment = {
  __typename?: 'GameLog';
  id: string;
  notes?: string | null;
  rating_for_game: number;
  classification: Classification;
  totalCommentCount: number;
  totalReactionCount: number;
  user: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url?: string | null;
  };
  game: { __typename?: 'Game'; id: string; date: string; teams?: any | null };
};

export type GameLogCountsFragmentFragment = {
  __typename?: 'GameLog';
  id: string;
  totalCommentCount: number;
  totalReactionCount: number;
};

export type GameLogDetailedFragmentFragment = {
  __typename?: 'GameLog';
  id: string;
  game_id: string;
  rating_for_game: number;
  notes?: string | null;
  tags?: Array<string> | null;
  watched_date?: string | null;
  watched_setting?: string | null;
  watched_location?: string | null;
  watched_scope?: string | null;
  classification: Classification;
  created_at: string;
  updated_at: string;
  totalCommentCount: number;
  totalReactionCount: number;
  user: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url?: string | null;
  };
  game: {
    __typename?: 'Game';
    id: string;
    date: string;
    status?: any | null;
    teams?: any | null;
    scores?: any | null;
    arena?: any | null;
    periods?: any | null;
    average_rating?: number | null;
    total_ratings?: number | null;
  };
  comments: {
    __typename?: 'CommentConnection';
    edges: Array<{
      __typename?: 'CommentEdge';
      node: {
        __typename?: 'Comment';
        id: string;
        content: string;
        created_at: string;
        user: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
      };
    }>;
  };
  reactions: Array<{
    __typename?: 'Reaction';
    id: string;
    emoji: string;
    created_at: string;
    user: {
      __typename?: 'UserSummary';
      id: string;
      username: string;
      first_name: string;
      last_name: string;
    };
  }>;
};

export type CommentCountsFragmentFragment = {
  __typename?: 'Comment';
  id: string;
  totalChildCommentCount: number;
  totalReactionCount: number;
};

export type CommentDetailedFragmentFragment = {
  __typename?: 'Comment';
  id: string;
  user_id: string;
  parent_id: string;
  parent_type: ParentType;
  content: string;
  depth: number;
  created_at: string;
  updated_at: string;
  totalChildCommentCount: number;
  totalReactionCount: number;
  user: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url?: string | null;
  };
  childComments: {
    __typename?: 'CommentConnection';
    edges: Array<{
      __typename?: 'CommentEdge';
      node: {
        __typename?: 'Comment';
        id: string;
        content: string;
        created_at: string;
        user: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
      };
    }>;
  };
  reactions: Array<{
    __typename?: 'Reaction';
    id: string;
    emoji: string;
    created_at: string;
    user: {
      __typename?: 'UserSummary';
      id: string;
      username: string;
      first_name: string;
      last_name: string;
    };
  }>;
};

export type PublicCommentCountsFragmentFragment = {
  __typename?: 'PublicComment';
  id: string;
  totalChildCommentCount: number;
  totalReactionCount: number;
};

export type PublicCommentDetailedFragmentFragment = {
  __typename?: 'PublicComment';
  id: string;
  content: string;
  user_id?: string | null;
  anonymous_name?: string | null;
  anonymous_email?: string | null;
  parent_id: string;
  parent_type: ParentType;
  depth: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  totalChildCommentCount: number;
  totalReactionCount: number;
  user?: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url?: string | null;
  } | null;
  childComments: {
    __typename?: 'PublicCommentConnection';
    edges: Array<{
      __typename?: 'PublicCommentEdge';
      node: {
        __typename?: 'PublicComment';
        id: string;
        content: string;
        created_at: string;
        user?: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        } | null;
      };
    }>;
  };
  reactions: Array<{
    __typename?: 'PublicReaction';
    id: string;
    emoji: string;
    user_id?: string | null;
    anonymous_name?: string | null;
    anonymous_email?: string | null;
    target_id: string;
    target_type: ParentType;
    is_approved: boolean;
    created_at: string;
    user?: {
      __typename?: 'UserSummary';
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      image_url?: string | null;
    } | null;
  }>;
};

export type GameCountsFragmentFragment = {
  __typename?: 'Game';
  id: string;
  totalPublicCommentCount: number;
  totalPublicReactionCount: number;
};

export type PublicReactionFragmentFragment = {
  __typename?: 'PublicReaction';
  id: string;
  emoji: string;
  user_id?: string | null;
  anonymous_name?: string | null;
  anonymous_email?: string | null;
  target_id: string;
  target_type: ParentType;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  user?: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url?: string | null;
  } | null;
};

export type GameDetailedFragmentFragment = {
  __typename?: 'Game';
  id: string;
  date: string;
  status?: any | null;
  game_id?: string | null;
  teams?: any | null;
  scores?: any | null;
  arena?: any | null;
  periods?: any | null;
  average_rating?: number | null;
  total_ratings?: number | null;
  created_at: string;
  updated_at: string;
  totalPublicCommentCount: number;
  totalPublicReactionCount: number;
  publicComments: {
    __typename?: 'PublicCommentConnection';
    edges: Array<{
      __typename?: 'PublicCommentEdge';
      node: {
        __typename?: 'PublicComment';
        id: string;
        content: string;
        anonymous_name?: string | null;
        created_at: string;
        user?: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        } | null;
      };
    }>;
  };
  publicReactions: Array<{
    __typename?: 'PublicReaction';
    id: string;
    emoji: string;
    anonymous_name?: string | null;
    created_at: string;
    user?: {
      __typename?: 'UserSummary';
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      image_url?: string | null;
    } | null;
  }>;
};

export type GetFriendsGameLogsTableQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetFriendsGameLogsTableQuery = {
  __typename?: 'Query';
  friendsGameLogs: {
    __typename?: 'GameLogConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'GameLogEdge';
      node: {
        __typename?: 'GameLog';
        id: string;
        notes?: string | null;
        rating_for_game: number;
        classification: Classification;
        totalCommentCount: number;
        totalReactionCount: number;
        user: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
        game: { __typename?: 'Game'; id: string; date: string; teams?: any | null };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; hasPreviousPage: boolean };
  };
};

export type GetGameLogsTableQueryVariables = Exact<{
  filters?: InputMaybe<GameLogFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetGameLogsTableQuery = {
  __typename?: 'Query';
  gameLogs: {
    __typename?: 'GameLogConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'GameLogEdge';
      node: {
        __typename?: 'GameLog';
        id: string;
        notes?: string | null;
        rating_for_game: number;
        classification: Classification;
        totalCommentCount: number;
        totalReactionCount: number;
        user: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
        game: { __typename?: 'Game'; id: string; date: string; teams?: any | null };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; hasPreviousPage: boolean };
  };
};

export type GetFriendsGameLogsCountsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetFriendsGameLogsCountsQuery = {
  __typename?: 'Query';
  friendsGameLogs: {
    __typename?: 'GameLogConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'GameLogEdge';
      cursor: string;
      node: {
        __typename?: 'GameLog';
        id: string;
        totalCommentCount: number;
        totalReactionCount: number;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; hasPreviousPage: boolean };
  };
};

export type GetGameLogsCountsQueryVariables = Exact<{
  filters?: InputMaybe<GameLogFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetGameLogsCountsQuery = {
  __typename?: 'Query';
  gameLogs: {
    __typename?: 'GameLogConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'GameLogEdge';
      cursor: string;
      node: {
        __typename?: 'GameLog';
        id: string;
        totalCommentCount: number;
        totalReactionCount: number;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; hasPreviousPage: boolean };
  };
};

export type GetLandingPageTrendingContentQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetLandingPageTrendingContentQuery = {
  __typename?: 'Query';
  gameLogs: {
    __typename?: 'GameLogConnection';
    edges: Array<{
      __typename?: 'GameLogEdge';
      node: {
        __typename?: 'GameLog';
        id: string;
        totalCommentCount: number;
        totalReactionCount: number;
        user: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
        game: {
          __typename?: 'Game';
          id: string;
          date: string;
          teams?: any | null;
          scores?: any | null;
        };
      };
    }>;
  };
};

export type GetLandingPageLatestGamesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetLandingPageLatestGamesQuery = {
  __typename?: 'Query';
  games: {
    __typename?: 'GameConnection';
    edges: Array<{
      __typename?: 'GameEdge';
      node: {
        __typename?: 'Game';
        date: string;
        status?: any | null;
        teams?: any | null;
        scores?: any | null;
        arena?: any | null;
        id: string;
        totalPublicCommentCount: number;
        totalPublicReactionCount: number;
      };
    }>;
  };
};

export type GetLandingPagePopularGamesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetLandingPagePopularGamesQuery = {
  __typename?: 'Query';
  games: {
    __typename?: 'GameConnection';
    edges: Array<{
      __typename?: 'GameEdge';
      node: {
        __typename?: 'Game';
        date: string;
        status?: any | null;
        teams?: any | null;
        scores?: any | null;
        average_rating?: number | null;
        total_ratings?: number | null;
        id: string;
        totalPublicCommentCount: number;
        totalPublicReactionCount: number;
      };
    }>;
  };
};

export type GetNbaHubCountsQueryVariables = Exact<{ [key: string]: never }>;

export type GetNbaHubCountsQuery = {
  __typename?: 'Query';
  games: { __typename?: 'GameConnection'; totalCount: number };
  teams: { __typename?: 'TeamConnection'; totalCount: number };
  players: { __typename?: 'NBAPlayerConnection'; totalCount: number };
  liveGames: { __typename?: 'GameConnection'; totalCount: number };
};

export type GetGameLogCommentsCountsQueryVariables = Exact<{
  gameLogId: Scalars['ID']['input'];
}>;

export type GetGameLogCommentsCountsQuery = {
  __typename?: 'Query';
  gameLog?: {
    __typename?: 'GameLog';
    id: string;
    totalCommentCount: number;
    totalReactionCount: number;
  } | null;
};

export type GetGameLogCommentsWithCountsQueryVariables = Exact<{
  gameLogId: Scalars['ID']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetGameLogCommentsWithCountsQuery = {
  __typename?: 'Query';
  gameLog?: {
    __typename?: 'GameLog';
    id: string;
    totalCommentCount: number;
    totalReactionCount: number;
  } | null;
  comments: {
    __typename?: 'CommentConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'CommentEdge';
      cursor: string;
      node: {
        __typename?: 'Comment';
        content: string;
        created_at: string;
        updated_at: string;
        id: string;
        totalChildCommentCount: number;
        totalReactionCount: number;
        user: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetGameLogCommentsDetailedQueryVariables = Exact<{
  gameLogId: Scalars['ID']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetGameLogCommentsDetailedQuery = {
  __typename?: 'Query';
  gameLog?: {
    __typename?: 'GameLog';
    id: string;
    totalCommentCount: number;
    totalReactionCount: number;
  } | null;
  comments: {
    __typename?: 'CommentConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'CommentEdge';
      cursor: string;
      node: {
        __typename?: 'Comment';
        id: string;
        user_id: string;
        parent_id: string;
        parent_type: ParentType;
        content: string;
        depth: number;
        created_at: string;
        updated_at: string;
        totalChildCommentCount: number;
        totalReactionCount: number;
        user: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
        childComments: {
          __typename?: 'CommentConnection';
          edges: Array<{
            __typename?: 'CommentEdge';
            node: {
              __typename?: 'Comment';
              id: string;
              content: string;
              created_at: string;
              user: {
                __typename?: 'UserSummary';
                id: string;
                username: string;
                first_name: string;
                last_name: string;
                image_url?: string | null;
              };
            };
          }>;
        };
        reactions: Array<{
          __typename?: 'Reaction';
          id: string;
          emoji: string;
          created_at: string;
          user: {
            __typename?: 'UserSummary';
            id: string;
            username: string;
            first_name: string;
            last_name: string;
          };
        }>;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetCommentRepliesWithCountsQueryVariables = Exact<{
  commentId: Scalars['ID']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetCommentRepliesWithCountsQuery = {
  __typename?: 'Query';
  comments: {
    __typename?: 'CommentConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'CommentEdge';
      cursor: string;
      node: {
        __typename?: 'Comment';
        content: string;
        created_at: string;
        updated_at: string;
        id: string;
        totalChildCommentCount: number;
        totalReactionCount: number;
        user: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetCommentRepliesDetailedQueryVariables = Exact<{
  commentId: Scalars['ID']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetCommentRepliesDetailedQuery = {
  __typename?: 'Query';
  comments: {
    __typename?: 'CommentConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'CommentEdge';
      cursor: string;
      node: {
        __typename?: 'Comment';
        id: string;
        user_id: string;
        parent_id: string;
        parent_type: ParentType;
        content: string;
        depth: number;
        created_at: string;
        updated_at: string;
        totalChildCommentCount: number;
        totalReactionCount: number;
        user: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
        childComments: {
          __typename?: 'CommentConnection';
          edges: Array<{
            __typename?: 'CommentEdge';
            node: {
              __typename?: 'Comment';
              id: string;
              content: string;
              created_at: string;
              user: {
                __typename?: 'UserSummary';
                id: string;
                username: string;
                first_name: string;
                last_name: string;
                image_url?: string | null;
              };
            };
          }>;
        };
        reactions: Array<{
          __typename?: 'Reaction';
          id: string;
          emoji: string;
          created_at: string;
          user: {
            __typename?: 'UserSummary';
            id: string;
            username: string;
            first_name: string;
            last_name: string;
          };
        }>;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetGameLogReactionsQueryVariables = Exact<{
  gameLogId: Scalars['ID']['input'];
}>;

export type GetGameLogReactionsQuery = {
  __typename?: 'Query';
  reactions: Array<{
    __typename?: 'Reaction';
    id: string;
    emoji: string;
    user_id: string;
    target_id: string;
    target_type: ParentType;
    created_at: string;
    user: {
      __typename?: 'UserSummary';
      id: string;
      username: string;
      first_name: string;
      last_name: string;
    };
  }>;
};

export type GetCommentReactionsQueryVariables = Exact<{
  commentId: Scalars['ID']['input'];
}>;

export type GetCommentReactionsQuery = {
  __typename?: 'Query';
  reactions: Array<{
    __typename?: 'Reaction';
    id: string;
    emoji: string;
    user_id: string;
    target_id: string;
    target_type: ParentType;
    created_at: string;
    user: {
      __typename?: 'UserSummary';
      id: string;
      username: string;
      first_name: string;
      last_name: string;
    };
  }>;
};

export type GetPublicCommentsCountsQueryVariables = Exact<{
  gameId: Scalars['ID']['input'];
}>;

export type GetPublicCommentsCountsQuery = {
  __typename?: 'Query';
  game?: {
    __typename?: 'Game';
    id: string;
    totalPublicCommentCount: number;
    totalPublicReactionCount: number;
  } | null;
};

export type GetPublicCommentsWithCountsQueryVariables = Exact<{
  gameId: Scalars['ID']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetPublicCommentsWithCountsQuery = {
  __typename?: 'Query';
  game?: {
    __typename?: 'Game';
    id: string;
    totalPublicCommentCount: number;
    totalPublicReactionCount: number;
  } | null;
  publicComments: {
    __typename?: 'PublicCommentConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'PublicCommentEdge';
      cursor: string;
      node: {
        __typename?: 'PublicComment';
        content: string;
        created_at: string;
        updated_at: string;
        id: string;
        totalChildCommentCount: number;
        totalReactionCount: number;
        user?: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        } | null;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetPublicCommentsDetailedQueryVariables = Exact<{
  gameId: Scalars['ID']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetPublicCommentsDetailedQuery = {
  __typename?: 'Query';
  game?: {
    __typename?: 'Game';
    id: string;
    totalPublicCommentCount: number;
    totalPublicReactionCount: number;
  } | null;
  publicComments: {
    __typename?: 'PublicCommentConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'PublicCommentEdge';
      cursor: string;
      node: {
        __typename?: 'PublicComment';
        id: string;
        content: string;
        user_id?: string | null;
        anonymous_name?: string | null;
        anonymous_email?: string | null;
        parent_id: string;
        parent_type: ParentType;
        depth: number;
        is_approved: boolean;
        created_at: string;
        updated_at: string;
        deleted_at?: string | null;
        totalChildCommentCount: number;
        totalReactionCount: number;
        user?: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        } | null;
        childComments: {
          __typename?: 'PublicCommentConnection';
          edges: Array<{
            __typename?: 'PublicCommentEdge';
            node: {
              __typename?: 'PublicComment';
              id: string;
              content: string;
              created_at: string;
              user?: {
                __typename?: 'UserSummary';
                id: string;
                username: string;
                first_name: string;
                last_name: string;
                image_url?: string | null;
              } | null;
            };
          }>;
        };
        reactions: Array<{
          __typename?: 'PublicReaction';
          id: string;
          emoji: string;
          user_id?: string | null;
          anonymous_name?: string | null;
          anonymous_email?: string | null;
          target_id: string;
          target_type: ParentType;
          is_approved: boolean;
          created_at: string;
          user?: {
            __typename?: 'UserSummary';
            id: string;
            username: string;
            first_name: string;
            last_name: string;
            image_url?: string | null;
          } | null;
        }>;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetPublicCommentRepliesWithCountsQueryVariables = Exact<{
  commentId: Scalars['ID']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetPublicCommentRepliesWithCountsQuery = {
  __typename?: 'Query';
  publicComments: {
    __typename?: 'PublicCommentConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'PublicCommentEdge';
      cursor: string;
      node: {
        __typename?: 'PublicComment';
        content: string;
        created_at: string;
        updated_at: string;
        id: string;
        totalChildCommentCount: number;
        totalReactionCount: number;
        user?: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        } | null;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetPublicCommentRepliesDetailedQueryVariables = Exact<{
  commentId: Scalars['ID']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetPublicCommentRepliesDetailedQuery = {
  __typename?: 'Query';
  publicComments: {
    __typename?: 'PublicCommentConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'PublicCommentEdge';
      cursor: string;
      node: {
        __typename?: 'PublicComment';
        id: string;
        content: string;
        user_id?: string | null;
        anonymous_name?: string | null;
        anonymous_email?: string | null;
        parent_id: string;
        parent_type: ParentType;
        depth: number;
        is_approved: boolean;
        created_at: string;
        updated_at: string;
        deleted_at?: string | null;
        totalChildCommentCount: number;
        totalReactionCount: number;
        user?: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        } | null;
        childComments: {
          __typename?: 'PublicCommentConnection';
          edges: Array<{
            __typename?: 'PublicCommentEdge';
            node: {
              __typename?: 'PublicComment';
              id: string;
              content: string;
              created_at: string;
              user?: {
                __typename?: 'UserSummary';
                id: string;
                username: string;
                first_name: string;
                last_name: string;
                image_url?: string | null;
              } | null;
            };
          }>;
        };
        reactions: Array<{
          __typename?: 'PublicReaction';
          id: string;
          emoji: string;
          user_id?: string | null;
          anonymous_name?: string | null;
          anonymous_email?: string | null;
          target_id: string;
          target_type: ParentType;
          is_approved: boolean;
          created_at: string;
          user?: {
            __typename?: 'UserSummary';
            id: string;
            username: string;
            first_name: string;
            last_name: string;
            image_url?: string | null;
          } | null;
        }>;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetPublicReactionsQueryVariables = Exact<{
  targetId: Scalars['ID']['input'];
  targetType: ParentType;
}>;

export type GetPublicReactionsQuery = {
  __typename?: 'Query';
  publicReactions: Array<{
    __typename?: 'PublicReaction';
    id: string;
    emoji: string;
    user_id?: string | null;
    anonymous_name?: string | null;
    anonymous_email?: string | null;
    target_id: string;
    target_type: ParentType;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    user?: {
      __typename?: 'UserSummary';
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      image_url?: string | null;
    } | null;
  }>;
};

export type GetCommentQueryVariables = Exact<{
  commentId: Scalars['ID']['input'];
  repliesPagination?: InputMaybe<PaginationInput>;
}>;

export type GetCommentQuery = {
  __typename?: 'Query';
  comments: {
    __typename?: 'CommentConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'CommentEdge';
      cursor: string;
      node: {
        __typename?: 'Comment';
        id: string;
        user_id: string;
        parent_id: string;
        parent_type: ParentType;
        content: string;
        depth: number;
        created_at: string;
        updated_at: string;
        totalChildCommentCount: number;
        totalReactionCount: number;
        user: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
        childComments: {
          __typename?: 'CommentConnection';
          edges: Array<{
            __typename?: 'CommentEdge';
            node: {
              __typename?: 'Comment';
              id: string;
              content: string;
              created_at: string;
              user: {
                __typename?: 'UserSummary';
                id: string;
                username: string;
                first_name: string;
                last_name: string;
                image_url?: string | null;
              };
            };
          }>;
        };
        reactions: Array<{
          __typename?: 'Reaction';
          id: string;
          emoji: string;
          created_at: string;
          user: {
            __typename?: 'UserSummary';
            id: string;
            username: string;
            first_name: string;
            last_name: string;
          };
        }>;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
  reactions: Array<{
    __typename?: 'Reaction';
    id: string;
    emoji: string;
    user_id: string;
    target_id: string;
    target_type: ParentType;
    created_at: string;
    user: {
      __typename?: 'UserSummary';
      id: string;
      username: string;
      first_name: string;
      last_name: string;
    };
  }>;
};

export type GetCommentWithCountsQueryVariables = Exact<{
  commentId: Scalars['ID']['input'];
  repliesPagination?: InputMaybe<PaginationInput>;
}>;

export type GetCommentWithCountsQuery = {
  __typename?: 'Query';
  comments: {
    __typename?: 'CommentConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'CommentEdge';
      cursor: string;
      node: {
        __typename?: 'Comment';
        content: string;
        created_at: string;
        updated_at: string;
        id: string;
        totalChildCommentCount: number;
        totalReactionCount: number;
        user: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
  reactions: Array<{
    __typename?: 'Reaction';
    id: string;
    emoji: string;
    user_id: string;
    target_id: string;
    target_type: ParentType;
    created_at: string;
    user: {
      __typename?: 'UserSummary';
      id: string;
      username: string;
      first_name: string;
      last_name: string;
    };
  }>;
};

export type GetPublicCommentQueryVariables = Exact<{
  commentId: Scalars['ID']['input'];
  repliesPagination?: InputMaybe<PaginationInput>;
}>;

export type GetPublicCommentQuery = {
  __typename?: 'Query';
  publicComments: {
    __typename?: 'PublicCommentConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'PublicCommentEdge';
      cursor: string;
      node: {
        __typename?: 'PublicComment';
        id: string;
        content: string;
        user_id?: string | null;
        anonymous_name?: string | null;
        anonymous_email?: string | null;
        parent_id: string;
        parent_type: ParentType;
        depth: number;
        is_approved: boolean;
        created_at: string;
        updated_at: string;
        deleted_at?: string | null;
        totalChildCommentCount: number;
        totalReactionCount: number;
        user?: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        } | null;
        childComments: {
          __typename?: 'PublicCommentConnection';
          edges: Array<{
            __typename?: 'PublicCommentEdge';
            node: {
              __typename?: 'PublicComment';
              id: string;
              content: string;
              created_at: string;
              user?: {
                __typename?: 'UserSummary';
                id: string;
                username: string;
                first_name: string;
                last_name: string;
                image_url?: string | null;
              } | null;
            };
          }>;
        };
        reactions: Array<{
          __typename?: 'PublicReaction';
          id: string;
          emoji: string;
          user_id?: string | null;
          anonymous_name?: string | null;
          anonymous_email?: string | null;
          target_id: string;
          target_type: ParentType;
          is_approved: boolean;
          created_at: string;
          user?: {
            __typename?: 'UserSummary';
            id: string;
            username: string;
            first_name: string;
            last_name: string;
            image_url?: string | null;
          } | null;
        }>;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
  publicReactions: Array<{
    __typename?: 'PublicReaction';
    id: string;
    emoji: string;
    user_id?: string | null;
    anonymous_name?: string | null;
    anonymous_email?: string | null;
    target_id: string;
    target_type: ParentType;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    user?: {
      __typename?: 'UserSummary';
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      image_url?: string | null;
    } | null;
  }>;
};

export type GetPublicCommentWithCountsQueryVariables = Exact<{
  commentId: Scalars['ID']['input'];
  repliesPagination?: InputMaybe<PaginationInput>;
}>;

export type GetPublicCommentWithCountsQuery = {
  __typename?: 'Query';
  publicComments: {
    __typename?: 'PublicCommentConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'PublicCommentEdge';
      cursor: string;
      node: {
        __typename?: 'PublicComment';
        content: string;
        created_at: string;
        updated_at: string;
        id: string;
        totalChildCommentCount: number;
        totalReactionCount: number;
        user?: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        } | null;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
  publicReactions: Array<{
    __typename?: 'PublicReaction';
    id: string;
    emoji: string;
    user_id?: string | null;
    anonymous_name?: string | null;
    anonymous_email?: string | null;
    target_id: string;
    target_type: ParentType;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    user?: {
      __typename?: 'UserSummary';
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      image_url?: string | null;
    } | null;
  }>;
};

export type GetUserFriendshipsQueryVariables = Exact<{
  filters?: InputMaybe<FriendshipFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetUserFriendshipsQuery = {
  __typename?: 'Query';
  userFriendships: {
    __typename?: 'FriendshipConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'FriendshipEdge';
      cursor: string;
      node: {
        __typename?: 'Friendship';
        id: string;
        status: FriendshipStatus;
        created_at: string;
        initiator: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
        recipient: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetFriendshipRequestsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetFriendshipRequestsQuery = {
  __typename?: 'Query';
  friendshipRequests: {
    __typename?: 'FriendshipConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'FriendshipEdge';
      cursor: string;
      node: {
        __typename?: 'Friendship';
        id: string;
        status: FriendshipStatus;
        created_at: string;
        initiator: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
        recipient: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetFriendshipStatusQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;

export type GetFriendshipStatusQuery = {
  __typename?: 'Query';
  friendshipStatus: {
    __typename?: 'FriendshipStatusResponse';
    status?: FriendshipStatus | null;
    friendshipId?: string | null;
    isInitiator?: boolean | null;
  };
};

export type GetFriendshipsCountsQueryVariables = Exact<{
  filters?: InputMaybe<FriendshipFilters>;
}>;

export type GetFriendshipsCountsQuery = {
  __typename?: 'Query';
  userFriendships: { __typename?: 'FriendshipConnection'; totalCount: number };
};

export type GetFriendshipsWithCountsQueryVariables = Exact<{
  filters?: InputMaybe<FriendshipFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetFriendshipsWithCountsQuery = {
  __typename?: 'Query';
  userFriendships: {
    __typename?: 'FriendshipConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'FriendshipEdge';
      cursor: string;
      node: {
        __typename?: 'Friendship';
        id: string;
        status: FriendshipStatus;
        created_at: string;
        initiator: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
        recipient: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetFriendshipsDetailedQueryVariables = Exact<{
  filters?: InputMaybe<FriendshipFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetFriendshipsDetailedQuery = {
  __typename?: 'Query';
  userFriendships: {
    __typename?: 'FriendshipConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'FriendshipEdge';
      cursor: string;
      node: {
        __typename?: 'Friendship';
        id: string;
        status: FriendshipStatus;
        created_at: string;
        updated_at: string;
        initiator: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          email_address?: string | null;
          image_url?: string | null;
          isAdmin: boolean;
        };
        recipient: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          email_address?: string | null;
          image_url?: string | null;
          isAdmin: boolean;
        };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetFriendshipRequestsCountsQueryVariables = Exact<{ [key: string]: never }>;

export type GetFriendshipRequestsCountsQuery = {
  __typename?: 'Query';
  friendshipRequests: { __typename?: 'FriendshipConnection'; totalCount: number };
};

export type GetFriendshipRequestsWithCountsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetFriendshipRequestsWithCountsQuery = {
  __typename?: 'Query';
  friendshipRequests: {
    __typename?: 'FriendshipConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'FriendshipEdge';
      cursor: string;
      node: {
        __typename?: 'Friendship';
        id: string;
        status: FriendshipStatus;
        created_at: string;
        initiator: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
        recipient: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetFriendshipRequestsDetailedQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetFriendshipRequestsDetailedQuery = {
  __typename?: 'Query';
  friendshipRequests: {
    __typename?: 'FriendshipConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'FriendshipEdge';
      cursor: string;
      node: {
        __typename?: 'Friendship';
        id: string;
        status: FriendshipStatus;
        created_at: string;
        updated_at: string;
        initiator: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          email_address?: string | null;
          image_url?: string | null;
          isAdmin: boolean;
        };
        recipient: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          email_address?: string | null;
          image_url?: string | null;
          isAdmin: boolean;
        };
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type GetUserSearchSimpleQueryVariables = Exact<{
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetUserSearchSimpleQuery = {
  __typename?: 'Query';
  searchUsers: {
    __typename?: 'UserConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'UserEdge';
      cursor: string;
      node: {
        __typename?: 'UserSummary';
        id: string;
        username: string;
        first_name: string;
        last_name: string;
        email_address?: string | null;
        image_url?: string | null;
        isAdmin: boolean;
      };
    }>;
    pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: string | null };
  };
};

export type NotificationFragmentFragment = {
  __typename?: 'Notification';
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  target_id?: string | null;
  target_type?: string | null;
  resolved: boolean;
  read: boolean;
  created_at: string;
};

export type PublicCommentFragmentFragment = {
  __typename?: 'PublicComment';
  id: string;
  content: string;
  user_id?: string | null;
  anonymous_name?: string | null;
  anonymous_email?: string | null;
  parent_id: string;
  parent_type: ParentType;
  depth: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  totalChildCommentCount: number;
  totalReactionCount: number;
  user?: {
    __typename?: 'UserSummary';
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url?: string | null;
  } | null;
};

export type GetUserNotificationsQueryVariables = Exact<{
  filters?: InputMaybe<NotificationFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetUserNotificationsQuery = {
  __typename?: 'Query';
  userNotifications: {
    __typename?: 'NotificationConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'NotificationEdge';
      cursor: string;
      node: {
        __typename?: 'Notification';
        id: string;
        user_id: string;
        type: string;
        title: string;
        message: string;
        target_id?: string | null;
        target_type?: string | null;
        resolved: boolean;
        read: boolean;
        created_at: string;
      };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
      endCursor?: string | null;
    };
  };
};

export type GetUnreadNotificationsCountQueryVariables = Exact<{ [key: string]: never }>;

export type GetUnreadNotificationsCountQuery = {
  __typename?: 'Query';
  unreadNotificationsCount: number;
};

export type GetPublicCommentsQueryVariables = Exact<{
  filters?: InputMaybe<PublicCommentFilters>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetPublicCommentsQuery = {
  __typename?: 'Query';
  publicComments: {
    __typename?: 'PublicCommentConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'PublicCommentEdge';
      cursor: string;
      node: {
        __typename?: 'PublicComment';
        id: string;
        content: string;
        user_id?: string | null;
        anonymous_name?: string | null;
        anonymous_email?: string | null;
        parent_id: string;
        parent_type: ParentType;
        depth: number;
        is_approved: boolean;
        created_at: string;
        updated_at: string;
        deleted_at?: string | null;
        totalChildCommentCount: number;
        totalReactionCount: number;
        user?: {
          __typename?: 'UserSummary';
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          image_url?: string | null;
        } | null;
      };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
      endCursor?: string | null;
    };
  };
};

export const GameFragmentFragmentDoc = gql`
  fragment GameFragment on Game {
    id
    date
    status
    game_id
    teams
    scores
    arena
    periods
    average_rating
    total_ratings
    created_at
    updated_at
  }
`;
export const BasicUserFragmentFragmentDoc = gql`
  fragment BasicUserFragment on DBUser {
    id
    username
    first_name
    last_name
    email_address
    image_url
    last_active_at
    created_at
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
    isAdmin
  }
`;
export const ReactionFragmentFragmentDoc = gql`
  fragment ReactionFragment on Reaction {
    id
    emoji
    user_id
    target_id
    target_type
    created_at
    user {
      id
      username
      first_name
      last_name
    }
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
      id
      username
      first_name
      last_name
      image_url
    }
    totalChildCommentCount
    totalReactionCount
  }
`;
export const GameLogFragmentFragmentDoc = gql`
  fragment GameLogFragment on GameLog {
    id
    game_id
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
    totalCommentCount
    totalReactionCount
    user {
      id
      username
      first_name
      last_name
      image_url
    }
    game {
      id
      date
      status
      teams
      scores
    }
  }
`;
export const FriendshipFragmentFragmentDoc = gql`
  fragment FriendshipFragment on Friendship {
    id
    status
    created_at
    initiator {
      id
      username
      first_name
      last_name
      image_url
    }
    recipient {
      id
      username
      first_name
      last_name
      image_url
    }
  }
`;
export const FriendshipCountsFragmentFragmentDoc = gql`
  fragment FriendshipCountsFragment on Friendship {
    id
    status
    created_at
    initiator {
      id
      username
      first_name
      last_name
      image_url
    }
    recipient {
      id
      username
      first_name
      last_name
      image_url
    }
  }
`;
export const FriendshipTableFragmentFragmentDoc = gql`
  fragment FriendshipTableFragment on Friendship {
    id
    status
    created_at
    initiator {
      id
      username
      first_name
      last_name
      image_url
    }
    recipient {
      id
      username
      first_name
      last_name
      image_url
    }
  }
`;
export const FriendshipDetailedFragmentFragmentDoc = gql`
  fragment FriendshipDetailedFragment on Friendship {
    id
    status
    created_at
    updated_at
    initiator {
      id
      username
      first_name
      last_name
      email_address
      image_url
      isAdmin
    }
    recipient {
      id
      username
      first_name
      last_name
      email_address
      image_url
      isAdmin
    }
  }
`;
export const NbaPlayerFragmentFragmentDoc = gql`
  fragment NBAPlayerFragment on NBAPlayer {
    id
    first_name
    last_name
    birth
    nba
    height
    weight
    college
    affiliation
    teams
    leagues
    image_url
    created_at
    updated_at
  }
`;
export const TeamFragmentFragmentDoc = gql`
  fragment TeamFragment on Team {
    id
    name
    nickname
    code
    city
    logo
    all_star
    nba_franchise
    conference
    leagues
    created_at
    updated_at
  }
`;
export const GameLogTableFragmentFragmentDoc = gql`
  fragment GameLogTableFragment on GameLog {
    id
    notes
    rating_for_game
    classification
    totalCommentCount
    totalReactionCount
    user {
      id
      username
      first_name
      last_name
      image_url
    }
    game {
      id
      date
      teams
    }
  }
`;
export const GameLogCountsFragmentFragmentDoc = gql`
  fragment GameLogCountsFragment on GameLog {
    id
    totalCommentCount
    totalReactionCount
  }
`;
export const GameLogDetailedFragmentFragmentDoc = gql`
  fragment GameLogDetailedFragment on GameLog {
    id
    game_id
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
    totalCommentCount
    totalReactionCount
    user {
      id
      username
      first_name
      last_name
      image_url
    }
    game {
      id
      date
      status
      teams
      scores
      arena
      periods
      average_rating
      total_ratings
    }
    comments {
      edges {
        node {
          id
          content
          user {
            id
            username
            first_name
            last_name
            image_url
          }
          created_at
        }
      }
    }
    reactions {
      id
      emoji
      user {
        id
        username
        first_name
        last_name
      }
      created_at
    }
  }
`;
export const CommentCountsFragmentFragmentDoc = gql`
  fragment CommentCountsFragment on Comment {
    id
    totalChildCommentCount
    totalReactionCount
  }
`;
export const CommentDetailedFragmentFragmentDoc = gql`
  fragment CommentDetailedFragment on Comment {
    id
    user_id
    parent_id
    parent_type
    content
    depth
    created_at
    updated_at
    totalChildCommentCount
    totalReactionCount
    user {
      id
      username
      first_name
      last_name
      image_url
    }
    childComments {
      edges {
        node {
          id
          content
          user {
            id
            username
            first_name
            last_name
            image_url
          }
          created_at
        }
      }
    }
    reactions {
      id
      emoji
      user {
        id
        username
        first_name
        last_name
      }
      created_at
    }
  }
`;
export const PublicCommentCountsFragmentFragmentDoc = gql`
  fragment PublicCommentCountsFragment on PublicComment {
    id
    totalChildCommentCount
    totalReactionCount
  }
`;
export const PublicCommentDetailedFragmentFragmentDoc = gql`
  fragment PublicCommentDetailedFragment on PublicComment {
    id
    content
    user {
      id
      username
      first_name
      last_name
      image_url
    }
    user_id
    anonymous_name
    anonymous_email
    parent_id
    parent_type
    depth
    is_approved
    created_at
    updated_at
    deleted_at
    totalChildCommentCount
    totalReactionCount
    childComments {
      edges {
        node {
          id
          content
          user {
            id
            username
            first_name
            last_name
            image_url
          }
          created_at
        }
      }
    }
    reactions {
      id
      emoji
      user {
        id
        username
        first_name
        last_name
        image_url
      }
      user_id
      anonymous_name
      anonymous_email
      target_id
      target_type
      is_approved
      created_at
    }
  }
`;
export const GameCountsFragmentFragmentDoc = gql`
  fragment GameCountsFragment on Game {
    id
    totalPublicCommentCount
    totalPublicReactionCount
  }
`;
export const PublicReactionFragmentFragmentDoc = gql`
  fragment PublicReactionFragment on PublicReaction {
    id
    emoji
    user {
      id
      username
      first_name
      last_name
      image_url
    }
    user_id
    anonymous_name
    anonymous_email
    target_id
    target_type
    is_approved
    created_at
    updated_at
    deleted_at
  }
`;
export const GameDetailedFragmentFragmentDoc = gql`
  fragment GameDetailedFragment on Game {
    id
    date
    status
    game_id
    teams
    scores
    arena
    periods
    average_rating
    total_ratings
    created_at
    updated_at
    totalPublicCommentCount
    totalPublicReactionCount
    publicComments {
      edges {
        node {
          id
          content
          user {
            id
            username
            first_name
            last_name
            image_url
          }
          anonymous_name
          created_at
        }
      }
    }
    publicReactions {
      id
      emoji
      user {
        id
        username
        first_name
        last_name
        image_url
      }
      anonymous_name
      created_at
    }
  }
`;
export const NotificationFragmentFragmentDoc = gql`
  fragment NotificationFragment on Notification {
    id
    user_id
    type
    title
    message
    target_id
    target_type
    resolved
    read
    created_at
  }
`;
export const PublicCommentFragmentFragmentDoc = gql`
  fragment PublicCommentFragment on PublicComment {
    id
    content
    user {
      id
      username
      first_name
      last_name
      image_url
    }
    user_id
    anonymous_name
    anonymous_email
    parent_id
    parent_type
    depth
    is_approved
    created_at
    updated_at
    deleted_at
    totalChildCommentCount
    totalReactionCount
  }
`;
export const CreateGameDocument = gql`
  mutation CreateGame($input: CreateGameInput!) {
    createGame(input: $input) {
      game {
        id
        date
        status
        game_id
        teams
        scores
        created_at
      }
      errors {
        message
        code
        field
      }
    }
  }
`;
export type CreateGameMutationFn = Apollo.MutationFunction<
  CreateGameMutation,
  CreateGameMutationVariables
>;

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
export function useCreateGameMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateGameMutation, CreateGameMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateGameMutation, CreateGameMutationVariables>(
    CreateGameDocument,
    options
  );
}
export type CreateGameMutationHookResult = ReturnType<typeof useCreateGameMutation>;
export type CreateGameMutationResult = Apollo.MutationResult<CreateGameMutation>;
export type CreateGameMutationOptions = Apollo.BaseMutationOptions<
  CreateGameMutation,
  CreateGameMutationVariables
>;
export const CreateGameLogDocument = gql`
  mutation CreateGameLog($input: CreateGameLogInput!) {
    createGameLog(input: $input) {
      gameLog {
        id
        game_id
        rating_for_game
        notes
        tags
        watched_date
        watched_setting
        watched_location
        watched_scope
        classification
        created_at
        user {
          id
          username
        }
        game {
          id
          date
          teams
        }
      }
      errors {
        message
        code
        field
      }
    }
  }
`;
export type CreateGameLogMutationFn = Apollo.MutationFunction<
  CreateGameLogMutation,
  CreateGameLogMutationVariables
>;

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
export function useCreateGameLogMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateGameLogMutation, CreateGameLogMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateGameLogMutation, CreateGameLogMutationVariables>(
    CreateGameLogDocument,
    options
  );
}
export type CreateGameLogMutationHookResult = ReturnType<typeof useCreateGameLogMutation>;
export type CreateGameLogMutationResult = Apollo.MutationResult<CreateGameLogMutation>;
export type CreateGameLogMutationOptions = Apollo.BaseMutationOptions<
  CreateGameLogMutation,
  CreateGameLogMutationVariables
>;
export const UpdateGameLogDocument = gql`
  mutation UpdateGameLog($id: ID!, $input: UpdateGameLogInput!) {
    updateGameLog(id: $id, input: $input) {
      gameLog {
        id
        rating_for_game
        notes
        tags
        watched_date
        watched_setting
        watched_location
        watched_scope
        classification
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
export type UpdateGameLogMutationFn = Apollo.MutationFunction<
  UpdateGameLogMutation,
  UpdateGameLogMutationVariables
>;

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
export function useUpdateGameLogMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateGameLogMutation, UpdateGameLogMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateGameLogMutation, UpdateGameLogMutationVariables>(
    UpdateGameLogDocument,
    options
  );
}
export type UpdateGameLogMutationHookResult = ReturnType<typeof useUpdateGameLogMutation>;
export type UpdateGameLogMutationResult = Apollo.MutationResult<UpdateGameLogMutation>;
export type UpdateGameLogMutationOptions = Apollo.BaseMutationOptions<
  UpdateGameLogMutation,
  UpdateGameLogMutationVariables
>;
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
export type DeleteGameLogMutationFn = Apollo.MutationFunction<
  DeleteGameLogMutation,
  DeleteGameLogMutationVariables
>;

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
export function useDeleteGameLogMutation(
  baseOptions?: Apollo.MutationHookOptions<DeleteGameLogMutation, DeleteGameLogMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteGameLogMutation, DeleteGameLogMutationVariables>(
    DeleteGameLogDocument,
    options
  );
}
export type DeleteGameLogMutationHookResult = ReturnType<typeof useDeleteGameLogMutation>;
export type DeleteGameLogMutationResult = Apollo.MutationResult<DeleteGameLogMutation>;
export type DeleteGameLogMutationOptions = Apollo.BaseMutationOptions<
  DeleteGameLogMutation,
  DeleteGameLogMutationVariables
>;
export const CreateCommentDocument = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      comment {
        id
        user_id
        parent_id
        parent_type
        content
        depth
        created_at
        user {
          id
          username
          first_name
          last_name
          image_url
        }
      }
      errors {
        message
        code
        field
      }
    }
  }
`;
export type CreateCommentMutationFn = Apollo.MutationFunction<
  CreateCommentMutation,
  CreateCommentMutationVariables
>;

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
export function useCreateCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateCommentMutation, CreateCommentMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateCommentMutation, CreateCommentMutationVariables>(
    CreateCommentDocument,
    options
  );
}
export type CreateCommentMutationHookResult = ReturnType<typeof useCreateCommentMutation>;
export type CreateCommentMutationResult = Apollo.MutationResult<CreateCommentMutation>;
export type CreateCommentMutationOptions = Apollo.BaseMutationOptions<
  CreateCommentMutation,
  CreateCommentMutationVariables
>;
export const UpdateCommentDocument = gql`
  mutation UpdateComment($id: ID!, $input: UpdateCommentInput!) {
    updateComment(id: $id, input: $input) {
      comment {
        id
        content
        updated_at
        user {
          id
          username
        }
      }
      errors {
        message
        code
        field
      }
    }
  }
`;
export type UpdateCommentMutationFn = Apollo.MutationFunction<
  UpdateCommentMutation,
  UpdateCommentMutationVariables
>;

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
export function useUpdateCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateCommentMutation, UpdateCommentMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateCommentMutation, UpdateCommentMutationVariables>(
    UpdateCommentDocument,
    options
  );
}
export type UpdateCommentMutationHookResult = ReturnType<typeof useUpdateCommentMutation>;
export type UpdateCommentMutationResult = Apollo.MutationResult<UpdateCommentMutation>;
export type UpdateCommentMutationOptions = Apollo.BaseMutationOptions<
  UpdateCommentMutation,
  UpdateCommentMutationVariables
>;
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
export type DeleteCommentMutationFn = Apollo.MutationFunction<
  DeleteCommentMutation,
  DeleteCommentMutationVariables
>;

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
export function useDeleteCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<DeleteCommentMutation, DeleteCommentMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteCommentMutation, DeleteCommentMutationVariables>(
    DeleteCommentDocument,
    options
  );
}
export type DeleteCommentMutationHookResult = ReturnType<typeof useDeleteCommentMutation>;
export type DeleteCommentMutationResult = Apollo.MutationResult<DeleteCommentMutation>;
export type DeleteCommentMutationOptions = Apollo.BaseMutationOptions<
  DeleteCommentMutation,
  DeleteCommentMutationVariables
>;
export const CreateReactionDocument = gql`
  mutation CreateReaction($input: CreateReactionInput!) {
    createReaction(input: $input) {
      reaction {
        id
        emoji
        user_id
        target_id
        target_type
        created_at
        user {
          id
          username
          first_name
          last_name
        }
      }
      errors {
        message
        code
        field
      }
    }
  }
`;
export type CreateReactionMutationFn = Apollo.MutationFunction<
  CreateReactionMutation,
  CreateReactionMutationVariables
>;

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
export function useCreateReactionMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateReactionMutation, CreateReactionMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateReactionMutation, CreateReactionMutationVariables>(
    CreateReactionDocument,
    options
  );
}
export type CreateReactionMutationHookResult = ReturnType<typeof useCreateReactionMutation>;
export type CreateReactionMutationResult = Apollo.MutationResult<CreateReactionMutation>;
export type CreateReactionMutationOptions = Apollo.BaseMutationOptions<
  CreateReactionMutation,
  CreateReactionMutationVariables
>;
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
export type DeleteReactionMutationFn = Apollo.MutationFunction<
  DeleteReactionMutation,
  DeleteReactionMutationVariables
>;

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
export function useDeleteReactionMutation(
  baseOptions?: Apollo.MutationHookOptions<DeleteReactionMutation, DeleteReactionMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteReactionMutation, DeleteReactionMutationVariables>(
    DeleteReactionDocument,
    options
  );
}
export type DeleteReactionMutationHookResult = ReturnType<typeof useDeleteReactionMutation>;
export type DeleteReactionMutationResult = Apollo.MutationResult<DeleteReactionMutation>;
export type DeleteReactionMutationOptions = Apollo.BaseMutationOptions<
  DeleteReactionMutation,
  DeleteReactionMutationVariables
>;
export const SendFriendRequestDocument = gql`
  mutation SendFriendRequest($userId: ID!) {
    sendFriendRequest(userId: $userId) {
      friendship {
        id
        status
        created_at
        initiator {
          id
          username
          first_name
          last_name
        }
        recipient {
          id
          username
          first_name
          last_name
        }
      }
      errors {
        message
        code
        field
      }
    }
  }
`;
export type SendFriendRequestMutationFn = Apollo.MutationFunction<
  SendFriendRequestMutation,
  SendFriendRequestMutationVariables
>;

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
export function useSendFriendRequestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SendFriendRequestMutation,
    SendFriendRequestMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SendFriendRequestMutation, SendFriendRequestMutationVariables>(
    SendFriendRequestDocument,
    options
  );
}
export type SendFriendRequestMutationHookResult = ReturnType<typeof useSendFriendRequestMutation>;
export type SendFriendRequestMutationResult = Apollo.MutationResult<SendFriendRequestMutation>;
export type SendFriendRequestMutationOptions = Apollo.BaseMutationOptions<
  SendFriendRequestMutation,
  SendFriendRequestMutationVariables
>;
export const AcceptFriendRequestDocument = gql`
  mutation AcceptFriendRequest($friendshipId: ID!) {
    acceptFriendRequest(friendshipId: $friendshipId) {
      friendship {
        id
        status
        created_at
        initiator {
          id
          username
          first_name
          last_name
        }
        recipient {
          id
          username
          first_name
          last_name
        }
      }
      errors {
        message
        code
        field
      }
    }
  }
`;
export type AcceptFriendRequestMutationFn = Apollo.MutationFunction<
  AcceptFriendRequestMutation,
  AcceptFriendRequestMutationVariables
>;

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
export function useAcceptFriendRequestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AcceptFriendRequestMutation,
    AcceptFriendRequestMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<AcceptFriendRequestMutation, AcceptFriendRequestMutationVariables>(
    AcceptFriendRequestDocument,
    options
  );
}
export type AcceptFriendRequestMutationHookResult = ReturnType<
  typeof useAcceptFriendRequestMutation
>;
export type AcceptFriendRequestMutationResult = Apollo.MutationResult<AcceptFriendRequestMutation>;
export type AcceptFriendRequestMutationOptions = Apollo.BaseMutationOptions<
  AcceptFriendRequestMutation,
  AcceptFriendRequestMutationVariables
>;
export const RejectFriendRequestDocument = gql`
  mutation RejectFriendRequest($friendshipId: ID!) {
    rejectFriendRequest(friendshipId: $friendshipId) {
      friendship {
        id
        status
        created_at
        initiator {
          id
          username
          first_name
          last_name
        }
        recipient {
          id
          username
          first_name
          last_name
        }
      }
      errors {
        message
        code
        field
      }
    }
  }
`;
export type RejectFriendRequestMutationFn = Apollo.MutationFunction<
  RejectFriendRequestMutation,
  RejectFriendRequestMutationVariables
>;

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
export function useRejectFriendRequestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RejectFriendRequestMutation,
    RejectFriendRequestMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<RejectFriendRequestMutation, RejectFriendRequestMutationVariables>(
    RejectFriendRequestDocument,
    options
  );
}
export type RejectFriendRequestMutationHookResult = ReturnType<
  typeof useRejectFriendRequestMutation
>;
export type RejectFriendRequestMutationResult = Apollo.MutationResult<RejectFriendRequestMutation>;
export type RejectFriendRequestMutationOptions = Apollo.BaseMutationOptions<
  RejectFriendRequestMutation,
  RejectFriendRequestMutationVariables
>;
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
export type RemoveFriendMutationFn = Apollo.MutationFunction<
  RemoveFriendMutation,
  RemoveFriendMutationVariables
>;

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
export function useRemoveFriendMutation(
  baseOptions?: Apollo.MutationHookOptions<RemoveFriendMutation, RemoveFriendMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<RemoveFriendMutation, RemoveFriendMutationVariables>(
    RemoveFriendDocument,
    options
  );
}
export type RemoveFriendMutationHookResult = ReturnType<typeof useRemoveFriendMutation>;
export type RemoveFriendMutationResult = Apollo.MutationResult<RemoveFriendMutation>;
export type RemoveFriendMutationOptions = Apollo.BaseMutationOptions<
  RemoveFriendMutation,
  RemoveFriendMutationVariables
>;
export const MarkNotificationAsReadDocument = gql`
  mutation MarkNotificationAsRead($notificationId: ID!) {
    markNotificationAsRead(notificationId: $notificationId) {
      success
      errors {
        message
        code
        field
      }
    }
  }
`;
export type MarkNotificationAsReadMutationFn = Apollo.MutationFunction<
  MarkNotificationAsReadMutation,
  MarkNotificationAsReadMutationVariables
>;

/**
 * __useMarkNotificationAsReadMutation__
 *
 * To run a mutation, you first call `useMarkNotificationAsReadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkNotificationAsReadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markNotificationAsReadMutation, { data, loading, error }] = useMarkNotificationAsReadMutation({
 *   variables: {
 *      notificationId: // value for 'notificationId'
 *   },
 * });
 */
export function useMarkNotificationAsReadMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MarkNotificationAsReadMutation,
    MarkNotificationAsReadMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MarkNotificationAsReadMutation,
    MarkNotificationAsReadMutationVariables
  >(MarkNotificationAsReadDocument, options);
}
export type MarkNotificationAsReadMutationHookResult = ReturnType<
  typeof useMarkNotificationAsReadMutation
>;
export type MarkNotificationAsReadMutationResult =
  Apollo.MutationResult<MarkNotificationAsReadMutation>;
export type MarkNotificationAsReadMutationOptions = Apollo.BaseMutationOptions<
  MarkNotificationAsReadMutation,
  MarkNotificationAsReadMutationVariables
>;
export const MarkAllNotificationsAsReadDocument = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead {
      success
      errors {
        message
        code
        field
      }
    }
  }
`;
export type MarkAllNotificationsAsReadMutationFn = Apollo.MutationFunction<
  MarkAllNotificationsAsReadMutation,
  MarkAllNotificationsAsReadMutationVariables
>;

/**
 * __useMarkAllNotificationsAsReadMutation__
 *
 * To run a mutation, you first call `useMarkAllNotificationsAsReadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkAllNotificationsAsReadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markAllNotificationsAsReadMutation, { data, loading, error }] = useMarkAllNotificationsAsReadMutation({
 *   variables: {
 *   },
 * });
 */
export function useMarkAllNotificationsAsReadMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MarkAllNotificationsAsReadMutation,
    MarkAllNotificationsAsReadMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MarkAllNotificationsAsReadMutation,
    MarkAllNotificationsAsReadMutationVariables
  >(MarkAllNotificationsAsReadDocument, options);
}
export type MarkAllNotificationsAsReadMutationHookResult = ReturnType<
  typeof useMarkAllNotificationsAsReadMutation
>;
export type MarkAllNotificationsAsReadMutationResult =
  Apollo.MutationResult<MarkAllNotificationsAsReadMutation>;
export type MarkAllNotificationsAsReadMutationOptions = Apollo.BaseMutationOptions<
  MarkAllNotificationsAsReadMutation,
  MarkAllNotificationsAsReadMutationVariables
>;
export const CreatePublicCommentDocument = gql`
  mutation CreatePublicComment($input: CreatePublicCommentInput!) {
    createPublicComment(input: $input) {
      comment {
        id
        content
        user {
          id
          username
          first_name
          last_name
          image_url
        }
        user_id
        anonymous_name
        anonymous_email
        parent_id
        parent_type
        depth
        is_approved
        created_at
        updated_at
        totalChildCommentCount
        totalReactionCount
      }
      errors {
        message
        code
        field
      }
    }
  }
`;
export type CreatePublicCommentMutationFn = Apollo.MutationFunction<
  CreatePublicCommentMutation,
  CreatePublicCommentMutationVariables
>;

/**
 * __useCreatePublicCommentMutation__
 *
 * To run a mutation, you first call `useCreatePublicCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePublicCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPublicCommentMutation, { data, loading, error }] = useCreatePublicCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreatePublicCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreatePublicCommentMutation,
    CreatePublicCommentMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreatePublicCommentMutation, CreatePublicCommentMutationVariables>(
    CreatePublicCommentDocument,
    options
  );
}
export type CreatePublicCommentMutationHookResult = ReturnType<
  typeof useCreatePublicCommentMutation
>;
export type CreatePublicCommentMutationResult = Apollo.MutationResult<CreatePublicCommentMutation>;
export type CreatePublicCommentMutationOptions = Apollo.BaseMutationOptions<
  CreatePublicCommentMutation,
  CreatePublicCommentMutationVariables
>;
export const UpdatePublicCommentDocument = gql`
  mutation UpdatePublicComment($id: ID!, $input: UpdatePublicCommentInput!) {
    updatePublicComment(id: $id, input: $input) {
      comment {
        id
        content
        user {
          id
          username
          first_name
          last_name
          image_url
        }
        user_id
        anonymous_name
        anonymous_email
        parent_id
        parent_type
        depth
        is_approved
        created_at
        updated_at
        totalChildCommentCount
        totalReactionCount
      }
      errors {
        message
        code
        field
      }
    }
  }
`;
export type UpdatePublicCommentMutationFn = Apollo.MutationFunction<
  UpdatePublicCommentMutation,
  UpdatePublicCommentMutationVariables
>;

/**
 * __useUpdatePublicCommentMutation__
 *
 * To run a mutation, you first call `useUpdatePublicCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePublicCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePublicCommentMutation, { data, loading, error }] = useUpdatePublicCommentMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdatePublicCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdatePublicCommentMutation,
    UpdatePublicCommentMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdatePublicCommentMutation, UpdatePublicCommentMutationVariables>(
    UpdatePublicCommentDocument,
    options
  );
}
export type UpdatePublicCommentMutationHookResult = ReturnType<
  typeof useUpdatePublicCommentMutation
>;
export type UpdatePublicCommentMutationResult = Apollo.MutationResult<UpdatePublicCommentMutation>;
export type UpdatePublicCommentMutationOptions = Apollo.BaseMutationOptions<
  UpdatePublicCommentMutation,
  UpdatePublicCommentMutationVariables
>;
export const DeletePublicCommentDocument = gql`
  mutation DeletePublicComment($id: ID!) {
    deletePublicComment(id: $id) {
      success
      errors {
        message
        code
        field
      }
    }
  }
`;
export type DeletePublicCommentMutationFn = Apollo.MutationFunction<
  DeletePublicCommentMutation,
  DeletePublicCommentMutationVariables
>;

/**
 * __useDeletePublicCommentMutation__
 *
 * To run a mutation, you first call `useDeletePublicCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePublicCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePublicCommentMutation, { data, loading, error }] = useDeletePublicCommentMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeletePublicCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeletePublicCommentMutation,
    DeletePublicCommentMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeletePublicCommentMutation, DeletePublicCommentMutationVariables>(
    DeletePublicCommentDocument,
    options
  );
}
export type DeletePublicCommentMutationHookResult = ReturnType<
  typeof useDeletePublicCommentMutation
>;
export type DeletePublicCommentMutationResult = Apollo.MutationResult<DeletePublicCommentMutation>;
export type DeletePublicCommentMutationOptions = Apollo.BaseMutationOptions<
  DeletePublicCommentMutation,
  DeletePublicCommentMutationVariables
>;
export const CreatePublicReactionDocument = gql`
  mutation CreatePublicReaction($input: CreatePublicReactionInput!) {
    createPublicReaction(input: $input) {
      reaction {
        id
        emoji
        user {
          id
          username
          first_name
          last_name
          image_url
        }
        user_id
        anonymous_name
        anonymous_email
        target_id
        target_type
        is_approved
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
export type CreatePublicReactionMutationFn = Apollo.MutationFunction<
  CreatePublicReactionMutation,
  CreatePublicReactionMutationVariables
>;

/**
 * __useCreatePublicReactionMutation__
 *
 * To run a mutation, you first call `useCreatePublicReactionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePublicReactionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPublicReactionMutation, { data, loading, error }] = useCreatePublicReactionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreatePublicReactionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreatePublicReactionMutation,
    CreatePublicReactionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreatePublicReactionMutation, CreatePublicReactionMutationVariables>(
    CreatePublicReactionDocument,
    options
  );
}
export type CreatePublicReactionMutationHookResult = ReturnType<
  typeof useCreatePublicReactionMutation
>;
export type CreatePublicReactionMutationResult =
  Apollo.MutationResult<CreatePublicReactionMutation>;
export type CreatePublicReactionMutationOptions = Apollo.BaseMutationOptions<
  CreatePublicReactionMutation,
  CreatePublicReactionMutationVariables
>;
export const DeletePublicReactionDocument = gql`
  mutation DeletePublicReaction($id: ID!) {
    deletePublicReaction(id: $id) {
      success
      errors {
        message
        code
        field
      }
    }
  }
`;
export type DeletePublicReactionMutationFn = Apollo.MutationFunction<
  DeletePublicReactionMutation,
  DeletePublicReactionMutationVariables
>;

/**
 * __useDeletePublicReactionMutation__
 *
 * To run a mutation, you first call `useDeletePublicReactionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePublicReactionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePublicReactionMutation, { data, loading, error }] = useDeletePublicReactionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeletePublicReactionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeletePublicReactionMutation,
    DeletePublicReactionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeletePublicReactionMutation, DeletePublicReactionMutationVariables>(
    DeletePublicReactionDocument,
    options
  );
}
export type DeletePublicReactionMutationHookResult = ReturnType<
  typeof useDeletePublicReactionMutation
>;
export type DeletePublicReactionMutationResult =
  Apollo.MutationResult<DeletePublicReactionMutation>;
export type DeletePublicReactionMutationOptions = Apollo.BaseMutationOptions<
  DeletePublicReactionMutation,
  DeletePublicReactionMutationVariables
>;
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
  ${GameFragmentFragmentDoc}
`;

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
export function useGetGamesQuery(
  baseOptions?: Apollo.QueryHookOptions<GetGamesQuery, GetGamesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetGamesQuery, GetGamesQueryVariables>(GetGamesDocument, options);
}
export function useGetGamesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetGamesQuery, GetGamesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetGamesQuery, GetGamesQueryVariables>(GetGamesDocument, options);
}
export function useGetGamesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetGamesQuery, GetGamesQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetGamesQuery, GetGamesQueryVariables>(GetGamesDocument, options);
}
export type GetGamesQueryHookResult = ReturnType<typeof useGetGamesQuery>;
export type GetGamesLazyQueryHookResult = ReturnType<typeof useGetGamesLazyQuery>;
export type GetGamesSuspenseQueryHookResult = ReturnType<typeof useGetGamesSuspenseQuery>;
export type GetGamesQueryResult = Apollo.QueryResult<GetGamesQuery, GetGamesQueryVariables>;
export const GetNbaPlayersDocument = gql`
  query GetNBAPlayers($filters: NBAPlayerFilters, $pagination: PaginationInput) {
    nbaPlayers(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...NBAPlayerFragment
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
  ${NbaPlayerFragmentFragmentDoc}
`;

/**
 * __useGetNbaPlayersQuery__
 *
 * To run a query within a React component, call `useGetNbaPlayersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNbaPlayersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNbaPlayersQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetNbaPlayersQuery(
  baseOptions?: Apollo.QueryHookOptions<GetNbaPlayersQuery, GetNbaPlayersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetNbaPlayersQuery, GetNbaPlayersQueryVariables>(
    GetNbaPlayersDocument,
    options
  );
}
export function useGetNbaPlayersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetNbaPlayersQuery, GetNbaPlayersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetNbaPlayersQuery, GetNbaPlayersQueryVariables>(
    GetNbaPlayersDocument,
    options
  );
}
export function useGetNbaPlayersSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetNbaPlayersQuery, GetNbaPlayersQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetNbaPlayersQuery, GetNbaPlayersQueryVariables>(
    GetNbaPlayersDocument,
    options
  );
}
export type GetNbaPlayersQueryHookResult = ReturnType<typeof useGetNbaPlayersQuery>;
export type GetNbaPlayersLazyQueryHookResult = ReturnType<typeof useGetNbaPlayersLazyQuery>;
export type GetNbaPlayersSuspenseQueryHookResult = ReturnType<typeof useGetNbaPlayersSuspenseQuery>;
export type GetNbaPlayersQueryResult = Apollo.QueryResult<
  GetNbaPlayersQuery,
  GetNbaPlayersQueryVariables
>;
export const GetNbaPlayerDocument = gql`
  query GetNBAPlayer($id: ID!) {
    nbaPlayer(id: $id) {
      ...NBAPlayerFragment
    }
  }
  ${NbaPlayerFragmentFragmentDoc}
`;

/**
 * __useGetNbaPlayerQuery__
 *
 * To run a query within a React component, call `useGetNbaPlayerQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNbaPlayerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNbaPlayerQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetNbaPlayerQuery(
  baseOptions: Apollo.QueryHookOptions<GetNbaPlayerQuery, GetNbaPlayerQueryVariables> &
    ({ variables: GetNbaPlayerQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetNbaPlayerQuery, GetNbaPlayerQueryVariables>(
    GetNbaPlayerDocument,
    options
  );
}
export function useGetNbaPlayerLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetNbaPlayerQuery, GetNbaPlayerQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetNbaPlayerQuery, GetNbaPlayerQueryVariables>(
    GetNbaPlayerDocument,
    options
  );
}
export function useGetNbaPlayerSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetNbaPlayerQuery, GetNbaPlayerQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetNbaPlayerQuery, GetNbaPlayerQueryVariables>(
    GetNbaPlayerDocument,
    options
  );
}
export type GetNbaPlayerQueryHookResult = ReturnType<typeof useGetNbaPlayerQuery>;
export type GetNbaPlayerLazyQueryHookResult = ReturnType<typeof useGetNbaPlayerLazyQuery>;
export type GetNbaPlayerSuspenseQueryHookResult = ReturnType<typeof useGetNbaPlayerSuspenseQuery>;
export type GetNbaPlayerQueryResult = Apollo.QueryResult<
  GetNbaPlayerQuery,
  GetNbaPlayerQueryVariables
>;
export const GetTeamsDocument = gql`
  query GetTeams($filters: TeamFilters, $pagination: PaginationInput) {
    basketball_teams(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...TeamFragment
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
  ${TeamFragmentFragmentDoc}
`;

/**
 * __useGetTeamsQuery__
 *
 * To run a query within a React component, call `useGetTeamsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTeamsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTeamsQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetTeamsQuery(
  baseOptions?: Apollo.QueryHookOptions<GetTeamsQuery, GetTeamsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetTeamsQuery, GetTeamsQueryVariables>(GetTeamsDocument, options);
}
export function useGetTeamsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetTeamsQuery, GetTeamsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetTeamsQuery, GetTeamsQueryVariables>(GetTeamsDocument, options);
}
export function useGetTeamsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetTeamsQuery, GetTeamsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetTeamsQuery, GetTeamsQueryVariables>(GetTeamsDocument, options);
}
export type GetTeamsQueryHookResult = ReturnType<typeof useGetTeamsQuery>;
export type GetTeamsLazyQueryHookResult = ReturnType<typeof useGetTeamsLazyQuery>;
export type GetTeamsSuspenseQueryHookResult = ReturnType<typeof useGetTeamsSuspenseQuery>;
export type GetTeamsQueryResult = Apollo.QueryResult<GetTeamsQuery, GetTeamsQueryVariables>;
export const GetTeamDocument = gql`
  query GetTeam($id: ID!) {
    team(id: $id) {
      ...TeamFragment
    }
  }
  ${TeamFragmentFragmentDoc}
`;

/**
 * __useGetTeamQuery__
 *
 * To run a query within a React component, call `useGetTeamQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTeamQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTeamQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTeamQuery(
  baseOptions: Apollo.QueryHookOptions<GetTeamQuery, GetTeamQueryVariables> &
    ({ variables: GetTeamQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetTeamQuery, GetTeamQueryVariables>(GetTeamDocument, options);
}
export function useGetTeamLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetTeamQuery, GetTeamQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetTeamQuery, GetTeamQueryVariables>(GetTeamDocument, options);
}
export function useGetTeamSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetTeamQuery, GetTeamQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetTeamQuery, GetTeamQueryVariables>(GetTeamDocument, options);
}
export type GetTeamQueryHookResult = ReturnType<typeof useGetTeamQuery>;
export type GetTeamLazyQueryHookResult = ReturnType<typeof useGetTeamLazyQuery>;
export type GetTeamSuspenseQueryHookResult = ReturnType<typeof useGetTeamSuspenseQuery>;
export type GetTeamQueryResult = Apollo.QueryResult<GetTeamQuery, GetTeamQueryVariables>;
export const GetGameDocument = gql`
  query GetGame($id: ID!) {
    game(id: $id) {
      ...GameFragment
    }
  }
  ${GameFragmentFragmentDoc}
`;

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
export function useGetGameQuery(
  baseOptions: Apollo.QueryHookOptions<GetGameQuery, GetGameQueryVariables> &
    ({ variables: GetGameQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetGameQuery, GetGameQueryVariables>(GetGameDocument, options);
}
export function useGetGameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetGameQuery, GetGameQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetGameQuery, GetGameQueryVariables>(GetGameDocument, options);
}
export function useGetGameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetGameQuery, GetGameQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
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
  ${GameFragmentFragmentDoc}
`;

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
export function useGetLiveGamesQuery(
  baseOptions?: Apollo.QueryHookOptions<GetLiveGamesQuery, GetLiveGamesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetLiveGamesQuery, GetLiveGamesQueryVariables>(
    GetLiveGamesDocument,
    options
  );
}
export function useGetLiveGamesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetLiveGamesQuery, GetLiveGamesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetLiveGamesQuery, GetLiveGamesQueryVariables>(
    GetLiveGamesDocument,
    options
  );
}
export function useGetLiveGamesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetLiveGamesQuery, GetLiveGamesQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetLiveGamesQuery, GetLiveGamesQueryVariables>(
    GetLiveGamesDocument,
    options
  );
}
export type GetLiveGamesQueryHookResult = ReturnType<typeof useGetLiveGamesQuery>;
export type GetLiveGamesLazyQueryHookResult = ReturnType<typeof useGetLiveGamesLazyQuery>;
export type GetLiveGamesSuspenseQueryHookResult = ReturnType<typeof useGetLiveGamesSuspenseQuery>;
export type GetLiveGamesQueryResult = Apollo.QueryResult<
  GetLiveGamesQuery,
  GetLiveGamesQueryVariables
>;
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
  ${GameLogFragmentFragmentDoc}
`;

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
export function useGetGameLogsQuery(
  baseOptions?: Apollo.QueryHookOptions<GetGameLogsQuery, GetGameLogsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetGameLogsQuery, GetGameLogsQueryVariables>(GetGameLogsDocument, options);
}
export function useGetGameLogsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetGameLogsQuery, GetGameLogsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetGameLogsQuery, GetGameLogsQueryVariables>(
    GetGameLogsDocument,
    options
  );
}
export function useGetGameLogsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetGameLogsQuery, GetGameLogsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetGameLogsQuery, GetGameLogsQueryVariables>(
    GetGameLogsDocument,
    options
  );
}
export type GetGameLogsQueryHookResult = ReturnType<typeof useGetGameLogsQuery>;
export type GetGameLogsLazyQueryHookResult = ReturnType<typeof useGetGameLogsLazyQuery>;
export type GetGameLogsSuspenseQueryHookResult = ReturnType<typeof useGetGameLogsSuspenseQuery>;
export type GetGameLogsQueryResult = Apollo.QueryResult<
  GetGameLogsQuery,
  GetGameLogsQueryVariables
>;
export const GetGameLogDocument = gql`
  query GetGameLog($id: ID!) {
    gameLog(id: $id) {
      ...GameLogFragment
    }
  }
  ${GameLogFragmentFragmentDoc}
`;

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
export function useGetGameLogQuery(
  baseOptions: Apollo.QueryHookOptions<GetGameLogQuery, GetGameLogQueryVariables> &
    ({ variables: GetGameLogQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetGameLogQuery, GetGameLogQueryVariables>(GetGameLogDocument, options);
}
export function useGetGameLogLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetGameLogQuery, GetGameLogQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetGameLogQuery, GetGameLogQueryVariables>(
    GetGameLogDocument,
    options
  );
}
export function useGetGameLogSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetGameLogQuery, GetGameLogQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetGameLogQuery, GetGameLogQueryVariables>(
    GetGameLogDocument,
    options
  );
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
  ${UserSummaryFragmentFragmentDoc}
`;

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
export function useGetUsersQuery(
  baseOptions?: Apollo.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
}
export function useGetUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
}
export function useGetUsersSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
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
  ${UserSummaryFragmentFragmentDoc}
`;

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
export function useGetUserQuery(
  baseOptions: Apollo.QueryHookOptions<GetUserQuery, GetUserQueryVariables> &
    ({ variables: GetUserQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
}
export function useGetUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
}
export function useGetUserSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
}
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserSuspenseQueryHookResult = ReturnType<typeof useGetUserSuspenseQuery>;
export type GetUserQueryResult = Apollo.QueryResult<GetUserQuery, GetUserQueryVariables>;
export const SearchUsersDocument = gql`
  query SearchUsers($searchTerm: String, $limit: Int) {
    searchUsers(searchTerm: $searchTerm, limit: $limit) {
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
  ${UserSummaryFragmentFragmentDoc}
`;

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
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useSearchUsersQuery(
  baseOptions?: Apollo.QueryHookOptions<SearchUsersQuery, SearchUsersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SearchUsersQuery, SearchUsersQueryVariables>(SearchUsersDocument, options);
}
export function useSearchUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SearchUsersQuery, SearchUsersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SearchUsersQuery, SearchUsersQueryVariables>(
    SearchUsersDocument,
    options
  );
}
export function useSearchUsersSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SearchUsersQuery, SearchUsersQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SearchUsersQuery, SearchUsersQueryVariables>(
    SearchUsersDocument,
    options
  );
}
export type SearchUsersQueryHookResult = ReturnType<typeof useSearchUsersQuery>;
export type SearchUsersLazyQueryHookResult = ReturnType<typeof useSearchUsersLazyQuery>;
export type SearchUsersSuspenseQueryHookResult = ReturnType<typeof useSearchUsersSuspenseQuery>;
export type SearchUsersQueryResult = Apollo.QueryResult<
  SearchUsersQuery,
  SearchUsersQueryVariables
>;
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
  ${CommentFragmentFragmentDoc}
`;

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
export function useGetCommentsQuery(
  baseOptions?: Apollo.QueryHookOptions<GetCommentsQuery, GetCommentsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCommentsQuery, GetCommentsQueryVariables>(GetCommentsDocument, options);
}
export function useGetCommentsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetCommentsQuery, GetCommentsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCommentsQuery, GetCommentsQueryVariables>(
    GetCommentsDocument,
    options
  );
}
export function useGetCommentsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetCommentsQuery, GetCommentsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetCommentsQuery, GetCommentsQueryVariables>(
    GetCommentsDocument,
    options
  );
}
export type GetCommentsQueryHookResult = ReturnType<typeof useGetCommentsQuery>;
export type GetCommentsLazyQueryHookResult = ReturnType<typeof useGetCommentsLazyQuery>;
export type GetCommentsSuspenseQueryHookResult = ReturnType<typeof useGetCommentsSuspenseQuery>;
export type GetCommentsQueryResult = Apollo.QueryResult<
  GetCommentsQuery,
  GetCommentsQueryVariables
>;
export const GetReactionsDocument = gql`
  query GetReactions($targetId: ID!, $targetType: ParentType!) {
    reactions(targetId: $targetId, targetType: $targetType) {
      ...ReactionFragment
    }
  }
  ${ReactionFragmentFragmentDoc}
`;

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
export function useGetReactionsQuery(
  baseOptions: Apollo.QueryHookOptions<GetReactionsQuery, GetReactionsQueryVariables> &
    ({ variables: GetReactionsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetReactionsQuery, GetReactionsQueryVariables>(
    GetReactionsDocument,
    options
  );
}
export function useGetReactionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetReactionsQuery, GetReactionsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetReactionsQuery, GetReactionsQueryVariables>(
    GetReactionsDocument,
    options
  );
}
export function useGetReactionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetReactionsQuery, GetReactionsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetReactionsQuery, GetReactionsQueryVariables>(
    GetReactionsDocument,
    options
  );
}
export type GetReactionsQueryHookResult = ReturnType<typeof useGetReactionsQuery>;
export type GetReactionsLazyQueryHookResult = ReturnType<typeof useGetReactionsLazyQuery>;
export type GetReactionsSuspenseQueryHookResult = ReturnType<typeof useGetReactionsSuspenseQuery>;
export type GetReactionsQueryResult = Apollo.QueryResult<
  GetReactionsQuery,
  GetReactionsQueryVariables
>;
export const SearchUsersAdminDocument = gql`
  query SearchUsersAdmin($searchTerm: String, $limit: Int) {
    searchUsers(searchTerm: $searchTerm, limit: $limit) {
      edges {
        node {
          id
          username
          first_name
          last_name
          email_address
          isAdmin
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
 *      searchTerm: // value for 'searchTerm'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useSearchUsersAdminQuery(
  baseOptions?: Apollo.QueryHookOptions<SearchUsersAdminQuery, SearchUsersAdminQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SearchUsersAdminQuery, SearchUsersAdminQueryVariables>(
    SearchUsersAdminDocument,
    options
  );
}
export function useSearchUsersAdminLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SearchUsersAdminQuery, SearchUsersAdminQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SearchUsersAdminQuery, SearchUsersAdminQueryVariables>(
    SearchUsersAdminDocument,
    options
  );
}
export function useSearchUsersAdminSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SearchUsersAdminQuery, SearchUsersAdminQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SearchUsersAdminQuery, SearchUsersAdminQueryVariables>(
    SearchUsersAdminDocument,
    options
  );
}
export type SearchUsersAdminQueryHookResult = ReturnType<typeof useSearchUsersAdminQuery>;
export type SearchUsersAdminLazyQueryHookResult = ReturnType<typeof useSearchUsersAdminLazyQuery>;
export type SearchUsersAdminSuspenseQueryHookResult = ReturnType<
  typeof useSearchUsersAdminSuspenseQuery
>;
export type SearchUsersAdminQueryResult = Apollo.QueryResult<
  SearchUsersAdminQuery,
  SearchUsersAdminQueryVariables
>;
export const SearchGameLogsAdminDocument = gql`
  query SearchGameLogsAdmin($searchTerm: String, $first: Int) {
    searchGameLogs(searchTerm: $searchTerm, first: $first) {
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
            isAdmin
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
 *      searchTerm: // value for 'searchTerm'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useSearchGameLogsAdminQuery(
  baseOptions?: Apollo.QueryHookOptions<SearchGameLogsAdminQuery, SearchGameLogsAdminQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SearchGameLogsAdminQuery, SearchGameLogsAdminQueryVariables>(
    SearchGameLogsAdminDocument,
    options
  );
}
export function useSearchGameLogsAdminLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SearchGameLogsAdminQuery,
    SearchGameLogsAdminQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SearchGameLogsAdminQuery, SearchGameLogsAdminQueryVariables>(
    SearchGameLogsAdminDocument,
    options
  );
}
export function useSearchGameLogsAdminSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SearchGameLogsAdminQuery, SearchGameLogsAdminQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SearchGameLogsAdminQuery, SearchGameLogsAdminQueryVariables>(
    SearchGameLogsAdminDocument,
    options
  );
}
export type SearchGameLogsAdminQueryHookResult = ReturnType<typeof useSearchGameLogsAdminQuery>;
export type SearchGameLogsAdminLazyQueryHookResult = ReturnType<
  typeof useSearchGameLogsAdminLazyQuery
>;
export type SearchGameLogsAdminSuspenseQueryHookResult = ReturnType<
  typeof useSearchGameLogsAdminSuspenseQuery
>;
export type SearchGameLogsAdminQueryResult = Apollo.QueryResult<
  SearchGameLogsAdminQuery,
  SearchGameLogsAdminQueryVariables
>;
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
  ${GameLogFragmentFragmentDoc}
`;

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
export function useGetFriendsGameLogsQuery(
  baseOptions?: Apollo.QueryHookOptions<GetFriendsGameLogsQuery, GetFriendsGameLogsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFriendsGameLogsQuery, GetFriendsGameLogsQueryVariables>(
    GetFriendsGameLogsDocument,
    options
  );
}
export function useGetFriendsGameLogsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFriendsGameLogsQuery,
    GetFriendsGameLogsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetFriendsGameLogsQuery, GetFriendsGameLogsQueryVariables>(
    GetFriendsGameLogsDocument,
    options
  );
}
export function useGetFriendsGameLogsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetFriendsGameLogsQuery, GetFriendsGameLogsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetFriendsGameLogsQuery, GetFriendsGameLogsQueryVariables>(
    GetFriendsGameLogsDocument,
    options
  );
}
export type GetFriendsGameLogsQueryHookResult = ReturnType<typeof useGetFriendsGameLogsQuery>;
export type GetFriendsGameLogsLazyQueryHookResult = ReturnType<
  typeof useGetFriendsGameLogsLazyQuery
>;
export type GetFriendsGameLogsSuspenseQueryHookResult = ReturnType<
  typeof useGetFriendsGameLogsSuspenseQuery
>;
export type GetFriendsGameLogsQueryResult = Apollo.QueryResult<
  GetFriendsGameLogsQuery,
  GetFriendsGameLogsQueryVariables
>;
export const GetFriendsGameLogsTableDocument = gql`
  query GetFriendsGameLogsTable($pagination: PaginationInput) {
    friendsGameLogs(pagination: $pagination) {
      edges {
        node {
          ...GameLogTableFragment
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
  ${GameLogTableFragmentFragmentDoc}
`;

/**
 * __useGetFriendsGameLogsTableQuery__
 *
 * To run a query within a React component, call `useGetFriendsGameLogsTableQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFriendsGameLogsTableQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFriendsGameLogsTableQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetFriendsGameLogsTableQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFriendsGameLogsTableQuery,
    GetFriendsGameLogsTableQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFriendsGameLogsTableQuery, GetFriendsGameLogsTableQueryVariables>(
    GetFriendsGameLogsTableDocument,
    options
  );
}
export function useGetFriendsGameLogsTableLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFriendsGameLogsTableQuery,
    GetFriendsGameLogsTableQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetFriendsGameLogsTableQuery, GetFriendsGameLogsTableQueryVariables>(
    GetFriendsGameLogsTableDocument,
    options
  );
}
export function useGetFriendsGameLogsTableSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetFriendsGameLogsTableQuery,
        GetFriendsGameLogsTableQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetFriendsGameLogsTableQuery,
    GetFriendsGameLogsTableQueryVariables
  >(GetFriendsGameLogsTableDocument, options);
}
export type GetFriendsGameLogsTableQueryHookResult = ReturnType<
  typeof useGetFriendsGameLogsTableQuery
>;
export type GetFriendsGameLogsTableLazyQueryHookResult = ReturnType<
  typeof useGetFriendsGameLogsTableLazyQuery
>;
export type GetFriendsGameLogsTableSuspenseQueryHookResult = ReturnType<
  typeof useGetFriendsGameLogsTableSuspenseQuery
>;
export type GetFriendsGameLogsTableQueryResult = Apollo.QueryResult<
  GetFriendsGameLogsTableQuery,
  GetFriendsGameLogsTableQueryVariables
>;
export const GetGameLogsTableDocument = gql`
  query GetGameLogsTable($filters: GameLogFilters, $pagination: PaginationInput) {
    gameLogs(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...GameLogTableFragment
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
  ${GameLogTableFragmentFragmentDoc}
`;

/**
 * __useGetGameLogsTableQuery__
 *
 * To run a query within a React component, call `useGetGameLogsTableQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGameLogsTableQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGameLogsTableQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetGameLogsTableQuery(
  baseOptions?: Apollo.QueryHookOptions<GetGameLogsTableQuery, GetGameLogsTableQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetGameLogsTableQuery, GetGameLogsTableQueryVariables>(
    GetGameLogsTableDocument,
    options
  );
}
export function useGetGameLogsTableLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetGameLogsTableQuery, GetGameLogsTableQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetGameLogsTableQuery, GetGameLogsTableQueryVariables>(
    GetGameLogsTableDocument,
    options
  );
}
export function useGetGameLogsTableSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetGameLogsTableQuery, GetGameLogsTableQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetGameLogsTableQuery, GetGameLogsTableQueryVariables>(
    GetGameLogsTableDocument,
    options
  );
}
export type GetGameLogsTableQueryHookResult = ReturnType<typeof useGetGameLogsTableQuery>;
export type GetGameLogsTableLazyQueryHookResult = ReturnType<typeof useGetGameLogsTableLazyQuery>;
export type GetGameLogsTableSuspenseQueryHookResult = ReturnType<
  typeof useGetGameLogsTableSuspenseQuery
>;
export type GetGameLogsTableQueryResult = Apollo.QueryResult<
  GetGameLogsTableQuery,
  GetGameLogsTableQueryVariables
>;
export const GetFriendsGameLogsCountsDocument = gql`
  query GetFriendsGameLogsCounts($pagination: PaginationInput) {
    friendsGameLogs(pagination: $pagination) {
      edges {
        node {
          ...GameLogCountsFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
  ${GameLogCountsFragmentFragmentDoc}
`;

/**
 * __useGetFriendsGameLogsCountsQuery__
 *
 * To run a query within a React component, call `useGetFriendsGameLogsCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFriendsGameLogsCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFriendsGameLogsCountsQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetFriendsGameLogsCountsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFriendsGameLogsCountsQuery,
    GetFriendsGameLogsCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFriendsGameLogsCountsQuery, GetFriendsGameLogsCountsQueryVariables>(
    GetFriendsGameLogsCountsDocument,
    options
  );
}
export function useGetFriendsGameLogsCountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFriendsGameLogsCountsQuery,
    GetFriendsGameLogsCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetFriendsGameLogsCountsQuery, GetFriendsGameLogsCountsQueryVariables>(
    GetFriendsGameLogsCountsDocument,
    options
  );
}
export function useGetFriendsGameLogsCountsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetFriendsGameLogsCountsQuery,
        GetFriendsGameLogsCountsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetFriendsGameLogsCountsQuery,
    GetFriendsGameLogsCountsQueryVariables
  >(GetFriendsGameLogsCountsDocument, options);
}
export type GetFriendsGameLogsCountsQueryHookResult = ReturnType<
  typeof useGetFriendsGameLogsCountsQuery
>;
export type GetFriendsGameLogsCountsLazyQueryHookResult = ReturnType<
  typeof useGetFriendsGameLogsCountsLazyQuery
>;
export type GetFriendsGameLogsCountsSuspenseQueryHookResult = ReturnType<
  typeof useGetFriendsGameLogsCountsSuspenseQuery
>;
export type GetFriendsGameLogsCountsQueryResult = Apollo.QueryResult<
  GetFriendsGameLogsCountsQuery,
  GetFriendsGameLogsCountsQueryVariables
>;
export const GetGameLogsCountsDocument = gql`
  query GetGameLogsCounts($filters: GameLogFilters, $pagination: PaginationInput) {
    gameLogs(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...GameLogCountsFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
  ${GameLogCountsFragmentFragmentDoc}
`;

/**
 * __useGetGameLogsCountsQuery__
 *
 * To run a query within a React component, call `useGetGameLogsCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGameLogsCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGameLogsCountsQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetGameLogsCountsQuery(
  baseOptions?: Apollo.QueryHookOptions<GetGameLogsCountsQuery, GetGameLogsCountsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetGameLogsCountsQuery, GetGameLogsCountsQueryVariables>(
    GetGameLogsCountsDocument,
    options
  );
}
export function useGetGameLogsCountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetGameLogsCountsQuery, GetGameLogsCountsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetGameLogsCountsQuery, GetGameLogsCountsQueryVariables>(
    GetGameLogsCountsDocument,
    options
  );
}
export function useGetGameLogsCountsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetGameLogsCountsQuery, GetGameLogsCountsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetGameLogsCountsQuery, GetGameLogsCountsQueryVariables>(
    GetGameLogsCountsDocument,
    options
  );
}
export type GetGameLogsCountsQueryHookResult = ReturnType<typeof useGetGameLogsCountsQuery>;
export type GetGameLogsCountsLazyQueryHookResult = ReturnType<typeof useGetGameLogsCountsLazyQuery>;
export type GetGameLogsCountsSuspenseQueryHookResult = ReturnType<
  typeof useGetGameLogsCountsSuspenseQuery
>;
export type GetGameLogsCountsQueryResult = Apollo.QueryResult<
  GetGameLogsCountsQuery,
  GetGameLogsCountsQueryVariables
>;
export const GetLandingPageTrendingContentDocument = gql`
  query GetLandingPageTrendingContent($limit: Int = 10) {
    gameLogs(filters: { classification: PUBLIC }, pagination: { first: $limit }) {
      edges {
        node {
          ...GameLogCountsFragment
          user {
            id
            username
            first_name
            last_name
            image_url
          }
          game {
            id
            date
            teams
            scores
          }
        }
      }
    }
  }
  ${GameLogCountsFragmentFragmentDoc}
`;

/**
 * __useGetLandingPageTrendingContentQuery__
 *
 * To run a query within a React component, call `useGetLandingPageTrendingContentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLandingPageTrendingContentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLandingPageTrendingContentQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetLandingPageTrendingContentQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetLandingPageTrendingContentQuery,
    GetLandingPageTrendingContentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetLandingPageTrendingContentQuery,
    GetLandingPageTrendingContentQueryVariables
  >(GetLandingPageTrendingContentDocument, options);
}
export function useGetLandingPageTrendingContentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLandingPageTrendingContentQuery,
    GetLandingPageTrendingContentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetLandingPageTrendingContentQuery,
    GetLandingPageTrendingContentQueryVariables
  >(GetLandingPageTrendingContentDocument, options);
}
export function useGetLandingPageTrendingContentSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetLandingPageTrendingContentQuery,
        GetLandingPageTrendingContentQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetLandingPageTrendingContentQuery,
    GetLandingPageTrendingContentQueryVariables
  >(GetLandingPageTrendingContentDocument, options);
}
export type GetLandingPageTrendingContentQueryHookResult = ReturnType<
  typeof useGetLandingPageTrendingContentQuery
>;
export type GetLandingPageTrendingContentLazyQueryHookResult = ReturnType<
  typeof useGetLandingPageTrendingContentLazyQuery
>;
export type GetLandingPageTrendingContentSuspenseQueryHookResult = ReturnType<
  typeof useGetLandingPageTrendingContentSuspenseQuery
>;
export type GetLandingPageTrendingContentQueryResult = Apollo.QueryResult<
  GetLandingPageTrendingContentQuery,
  GetLandingPageTrendingContentQueryVariables
>;
export const GetLandingPageLatestGamesDocument = gql`
  query GetLandingPageLatestGames($limit: Int = 10) {
    games(filters: { status: FINISHED }, pagination: { first: $limit }) {
      edges {
        node {
          ...GameCountsFragment
          date
          status
          teams
          scores
          arena
        }
      }
    }
  }
  ${GameCountsFragmentFragmentDoc}
`;

/**
 * __useGetLandingPageLatestGamesQuery__
 *
 * To run a query within a React component, call `useGetLandingPageLatestGamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLandingPageLatestGamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLandingPageLatestGamesQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetLandingPageLatestGamesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetLandingPageLatestGamesQuery,
    GetLandingPageLatestGamesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetLandingPageLatestGamesQuery, GetLandingPageLatestGamesQueryVariables>(
    GetLandingPageLatestGamesDocument,
    options
  );
}
export function useGetLandingPageLatestGamesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLandingPageLatestGamesQuery,
    GetLandingPageLatestGamesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetLandingPageLatestGamesQuery,
    GetLandingPageLatestGamesQueryVariables
  >(GetLandingPageLatestGamesDocument, options);
}
export function useGetLandingPageLatestGamesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetLandingPageLatestGamesQuery,
        GetLandingPageLatestGamesQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetLandingPageLatestGamesQuery,
    GetLandingPageLatestGamesQueryVariables
  >(GetLandingPageLatestGamesDocument, options);
}
export type GetLandingPageLatestGamesQueryHookResult = ReturnType<
  typeof useGetLandingPageLatestGamesQuery
>;
export type GetLandingPageLatestGamesLazyQueryHookResult = ReturnType<
  typeof useGetLandingPageLatestGamesLazyQuery
>;
export type GetLandingPageLatestGamesSuspenseQueryHookResult = ReturnType<
  typeof useGetLandingPageLatestGamesSuspenseQuery
>;
export type GetLandingPageLatestGamesQueryResult = Apollo.QueryResult<
  GetLandingPageLatestGamesQuery,
  GetLandingPageLatestGamesQueryVariables
>;
export const GetLandingPagePopularGamesDocument = gql`
  query GetLandingPagePopularGames($limit: Int = 10) {
    games(filters: { status: FINISHED }, pagination: { first: $limit }) {
      edges {
        node {
          ...GameCountsFragment
          date
          status
          teams
          scores
          average_rating
          total_ratings
        }
      }
    }
  }
  ${GameCountsFragmentFragmentDoc}
`;

/**
 * __useGetLandingPagePopularGamesQuery__
 *
 * To run a query within a React component, call `useGetLandingPagePopularGamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLandingPagePopularGamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLandingPagePopularGamesQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetLandingPagePopularGamesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetLandingPagePopularGamesQuery,
    GetLandingPagePopularGamesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetLandingPagePopularGamesQuery, GetLandingPagePopularGamesQueryVariables>(
    GetLandingPagePopularGamesDocument,
    options
  );
}
export function useGetLandingPagePopularGamesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLandingPagePopularGamesQuery,
    GetLandingPagePopularGamesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetLandingPagePopularGamesQuery,
    GetLandingPagePopularGamesQueryVariables
  >(GetLandingPagePopularGamesDocument, options);
}
export function useGetLandingPagePopularGamesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetLandingPagePopularGamesQuery,
        GetLandingPagePopularGamesQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetLandingPagePopularGamesQuery,
    GetLandingPagePopularGamesQueryVariables
  >(GetLandingPagePopularGamesDocument, options);
}
export type GetLandingPagePopularGamesQueryHookResult = ReturnType<
  typeof useGetLandingPagePopularGamesQuery
>;
export type GetLandingPagePopularGamesLazyQueryHookResult = ReturnType<
  typeof useGetLandingPagePopularGamesLazyQuery
>;
export type GetLandingPagePopularGamesSuspenseQueryHookResult = ReturnType<
  typeof useGetLandingPagePopularGamesSuspenseQuery
>;
export type GetLandingPagePopularGamesQueryResult = Apollo.QueryResult<
  GetLandingPagePopularGamesQuery,
  GetLandingPagePopularGamesQueryVariables
>;
export const GetNbaHubCountsDocument = gql`
  query GetNBAHubCounts {
    games: games(filters: { status: FINISHED }, pagination: { first: 1 }) {
      totalCount
    }
    teams: basketball_teams(pagination: { first: 1 }) {
      totalCount
    }
    players: nbaPlayers(pagination: { first: 1 }) {
      totalCount
    }
    liveGames: games(filters: { status: LIVE }, pagination: { first: 1 }) {
      totalCount
    }
  }
`;

/**
 * __useGetNbaHubCountsQuery__
 *
 * To run a query within a React component, call `useGetNbaHubCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNbaHubCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNbaHubCountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetNbaHubCountsQuery(
  baseOptions?: Apollo.QueryHookOptions<GetNbaHubCountsQuery, GetNbaHubCountsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetNbaHubCountsQuery, GetNbaHubCountsQueryVariables>(
    GetNbaHubCountsDocument,
    options
  );
}
export function useGetNbaHubCountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetNbaHubCountsQuery, GetNbaHubCountsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetNbaHubCountsQuery, GetNbaHubCountsQueryVariables>(
    GetNbaHubCountsDocument,
    options
  );
}
export function useGetNbaHubCountsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetNbaHubCountsQuery, GetNbaHubCountsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetNbaHubCountsQuery, GetNbaHubCountsQueryVariables>(
    GetNbaHubCountsDocument,
    options
  );
}
export type GetNbaHubCountsQueryHookResult = ReturnType<typeof useGetNbaHubCountsQuery>;
export type GetNbaHubCountsLazyQueryHookResult = ReturnType<typeof useGetNbaHubCountsLazyQuery>;
export type GetNbaHubCountsSuspenseQueryHookResult = ReturnType<
  typeof useGetNbaHubCountsSuspenseQuery
>;
export type GetNbaHubCountsQueryResult = Apollo.QueryResult<
  GetNbaHubCountsQuery,
  GetNbaHubCountsQueryVariables
>;
export const GetGameLogCommentsCountsDocument = gql`
  query GetGameLogCommentsCounts($gameLogId: ID!) {
    gameLog(id: $gameLogId) {
      id
      totalCommentCount
      totalReactionCount
    }
  }
`;

/**
 * __useGetGameLogCommentsCountsQuery__
 *
 * To run a query within a React component, call `useGetGameLogCommentsCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGameLogCommentsCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGameLogCommentsCountsQuery({
 *   variables: {
 *      gameLogId: // value for 'gameLogId'
 *   },
 * });
 */
export function useGetGameLogCommentsCountsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGameLogCommentsCountsQuery,
    GetGameLogCommentsCountsQueryVariables
  > &
    ({ variables: GetGameLogCommentsCountsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetGameLogCommentsCountsQuery, GetGameLogCommentsCountsQueryVariables>(
    GetGameLogCommentsCountsDocument,
    options
  );
}
export function useGetGameLogCommentsCountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGameLogCommentsCountsQuery,
    GetGameLogCommentsCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetGameLogCommentsCountsQuery, GetGameLogCommentsCountsQueryVariables>(
    GetGameLogCommentsCountsDocument,
    options
  );
}
export function useGetGameLogCommentsCountsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGameLogCommentsCountsQuery,
        GetGameLogCommentsCountsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGameLogCommentsCountsQuery,
    GetGameLogCommentsCountsQueryVariables
  >(GetGameLogCommentsCountsDocument, options);
}
export type GetGameLogCommentsCountsQueryHookResult = ReturnType<
  typeof useGetGameLogCommentsCountsQuery
>;
export type GetGameLogCommentsCountsLazyQueryHookResult = ReturnType<
  typeof useGetGameLogCommentsCountsLazyQuery
>;
export type GetGameLogCommentsCountsSuspenseQueryHookResult = ReturnType<
  typeof useGetGameLogCommentsCountsSuspenseQuery
>;
export type GetGameLogCommentsCountsQueryResult = Apollo.QueryResult<
  GetGameLogCommentsCountsQuery,
  GetGameLogCommentsCountsQueryVariables
>;
export const GetGameLogCommentsWithCountsDocument = gql`
  query GetGameLogCommentsWithCounts($gameLogId: ID!, $pagination: PaginationInput) {
    gameLog(id: $gameLogId) {
      id
      totalCommentCount
      totalReactionCount
    }
    comments(filters: { parentId: $gameLogId, parentType: GAME_LOG }, pagination: $pagination) {
      edges {
        node {
          ...CommentCountsFragment
          user {
            id
            username
            first_name
            last_name
            image_url
          }
          content
          created_at
          updated_at
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
  ${CommentCountsFragmentFragmentDoc}
`;

/**
 * __useGetGameLogCommentsWithCountsQuery__
 *
 * To run a query within a React component, call `useGetGameLogCommentsWithCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGameLogCommentsWithCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGameLogCommentsWithCountsQuery({
 *   variables: {
 *      gameLogId: // value for 'gameLogId'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetGameLogCommentsWithCountsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGameLogCommentsWithCountsQuery,
    GetGameLogCommentsWithCountsQueryVariables
  > &
    ({ variables: GetGameLogCommentsWithCountsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGameLogCommentsWithCountsQuery,
    GetGameLogCommentsWithCountsQueryVariables
  >(GetGameLogCommentsWithCountsDocument, options);
}
export function useGetGameLogCommentsWithCountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGameLogCommentsWithCountsQuery,
    GetGameLogCommentsWithCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGameLogCommentsWithCountsQuery,
    GetGameLogCommentsWithCountsQueryVariables
  >(GetGameLogCommentsWithCountsDocument, options);
}
export function useGetGameLogCommentsWithCountsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGameLogCommentsWithCountsQuery,
        GetGameLogCommentsWithCountsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGameLogCommentsWithCountsQuery,
    GetGameLogCommentsWithCountsQueryVariables
  >(GetGameLogCommentsWithCountsDocument, options);
}
export type GetGameLogCommentsWithCountsQueryHookResult = ReturnType<
  typeof useGetGameLogCommentsWithCountsQuery
>;
export type GetGameLogCommentsWithCountsLazyQueryHookResult = ReturnType<
  typeof useGetGameLogCommentsWithCountsLazyQuery
>;
export type GetGameLogCommentsWithCountsSuspenseQueryHookResult = ReturnType<
  typeof useGetGameLogCommentsWithCountsSuspenseQuery
>;
export type GetGameLogCommentsWithCountsQueryResult = Apollo.QueryResult<
  GetGameLogCommentsWithCountsQuery,
  GetGameLogCommentsWithCountsQueryVariables
>;
export const GetGameLogCommentsDetailedDocument = gql`
  query GetGameLogCommentsDetailed($gameLogId: ID!, $pagination: PaginationInput) {
    gameLog(id: $gameLogId) {
      id
      totalCommentCount
      totalReactionCount
    }
    comments(filters: { parentId: $gameLogId, parentType: GAME_LOG }, pagination: $pagination) {
      edges {
        node {
          ...CommentDetailedFragment
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
  ${CommentDetailedFragmentFragmentDoc}
`;

/**
 * __useGetGameLogCommentsDetailedQuery__
 *
 * To run a query within a React component, call `useGetGameLogCommentsDetailedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGameLogCommentsDetailedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGameLogCommentsDetailedQuery({
 *   variables: {
 *      gameLogId: // value for 'gameLogId'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetGameLogCommentsDetailedQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGameLogCommentsDetailedQuery,
    GetGameLogCommentsDetailedQueryVariables
  > &
    ({ variables: GetGameLogCommentsDetailedQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetGameLogCommentsDetailedQuery, GetGameLogCommentsDetailedQueryVariables>(
    GetGameLogCommentsDetailedDocument,
    options
  );
}
export function useGetGameLogCommentsDetailedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGameLogCommentsDetailedQuery,
    GetGameLogCommentsDetailedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGameLogCommentsDetailedQuery,
    GetGameLogCommentsDetailedQueryVariables
  >(GetGameLogCommentsDetailedDocument, options);
}
export function useGetGameLogCommentsDetailedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGameLogCommentsDetailedQuery,
        GetGameLogCommentsDetailedQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGameLogCommentsDetailedQuery,
    GetGameLogCommentsDetailedQueryVariables
  >(GetGameLogCommentsDetailedDocument, options);
}
export type GetGameLogCommentsDetailedQueryHookResult = ReturnType<
  typeof useGetGameLogCommentsDetailedQuery
>;
export type GetGameLogCommentsDetailedLazyQueryHookResult = ReturnType<
  typeof useGetGameLogCommentsDetailedLazyQuery
>;
export type GetGameLogCommentsDetailedSuspenseQueryHookResult = ReturnType<
  typeof useGetGameLogCommentsDetailedSuspenseQuery
>;
export type GetGameLogCommentsDetailedQueryResult = Apollo.QueryResult<
  GetGameLogCommentsDetailedQuery,
  GetGameLogCommentsDetailedQueryVariables
>;
export const GetCommentRepliesWithCountsDocument = gql`
  query GetCommentRepliesWithCounts($commentId: ID!, $pagination: PaginationInput) {
    comments(filters: { parentId: $commentId, parentType: COMMENT }, pagination: $pagination) {
      edges {
        node {
          ...CommentCountsFragment
          user {
            id
            username
            first_name
            last_name
            image_url
          }
          content
          created_at
          updated_at
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
  ${CommentCountsFragmentFragmentDoc}
`;

/**
 * __useGetCommentRepliesWithCountsQuery__
 *
 * To run a query within a React component, call `useGetCommentRepliesWithCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentRepliesWithCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentRepliesWithCountsQuery({
 *   variables: {
 *      commentId: // value for 'commentId'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetCommentRepliesWithCountsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCommentRepliesWithCountsQuery,
    GetCommentRepliesWithCountsQueryVariables
  > &
    ({ variables: GetCommentRepliesWithCountsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCommentRepliesWithCountsQuery,
    GetCommentRepliesWithCountsQueryVariables
  >(GetCommentRepliesWithCountsDocument, options);
}
export function useGetCommentRepliesWithCountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCommentRepliesWithCountsQuery,
    GetCommentRepliesWithCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCommentRepliesWithCountsQuery,
    GetCommentRepliesWithCountsQueryVariables
  >(GetCommentRepliesWithCountsDocument, options);
}
export function useGetCommentRepliesWithCountsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCommentRepliesWithCountsQuery,
        GetCommentRepliesWithCountsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCommentRepliesWithCountsQuery,
    GetCommentRepliesWithCountsQueryVariables
  >(GetCommentRepliesWithCountsDocument, options);
}
export type GetCommentRepliesWithCountsQueryHookResult = ReturnType<
  typeof useGetCommentRepliesWithCountsQuery
>;
export type GetCommentRepliesWithCountsLazyQueryHookResult = ReturnType<
  typeof useGetCommentRepliesWithCountsLazyQuery
>;
export type GetCommentRepliesWithCountsSuspenseQueryHookResult = ReturnType<
  typeof useGetCommentRepliesWithCountsSuspenseQuery
>;
export type GetCommentRepliesWithCountsQueryResult = Apollo.QueryResult<
  GetCommentRepliesWithCountsQuery,
  GetCommentRepliesWithCountsQueryVariables
>;
export const GetCommentRepliesDetailedDocument = gql`
  query GetCommentRepliesDetailed($commentId: ID!, $pagination: PaginationInput) {
    comments(filters: { parentId: $commentId, parentType: COMMENT }, pagination: $pagination) {
      edges {
        node {
          ...CommentDetailedFragment
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
  ${CommentDetailedFragmentFragmentDoc}
`;

/**
 * __useGetCommentRepliesDetailedQuery__
 *
 * To run a query within a React component, call `useGetCommentRepliesDetailedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentRepliesDetailedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentRepliesDetailedQuery({
 *   variables: {
 *      commentId: // value for 'commentId'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetCommentRepliesDetailedQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCommentRepliesDetailedQuery,
    GetCommentRepliesDetailedQueryVariables
  > &
    ({ variables: GetCommentRepliesDetailedQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCommentRepliesDetailedQuery, GetCommentRepliesDetailedQueryVariables>(
    GetCommentRepliesDetailedDocument,
    options
  );
}
export function useGetCommentRepliesDetailedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCommentRepliesDetailedQuery,
    GetCommentRepliesDetailedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCommentRepliesDetailedQuery,
    GetCommentRepliesDetailedQueryVariables
  >(GetCommentRepliesDetailedDocument, options);
}
export function useGetCommentRepliesDetailedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCommentRepliesDetailedQuery,
        GetCommentRepliesDetailedQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCommentRepliesDetailedQuery,
    GetCommentRepliesDetailedQueryVariables
  >(GetCommentRepliesDetailedDocument, options);
}
export type GetCommentRepliesDetailedQueryHookResult = ReturnType<
  typeof useGetCommentRepliesDetailedQuery
>;
export type GetCommentRepliesDetailedLazyQueryHookResult = ReturnType<
  typeof useGetCommentRepliesDetailedLazyQuery
>;
export type GetCommentRepliesDetailedSuspenseQueryHookResult = ReturnType<
  typeof useGetCommentRepliesDetailedSuspenseQuery
>;
export type GetCommentRepliesDetailedQueryResult = Apollo.QueryResult<
  GetCommentRepliesDetailedQuery,
  GetCommentRepliesDetailedQueryVariables
>;
export const GetGameLogReactionsDocument = gql`
  query GetGameLogReactions($gameLogId: ID!) {
    reactions(targetId: $gameLogId, targetType: GAME_LOG) {
      ...ReactionFragment
    }
  }
  ${ReactionFragmentFragmentDoc}
`;

/**
 * __useGetGameLogReactionsQuery__
 *
 * To run a query within a React component, call `useGetGameLogReactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGameLogReactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGameLogReactionsQuery({
 *   variables: {
 *      gameLogId: // value for 'gameLogId'
 *   },
 * });
 */
export function useGetGameLogReactionsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGameLogReactionsQuery,
    GetGameLogReactionsQueryVariables
  > &
    ({ variables: GetGameLogReactionsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetGameLogReactionsQuery, GetGameLogReactionsQueryVariables>(
    GetGameLogReactionsDocument,
    options
  );
}
export function useGetGameLogReactionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGameLogReactionsQuery,
    GetGameLogReactionsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetGameLogReactionsQuery, GetGameLogReactionsQueryVariables>(
    GetGameLogReactionsDocument,
    options
  );
}
export function useGetGameLogReactionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetGameLogReactionsQuery, GetGameLogReactionsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetGameLogReactionsQuery, GetGameLogReactionsQueryVariables>(
    GetGameLogReactionsDocument,
    options
  );
}
export type GetGameLogReactionsQueryHookResult = ReturnType<typeof useGetGameLogReactionsQuery>;
export type GetGameLogReactionsLazyQueryHookResult = ReturnType<
  typeof useGetGameLogReactionsLazyQuery
>;
export type GetGameLogReactionsSuspenseQueryHookResult = ReturnType<
  typeof useGetGameLogReactionsSuspenseQuery
>;
export type GetGameLogReactionsQueryResult = Apollo.QueryResult<
  GetGameLogReactionsQuery,
  GetGameLogReactionsQueryVariables
>;
export const GetCommentReactionsDocument = gql`
  query GetCommentReactions($commentId: ID!) {
    reactions(targetId: $commentId, targetType: COMMENT) {
      ...ReactionFragment
    }
  }
  ${ReactionFragmentFragmentDoc}
`;

/**
 * __useGetCommentReactionsQuery__
 *
 * To run a query within a React component, call `useGetCommentReactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentReactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentReactionsQuery({
 *   variables: {
 *      commentId: // value for 'commentId'
 *   },
 * });
 */
export function useGetCommentReactionsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCommentReactionsQuery,
    GetCommentReactionsQueryVariables
  > &
    ({ variables: GetCommentReactionsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCommentReactionsQuery, GetCommentReactionsQueryVariables>(
    GetCommentReactionsDocument,
    options
  );
}
export function useGetCommentReactionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCommentReactionsQuery,
    GetCommentReactionsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCommentReactionsQuery, GetCommentReactionsQueryVariables>(
    GetCommentReactionsDocument,
    options
  );
}
export function useGetCommentReactionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetCommentReactionsQuery, GetCommentReactionsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetCommentReactionsQuery, GetCommentReactionsQueryVariables>(
    GetCommentReactionsDocument,
    options
  );
}
export type GetCommentReactionsQueryHookResult = ReturnType<typeof useGetCommentReactionsQuery>;
export type GetCommentReactionsLazyQueryHookResult = ReturnType<
  typeof useGetCommentReactionsLazyQuery
>;
export type GetCommentReactionsSuspenseQueryHookResult = ReturnType<
  typeof useGetCommentReactionsSuspenseQuery
>;
export type GetCommentReactionsQueryResult = Apollo.QueryResult<
  GetCommentReactionsQuery,
  GetCommentReactionsQueryVariables
>;
export const GetPublicCommentsCountsDocument = gql`
  query GetPublicCommentsCounts($gameId: ID!) {
    game(id: $gameId) {
      id
      totalPublicCommentCount
      totalPublicReactionCount
    }
  }
`;

/**
 * __useGetPublicCommentsCountsQuery__
 *
 * To run a query within a React component, call `useGetPublicCommentsCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPublicCommentsCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPublicCommentsCountsQuery({
 *   variables: {
 *      gameId: // value for 'gameId'
 *   },
 * });
 */
export function useGetPublicCommentsCountsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPublicCommentsCountsQuery,
    GetPublicCommentsCountsQueryVariables
  > &
    ({ variables: GetPublicCommentsCountsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetPublicCommentsCountsQuery, GetPublicCommentsCountsQueryVariables>(
    GetPublicCommentsCountsDocument,
    options
  );
}
export function useGetPublicCommentsCountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPublicCommentsCountsQuery,
    GetPublicCommentsCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetPublicCommentsCountsQuery, GetPublicCommentsCountsQueryVariables>(
    GetPublicCommentsCountsDocument,
    options
  );
}
export function useGetPublicCommentsCountsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPublicCommentsCountsQuery,
        GetPublicCommentsCountsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPublicCommentsCountsQuery,
    GetPublicCommentsCountsQueryVariables
  >(GetPublicCommentsCountsDocument, options);
}
export type GetPublicCommentsCountsQueryHookResult = ReturnType<
  typeof useGetPublicCommentsCountsQuery
>;
export type GetPublicCommentsCountsLazyQueryHookResult = ReturnType<
  typeof useGetPublicCommentsCountsLazyQuery
>;
export type GetPublicCommentsCountsSuspenseQueryHookResult = ReturnType<
  typeof useGetPublicCommentsCountsSuspenseQuery
>;
export type GetPublicCommentsCountsQueryResult = Apollo.QueryResult<
  GetPublicCommentsCountsQuery,
  GetPublicCommentsCountsQueryVariables
>;
export const GetPublicCommentsWithCountsDocument = gql`
  query GetPublicCommentsWithCounts($gameId: ID!, $pagination: PaginationInput) {
    game(id: $gameId) {
      id
      totalPublicCommentCount
      totalPublicReactionCount
    }
    publicComments(
      filters: { parentId: $gameId, parentType: BASKETBALL_GAME }
      pagination: $pagination
    ) {
      edges {
        node {
          ...PublicCommentCountsFragment
          user {
            id
            username
            first_name
            last_name
            image_url
          }
          content
          created_at
          updated_at
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
  ${PublicCommentCountsFragmentFragmentDoc}
`;

/**
 * __useGetPublicCommentsWithCountsQuery__
 *
 * To run a query within a React component, call `useGetPublicCommentsWithCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPublicCommentsWithCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPublicCommentsWithCountsQuery({
 *   variables: {
 *      gameId: // value for 'gameId'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetPublicCommentsWithCountsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPublicCommentsWithCountsQuery,
    GetPublicCommentsWithCountsQueryVariables
  > &
    ({ variables: GetPublicCommentsWithCountsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPublicCommentsWithCountsQuery,
    GetPublicCommentsWithCountsQueryVariables
  >(GetPublicCommentsWithCountsDocument, options);
}
export function useGetPublicCommentsWithCountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPublicCommentsWithCountsQuery,
    GetPublicCommentsWithCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPublicCommentsWithCountsQuery,
    GetPublicCommentsWithCountsQueryVariables
  >(GetPublicCommentsWithCountsDocument, options);
}
export function useGetPublicCommentsWithCountsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPublicCommentsWithCountsQuery,
        GetPublicCommentsWithCountsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPublicCommentsWithCountsQuery,
    GetPublicCommentsWithCountsQueryVariables
  >(GetPublicCommentsWithCountsDocument, options);
}
export type GetPublicCommentsWithCountsQueryHookResult = ReturnType<
  typeof useGetPublicCommentsWithCountsQuery
>;
export type GetPublicCommentsWithCountsLazyQueryHookResult = ReturnType<
  typeof useGetPublicCommentsWithCountsLazyQuery
>;
export type GetPublicCommentsWithCountsSuspenseQueryHookResult = ReturnType<
  typeof useGetPublicCommentsWithCountsSuspenseQuery
>;
export type GetPublicCommentsWithCountsQueryResult = Apollo.QueryResult<
  GetPublicCommentsWithCountsQuery,
  GetPublicCommentsWithCountsQueryVariables
>;
export const GetPublicCommentsDetailedDocument = gql`
  query GetPublicCommentsDetailed($gameId: ID!, $pagination: PaginationInput) {
    game(id: $gameId) {
      id
      totalPublicCommentCount
      totalPublicReactionCount
    }
    publicComments(
      filters: { parentId: $gameId, parentType: BASKETBALL_GAME }
      pagination: $pagination
    ) {
      edges {
        node {
          ...PublicCommentDetailedFragment
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
  ${PublicCommentDetailedFragmentFragmentDoc}
`;

/**
 * __useGetPublicCommentsDetailedQuery__
 *
 * To run a query within a React component, call `useGetPublicCommentsDetailedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPublicCommentsDetailedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPublicCommentsDetailedQuery({
 *   variables: {
 *      gameId: // value for 'gameId'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetPublicCommentsDetailedQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPublicCommentsDetailedQuery,
    GetPublicCommentsDetailedQueryVariables
  > &
    ({ variables: GetPublicCommentsDetailedQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetPublicCommentsDetailedQuery, GetPublicCommentsDetailedQueryVariables>(
    GetPublicCommentsDetailedDocument,
    options
  );
}
export function useGetPublicCommentsDetailedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPublicCommentsDetailedQuery,
    GetPublicCommentsDetailedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPublicCommentsDetailedQuery,
    GetPublicCommentsDetailedQueryVariables
  >(GetPublicCommentsDetailedDocument, options);
}
export function useGetPublicCommentsDetailedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPublicCommentsDetailedQuery,
        GetPublicCommentsDetailedQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPublicCommentsDetailedQuery,
    GetPublicCommentsDetailedQueryVariables
  >(GetPublicCommentsDetailedDocument, options);
}
export type GetPublicCommentsDetailedQueryHookResult = ReturnType<
  typeof useGetPublicCommentsDetailedQuery
>;
export type GetPublicCommentsDetailedLazyQueryHookResult = ReturnType<
  typeof useGetPublicCommentsDetailedLazyQuery
>;
export type GetPublicCommentsDetailedSuspenseQueryHookResult = ReturnType<
  typeof useGetPublicCommentsDetailedSuspenseQuery
>;
export type GetPublicCommentsDetailedQueryResult = Apollo.QueryResult<
  GetPublicCommentsDetailedQuery,
  GetPublicCommentsDetailedQueryVariables
>;
export const GetPublicCommentRepliesWithCountsDocument = gql`
  query GetPublicCommentRepliesWithCounts($commentId: ID!, $pagination: PaginationInput) {
    publicComments(
      filters: { parentId: $commentId, parentType: PUBLIC_COMMENT }
      pagination: $pagination
    ) {
      edges {
        node {
          ...PublicCommentCountsFragment
          user {
            id
            username
            first_name
            last_name
            image_url
          }
          content
          created_at
          updated_at
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
  ${PublicCommentCountsFragmentFragmentDoc}
`;

/**
 * __useGetPublicCommentRepliesWithCountsQuery__
 *
 * To run a query within a React component, call `useGetPublicCommentRepliesWithCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPublicCommentRepliesWithCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPublicCommentRepliesWithCountsQuery({
 *   variables: {
 *      commentId: // value for 'commentId'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetPublicCommentRepliesWithCountsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPublicCommentRepliesWithCountsQuery,
    GetPublicCommentRepliesWithCountsQueryVariables
  > &
    (
      | { variables: GetPublicCommentRepliesWithCountsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPublicCommentRepliesWithCountsQuery,
    GetPublicCommentRepliesWithCountsQueryVariables
  >(GetPublicCommentRepliesWithCountsDocument, options);
}
export function useGetPublicCommentRepliesWithCountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPublicCommentRepliesWithCountsQuery,
    GetPublicCommentRepliesWithCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPublicCommentRepliesWithCountsQuery,
    GetPublicCommentRepliesWithCountsQueryVariables
  >(GetPublicCommentRepliesWithCountsDocument, options);
}
export function useGetPublicCommentRepliesWithCountsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPublicCommentRepliesWithCountsQuery,
        GetPublicCommentRepliesWithCountsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPublicCommentRepliesWithCountsQuery,
    GetPublicCommentRepliesWithCountsQueryVariables
  >(GetPublicCommentRepliesWithCountsDocument, options);
}
export type GetPublicCommentRepliesWithCountsQueryHookResult = ReturnType<
  typeof useGetPublicCommentRepliesWithCountsQuery
>;
export type GetPublicCommentRepliesWithCountsLazyQueryHookResult = ReturnType<
  typeof useGetPublicCommentRepliesWithCountsLazyQuery
>;
export type GetPublicCommentRepliesWithCountsSuspenseQueryHookResult = ReturnType<
  typeof useGetPublicCommentRepliesWithCountsSuspenseQuery
>;
export type GetPublicCommentRepliesWithCountsQueryResult = Apollo.QueryResult<
  GetPublicCommentRepliesWithCountsQuery,
  GetPublicCommentRepliesWithCountsQueryVariables
>;
export const GetPublicCommentRepliesDetailedDocument = gql`
  query GetPublicCommentRepliesDetailed($commentId: ID!, $pagination: PaginationInput) {
    publicComments(
      filters: { parentId: $commentId, parentType: PUBLIC_COMMENT }
      pagination: $pagination
    ) {
      edges {
        node {
          ...PublicCommentDetailedFragment
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
  ${PublicCommentDetailedFragmentFragmentDoc}
`;

/**
 * __useGetPublicCommentRepliesDetailedQuery__
 *
 * To run a query within a React component, call `useGetPublicCommentRepliesDetailedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPublicCommentRepliesDetailedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPublicCommentRepliesDetailedQuery({
 *   variables: {
 *      commentId: // value for 'commentId'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetPublicCommentRepliesDetailedQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPublicCommentRepliesDetailedQuery,
    GetPublicCommentRepliesDetailedQueryVariables
  > &
    (
      | { variables: GetPublicCommentRepliesDetailedQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPublicCommentRepliesDetailedQuery,
    GetPublicCommentRepliesDetailedQueryVariables
  >(GetPublicCommentRepliesDetailedDocument, options);
}
export function useGetPublicCommentRepliesDetailedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPublicCommentRepliesDetailedQuery,
    GetPublicCommentRepliesDetailedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPublicCommentRepliesDetailedQuery,
    GetPublicCommentRepliesDetailedQueryVariables
  >(GetPublicCommentRepliesDetailedDocument, options);
}
export function useGetPublicCommentRepliesDetailedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPublicCommentRepliesDetailedQuery,
        GetPublicCommentRepliesDetailedQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPublicCommentRepliesDetailedQuery,
    GetPublicCommentRepliesDetailedQueryVariables
  >(GetPublicCommentRepliesDetailedDocument, options);
}
export type GetPublicCommentRepliesDetailedQueryHookResult = ReturnType<
  typeof useGetPublicCommentRepliesDetailedQuery
>;
export type GetPublicCommentRepliesDetailedLazyQueryHookResult = ReturnType<
  typeof useGetPublicCommentRepliesDetailedLazyQuery
>;
export type GetPublicCommentRepliesDetailedSuspenseQueryHookResult = ReturnType<
  typeof useGetPublicCommentRepliesDetailedSuspenseQuery
>;
export type GetPublicCommentRepliesDetailedQueryResult = Apollo.QueryResult<
  GetPublicCommentRepliesDetailedQuery,
  GetPublicCommentRepliesDetailedQueryVariables
>;
export const GetPublicReactionsDocument = gql`
  query GetPublicReactions($targetId: ID!, $targetType: ParentType!) {
    publicReactions(targetId: $targetId, targetType: $targetType) {
      ...PublicReactionFragment
    }
  }
  ${PublicReactionFragmentFragmentDoc}
`;

/**
 * __useGetPublicReactionsQuery__
 *
 * To run a query within a React component, call `useGetPublicReactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPublicReactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPublicReactionsQuery({
 *   variables: {
 *      targetId: // value for 'targetId'
 *      targetType: // value for 'targetType'
 *   },
 * });
 */
export function useGetPublicReactionsQuery(
  baseOptions: Apollo.QueryHookOptions<GetPublicReactionsQuery, GetPublicReactionsQueryVariables> &
    ({ variables: GetPublicReactionsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetPublicReactionsQuery, GetPublicReactionsQueryVariables>(
    GetPublicReactionsDocument,
    options
  );
}
export function useGetPublicReactionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPublicReactionsQuery,
    GetPublicReactionsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetPublicReactionsQuery, GetPublicReactionsQueryVariables>(
    GetPublicReactionsDocument,
    options
  );
}
export function useGetPublicReactionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetPublicReactionsQuery, GetPublicReactionsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetPublicReactionsQuery, GetPublicReactionsQueryVariables>(
    GetPublicReactionsDocument,
    options
  );
}
export type GetPublicReactionsQueryHookResult = ReturnType<typeof useGetPublicReactionsQuery>;
export type GetPublicReactionsLazyQueryHookResult = ReturnType<
  typeof useGetPublicReactionsLazyQuery
>;
export type GetPublicReactionsSuspenseQueryHookResult = ReturnType<
  typeof useGetPublicReactionsSuspenseQuery
>;
export type GetPublicReactionsQueryResult = Apollo.QueryResult<
  GetPublicReactionsQuery,
  GetPublicReactionsQueryVariables
>;
export const GetCommentDocument = gql`
  query GetComment($commentId: ID!, $repliesPagination: PaginationInput) {
    comments(
      filters: { parentId: $commentId, parentType: COMMENT }
      pagination: $repliesPagination
    ) {
      edges {
        node {
          ...CommentDetailedFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
    reactions(targetId: $commentId, targetType: COMMENT) {
      ...ReactionFragment
    }
  }
  ${CommentDetailedFragmentFragmentDoc}
  ${ReactionFragmentFragmentDoc}
`;

/**
 * __useGetCommentQuery__
 *
 * To run a query within a React component, call `useGetCommentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentQuery({
 *   variables: {
 *      commentId: // value for 'commentId'
 *      repliesPagination: // value for 'repliesPagination'
 *   },
 * });
 */
export function useGetCommentQuery(
  baseOptions: Apollo.QueryHookOptions<GetCommentQuery, GetCommentQueryVariables> &
    ({ variables: GetCommentQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCommentQuery, GetCommentQueryVariables>(GetCommentDocument, options);
}
export function useGetCommentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetCommentQuery, GetCommentQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCommentQuery, GetCommentQueryVariables>(
    GetCommentDocument,
    options
  );
}
export function useGetCommentSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetCommentQuery, GetCommentQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetCommentQuery, GetCommentQueryVariables>(
    GetCommentDocument,
    options
  );
}
export type GetCommentQueryHookResult = ReturnType<typeof useGetCommentQuery>;
export type GetCommentLazyQueryHookResult = ReturnType<typeof useGetCommentLazyQuery>;
export type GetCommentSuspenseQueryHookResult = ReturnType<typeof useGetCommentSuspenseQuery>;
export type GetCommentQueryResult = Apollo.QueryResult<GetCommentQuery, GetCommentQueryVariables>;
export const GetCommentWithCountsDocument = gql`
  query GetCommentWithCounts($commentId: ID!, $repliesPagination: PaginationInput) {
    comments(
      filters: { parentId: $commentId, parentType: COMMENT }
      pagination: $repliesPagination
    ) {
      edges {
        node {
          ...CommentCountsFragment
          user {
            id
            username
            first_name
            last_name
            image_url
          }
          content
          created_at
          updated_at
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
    reactions(targetId: $commentId, targetType: COMMENT) {
      ...ReactionFragment
    }
  }
  ${CommentCountsFragmentFragmentDoc}
  ${ReactionFragmentFragmentDoc}
`;

/**
 * __useGetCommentWithCountsQuery__
 *
 * To run a query within a React component, call `useGetCommentWithCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentWithCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentWithCountsQuery({
 *   variables: {
 *      commentId: // value for 'commentId'
 *      repliesPagination: // value for 'repliesPagination'
 *   },
 * });
 */
export function useGetCommentWithCountsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCommentWithCountsQuery,
    GetCommentWithCountsQueryVariables
  > &
    ({ variables: GetCommentWithCountsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCommentWithCountsQuery, GetCommentWithCountsQueryVariables>(
    GetCommentWithCountsDocument,
    options
  );
}
export function useGetCommentWithCountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCommentWithCountsQuery,
    GetCommentWithCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCommentWithCountsQuery, GetCommentWithCountsQueryVariables>(
    GetCommentWithCountsDocument,
    options
  );
}
export function useGetCommentWithCountsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetCommentWithCountsQuery, GetCommentWithCountsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetCommentWithCountsQuery, GetCommentWithCountsQueryVariables>(
    GetCommentWithCountsDocument,
    options
  );
}
export type GetCommentWithCountsQueryHookResult = ReturnType<typeof useGetCommentWithCountsQuery>;
export type GetCommentWithCountsLazyQueryHookResult = ReturnType<
  typeof useGetCommentWithCountsLazyQuery
>;
export type GetCommentWithCountsSuspenseQueryHookResult = ReturnType<
  typeof useGetCommentWithCountsSuspenseQuery
>;
export type GetCommentWithCountsQueryResult = Apollo.QueryResult<
  GetCommentWithCountsQuery,
  GetCommentWithCountsQueryVariables
>;
export const GetPublicCommentDocument = gql`
  query GetPublicComment($commentId: ID!, $repliesPagination: PaginationInput) {
    publicComments(
      filters: { parentId: $commentId, parentType: PUBLIC_COMMENT }
      pagination: $repliesPagination
    ) {
      edges {
        node {
          ...PublicCommentDetailedFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
    publicReactions(targetId: $commentId, targetType: PUBLIC_COMMENT) {
      ...PublicReactionFragment
    }
  }
  ${PublicCommentDetailedFragmentFragmentDoc}
  ${PublicReactionFragmentFragmentDoc}
`;

/**
 * __useGetPublicCommentQuery__
 *
 * To run a query within a React component, call `useGetPublicCommentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPublicCommentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPublicCommentQuery({
 *   variables: {
 *      commentId: // value for 'commentId'
 *      repliesPagination: // value for 'repliesPagination'
 *   },
 * });
 */
export function useGetPublicCommentQuery(
  baseOptions: Apollo.QueryHookOptions<GetPublicCommentQuery, GetPublicCommentQueryVariables> &
    ({ variables: GetPublicCommentQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetPublicCommentQuery, GetPublicCommentQueryVariables>(
    GetPublicCommentDocument,
    options
  );
}
export function useGetPublicCommentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetPublicCommentQuery, GetPublicCommentQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetPublicCommentQuery, GetPublicCommentQueryVariables>(
    GetPublicCommentDocument,
    options
  );
}
export function useGetPublicCommentSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetPublicCommentQuery, GetPublicCommentQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetPublicCommentQuery, GetPublicCommentQueryVariables>(
    GetPublicCommentDocument,
    options
  );
}
export type GetPublicCommentQueryHookResult = ReturnType<typeof useGetPublicCommentQuery>;
export type GetPublicCommentLazyQueryHookResult = ReturnType<typeof useGetPublicCommentLazyQuery>;
export type GetPublicCommentSuspenseQueryHookResult = ReturnType<
  typeof useGetPublicCommentSuspenseQuery
>;
export type GetPublicCommentQueryResult = Apollo.QueryResult<
  GetPublicCommentQuery,
  GetPublicCommentQueryVariables
>;
export const GetPublicCommentWithCountsDocument = gql`
  query GetPublicCommentWithCounts($commentId: ID!, $repliesPagination: PaginationInput) {
    publicComments(
      filters: { parentId: $commentId, parentType: PUBLIC_COMMENT }
      pagination: $repliesPagination
    ) {
      edges {
        node {
          ...PublicCommentCountsFragment
          user {
            id
            username
            first_name
            last_name
            image_url
          }
          content
          created_at
          updated_at
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
    publicReactions(targetId: $commentId, targetType: PUBLIC_COMMENT) {
      ...PublicReactionFragment
    }
  }
  ${PublicCommentCountsFragmentFragmentDoc}
  ${PublicReactionFragmentFragmentDoc}
`;

/**
 * __useGetPublicCommentWithCountsQuery__
 *
 * To run a query within a React component, call `useGetPublicCommentWithCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPublicCommentWithCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPublicCommentWithCountsQuery({
 *   variables: {
 *      commentId: // value for 'commentId'
 *      repliesPagination: // value for 'repliesPagination'
 *   },
 * });
 */
export function useGetPublicCommentWithCountsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPublicCommentWithCountsQuery,
    GetPublicCommentWithCountsQueryVariables
  > &
    ({ variables: GetPublicCommentWithCountsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetPublicCommentWithCountsQuery, GetPublicCommentWithCountsQueryVariables>(
    GetPublicCommentWithCountsDocument,
    options
  );
}
export function useGetPublicCommentWithCountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPublicCommentWithCountsQuery,
    GetPublicCommentWithCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPublicCommentWithCountsQuery,
    GetPublicCommentWithCountsQueryVariables
  >(GetPublicCommentWithCountsDocument, options);
}
export function useGetPublicCommentWithCountsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPublicCommentWithCountsQuery,
        GetPublicCommentWithCountsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPublicCommentWithCountsQuery,
    GetPublicCommentWithCountsQueryVariables
  >(GetPublicCommentWithCountsDocument, options);
}
export type GetPublicCommentWithCountsQueryHookResult = ReturnType<
  typeof useGetPublicCommentWithCountsQuery
>;
export type GetPublicCommentWithCountsLazyQueryHookResult = ReturnType<
  typeof useGetPublicCommentWithCountsLazyQuery
>;
export type GetPublicCommentWithCountsSuspenseQueryHookResult = ReturnType<
  typeof useGetPublicCommentWithCountsSuspenseQuery
>;
export type GetPublicCommentWithCountsQueryResult = Apollo.QueryResult<
  GetPublicCommentWithCountsQuery,
  GetPublicCommentWithCountsQueryVariables
>;
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
  ${FriendshipFragmentFragmentDoc}
`;

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
export function useGetUserFriendshipsQuery(
  baseOptions?: Apollo.QueryHookOptions<GetUserFriendshipsQuery, GetUserFriendshipsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserFriendshipsQuery, GetUserFriendshipsQueryVariables>(
    GetUserFriendshipsDocument,
    options
  );
}
export function useGetUserFriendshipsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserFriendshipsQuery,
    GetUserFriendshipsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserFriendshipsQuery, GetUserFriendshipsQueryVariables>(
    GetUserFriendshipsDocument,
    options
  );
}
export function useGetUserFriendshipsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetUserFriendshipsQuery, GetUserFriendshipsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetUserFriendshipsQuery, GetUserFriendshipsQueryVariables>(
    GetUserFriendshipsDocument,
    options
  );
}
export type GetUserFriendshipsQueryHookResult = ReturnType<typeof useGetUserFriendshipsQuery>;
export type GetUserFriendshipsLazyQueryHookResult = ReturnType<
  typeof useGetUserFriendshipsLazyQuery
>;
export type GetUserFriendshipsSuspenseQueryHookResult = ReturnType<
  typeof useGetUserFriendshipsSuspenseQuery
>;
export type GetUserFriendshipsQueryResult = Apollo.QueryResult<
  GetUserFriendshipsQuery,
  GetUserFriendshipsQueryVariables
>;
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
  ${FriendshipFragmentFragmentDoc}
`;

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
export function useGetFriendshipRequestsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFriendshipRequestsQuery,
    GetFriendshipRequestsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFriendshipRequestsQuery, GetFriendshipRequestsQueryVariables>(
    GetFriendshipRequestsDocument,
    options
  );
}
export function useGetFriendshipRequestsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFriendshipRequestsQuery,
    GetFriendshipRequestsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetFriendshipRequestsQuery, GetFriendshipRequestsQueryVariables>(
    GetFriendshipRequestsDocument,
    options
  );
}
export function useGetFriendshipRequestsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetFriendshipRequestsQuery,
        GetFriendshipRequestsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetFriendshipRequestsQuery, GetFriendshipRequestsQueryVariables>(
    GetFriendshipRequestsDocument,
    options
  );
}
export type GetFriendshipRequestsQueryHookResult = ReturnType<typeof useGetFriendshipRequestsQuery>;
export type GetFriendshipRequestsLazyQueryHookResult = ReturnType<
  typeof useGetFriendshipRequestsLazyQuery
>;
export type GetFriendshipRequestsSuspenseQueryHookResult = ReturnType<
  typeof useGetFriendshipRequestsSuspenseQuery
>;
export type GetFriendshipRequestsQueryResult = Apollo.QueryResult<
  GetFriendshipRequestsQuery,
  GetFriendshipRequestsQueryVariables
>;
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
export function useGetFriendshipStatusQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetFriendshipStatusQuery,
    GetFriendshipStatusQueryVariables
  > &
    ({ variables: GetFriendshipStatusQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFriendshipStatusQuery, GetFriendshipStatusQueryVariables>(
    GetFriendshipStatusDocument,
    options
  );
}
export function useGetFriendshipStatusLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFriendshipStatusQuery,
    GetFriendshipStatusQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetFriendshipStatusQuery, GetFriendshipStatusQueryVariables>(
    GetFriendshipStatusDocument,
    options
  );
}
export function useGetFriendshipStatusSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetFriendshipStatusQuery, GetFriendshipStatusQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetFriendshipStatusQuery, GetFriendshipStatusQueryVariables>(
    GetFriendshipStatusDocument,
    options
  );
}
export type GetFriendshipStatusQueryHookResult = ReturnType<typeof useGetFriendshipStatusQuery>;
export type GetFriendshipStatusLazyQueryHookResult = ReturnType<
  typeof useGetFriendshipStatusLazyQuery
>;
export type GetFriendshipStatusSuspenseQueryHookResult = ReturnType<
  typeof useGetFriendshipStatusSuspenseQuery
>;
export type GetFriendshipStatusQueryResult = Apollo.QueryResult<
  GetFriendshipStatusQuery,
  GetFriendshipStatusQueryVariables
>;
export const GetFriendshipsCountsDocument = gql`
  query GetFriendshipsCounts($filters: FriendshipFilters) {
    userFriendships(filters: $filters, pagination: { first: 1 }) {
      totalCount
    }
  }
`;

/**
 * __useGetFriendshipsCountsQuery__
 *
 * To run a query within a React component, call `useGetFriendshipsCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFriendshipsCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFriendshipsCountsQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetFriendshipsCountsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFriendshipsCountsQuery,
    GetFriendshipsCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFriendshipsCountsQuery, GetFriendshipsCountsQueryVariables>(
    GetFriendshipsCountsDocument,
    options
  );
}
export function useGetFriendshipsCountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFriendshipsCountsQuery,
    GetFriendshipsCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetFriendshipsCountsQuery, GetFriendshipsCountsQueryVariables>(
    GetFriendshipsCountsDocument,
    options
  );
}
export function useGetFriendshipsCountsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetFriendshipsCountsQuery, GetFriendshipsCountsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetFriendshipsCountsQuery, GetFriendshipsCountsQueryVariables>(
    GetFriendshipsCountsDocument,
    options
  );
}
export type GetFriendshipsCountsQueryHookResult = ReturnType<typeof useGetFriendshipsCountsQuery>;
export type GetFriendshipsCountsLazyQueryHookResult = ReturnType<
  typeof useGetFriendshipsCountsLazyQuery
>;
export type GetFriendshipsCountsSuspenseQueryHookResult = ReturnType<
  typeof useGetFriendshipsCountsSuspenseQuery
>;
export type GetFriendshipsCountsQueryResult = Apollo.QueryResult<
  GetFriendshipsCountsQuery,
  GetFriendshipsCountsQueryVariables
>;
export const GetFriendshipsWithCountsDocument = gql`
  query GetFriendshipsWithCounts($filters: FriendshipFilters, $pagination: PaginationInput) {
    userFriendships(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...FriendshipTableFragment
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
  ${FriendshipTableFragmentFragmentDoc}
`;

/**
 * __useGetFriendshipsWithCountsQuery__
 *
 * To run a query within a React component, call `useGetFriendshipsWithCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFriendshipsWithCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFriendshipsWithCountsQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetFriendshipsWithCountsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFriendshipsWithCountsQuery,
    GetFriendshipsWithCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFriendshipsWithCountsQuery, GetFriendshipsWithCountsQueryVariables>(
    GetFriendshipsWithCountsDocument,
    options
  );
}
export function useGetFriendshipsWithCountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFriendshipsWithCountsQuery,
    GetFriendshipsWithCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetFriendshipsWithCountsQuery, GetFriendshipsWithCountsQueryVariables>(
    GetFriendshipsWithCountsDocument,
    options
  );
}
export function useGetFriendshipsWithCountsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetFriendshipsWithCountsQuery,
        GetFriendshipsWithCountsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetFriendshipsWithCountsQuery,
    GetFriendshipsWithCountsQueryVariables
  >(GetFriendshipsWithCountsDocument, options);
}
export type GetFriendshipsWithCountsQueryHookResult = ReturnType<
  typeof useGetFriendshipsWithCountsQuery
>;
export type GetFriendshipsWithCountsLazyQueryHookResult = ReturnType<
  typeof useGetFriendshipsWithCountsLazyQuery
>;
export type GetFriendshipsWithCountsSuspenseQueryHookResult = ReturnType<
  typeof useGetFriendshipsWithCountsSuspenseQuery
>;
export type GetFriendshipsWithCountsQueryResult = Apollo.QueryResult<
  GetFriendshipsWithCountsQuery,
  GetFriendshipsWithCountsQueryVariables
>;
export const GetFriendshipsDetailedDocument = gql`
  query GetFriendshipsDetailed($filters: FriendshipFilters, $pagination: PaginationInput) {
    userFriendships(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...FriendshipDetailedFragment
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
  ${FriendshipDetailedFragmentFragmentDoc}
`;

/**
 * __useGetFriendshipsDetailedQuery__
 *
 * To run a query within a React component, call `useGetFriendshipsDetailedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFriendshipsDetailedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFriendshipsDetailedQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetFriendshipsDetailedQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFriendshipsDetailedQuery,
    GetFriendshipsDetailedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFriendshipsDetailedQuery, GetFriendshipsDetailedQueryVariables>(
    GetFriendshipsDetailedDocument,
    options
  );
}
export function useGetFriendshipsDetailedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFriendshipsDetailedQuery,
    GetFriendshipsDetailedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetFriendshipsDetailedQuery, GetFriendshipsDetailedQueryVariables>(
    GetFriendshipsDetailedDocument,
    options
  );
}
export function useGetFriendshipsDetailedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetFriendshipsDetailedQuery,
        GetFriendshipsDetailedQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetFriendshipsDetailedQuery, GetFriendshipsDetailedQueryVariables>(
    GetFriendshipsDetailedDocument,
    options
  );
}
export type GetFriendshipsDetailedQueryHookResult = ReturnType<
  typeof useGetFriendshipsDetailedQuery
>;
export type GetFriendshipsDetailedLazyQueryHookResult = ReturnType<
  typeof useGetFriendshipsDetailedLazyQuery
>;
export type GetFriendshipsDetailedSuspenseQueryHookResult = ReturnType<
  typeof useGetFriendshipsDetailedSuspenseQuery
>;
export type GetFriendshipsDetailedQueryResult = Apollo.QueryResult<
  GetFriendshipsDetailedQuery,
  GetFriendshipsDetailedQueryVariables
>;
export const GetFriendshipRequestsCountsDocument = gql`
  query GetFriendshipRequestsCounts {
    friendshipRequests(pagination: { first: 1 }) {
      totalCount
    }
  }
`;

/**
 * __useGetFriendshipRequestsCountsQuery__
 *
 * To run a query within a React component, call `useGetFriendshipRequestsCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFriendshipRequestsCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFriendshipRequestsCountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFriendshipRequestsCountsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFriendshipRequestsCountsQuery,
    GetFriendshipRequestsCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetFriendshipRequestsCountsQuery,
    GetFriendshipRequestsCountsQueryVariables
  >(GetFriendshipRequestsCountsDocument, options);
}
export function useGetFriendshipRequestsCountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFriendshipRequestsCountsQuery,
    GetFriendshipRequestsCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetFriendshipRequestsCountsQuery,
    GetFriendshipRequestsCountsQueryVariables
  >(GetFriendshipRequestsCountsDocument, options);
}
export function useGetFriendshipRequestsCountsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetFriendshipRequestsCountsQuery,
        GetFriendshipRequestsCountsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetFriendshipRequestsCountsQuery,
    GetFriendshipRequestsCountsQueryVariables
  >(GetFriendshipRequestsCountsDocument, options);
}
export type GetFriendshipRequestsCountsQueryHookResult = ReturnType<
  typeof useGetFriendshipRequestsCountsQuery
>;
export type GetFriendshipRequestsCountsLazyQueryHookResult = ReturnType<
  typeof useGetFriendshipRequestsCountsLazyQuery
>;
export type GetFriendshipRequestsCountsSuspenseQueryHookResult = ReturnType<
  typeof useGetFriendshipRequestsCountsSuspenseQuery
>;
export type GetFriendshipRequestsCountsQueryResult = Apollo.QueryResult<
  GetFriendshipRequestsCountsQuery,
  GetFriendshipRequestsCountsQueryVariables
>;
export const GetFriendshipRequestsWithCountsDocument = gql`
  query GetFriendshipRequestsWithCounts($pagination: PaginationInput) {
    friendshipRequests(pagination: $pagination) {
      edges {
        node {
          ...FriendshipTableFragment
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
  ${FriendshipTableFragmentFragmentDoc}
`;

/**
 * __useGetFriendshipRequestsWithCountsQuery__
 *
 * To run a query within a React component, call `useGetFriendshipRequestsWithCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFriendshipRequestsWithCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFriendshipRequestsWithCountsQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetFriendshipRequestsWithCountsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFriendshipRequestsWithCountsQuery,
    GetFriendshipRequestsWithCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetFriendshipRequestsWithCountsQuery,
    GetFriendshipRequestsWithCountsQueryVariables
  >(GetFriendshipRequestsWithCountsDocument, options);
}
export function useGetFriendshipRequestsWithCountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFriendshipRequestsWithCountsQuery,
    GetFriendshipRequestsWithCountsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetFriendshipRequestsWithCountsQuery,
    GetFriendshipRequestsWithCountsQueryVariables
  >(GetFriendshipRequestsWithCountsDocument, options);
}
export function useGetFriendshipRequestsWithCountsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetFriendshipRequestsWithCountsQuery,
        GetFriendshipRequestsWithCountsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetFriendshipRequestsWithCountsQuery,
    GetFriendshipRequestsWithCountsQueryVariables
  >(GetFriendshipRequestsWithCountsDocument, options);
}
export type GetFriendshipRequestsWithCountsQueryHookResult = ReturnType<
  typeof useGetFriendshipRequestsWithCountsQuery
>;
export type GetFriendshipRequestsWithCountsLazyQueryHookResult = ReturnType<
  typeof useGetFriendshipRequestsWithCountsLazyQuery
>;
export type GetFriendshipRequestsWithCountsSuspenseQueryHookResult = ReturnType<
  typeof useGetFriendshipRequestsWithCountsSuspenseQuery
>;
export type GetFriendshipRequestsWithCountsQueryResult = Apollo.QueryResult<
  GetFriendshipRequestsWithCountsQuery,
  GetFriendshipRequestsWithCountsQueryVariables
>;
export const GetFriendshipRequestsDetailedDocument = gql`
  query GetFriendshipRequestsDetailed($pagination: PaginationInput) {
    friendshipRequests(pagination: $pagination) {
      edges {
        node {
          ...FriendshipDetailedFragment
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
  ${FriendshipDetailedFragmentFragmentDoc}
`;

/**
 * __useGetFriendshipRequestsDetailedQuery__
 *
 * To run a query within a React component, call `useGetFriendshipRequestsDetailedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFriendshipRequestsDetailedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFriendshipRequestsDetailedQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetFriendshipRequestsDetailedQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFriendshipRequestsDetailedQuery,
    GetFriendshipRequestsDetailedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetFriendshipRequestsDetailedQuery,
    GetFriendshipRequestsDetailedQueryVariables
  >(GetFriendshipRequestsDetailedDocument, options);
}
export function useGetFriendshipRequestsDetailedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFriendshipRequestsDetailedQuery,
    GetFriendshipRequestsDetailedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetFriendshipRequestsDetailedQuery,
    GetFriendshipRequestsDetailedQueryVariables
  >(GetFriendshipRequestsDetailedDocument, options);
}
export function useGetFriendshipRequestsDetailedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetFriendshipRequestsDetailedQuery,
        GetFriendshipRequestsDetailedQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetFriendshipRequestsDetailedQuery,
    GetFriendshipRequestsDetailedQueryVariables
  >(GetFriendshipRequestsDetailedDocument, options);
}
export type GetFriendshipRequestsDetailedQueryHookResult = ReturnType<
  typeof useGetFriendshipRequestsDetailedQuery
>;
export type GetFriendshipRequestsDetailedLazyQueryHookResult = ReturnType<
  typeof useGetFriendshipRequestsDetailedLazyQuery
>;
export type GetFriendshipRequestsDetailedSuspenseQueryHookResult = ReturnType<
  typeof useGetFriendshipRequestsDetailedSuspenseQuery
>;
export type GetFriendshipRequestsDetailedQueryResult = Apollo.QueryResult<
  GetFriendshipRequestsDetailedQuery,
  GetFriendshipRequestsDetailedQueryVariables
>;
export const GetUserSearchSimpleDocument = gql`
  query GetUserSearchSimple($searchTerm: String, $limit: Int) {
    searchUsers(searchTerm: $searchTerm, limit: $limit) {
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
  ${UserSummaryFragmentFragmentDoc}
`;

/**
 * __useGetUserSearchSimpleQuery__
 *
 * To run a query within a React component, call `useGetUserSearchSimpleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserSearchSimpleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserSearchSimpleQuery({
 *   variables: {
 *      searchTerm: // value for 'searchTerm'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetUserSearchSimpleQuery(
  baseOptions?: Apollo.QueryHookOptions<GetUserSearchSimpleQuery, GetUserSearchSimpleQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserSearchSimpleQuery, GetUserSearchSimpleQueryVariables>(
    GetUserSearchSimpleDocument,
    options
  );
}
export function useGetUserSearchSimpleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserSearchSimpleQuery,
    GetUserSearchSimpleQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserSearchSimpleQuery, GetUserSearchSimpleQueryVariables>(
    GetUserSearchSimpleDocument,
    options
  );
}
export function useGetUserSearchSimpleSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetUserSearchSimpleQuery, GetUserSearchSimpleQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetUserSearchSimpleQuery, GetUserSearchSimpleQueryVariables>(
    GetUserSearchSimpleDocument,
    options
  );
}
export type GetUserSearchSimpleQueryHookResult = ReturnType<typeof useGetUserSearchSimpleQuery>;
export type GetUserSearchSimpleLazyQueryHookResult = ReturnType<
  typeof useGetUserSearchSimpleLazyQuery
>;
export type GetUserSearchSimpleSuspenseQueryHookResult = ReturnType<
  typeof useGetUserSearchSimpleSuspenseQuery
>;
export type GetUserSearchSimpleQueryResult = Apollo.QueryResult<
  GetUserSearchSimpleQuery,
  GetUserSearchSimpleQueryVariables
>;
export const GetUserNotificationsDocument = gql`
  query GetUserNotifications($filters: NotificationFilters, $pagination: PaginationInput) {
    userNotifications(filters: $filters, pagination: $pagination) {
      edges {
        cursor
        node {
          ...NotificationFragment
        }
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
  ${NotificationFragmentFragmentDoc}
`;

/**
 * __useGetUserNotificationsQuery__
 *
 * To run a query within a React component, call `useGetUserNotificationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserNotificationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserNotificationsQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetUserNotificationsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUserNotificationsQuery,
    GetUserNotificationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserNotificationsQuery, GetUserNotificationsQueryVariables>(
    GetUserNotificationsDocument,
    options
  );
}
export function useGetUserNotificationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserNotificationsQuery,
    GetUserNotificationsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserNotificationsQuery, GetUserNotificationsQueryVariables>(
    GetUserNotificationsDocument,
    options
  );
}
export function useGetUserNotificationsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetUserNotificationsQuery, GetUserNotificationsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetUserNotificationsQuery, GetUserNotificationsQueryVariables>(
    GetUserNotificationsDocument,
    options
  );
}
export type GetUserNotificationsQueryHookResult = ReturnType<typeof useGetUserNotificationsQuery>;
export type GetUserNotificationsLazyQueryHookResult = ReturnType<
  typeof useGetUserNotificationsLazyQuery
>;
export type GetUserNotificationsSuspenseQueryHookResult = ReturnType<
  typeof useGetUserNotificationsSuspenseQuery
>;
export type GetUserNotificationsQueryResult = Apollo.QueryResult<
  GetUserNotificationsQuery,
  GetUserNotificationsQueryVariables
>;
export const GetUnreadNotificationsCountDocument = gql`
  query GetUnreadNotificationsCount {
    unreadNotificationsCount
  }
`;

/**
 * __useGetUnreadNotificationsCountQuery__
 *
 * To run a query within a React component, call `useGetUnreadNotificationsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUnreadNotificationsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUnreadNotificationsCountQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUnreadNotificationsCountQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUnreadNotificationsCountQuery,
    GetUnreadNotificationsCountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUnreadNotificationsCountQuery,
    GetUnreadNotificationsCountQueryVariables
  >(GetUnreadNotificationsCountDocument, options);
}
export function useGetUnreadNotificationsCountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUnreadNotificationsCountQuery,
    GetUnreadNotificationsCountQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUnreadNotificationsCountQuery,
    GetUnreadNotificationsCountQueryVariables
  >(GetUnreadNotificationsCountDocument, options);
}
export function useGetUnreadNotificationsCountSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUnreadNotificationsCountQuery,
        GetUnreadNotificationsCountQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUnreadNotificationsCountQuery,
    GetUnreadNotificationsCountQueryVariables
  >(GetUnreadNotificationsCountDocument, options);
}
export type GetUnreadNotificationsCountQueryHookResult = ReturnType<
  typeof useGetUnreadNotificationsCountQuery
>;
export type GetUnreadNotificationsCountLazyQueryHookResult = ReturnType<
  typeof useGetUnreadNotificationsCountLazyQuery
>;
export type GetUnreadNotificationsCountSuspenseQueryHookResult = ReturnType<
  typeof useGetUnreadNotificationsCountSuspenseQuery
>;
export type GetUnreadNotificationsCountQueryResult = Apollo.QueryResult<
  GetUnreadNotificationsCountQuery,
  GetUnreadNotificationsCountQueryVariables
>;
export const GetPublicCommentsDocument = gql`
  query GetPublicComments($filters: PublicCommentFilters, $pagination: PaginationInput) {
    publicComments(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...PublicCommentFragment
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
  ${PublicCommentFragmentFragmentDoc}
`;

/**
 * __useGetPublicCommentsQuery__
 *
 * To run a query within a React component, call `useGetPublicCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPublicCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPublicCommentsQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetPublicCommentsQuery(
  baseOptions?: Apollo.QueryHookOptions<GetPublicCommentsQuery, GetPublicCommentsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetPublicCommentsQuery, GetPublicCommentsQueryVariables>(
    GetPublicCommentsDocument,
    options
  );
}
export function useGetPublicCommentsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetPublicCommentsQuery, GetPublicCommentsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetPublicCommentsQuery, GetPublicCommentsQueryVariables>(
    GetPublicCommentsDocument,
    options
  );
}
export function useGetPublicCommentsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetPublicCommentsQuery, GetPublicCommentsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetPublicCommentsQuery, GetPublicCommentsQueryVariables>(
    GetPublicCommentsDocument,
    options
  );
}
export type GetPublicCommentsQueryHookResult = ReturnType<typeof useGetPublicCommentsQuery>;
export type GetPublicCommentsLazyQueryHookResult = ReturnType<typeof useGetPublicCommentsLazyQuery>;
export type GetPublicCommentsSuspenseQueryHookResult = ReturnType<
  typeof useGetPublicCommentsSuspenseQuery
>;
export type GetPublicCommentsQueryResult = Apollo.QueryResult<
  GetPublicCommentsQuery,
  GetPublicCommentsQueryVariables
>;
