import { pgTable, index, foreignKey, varchar, text, timestamp, jsonb, boolean, integer, unique, check, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const comments = pgTable("comments", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }),
	content: text().notNull(),
	targetId: varchar("target_id", { length: 255 }).notNull(),
	targetType: varchar("target_type", { length: 50 }).notNull(),
	parentId: varchar("parent_id", { length: 255 }),
	parentType: varchar("parent_type", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("idx_comments_parent_id").using("btree", table.parentId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "comments_user_id_users_id_fk"
		}),
]);

export const nbaPlayers = pgTable("nba_players", {
	id: text().primaryKey().notNull(),
	firstname: varchar().notNull(),
	lastname: varchar().notNull(),
	birth: jsonb(),
	nba: jsonb(),
	height: jsonb(),
	weight: jsonb(),
	college: varchar(),
	affiliation: varchar(),
	jersey: varchar(),
	active: boolean().default(true),
	pos: varchar(),
	seasonsActive: jsonb("seasons_active"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("idx_nba_players_seasons").using("btree", table.seasonsActive.asc().nullsLast().op("jsonb_ops")),
]);

export const teamH2H = pgTable("team_h2h", {
	id: varchar({ length: 255 }).default('01970ac0-7258-7689-90c9-74e3b94664a0-mb4k8leg-6e6p7l73jt6-23fu').primaryKey().notNull(),
	team1Id: varchar("team1_id", { length: 255 }).notNull(),
	team2Id: varchar("team2_id", { length: 255 }).notNull(),
	seasonId: integer("season_id").notNull(),
	last5Games: text("last_5_games").array().default([""]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.team1Id],
			foreignColumns: [teams.id],
			name: "team_h2h_team1_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.team2Id],
			foreignColumns: [teams.id],
			name: "team_h2h_team2_id_teams_id_fk"
		}),
]);

export const teams = pgTable("teams", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	name: varchar({ length: 255 }).notNull(),
	abbreviation: varchar({ length: 10 }).notNull(),
	city: varchar({ length: 255 }).notNull(),
	state: varchar({ length: 255 }).notNull(),
	country: varchar({ length: 255 }).notNull(),
	conference: varchar({ length: 255 }),
	division: varchar({ length: 255 }),
	logoUrl: varchar("logo_url", { length: 255 }),
	primaryColor: varchar("primary_color", { length: 7 }),
	secondaryColor: varchar("secondary_color", { length: 7 }),
	isActive: boolean("is_active").default(true).notNull(),
});

export const friendships = pgTable("friendships", {
	id: varchar({ length: 255 }).default('01970ac0-7251-728c-9b4b-3704d91aae0e-mb4k8le9-c8x43h2i0n-23fu').primaryKey().notNull(),
	friendId: varchar("friend_id", { length: 255 }),
	userId: varchar("user_id", { length: 255 }),
	status: varchar({ length: 50 }).default('PENDING').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.friendId],
			foreignColumns: [users.id],
			name: "friendships_friend_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "friendships_user_id_users_id_fk"
		}),
	unique("friendships_friend_id_user_id_unique").on(table.friendId, table.userId),
]);

export const users = pgTable("users", {
	id: varchar({ length: 255 }).default('01970ac0-7250-70d0-920f-942a9bee90cf-mb4k8le8-t27aw697m7q-23fu').primaryKey().notNull(),
	username: varchar({ length: 255 }).notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }).notNull(),
	emailAddress: varchar("email_address", { length: 255 }).notNull(),
	imageUrl: text("image_url").notNull(),
	inboundFriendshipIds: text("inbound_friendship_ids").array().default([""]).notNull(),
	outboundFriendshipIds: text("outbound_friendship_ids").array().default([""]).notNull(),
	banned: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).notNull(),
	timestamp: timestamp({ precision: 6, withTimezone: true, mode: 'string' }).notNull(),
	lastSignInAt: timestamp("last_sign_in_at", { precision: 6, withTimezone: true, mode: 'string' }),
	passwordEnabled: boolean("password_enabled").default(false).notNull(),
	twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	emailVerificationStrategy: varchar("email_verification_strategy", { length: 50 }),
	externalId: varchar("external_id", { length: 255 }),
	externalAccounts: jsonb("external_accounts").default([]).notNull(),
	deletedAt: timestamp("deleted_at", { precision: 6, withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("users_email_address_unique").on(table.emailAddress),
]);

