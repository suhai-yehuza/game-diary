CREATE TABLE "comments" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01978c09-627e-744d-ac4e-2381750662fd' NOT NULL,
	"userId" varchar(255),
	"parentId" varchar(255) NOT NULL,
	"parentType" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01978c09-627e-744d-ac4e-1f866ab39942' NOT NULL,
	"friendId" varchar(255),
	"userId" varchar(255),
	"status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone DEFAULT null,
	CONSTRAINT "friendships_friendId_userId_unique" UNIQUE("friendId","userId")
);
--> statement-breakpoint
CREATE TABLE "game_logs" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01978c09-627f-7425-bea6-5abb5526fe6c' NOT NULL,
	"userId" varchar(255),
	"gameId" varchar(255) NOT NULL,
	"classification" varchar(50) DEFAULT 'Protected' NOT NULL,
	"watchedSetting" varchar(50) DEFAULT 'TV' NOT NULL,
	"watchedScope" varchar(50) DEFAULT 'Full Game' NOT NULL,
	"watchedDate" timestamp (6) with time zone NOT NULL,
	"watchedLocation" varchar(255) DEFAULT '',
	"ratingForGame" integer NOT NULL,
	"notes" text DEFAULT '',
	"tags" text[] DEFAULT '{}',
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp (6) with time zone,
	CONSTRAINT "game_logs_userId_gameId_unique" UNIQUE("userId","gameId")
);
--> statement-breakpoint
CREATE TABLE "game_ratings" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01978c09-627f-7425-bea6-5ed5f3a74f5b' NOT NULL,
	"gameId" varchar(255) NOT NULL,
	"averageRating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"totalRatings" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp DEFAULT null,
	CONSTRAINT "game_ratings_gameId_unique" UNIQUE("gameId")
);
--> statement-breakpoint
CREATE TABLE "game_stats" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01978c09-627c-77fc-bfe6-8c062f46a073' NOT NULL,
	"gameId" varchar(255) NOT NULL,
	"seasonId" integer NOT NULL,
	"homeTeamId" varchar(255) NOT NULL,
	"awayTeamId" varchar(255) NOT NULL,
	"gameDate" timestamp NOT NULL,
	"homeTeamScore" integer,
	"awayTeamScore" integer,
	"status" varchar(50) NOT NULL,
	"homeFastBreakPoints" integer,
	"homePointsInPaint" integer,
	"homeBiggestLead" integer,
	"homeSecondChancePoints" integer,
	"homePointsOffTurnovers" integer,
	"homeLongestRun" integer,
	"homeFgm" integer,
	"homeFga" integer,
	"homeFgp" numeric(5, 2),
	"homeFtm" integer,
	"homeFta" integer,
	"homeFtp" numeric(5, 2),
	"homeTpm" integer,
	"homeTpa" integer,
	"homeTpp" numeric(5, 2),
	"homeOffReb" integer,
	"homeDefReb" integer,
	"homeTotReb" integer,
	"homeAssists" integer,
	"homePFouls" integer,
	"homeSteals" integer,
	"homeTurnovers" integer,
	"homeBlocks" integer,
	"homePlusMinus" integer,
	"homeMinutes" varchar(10),
	"awayFastBreakPoints" integer,
	"awayPointsInPaint" integer,
	"awayBiggestLead" integer,
	"awaySecondChancePoints" integer,
	"awayPointsOffTurnovers" integer,
	"awayLongestRun" integer,
	"awayFgm" integer,
	"awayFga" integer,
	"awayFgp" numeric(5, 2),
	"awayFtm" integer,
	"awayFta" integer,
	"awayFtp" numeric(5, 2),
	"awayTpm" integer,
	"awayTpa" integer,
	"awayTpp" numeric(5, 2),
	"awayOffReb" integer,
	"awayDefReb" integer,
	"awayTotReb" integer,
	"awayAssists" integer,
	"awayPFouls" integer,
	"awaySteals" integer,
	"awayTurnovers" integer,
	"awayBlocks" integer,
	"awayPlusMinus" integer,
	"awayMinutes" varchar(10),
	"stats" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp DEFAULT null,
	CONSTRAINT "game_stats_gameId_unique" UNIQUE("gameId")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01978c09-627f-7425-bea6-5793d4935c38' NOT NULL,
	"gameType" varchar(50) DEFAULT 'nba' NOT NULL,
	"nbaGameId" varchar(255),
	"date" timestamp NOT NULL,
	"homeTeamId" varchar(255) NOT NULL,
	"awayTeamId" varchar(255) NOT NULL,
	"homeTeamScore" integer,
	"awayTeamScore" integer,
	"status" varchar(50) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE "nba_games" (
	"id" text PRIMARY KEY DEFAULT '01978c09-627b-7386-b90e-f50395b882e0' NOT NULL,
	"league" text NOT NULL,
	"season" integer NOT NULL,
	"date" jsonb,
	"stage" integer NOT NULL,
	"status" jsonb,
	"periods" jsonb,
	"arena" jsonb,
	"teams" jsonb,
	"scores" jsonb,
	"officials" jsonb,
	"timesTied" integer,
	"leadChanges" integer,
	"nugget" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE "nba_player_stats" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"playerId" varchar(255) NOT NULL,
	"gameId" varchar(255) NOT NULL,
	"teamId" varchar(255) NOT NULL,
	"points" integer,
	"assists" integer,
	"rebounds" integer,
	"steals" integer,
	"blocks" integer,
	"turnovers" integer,
	"fouls" integer,
	"minutes" varchar(10),
	"fieldGoalsMade" integer,
	"fieldGoalsAttempted" integer,
	"threePointersMade" integer,
	"threePointersAttempted" integer,
	"freeThrowsMade" integer,
	"freeThrowsAttempted" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE "nba_players" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"firstName" varchar(255),
	"lastName" varchar(255) NOT NULL,
	"birth" jsonb,
	"nba" jsonb,
	"height" jsonb,
	"weight" jsonb,
	"college" varchar(255),
	"affiliation" varchar(255),
	"jersey" varchar(10),
	"active" boolean DEFAULT true,
	"pos" varchar(10),
	"seasonsActive" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255),
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"targetId" varchar(255),
	"targetType" varchar(50),
	"resolved" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01978c09-627f-7425-bea6-5101284e4955' NOT NULL,
	"userId" varchar(255),
	"targetType" varchar(50) NOT NULL,
	"targetId" varchar(255) NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp DEFAULT null,
	CONSTRAINT "reactions_userId_targetType_targetId_emoji_unique" UNIQUE("userId","targetType","targetId","emoji")
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" integer PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"displayYear" text NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"isCurrent" boolean DEFAULT false NOT NULL,
	"isPlayoffs" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE "team_h2h" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01978c09-627c-77fc-bfe6-8a0bb6b6f523' NOT NULL,
	"team1Id" varchar(255) NOT NULL,
	"team2Id" varchar(255) NOT NULL,
	"season" integer NOT NULL,
	"totalGames" integer DEFAULT 0 NOT NULL,
	"team1Wins" integer DEFAULT 0 NOT NULL,
	"team2Wins" integer DEFAULT 0 NOT NULL,
	"last5Games" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"averagePointsTeam1" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"averagePointsTeam2" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"deletedAt" timestamp DEFAULT null,
	"name" varchar(255) NOT NULL,
	"code" varchar(10) NOT NULL,
	"city" varchar(255) NOT NULL,
	"state" varchar(255) NOT NULL,
	"country" varchar(255) NOT NULL,
	"conference" varchar(255),
	"division" varchar(255),
	"logoUrl" varchar(255),
	"isActive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01978c09-627e-744d-ac4e-191c903fa08e' NOT NULL,
	"username" varchar(255) NOT NULL,
	"firstName" varchar(255) NOT NULL,
	"lastName" varchar(255) NOT NULL,
	"emailAddress" varchar(255) NOT NULL,
	"imageUrl" text NOT NULL,
	"inboundFriendshipIds" text[] DEFAULT '{}' NOT NULL,
	"outboundFriendshipIds" text[] DEFAULT '{}' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"last_sign_in_at" timestamp (6) with time zone,
	"password_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verification_strategy" varchar(50),
	"external_id" varchar(255),
	"external_accounts" jsonb DEFAULT '[]' NOT NULL,
	"createdAt" timestamp (6) with time zone NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"deletedAt" timestamp (6) with time zone,
	CONSTRAINT "users_emailAddress_unique" UNIQUE("emailAddress")
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friendId_users_id_fk" FOREIGN KEY ("friendId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_gameId_nba_games_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."nba_games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_ratings" ADD CONSTRAINT "game_ratings_gameId_nba_games_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."nba_games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_stats" ADD CONSTRAINT "game_stats_gameId_nba_games_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."nba_games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_stats" ADD CONSTRAINT "game_stats_seasonId_seasons_id_fk" FOREIGN KEY ("seasonId") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_stats" ADD CONSTRAINT "game_stats_homeTeamId_teams_id_fk" FOREIGN KEY ("homeTeamId") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_stats" ADD CONSTRAINT "game_stats_awayTeamId_teams_id_fk" FOREIGN KEY ("awayTeamId") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_nbaGameId_nba_games_id_fk" FOREIGN KEY ("nbaGameId") REFERENCES "public"."nba_games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_homeTeamId_teams_id_fk" FOREIGN KEY ("homeTeamId") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_awayTeamId_teams_id_fk" FOREIGN KEY ("awayTeamId") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nba_player_stats" ADD CONSTRAINT "nba_player_stats_playerId_nba_players_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."nba_players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nba_player_stats" ADD CONSTRAINT "nba_player_stats_gameId_nba_games_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."nba_games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nba_player_stats" ADD CONSTRAINT "nba_player_stats_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_h2h" ADD CONSTRAINT "team_h2h_season_seasons_id_fk" FOREIGN KEY ("season") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;