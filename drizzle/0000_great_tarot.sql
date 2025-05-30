CREATE TABLE "comments" (
	"id" text PRIMARY KEY DEFAULT '019721b1-c6c4-7468-adbd-5f390b5e86dd-mbaxend0-awehqiug27-13nu' NOT NULL,
	"userId" text,
	"parentId" text NOT NULL,
	"parentType" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" varchar(255) PRIMARY KEY DEFAULT '019721b1-c6c4-7468-adbd-58bd392c948c-mbaxend0-rg80ux04i2n-13nu' NOT NULL,
	"friendId" varchar(255),
	"userId" varchar(255),
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "friendships_friendId_userId_unique" UNIQUE("friendId","userId")
);
--> statement-breakpoint
CREATE TABLE "game_logs" (
	"id" varchar(255) PRIMARY KEY DEFAULT '019721b1-c6c4-7468-adbd-69bdd9d27b7f-mbaxend0-mz3w28y9e7p-13nu' NOT NULL,
	"userId" varchar(255),
	"gameId" text NOT NULL,
	"watchedSetting" varchar(50) DEFAULT 'tv' NOT NULL,
	"watchedDate" timestamp (6) with time zone NOT NULL,
	"watchedLocation" text DEFAULT '',
	"ratingForGame" integer NOT NULL,
	"ratingStars" text DEFAULT '',
	"watchedCount" integer DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '',
	"tags" text[] DEFAULT '{}',
	"classification" text DEFAULT 'PROTECTED' NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "game_ratings" (
	"id" varchar(255) PRIMARY KEY DEFAULT '019721b1-c6c4-7468-adbd-6f472a40991b-mbaxend0-wsa7jsa1kcs-13nu' NOT NULL,
	"gameId" text NOT NULL,
	"averageRating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"totalRatings" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_ratings_gameId_unique" UNIQUE("gameId")
);
--> statement-breakpoint
CREATE TABLE "game_stats" (
	"id" varchar(255) PRIMARY KEY DEFAULT '019721b1-c6c1-7551-88fb-324480685cf0-mbaxencx-7ssix3qt8f4-13nu' NOT NULL,
	"gameId" varchar(255) NOT NULL,
	"seasonId" integer NOT NULL,
	"homeTeamId" varchar(255) NOT NULL,
	"awayTeamId" varchar(255) NOT NULL,
	"gameDate" timestamp NOT NULL,
	"homeScore" integer,
	"awayScore" integer,
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
	CONSTRAINT "game_stats_gameId_unique" UNIQUE("gameId")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" varchar(255) PRIMARY KEY DEFAULT '019721b1-c6c4-7468-adbd-67eccbca6c79-mbaxend0-6rb8sdeuj5o-13nu' NOT NULL,
	"gameType" varchar(50) DEFAULT 'nba' NOT NULL,
	"nbaGameId" text,
	"date" timestamp NOT NULL,
	"homeTeamId" varchar(255) NOT NULL,
	"awayTeamId" varchar(255) NOT NULL,
	"homeScore" integer,
	"awayScore" integer,
	"status" varchar(50) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nba_games" (
	"id" varchar(255) PRIMARY KEY DEFAULT '019721b1-c6bf-7588-8ef1-ee290dba2a44-mbaxencv-m5gf24j02j-13nu' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
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
	"nugget" text
);
--> statement-breakpoint
CREATE TABLE "nba_player_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"playerId" text NOT NULL,
	"gameId" text NOT NULL,
	"teamId" text NOT NULL,
	"points" integer,
	"assists" integer,
	"rebounds" integer,
	"steals" integer,
	"blocks" integer,
	"turnovers" integer,
	"fouls" integer,
	"minutes" varchar,
	"fieldGoalsMade" integer,
	"fieldGoalsAttempted" integer,
	"threePointersMade" integer,
	"threePointersAttempted" integer,
	"freeThrowsMade" integer,
	"freeThrowsAttempted" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "nba_players" (
	"id" text PRIMARY KEY NOT NULL,
	"firstName" varchar NOT NULL,
	"lastName" varchar NOT NULL,
	"birth" jsonb,
	"nba" jsonb,
	"height" jsonb,
	"weight" jsonb,
	"college" varchar,
	"affiliation" varchar,
	"jersey" varchar,
	"active" boolean DEFAULT true,
	"pos" varchar,
	"seasonsActive" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
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
	"read" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" text PRIMARY KEY DEFAULT '019721b1-c6c4-7468-adbd-600e26c050c3-mbaxend0-u2w8rqsfq9-13nu' NOT NULL,
	"userId" text,
	"targetType" varchar(50) NOT NULL,
	"targetId" text NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
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
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_h2h" (
	"id" varchar(255) PRIMARY KEY DEFAULT '019721b1-c6c4-7468-adbd-73030b86763f-mbaxend0-5yk5awqo31i-13nu' NOT NULL,
	"team1Id" varchar(255) NOT NULL,
	"team2Id" varchar(255) NOT NULL,
	"season" integer NOT NULL,
	"last5Games" text[] DEFAULT '{}',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"name" varchar(255) NOT NULL,
	"abbreviation" varchar(10) NOT NULL,
	"city" varchar(255) NOT NULL,
	"state" varchar(255) NOT NULL,
	"country" varchar(255) NOT NULL,
	"conference" varchar(255),
	"division" varchar(255),
	"logoUrl" varchar(255),
	"primaryColor" varchar(7),
	"secondaryColor" varchar(7),
	"isActive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY DEFAULT '019721b1-c6c3-7369-88a0-eee4053d5b3e-mbaxencz-b0asf55zjzg-13nu' NOT NULL,
	"username" varchar(255) NOT NULL,
	"firstName" varchar(255) NOT NULL,
	"lastName" varchar(255) NOT NULL,
	"emailAddress" varchar(255) NOT NULL,
	"imageUrl" text NOT NULL,
	"inboundFriendshipIds" text[] DEFAULT '{}' NOT NULL,
	"outboundFriendshipIds" text[] DEFAULT '{}' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (6) with time zone NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"timestamp" timestamp (6) with time zone NOT NULL,
	"last_sign_in_at" timestamp (6) with time zone,
	"password_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verification_strategy" varchar(50),
	"external_id" varchar(255),
	"external_accounts" jsonb DEFAULT '[]' NOT NULL,
	"deletedAt" timestamp (6) with time zone,
	CONSTRAINT "users_emailAddress_unique" UNIQUE("emailAddress")
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friendId_users_id_fk" FOREIGN KEY ("friendId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_gameId_nba_games_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."nba_games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "team_h2h" ADD CONSTRAINT "team_h2h_team1Id_teams_id_fk" FOREIGN KEY ("team1Id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_h2h" ADD CONSTRAINT "team_h2h_team2Id_teams_id_fk" FOREIGN KEY ("team2Id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;