export const gameLogs = pgTable("game_logs", {
	id: varchar({ length: 255 }).default('01970ac0-7258-7689-90c9-70d95b13aa17-mb4k8leg-efgjtmxz37d-23fu').primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }),
	gameId: text("game_id").notNull(),
	watchedSetting: varchar("watched_setting", { length: 50 }).default('tv').notNull(),
	watchedDate: timestamp("watched_date", { precision: 6, withTimezone: true, mode: 'string' }).notNull(),
	watchedLocation: text("watched_location").default('),
	ratingForGame: integer("rating_for_game").notNull(),
	ratingStars: text("rating_stars").default('),
	watchedCount: integer("watched_count").default(0).notNull(),
	notes: text().default('),
	tags: text().array().default([""]),
	classification: varchar({ length: 255 }).default('PROTECTED').notNull(),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { precision: 6, withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_game_logs_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "game_logs_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.gameId],
			foreignColumns: [nbaGames.id],
			name: "game_logs_game_id_nba_games_id_fk"
		}),
	check("game_logs_classification_check", sql`(classification)::text = ANY ((ARRAY['PRIVATE'::character varying, 'PROTECTED'::character varying, 'PUBLIC'::character varying])::text[])`),
]);

export const gameRatings = pgTable("game_ratings", {
	id: varchar({ length: 255 }).default('01970ac0-7258-7689-90c9-6fc2e356c8df-mb4k8leg-zvn0g9iqn8-23fu').primaryKey().notNull(),
	gameId: text("game_id").notNull(),
	averageRating: numeric("average_rating", { precision: 3, scale:  2 }).default('0.00').notNull(),
	totalRatings: integer("total_ratings").default(0).notNull(),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("game_ratings_game_id_unique").on(table.gameId),
]);

export const gameStats = pgTable("game_stats", {
	id: varchar({ length: 255 }).default('01970ac0-7258-7689-90c9-66e8885bdf82-mb4k8leg-u2rxpk5mdyo-23fu').primaryKey().notNull(),
	gameId: varchar("game_id", { length: 255 }).notNull(),
	seasonId: integer("season_id").notNull(),
	homeTeamId: varchar("home_team_id", { length: 255 }).notNull(),
	awayTeamId: varchar("away_team_id", { length: 255 }).notNull(),
	gameDate: timestamp("game_date", { mode: 'string' }).notNull(),
	homeScore: integer("home_score"),
	awayScore: integer("away_score"),
	status: varchar({ length: 50 }).notNull(),
	homeFastBreakPoints: integer("home_fast_break_points"),
	homePointsInPaint: integer("home_points_in_paint"),
	homeBiggestLead: integer("home_biggest_lead"),
	homeSecondChancePoints: integer("home_second_chance_points"),
	homePointsOffTurnovers: integer("home_points_off_turnovers"),
	homeLongestRun: integer("home_longest_run"),
	homeFgm: integer("home_fgm"),
	homeFga: integer("home_fga"),
	homeFgp: numeric("home_fgp", { precision: 5, scale:  2 }),
	homeFtm: integer("home_ftm"),
	homeFta: integer("home_fta"),
	homeFtp: numeric("home_ftp", { precision: 5, scale:  2 }),
	homeTpm: integer("home_tpm"),
	homeTpa: integer("home_tpa"),
	homeTpp: numeric("home_tpp", { precision: 5, scale:  2 }),
	homeOffReb: integer("home_off_reb"),
	homeDefReb: integer("home_def_reb"),
	homeTotReb: integer("home_tot_reb"),
	homeAssists: integer("home_assists"),
	homePFouls: integer("home_p_fouls"),
	homeSteals: integer("home_steals"),
	homeTurnovers: integer("home_turnovers"),
	homeBlocks: integer("home_blocks"),
	homePlusMinus: integer("home_plus_minus"),
	homeMinutes: varchar("home_minutes", { length: 10 }),
	awayFastBreakPoints: integer("away_fast_break_points"),
	awayPointsInPaint: integer("away_points_in_paint"),
	awayBiggestLead: integer("away_biggest_lead"),
	awaySecondChancePoints: integer("away_second_chance_points"),
	awayPointsOffTurnovers: integer("away_points_off_turnovers"),
	awayLongestRun: integer("away_longest_run"),
	awayFgm: integer("away_fgm"),
	awayFga: integer("away_fga"),
	awayFgp: numeric("away_fgp", { precision: 5, scale:  2 }),
	awayFtm: integer("away_ftm"),
	awayFta: integer("away_fta"),
	awayFtp: numeric("away_ftp", { precision: 5, scale:  2 }),
	awayTpm: integer("away_tpm"),
	awayTpa: integer("away_tpa"),
	awayTpp: numeric("away_tpp", { precision: 5, scale:  2 }),
	awayOffReb: integer("away_off_reb"),
	awayDefReb: integer("away_def_reb"),
	awayTotReb: integer("away_tot_reb"),
	awayAssists: integer("away_assists"),
	awayPFouls: integer("away_p_fouls"),
	awaySteals: integer("away_steals"),
	awayTurnovers: integer("away_turnovers"),
	awayBlocks: integer("away_blocks"),
	awayPlusMinus: integer("away_plus_minus"),
	awayMinutes: varchar("away_minutes", { length: 10 }),
	stats: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.gameId],
			foreignColumns: [nbaGames.id],
			name: "game_stats_game_id_nba_games_id_fk"
		}),
	foreignKey({
			columns: [table.seasonId],
			foreignColumns: [seasons.id],
			name: "game_stats_season_id_seasons_id_fk"
		}),
	foreignKey({
			columns: [table.homeTeamId],
			foreignColumns: [teams.id],
			name: "game_stats_home_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.awayTeamId],
			foreignColumns: [teams.id],
			name: "game_stats_away_team_id_teams_id_fk"
		}),
	unique("game_stats_game_id_unique").on(table.gameId),
]);

