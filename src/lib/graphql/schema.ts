import { gql } from '@apollo/client';

export const typeDefs = gql`
  # Custom scalar types
  scalar DateTime
  scalar JSON
  scalar Any
  scalar ID

  # Error types
  type ValidationError {
    field: String!
    message: String!
  }

  type NotFoundError {
    resource: String!
    id: String
    message: String!
  }

  type AuthenticationError {
    message: String!
  }

  type AuthorizationError {
    message: String!
    requiredRole: String
  }

  type RateLimitError {
    message: String!
    retryAfter: Int!
  }

  type BusinessLogicError {
    message: String!
    code: String!
    details: String
  }

  union ErrorResult =
    | ValidationError
    | NotFoundError
    | AuthenticationError
    | AuthorizationError
    | RateLimitError
    | BusinessLogicError

  # Pagination
  input PaginationInput {
    first: Int
    after: String
    last: Int
    before: String
  }

  union PaginatedItem = Game | GameLog | Comment | Player | PlayerStats | Team | User

  type PaginatedResponse {
    items: [PaginatedItem!]!
    total: Int!
    hasMore: Boolean!
    nextCursor: String
  }

  type GameLogsResponse {
    items: [GameLog!]!
    total: Int!
    hasMore: Boolean!
    nextCursor: String
  }

  # Response types
  type MutationResponse {
    success: Boolean!
    errors: [ErrorResult!]
  }

  type CreateGameLogResponse {
    gameLog: GameLog
    errors: [ErrorResult!]
  }

  type UpdateGameLogResponse {
    gameLog: GameLog
    errors: [ErrorResult!]
  }

  type DeleteGameLogResponse {
    success: Boolean!
    errors: [ErrorResult!]
  }

  type CreateCommentResponse {
    comment: Comment
    errors: [ErrorResult!]
  }

  type UpdateCommentResponse {
    comment: Comment
    errors: [ErrorResult!]
  }

  type DeleteCommentResponse {
    success: Boolean!
    errors: [ErrorResult!]
  }

  type CreateReactionResponse {
    reaction: Reaction
    errors: [ErrorResult!]
  }

  type DeleteReactionResponse {
    success: Boolean!
    errors: [ErrorResult!]
  }

  type DeleteUserResponse {
    success: Boolean!
    errors: [ErrorResult!]
  }

  type UpdatePlayerResponse {
    player: Player
    errors: [ErrorResult!]
  }

  type FavoritePlayerResponse {
    player: Player
    errors: [ErrorResult!]
  }

  type UpdateFriendshipStatusResponse {
    friendship: Friendship
    errors: [ErrorResult!]
  }

  type SendFriendRequestResponse {
    friendship: Friendship
    errors: [ErrorResult!]
  }

  type AcceptFriendRequestResponse {
    friendship: Friendship
    errors: [ErrorResult!]
  }

  type RejectFriendRequestResponse {
    friendship: Friendship
    errors: [ErrorResult!]
  }

  type RemoveFriendResponse {
    success: Boolean!
    errors: [ErrorResult!]
  }

  # Input types with validation
  input CreateGameInput {
    gameType: String!
    nbaGameId: String
    date: DateTime!
    homeTeamId: String!
    awayTeamId: String!
    homeScore: Int
    awayScore: Int
    status: String!
  }

  input UpdateFriendshipStatusInput {
    friendshipId: String!
    status: FriendshipStatus!
  }

  input GameFilters {
    userId: String
    gameId: String
    classification: Classification
    season: String
    dateRange: DateRange
    teamId: String
    status: GameStatus
    homeTeamId: String
    awayTeamId: String
    minScore: Int
    maxScore: Int
    officials: [String!]
    timesTiedMin: Int
    timesTiedMax: Int
    leadChangesMin: Int
    leadChangesMax: Int
    pagination: PaginationInput
  }

  input DateRange {
    start: DateTime!
    end: DateTime!
  }

  input CreateGameLogInput {
    userId: String!
    gameId: String!
    watchedSetting: WatchedSettingType!
    watchedDate: DateTime!
    watchedLocation: String
    ratingForGame: Int
    ratingStars: String
    watchedCount: Int
    notes: String
    tags: [String]
    classification: Classification!
  }

  input UpdateGameLogInput {
    watchedSetting: WatchedSettingType
    watchedDate: DateTime
    watchedLocation: String
    ratingForGame: Int
    ratingStars: String
    watchedCount: Int
    notes: String
    tags: [String]
    classification: Classification
  }

  input CreateCommentInput {
    userId: String!
    parentId: String!
    parentType: ParentType!
    content: String!
  }

  input UpdateCommentInput {
    content: String!
  }

  input CreateReactionInput {
    userId: String!
    targetId: String!
    targetType: TargetType!
    emoji: ReactionEmojiType!
  }

  input UpdatePlayerInput {
    firstName: String
    lastName: String
    teamId: String
    birth_date: DateTime
    birth_country: String
    nba_start: Int
    nba_pro_years: Int
    height_feet: String
    height_inches: String
    height_meters: String
    weight_pounds: Int
    weight_kilograms: Float
    college: String
    affiliation: String
    jersey_number: Int
    active: Boolean
    position: String
  }

  input BirthInput {
    date: String
    country: String
  }

  input HeightInput {
    feets: String
    inches: String
    meters: String
  }

  input WeightInput {
    pounds: String
    kilograms: String
  }

  input TeamInfoInput {
    id: Int
    name: String
    nickname: String
    code: String
    city: String
    logo: String
    conference: String
    division: String
  }

  # Enums
  enum WatchedSetting {
    TV
    ARENA
    PHONE
    LAPTOP
    BAR
    HOME
    OTHER
  }

  enum Classification {
    PRIVATE
    PROTECTED
    PUBLIC
  }

  enum ParentType {
    comment
    game_log
  }

  enum TargetType {
    comment
    game_log
  }

  enum ReactionEmojiType {
    LIKE
    LOVE
    LAUGH
    WOW
    SAD
    ANGRY
    FIRE
    CLAP
    EYES
    ROCKET
    MUSCLE
    GOAT
    BULLSEYE
    THUMBS_DOWN
    BASKETBALL
    SOCCER
    FOOTBALL
    BASEBALL
    TENNIS
    GOLF
  }

  # Types
  type GameLogStats {
    total: Int!
    byClassification: JSON!
    averageRating: Float!
    byMonth: JSON!
  }

  union GameLogOrComment = GameLog | Comment

  type Game {
    id: ID!
    date: String!
    status: String!
    arena: Arena!
    league: String!
    season: Int!
    stage: Int!
    periods: [Int!]
    scores: [Int!]
    officials: [String!]
    timesTied: Int
    leadChanges: Int
    nugget: String
    createdAt: String!
    updatedAt: String!
    homeTeamId: String!
    awayTeamId: String!
    teams: JSON
    isCompleted: Boolean!
  }

  type GameDate {
    start: String
    end: String
    duration: String
  }

  type GamePeriods {
    current: Int
    total: Int
    endOfPeriod: Boolean
  }

  type Arena {
    name: String
    city: String
    state: String
    country: String
  }

  type Teams {
    visitors: TeamSummary!
    home: TeamSummary!
  }

  type TeamSummary {
    id: String
    name: String
    nickname: String
    code: String
    logo: String
  }

  type Scores {
    visitors: TeamScore!
    home: TeamScore!
  }

  type TeamScore {
    win: Int
    loss: Int
    series: SeriesScore
    linescore: [Int]
    points: Int
  }

  type SeriesScore {
    win: Int
    loss: Int
  }

  type Player {
    id: ID!
    firstname: String!
    lastname: String!
    birth: JSON
    nba: JSON
    height: JSON
    weight: JSON
    college: String
    affiliation: String
    jersey: String
    active: Boolean!
    pos: String
    createdAt: String!
    updatedAt: String!
  }

  type SeasonTeam {
    season: Int!
    teams: [String!]!
  }

  type BirthInfo {
    date: String
    country: String
  }

  type NbaInfo {
    start: Int
    pro: Int
  }

  type HeightInfo {
    feets: String
    inches: String
    meters: String
  }

  type WeightInfo {
    pounds: String
    kilograms: String
  }

  type LeaguesInfo {
    standard: LeagueDetails
    vegas: LeagueDetails
    utah: LeagueDetails
    sacramento: LeagueDetails
  }

  type LeagueDetails {
    jersey: String
    active: Boolean
    pos: String
    conference: String
    division: String
  }

  type Team {
    id: ID!
    name: String!
    abbreviation: String!
    city: String!
    state: String
    country: String!
    conference: String
    division: String
    logoUrl: String
    primaryColor: String
    secondaryColor: String
  }

  type GameStatistics {
    fastBreakPoints: Int
    pointsInPaint: Int
    biggestLead: Int
    secondChancePoints: Int
    pointsOffTurnovers: Int
    longestRun: Int
    points: Int
    fgm: Int
    fga: Int
    fgp: String
    ftm: Int
    fta: Int
    ftp: String
    tpm: Int
    tpa: Int
    tpp: String
    offReb: Int
    defReb: Int
    totReb: Int
    assists: Int
    pFouls: Int
    steals: Int
    turnovers: Int
    blocks: Int
    plusMinus: Int
    min: String
  }

  type PlayerStats {
    id: ID!
    playerId: String!
    gameId: String!
    teamId: String!
    points: Int!
    assists: Int!
    rebounds: Int!
    steals: Int!
    blocks: Int!
    turnovers: Int!
    fouls: Int!
    minutes: Int!
    field_goals_made: Int!
    field_goals_attempted: Int!
    three_pointers_made: Int!
    three_pointers_attempted: Int!
    free_throws_made: Int!
    free_throws_attempted: Int!
    createdAt: String!
    updatedAt: String!
  }

  type TeamStats {
    games: Int
    fastBreakPoints: Int
    pointsInPaint: Int
    biggestLead: Int
    secondChancePoints: Int
    pointsOffTurnovers: Int
    longestRun: Int
    points: Int
    fgm: Int
    fga: Int
    fgp: String
    ftm: Int
    fta: Int
    ftp: String
    tpm: Int
    tpa: Int
    tpp: String
    offReb: Int
    defReb: Int
    totReb: Int
    assists: Int
    pFouls: Int
    steals: Int
    turnovers: Int
    blocks: Int
    plusMinus: Int
  }

  type GameLog {
    id: ID!
    userId: String!
    gameId: String!
    watchedSetting: String!
    watchedDate: String!
    watchedLocation: String
    ratingForGame: Int
    watchedCount: Int
    notes: String
    tags: [String!]
    classification: String
    createdAt: String!
    updatedAt: String!
    deletedAt: String
    comments(pagination: PaginationInput): PaginatedResponse!
    reactions(pagination: PaginationInput): PaginatedResponse!
  }

  type Comment {
    id: ID!
    userId: String!
    parentId: String
    parentType: String
    content: String!
    createdAt: String!
    updatedAt: String!
    deletedAt: String
    user: UserSummary
    reactions: [Reaction!]!
    replies: [Comment!]!
  }

  type Reaction {
    id: String!
    user: User!
    targetId: String!
    targetType: String!
    emoji: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    target: GameLogOrComment!
  }

  type User {
    id: ID!
    username: String!
    emailAddress: String!
    imageUrl: String
    createdAt: String!
    updatedAt: String!
    comments: [Comment!]!
    gameLogs: [GameLog!]!
    initiated_friendships: [Friendship!]!
    reactions: [Reaction!]!
    friendships: [Friendship!]!
  }

  type UserSummary {
    id: String!
    username: String
    imageUrl: String
    firstName: String
    lastName: String
    emailAddress: String
  }

  # Queries
  type Query {
    seasons: [Season!]!
    leagues: [League!]!
    games(filters: GameFilters, pagination: PaginationInput): PaginatedResponse!
    teams(filters: TeamFilters, pagination: PaginationInput): [Team!]!
    players(filters: PlayerFilters, pagination: PaginationInput): PaginatedResponse!
    player(id: String!): Player
    standings: [Standing!]!
    users(pagination: PaginationInput): PaginatedResponse!
    user(id: String!): User
    friendships(userId: String!): [User!]!
    friendship(id: String!): Friendship
    gameLogs(filters: GameLogFilters, pagination: PaginationInput): PaginatedResponse!
    gameLog(id: String!): GameLog
    gameLogStats(filters: GameLogFilters): GameLogStats!
    comments(filters: CommentFilters): [Comment!]!
    liveGames: [Game!]!
    teamStats(teamId: String!, sort: GameTeamSortInput, pagination: PaginationInput): [TeamStats!]!
    game(id: String!): Game
    gameStats(gameId: String!): GameStats
    playerGameStats(gameId: String!, playerId: String!): PlayerGameStats
    teamGameStats(gameId: String!, team: String!): TeamGameStats
    allTeamStats(season: Int!): [TeamStats!]!
    playerStats(playerId: String!, season: Int!): PlayerStats
    allPlayerStats(season: Int!): [PlayerStats!]!
    playerStatsByTeam(team: String!, season: Int!): [PlayerStats!]!
    topPlayers(season: Int!): [Player!]!
    reactions(targetId: String!, targetType: TargetType!): [Reaction!]!
    messages(groupId: String!, pagination: PaginationInput): PaginatedResponse!
    groupMembers(groupId: String!, pagination: PaginationInput): PaginatedResponse!
    gameLogs(filters: GqlGameLogFilters, pagination: PaginationInput): GameLogsResponse!
    gameLog(userId: String!, gameId: String!): GameLog
    comments(parentId: String!): [Comment!]!
    reactions(targetId: String!): [Reaction!]!
  }

  # Mutations
  type Mutation {
    createGameLog(input: CreateGameLogInput!): CreateGameLogResponse!
    updateGameLog(id: String!, input: UpdateGameLogInput!): UpdateGameLogResponse!
    deleteGameLog(id: String!): DeleteGameLogResponse!
    createComment(input: CreateCommentInput!): CreateCommentResponse!
    updateComment(id: String!, input: UpdateCommentInput!): UpdateCommentResponse!
    deleteComment(id: String!): DeleteCommentResponse!
    createReaction(input: CreateReactionInput!): CreateReactionResponse!
    deleteReaction(id: String!): DeleteReactionResponse!
    updatePlayer(id: String!, input: UpdatePlayerInput!): UpdatePlayerResponse!
    favoritePlayer(id: String!): FavoritePlayerResponse!
    updateTeam(input: UpdateTeamInput!): UpdateTeamResponse!
    favoriteTeam(teamId: String!): FavoriteTeamResponse!
    createFriendship(input: CreateFriendshipInput!): CreateFriendshipResponse!
    updateFriendshipStatus(input: UpdateFriendshipStatusInput!): UpdateFriendshipStatusResponse!
    sendFriendRequest(userId: String!): SendFriendRequestResponse!
    acceptFriendRequest(friendshipId: String!): AcceptFriendRequestResponse!
    rejectFriendRequest(friendshipId: String!): RejectFriendRequestResponse!
    removeFriend(friendshipId: String!): RemoveFriendResponse!
    createGame(input: CreateGameInput!): CreateGameResponse!
    deleteUser(id: String!): DeleteUserResponse!
    updatePlayerStats(id: String!, input: UpdatePlayerStatsInput!): UpdatePlayerStatsResponse!
    deletePlayerStats(id: String!): DeletePlayerStatsResponse!
    createMessage(input: CreateMessageInput!): CreateMessageResponse!
  }

  # Additional types for NBA data
  type Season {
    id: String!
    year: String!
    current: Boolean!
  }

  type League {
    id: String!
    name: String!
    type: String!
    logo: String
    country: String
  }

  type Standing {
    league: String!
    season: Int!
    team: Team!
    conference: ConferenceStanding
    division: DivisionStanding
    win: WinLossRecord
    loss: WinLossRecord
    gamesBehind: String
    lastTen: String
    streak: Int
    winStreak: Boolean
  }

  type ConferenceStanding {
    name: String!
    rank: Int!
    win: Int!
    loss: Int!
  }

  type DivisionStanding {
    name: String!
    rank: Int!
    win: Int!
    loss: Int!
  }

  type WinLossRecord {
    home: Int!
    away: Int!
    total: Int!
  }

  type GameStats {
    team: Int!
    season: Int!
    gamesPlayed: Int!
    pointsPerGame: String!
    fieldGoalPercentage: String!
    threePointPercentage: String!
    freeThrowPercentage: String!
    reboundsPerGame: String!
    assistsPerGame: String!
    stealsPerGame: String!
    blocksPerGame: String!
    turnoversPerGame: String!
    foulsPerGame: String!
    plusMinus: Int!
    statistics: GameStatistics!
    user: User!
    game: Game!
    homeTeam: Team!
    awayTeam: Team!
  }

  type PlayerGameStats {
    player: Player!
    team: Team!
    game: Game!
    points: Int!
    rebounds: Int!
    assists: Int!
    steals: Int!
    blocks: Int!
    turnovers: Int!
    fouls: Int!
    minutes: String!
    fieldGoals: FieldGoalStats!
    freeThrows: FreeThrowStats!
    threePointers: ThreePointerStats!
    player: Player
    pos: string
    min: string
    fgm: number
    fga: number
    fgp: string
    ftm: number
    fta: number
    ftp: string
    tpm: number
    tpa: number
    tpp: string
    offReb: number
    defReb: number
    totReb: number
    assists: number
    pFouls: number
    steals: number
    turnovers: number
    blocks: number
    plusMinus: number
    comment: string
  }

  type FieldGoalStats {
    made: Int!
    attempted: Int!
    percentage: String!
  }

  type FreeThrowStats {
    made: Int!
    attempted: Int!
    percentage: String!
  }

  type ThreePointerStats {
    made: Int!
    attempted: Int!
    percentage: String!
  }

  type TeamGameStats {
    team: Team!
    game: Game!
    points: Int!
    rebounds: Int!
    assists: Int!
    steals: Int!
    blocks: Int!
    turnovers: Int!
    fouls: Int!
    fieldGoals: FieldGoalStats!
    freeThrows: FreeThrowStats!
    threePointers: ThreePointerStats!
  }

  input PlayerFilters {
    teamId: String
    position: String
    active: Boolean
    minPoints: Int
    maxPoints: Int
    minAssists: Int
    maxAssists: Int
    minRebounds: Int
    maxRebounds: Int
    country: String
    team: String
    season: String
    minGames: Int
    minFgPercentage: Float
  }

  input TeamFilters {
    conference: String
    division: String
    code: String
    city: String
    minWins: Int
    maxWins: Int
    minLosses: Int
    maxLosses: Int
    season: String
    minWinPercentage: Float
    minPoints: Int
    maxPointsAllowed: Int
  }

  input SortInput {
    field: String!
    direction: SortDirection!
  }

  enum SortDirection {
    ASC
    DESC
  }

  input GameSortInput {
    field: GameSortField!
    direction: SortDirection!
  }

  enum GameSortField {
    DATE
    SCORE
    STATUS
    TIMES_TIED
    LEAD_CHANGES
  }

  input GameTeamSortInput {
    field: String!
    direction: SortDirection!
  }

  input GamePlayerSortInput {
    field: String!
    direction: SortDirection!
  }

  input CreateFriendshipInput {
    userId: String!
    subscriberId: String!
  }

  input UpdateFriendshipInput {
    status: String!
  }

  type UpdateTeamResponse {
    team: Team
    errors: [ErrorResult!]
  }

  type FavoriteTeamResponse {
    team: Team
    errors: [ErrorResult!]
  }

  enum FriendshipStatus {
    PENDING
    ACCEPTED
    REJECTED
    BLOCKED
  }

  type Friendship {
    id: String!
    subscriberId: String!
    userId: String!
    status: FriendshipStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    initiator: User!
    recipient: User!
  }

  type CreateGameResponse {
    game: Game
    errors: [ErrorResult!]
  }

  type GameStat {
    id: String!
    games_played: Int!
    teamId: String!
    season: Int!
    points: Int!
    rebounds: Int!
    assists: Int!
    steals: Int!
    blocks: Int!
    turnovers: Int!
    fouls: Int!
    field_goals_made: Int!
    field_goals_attempted: Int!
    three_pointers_made: Int!
    three_pointers_attempted: Int!
    free_throws_made: Int!
    free_throws_attempted: Int!
    game: Game!
    user: User!
    homeTeam: Team!
    awayTeam: Team!
  }

  type PlayerStat {
    id: String!
    playerId: String!
    gameId: String!
    teamId: String!
    points: Int!
    rebounds: Int!
    assists: Int!
    steals: Int!
    blocks: Int!
    turnovers: Int!
    fouls: Int!
    minutes: String!
    field_goals_made: Int!
    field_goals_attempted: Int!
    three_pointers_made: Int!
    three_pointers_attempted: Int!
    free_throws_made: Int!
    free_throws_attempted: Int!
  }

  input GameLogFilters {
    userId: String
    gameId: String
    classification: Classification
    season: String
    dateRange: DateRange
    teamId: String
    status: GameStatus
    homeTeamId: String
    awayTeamId: String
    minScore: Int
    maxScore: Int
    officials: [String!]
    timesTiedMin: Int
    timesTiedMax: Int
    leadChangesMin: Int
    leadChangesMax: Int
    pagination: PaginationInput
  }

  input CommentFilters {
    parentId: String
    parentType: ParentType
    userId: String
    pagination: PaginationInput
  }

  input ReactionFilters {
    userId: String
    targetId: String
    targetType: TargetType
    emoji: ReactionEmojiType
    created_before: DateTime
    created_after: DateTime
    deleted: Boolean
  }

  input FriendshipFilters {
    subscriber_id: String
    userId: String
    status: String
    created_before: DateTime
    created_after: DateTime
  }

  input UpdateTeamInput {
    id: String!
    name: String
    nickname: String
    city: String
    logo: String
    all_star: Boolean
    nba_franchise: Boolean
    division: String
    conference: String
  }

  type UpdateTeamResponse {
    team: Team
    errors: [ErrorResult!]
  }

  type FavoriteTeamResponse {
    team: Team
    errors: [ErrorResult!]
  }

  enum FriendshipStatus {
    PENDING
    ACCEPTED
    REJECTED
    BLOCKED
  }

  type CreateFriendshipResponse {
    friendship: Friendship
    errors: [ErrorResult!]
  }

  type UpdateFriendshipStatusResponse {
    friendship: Friendship
    errors: [ErrorResult!]
  }

  type SendFriendRequestResponse {
    friendship: Friendship
    errors: [ErrorResult!]
  }

  type AcceptFriendRequestResponse {
    friendship: Friendship
    errors: [ErrorResult!]
  }

  type RejectFriendRequestResponse {
    friendship: Friendship
    errors: [ErrorResult!]
  }

  type RemoveFriendResponse {
    success: Boolean!
    errors: [ErrorResult!]
  }

  type Friendship {
    id: String!
    subscriberId: String!
    userId: String!
    status: FriendshipStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    initiator: User!
    recipient: User!
  }

  type CreateGameResponse {
    game: Game
    errors: [ErrorResult!]
  }

  type Arena {
    name: String
    city: String
    state: String
    country: String
  }

  type Teams {
    visitors: TeamSummary
    home: TeamSummary
  }

  type TeamSummary {
    id: String
    name: String
    nickname: String
    code: String
    logo: String
  }

  type Scores {
    visitors: TeamScore
    home: TeamScore
  }

  type TeamScore {
    win: Int
    loss: Int
    series: SeriesScore
    linescore: [Int]
    points: Int
  }

  type SeriesScore {
    win: Int
    loss: Int
  }

  type LeaguesInfo {
    standard: LeagueDetails
    vegas: LeagueDetails
    utah: LeagueDetails
    sacramento: LeagueDetails
  }

  type LeagueDetails {
    conference: String
    division: String
    jersey: String
    active: Boolean
    pos: String
  }

  type NbaInfo {
    start: Int
    pro: Int
  }

  input UpdatePlayerStatsInput {
    points: Int
    pos: String
    min: String
    fgm: Int
    fga: Int
    fgp: String
    ftm: Int
    fta: Int
    ftp: String
    tpm: Int
    tpa: Int
    tpp: String
    offReb: Int
    defReb: Int
    totReb: Int
    assists: Int
    pFouls: Int
    steals: Int
    turnovers: Int
    blocks: Int
    plusMinus: Int
    comment: String
  }

  type UpdatePlayerStatsResponse {
    playerStats: PlayerStats
    errors: [ErrorResult!]
  }

  type DeletePlayerStatsResponse {
    success: Boolean!
    errors: [ErrorResult!]
  }

  input CreateMessageInput {
    groupId: String!
    content: String!
  }

  type Message {
    id: String!
    content: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
    reactions: [Reaction!]
  }

  type Group {
    id: String!
    name: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
    members: [GroupMember!]!
  }

  type GroupMember {
    id: String!
    role: GroupRole!
    joinedAt: DateTime!
    user: User!
  }

  enum GroupRole {
    ADMIN
    MODERATOR
    MEMBER
  }

  type CreateMessageResponse {
    message: Message
    errors: [ErrorResult!]
  }
`;
