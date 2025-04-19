import { gql } from "@apollo/client";

export const typeDefs = gql`
  scalar DateTime

  # Input Types
  input GameFilters {
    season: String
    date: String
    team: String
  }

  input PaginationInput {
    first: Int
    after: String
    last: Int
    before: String
  }

  input TeamFilters {
    conference: String
    division: String
    code: String
  }

  input PlayerFilters {
    team: String
    season: String
    country: String
  }

  # Enums
  enum Position {
    PG
    SG
    SF
    PF
    C
    F
    G
    CF
    FC
    GF
    FG
  }

  enum Conference {
    East
    West
    California
    summer
    Utah
  }

  enum Division {
    Atlantic
    Central
    Southeast
    Northwest
    Pacific
    Southwest
  }

  enum GameStatus {
    Scheduled
    InProgress
    Finished
  }

  enum PlayerSort {
    POINTS
    REBOUNDS
    ASSISTS
    STEALS
    BLOCKS
  }

  enum TeamSort {
    WINS
    LOSSES
    WIN_PERCENTAGE
    POINTS_PER_GAME
  }

  enum SortOption {
    ASC
    DESC
  }

  enum FriendshipStatus {
    pending
    accepted
    rejected
    connected
    severed
  }

  enum watched_setting {
    tv
    arena
    phone
    laptop
    bar
    home
    other
  }

  enum ReactionTargetType {
    game_log
    comment
  }

  # Types
  type Season {
    id: ID!
    name: String!
    startDate: String!
    endDate: String!
    isCurrent: Boolean!
  }

  type LeagueInfo {
    id: ID
    name: String
    type: String
    logo: String
  }

  type Team {
    id: ID!
    name: String!
    nickname: String
    code: String
    city: String
    logo: String
    allStar: Boolean
    nbaFranchise: Boolean
    leagues: TeamLeagues
  }

  type TeamLeagues {
    standard: TeamLeagueInfo
    sacramento: TeamLeagueInfo
    vegas: TeamLeagueInfo
    utah: TeamLeagueInfo
    orlando: TeamLeagueInfo
    africa: TeamLeagueInfo
  }

  type TeamLeagueInfo {
    conference: Conference!
    division: Division
  }

  type Player {
    id: ID!
    firstname: String!
    lastname: String!
    birth: Birth
    nba: NbaInfo
    height: Height
    weight: Weight
    college: String
    affiliation: String
    leagues: PlayerLeagues!
  }

  type PlayerLeagues {
    standard: PlayerLeagueInfo
    sacramento: PlayerLeagueInfo
    vegas: PlayerLeagueInfo
    utah: PlayerLeagueInfo
    orlando: PlayerLeagueInfo
    africa: PlayerLeagueInfo
  }

  type PlayerLeagueInfo {
    jersey: Int
    active: Boolean
    pos: Position
  }

  type Birth {
    date: String
    country: String
  }

  type NbaInfo {
    start: Int
    pro: Int
  }

  type Height {
    feets: String
    inches: String
    meters: String
  }

  type Weight {
    pounds: String
    kilograms: String
  }

  type Game {
    id: ID!
    league: LeagueInfo!
    season: Int!
    date: GameDate!
    stage: Int!
    status: GameStatusInfo!
    periods: GamePeriods!
    arena: Arena!
    teams: GameTeams!
    scores: GameScores
    officials: [String!]!
    timesTied: Int
    leadChanges: Int
    nugget: String
  }

  type GameDate {
    start: String
    end: String
    duration: String
  }

  type GameStatusInfo {
    clock: String
    halftime: Boolean!
    short: Int!
    long: String!
  }

  type GamePeriods {
    current: Int!
    total: Int!
    endOfPeriod: Boolean!
  }

  type Arena {
    name: String!
    city: String
    state: String
    country: String
  }

  type GameTeams {
    visitors: GameTeam!
    home: GameTeam!
  }

  type GameTeam {
    id: Int!
    name: String!
    nickname: String
    code: String
    logo: String
  }

  type GameScores {
    visitors: GameScore!
    home: GameScore!
  }

  type GameScore {
    win: Int
    loss: Int
    series: GameSeries
    linescore: [String]
    points: Int
  }

  type GameSeries {
    win: Int
    loss: Int
  }

  type GameStatistics {
    game_id: Int!
    team: Int!
    playerId: Int!
    points: Int!
    rebounds: Rebounds
    assists: Int
    steals: Int
    blocks: Int
    turnovers: Int
    fouls: Int
    minutes: String
    fieldGoals: ShootingStats
    threePointers: ShootingStats
    freeThrows: ShootingStats
    plusMinus: Int
  }

  type Rebounds {
    total: Int
    offensive: Int
    defensive: Int
  }

  type ShootingStats {
    made: Int
    attempted: Int
    percentage: String
  }

  type TeamStatistics {
    team: Int!
    season: Int
    gamesPlayed: Int
    pointsPerGame: Float
    fieldGoalPercentage: String
    threePointPercentage: String
    freeThrowPercentage: String
    reboundsPerGame: Float
    assistsPerGame: Float
    stealsPerGame: Float
    blocksPerGame: Float
    turnoversPerGame: Float
    foulsPerGame: Float
    plusMinus: Float
  }

  type PlayerStatistics {
    playerId: Int!
    season: Int!
    gamesPlayed: Int!
    pointsPerGame: Float!
    fieldGoalPercentage: String!
    threePointPercentage: String!
    freeThrowPercentage: String!
    reboundsPerGame: Float!
    assistsPerGame: Float!
    stealsPerGame: Float!
    blocksPerGame: Float!
    turnoversPerGame: Float!
    foulsPerGame: Float!
    plusMinus: Float!
    minutesPerGame: String!
    doubleDoubles: Int!
    tripleDoubles: Int!
  }

  type Standing {
    team: Team!
    conference: ConferenceStanding!
    division: DivisionStanding!
    win: WinLossRecord!
    loss: WinLossRecord!
    gamesBehind: String!
    streak: Int!
    lastTen: WinLossRecord!
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
    gamesBehind: String!
  }

  type WinLossRecord {
    home: Int!
    away: Int!
    total: Int!
    percentage: String!
    lastTen: Int!
  }

  type User {
    id: ID!
    username: String!
    first_name: String!
    last_name: String!
    email_address: String!
    image_url: String
    created_at: String!
    updated_at: String!
    timestamp: String!
    banned: Boolean!
    inbound_friendship_ids: [ID]
    outbound_friendship_ids: [ID]
    initiated_friendships: [Friendship]
    received_friendships: [Friendship]
    friendships: [Friendship]
    gameLogs: [GameLog]
  }

  type Friendship {
    id: ID!
    subscriber_id: ID!
    user_id: ID!
    status: FriendshipStatus!
    timestamp: String!
    initiator: User!
    responder: User!
  }

  type GameLog {
    id: ID!
    user_id: ID!
    game_id: ID!
    watched_setting: String!
    watched_date: String!
    watched_location: String!
    rating_for_game: Int!
    rating_stars: String!
    watched_count: Int!
    created_at: String!
    updated_at: String!
    user: User!
    game: Game!
    comments: [Comment]
  }

  type Comment {
    id: ID!
    user_id: ID!
    parent_id: ID!
    content: String!
    created_at: String!
    updated_at: String!
    game_log: GameLog
  }

  type Reaction {
    id: ID!
    user_id: ID!
    target_type: ReactionTargetType!
    target_id: ID!
    emoji: String!
    created_at: String!
    updated_at: String!
  }

  type GameRating {
    id: ID!
    game_id: String!
    average_rating: String!
    total_ratings: Int!
    created_at: DateTime!
    updated_at: DateTime!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type GameLogConnection {
    edges: [GameLogEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type GameLogEdge {
    node: GameLog!
    cursor: String!
  }

  # Query Types
  type Query {
    seasons: [Season!]!
    leagues: [LeagueInfo!]!
    games(filters: GameFilters): [Game!]!
    teams(filters: TeamFilters): [Team!]!
    players(filters: PlayerFilters): [Player!]!
    player(id: ID!): Player
    standings: [Standing!]!
    game_stats(game_id: ID!): [GameStatistics!]!
    player_game_stats(game_id: ID!, player_id: ID!): GameStatistics
    team_game_stats(game_id: ID!, team: ID!): [GameStatistics!]!
    team_stats(team: ID!, season: Int!): TeamStatistics
    all_team_stats(season: Int!): [TeamStatistics!]!
    player_stats(player_id: ID!, season: Int!): PlayerStatistics
    all_player_stats(season: Int!): [PlayerStatistics!]!
    player_stats_by_team(team: ID!, season: Int!): [PlayerStatistics!]!
    top_players(stat: String!, season: Int!, limit: Int): [PlayerStatistics!]!
    comments(parent_id: ID!): [Comment!]!
    comment(id: ID!): Comment
    users: [User!]!
    user(id: ID!): User
    friendships: [Friendship!]!
    friendship(id: ID!): Friendship
    game_logs(pagination: PaginationInput): GameLogConnection!
    game_log(id: ID!): GameLog
    game_rating(game_id: String!): GameRating
    game_ratings(game_ids: [String!]!): [GameRating!]!
    reactions(target_id: ID!): [Reaction!]!
  }

  type Mutation {
    # User mutations
    create_user(
      username: String!
      first_name: String!
      last_name: String!
      email_address: String!
      image_url: String!
    ): User!
    update_user(
      id: ID!
      username: String
      first_name: String
      last_name: String
      email_address: String
      image_url: String
    ): User!
    delete_user(id: ID!): Boolean!

    # Friendship mutations
    create_friendship(subscriber_id: ID!, user_id: ID!): Friendship!
    update_friendship_status(id: ID!, status: FriendshipStatus!): Friendship!
    delete_friendship(id: ID!): Boolean!

    # Game log mutations
    create_game_log(
      user_id: ID!
      game_id: String!
      watched_setting: watched_setting!
      watched_date: String!
      watched_location: String!
      rating_for_game: Int!
      rating_stars: String!
    ): GameLog!
    update_game_log(
      id: ID!
      watched_setting: watched_setting
      watched_date: String
      watched_location: String
      rating_for_game: Int
      rating_stars: String
    ): GameLog!
    delete_game_log(id: ID!): Boolean!

    # Comment mutations
    create_comment(input: CreateCommentInput!): Comment!
    update_comment(id: ID!, input: UpdateCommentInput!): Comment!
    delete_comment(id: ID!): Boolean!

    # Game rating mutations
    create_game_rating(game_id: String!, rating: Int!): GameRating!
    update_game_rating(id: String!, game_id: String!, rating: Int!): GameRating!
    delete_game_rating(id: String!): Boolean!

    # Reaction mutations
    create_reaction(input: CreateReactionInput!): Reaction!
    delete_reaction(id: ID!): Boolean!
  }

  input CreateCommentInput {
    user_id: ID!
    parent_id: ID!
    content: String!
  }

  input UpdateCommentInput {
    content: String!
  }

  input CreateUserInput {
    username: String!
    first_name: String!
    last_name: String!
    email_address: String!
    image_url: String!
  }

  input UpdateUserInput {
    username: String
    first_name: String
    last_name: String
    email_address: String
    image_url: String
  }

  input CreateReactionInput {
    user_id: ID!
    target_type: ReactionTargetType!
    target_id: ID!
    emoji: String!
  }
`;