export const games = pgTable("games", {
	id: varchar({ length: 255 }).default('01970ac0-7258-7689-90c9-68c90400d1df-mb4k8leg-1mos21kerwn-23fu').primaryKey().notNull(),
	gameType: varchar("game_type", { length: 50 }).default('nba').notNull(),
	nbaGameId: text("nba_game_id"),
	date: timestamp({ mode: 'string' }).notNull(),
	homeTeamId: varchar("home_team_id", { length: 255 }).notNull(),
	awayTeamId: varchar("away_team_id", { length: 255 }).notNull(),
	homeScore: integer("home_score"),
	awayScore: integer("away_score"),
	status: varchar({ length: 50 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.nbaGameId],
			foreignColumns: [nbaGames.id],
			name: "games_nba_game_id_nba_games_id_fk"
		}),
	foreignKey({
			columns: [table.homeTeamId],
			foreignColumns: [teams.id],
			name: "games_home_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.awayTeamId],
			foreignColumns: [teams.id],
			name: "games_away_team_id_teams_id_fk"
		}),
]);

export const nbaGames = pgTable("nba_games", {
	id: varchar({ length: 255 }).default('01970ac0-7256-76ff-bdac-8292c1a6185a-mb4k8lee-qfzodb33h1a-23fu').primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	league: text().notNull(),
	seasonId: integer("season_id").notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	homeTeamId: varchar("home_team_id", { length: 255 }).notNull(),
	awayTeamId: varchar("away_team_id", { length: 255 }).notNull(),
	homeScore: integer("home_score"),
	awayScore: integer("away_score"),
	status: varchar({ length: 50 }).notNull(),
	stage: integer().notNull(),
	periods: jsonb(),
	arena: jsonb(),
	teams: jsonb(),
	scores: jsonb(),
	officials: jsonb(),
	timesTied: integer("times_tied"),
	leadChanges: integer("lead_changes"),
	nugget: text(),
	season: integer().notNull(),
}, (table) => [
	index("idx_nba_games_season").using("btree", table.seasonId.asc().nullsLast().op("int4_ops")),
]);

export const nbaPlayerStats = pgTable("nba_player_stats", {
	id: text().primaryKey().notNull(),
	playerId: text("player_id").notNull(),
	gameId: text("game_id").notNull(),
	teamId: text("team_id").notNull(),
	points: integer(),
	assists: integer(),
	rebounds: integer(),
	steals: integer(),
	blocks: integer(),
	turnovers: integer(),
	fouls: integer(),
	minutes: varchar(),
	fieldGoalsMade: integer("field_goals_made"),
	fieldGoalsAttempted: integer("field_goals_attempted"),
	threePointersMade: integer("three_pointers_made"),
	threePointersAttempted: integer("three_pointers_attempted"),
	freeThrowsMade: integer("free_throws_made"),
	freeThrowsAttempted: integer("free_throws_attempted"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.playerId],
			foreignColumns: [nbaPlayers.id],
			name: "nba_player_stats_player_id_nba_players_id_fk"
		}),
	foreignKey({
			columns: [table.gameId],
			foreignColumns: [nbaGames.id],
			name: "nba_player_stats_game_id_nba_games_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "nba_player_stats_team_id_teams_id_fk"
		}),
]);

export const seasons = pgTable("seasons", {
	id: integer().primaryKey().notNull(),
	year: integer().notNull(),
	displayYear: text("display_year").notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	isCurrent: boolean("is_current").default(false).notNull(),
	isPlayoffs: boolean("is_playoffs").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }),
	type: varchar({ length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	targetId: varchar("target_id", { length: 255 }),
	targetType: varchar("target_type", { length: 50 }),
	read: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_users_id_fk"
		}),
]);

export const reactions = pgTable("reactions", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }),
	targetId: varchar("target_id", { length: 255 }).notNull(),
	targetType: varchar("target_type", { length: 50 }).notNull(),
	emoji: varchar({ length: 50 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("idx_reactions_target_id").using("btree", table.targetId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "reactions_user_id_users_id_fk"
		}),
]);
