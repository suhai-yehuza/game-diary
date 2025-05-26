CREATE TABLE "comments" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"content" text NOT NULL,
	"target_id" varchar(255) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"parent_id" varchar(255),
	"parent_type" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01970b73-12a9-70d6-9031-48e16c18d2f7-mb4r7i5l-xfb7p4j20fs-1z6w' NOT NULL,
	"friend_id" varchar(255),
	"user_id" varchar(255),
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "friendships_friend_id_user_id_unique" UNIQUE("friend_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "game_logs" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01970b73-12b1-7686-ab15-dea387d2eb68-mb4r7i5t-mqr0u2m1oah-1z6w' NOT NULL,
	"user_id" varchar(255),
	"game_id" text NOT NULL,
	"watched_setting" varchar(50) DEFAULT 'tv' NOT NULL,
	"watched_date" timestamp (6) with time zone NOT NULL,
	"watched_location" text DEFAULT '',
	"rating_for_game" integer NOT NULL,
	"rating_stars" text DEFAULT '',
	"watched_count" integer DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '',
	"tags" text[] DEFAULT '{}',
	"classification" text DEFAULT 'PROTECTED' NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "game_ratings" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01970b73-12b0-709a-99ca-732c78235bfb-mb4r7i5t-kwro4jzqs-1z6w' NOT NULL,
	"game_id" text NOT NULL,
	"average_rating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"total_ratings" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_ratings_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE "game_stats" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01970b73-12b0-709a-99ca-6a35b41cef71-mb4r7i5s-g8yjp3bnfn-1z6w' NOT NULL,
	"game_id" varchar(255) NOT NULL,
	"season_id" integer NOT NULL,
	"home_team_id" varchar(255) NOT NULL,
	"away_team_id" varchar(255) NOT NULL,
	"game_date" timestamp NOT NULL,
	"home_score" integer,
	"away_score" integer,
	"status" varchar(50) NOT NULL,
	"home_fast_break_points" integer,
	"home_points_in_paint" integer,
	"home_biggest_lead" integer,
	"home_second_chance_points" integer,
	"home_points_off_turnovers" integer,
	"home_longest_run" integer,
	"home_fgm" integer,
	"home_fga" integer,
	"home_fgp" numeric(5, 2),
	"home_ftm" integer,
	"home_fta" integer,
	"home_ftp" numeric(5, 2),
	"home_tpm" integer,
	"home_tpa" integer,
	"home_tpp" numeric(5, 2),
	"home_off_reb" integer,
	"home_def_reb" integer,
	"home_tot_reb" integer,
	"home_assists" integer,
	"home_p_fouls" integer,
	"home_steals" integer,
	"home_turnovers" integer,
	"home_blocks" integer,
	"home_plus_minus" integer,
	"home_minutes" varchar(10),
	"away_fast_break_points" integer,
	"away_points_in_paint" integer,
	"away_biggest_lead" integer,
	"away_second_chance_points" integer,
	"away_points_off_turnovers" integer,
	"away_longest_run" integer,
	"away_fgm" integer,
	"away_fga" integer,
	"away_fgp" numeric(5, 2),
	"away_ftm" integer,
	"away_fta" integer,
	"away_ftp" numeric(5, 2),
	"away_tpm" integer,
	"away_tpa" integer,
	"away_tpp" numeric(5, 2),
	"away_off_reb" integer,
	"away_def_reb" integer,
	"away_tot_reb" integer,
	"away_assists" integer,
	"away_p_fouls" integer,
	"away_steals" integer,
	"away_turnovers" integer,
	"away_blocks" integer,
	"away_plus_minus" integer,
	"away_minutes" varchar(10),
	"stats" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_stats_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01970b73-12b0-709a-99ca-6d516b637232-mb4r7i5s-1x3dlg46svv-1z6w' NOT NULL,
	"game_type" varchar(50) DEFAULT 'nba' NOT NULL,
	"nba_game_id" text,
	"date" timestamp NOT NULL,
	"home_team_id" varchar(255) NOT NULL,
	"away_team_id" varchar(255) NOT NULL,
	"home_score" integer,
	"away_score" integer,
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nba_games" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01970b73-12af-7113-86d2-f2a75f961638-mb4r7i5r-soqgcqb8otq-1z6w' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"league" text NOT NULL,
	"season_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"home_team_id" varchar(255) NOT NULL,
	"away_team_id" varchar(255) NOT NULL,
	"home_score" integer,
	"away_score" integer,
	"status" varchar(50) NOT NULL,
	"stage" integer NOT NULL,
	"periods" jsonb,
	"arena" jsonb,
	"teams" jsonb,
	"scores" jsonb,
	"officials" jsonb,
	"times_tied" integer,
	"lead_changes" integer,
	"nugget" text,
	"season" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nba_player_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"player_id" text NOT NULL,
	"game_id" text NOT NULL,
	"team_id" text NOT NULL,
	"points" integer,
	"assists" integer,
	"rebounds" integer,
	"steals" integer,
	"blocks" integer,
	"turnovers" integer,
	"fouls" integer,
	"minutes" varchar,
	"field_goals_made" integer,
	"field_goals_attempted" integer,
	"three_pointers_made" integer,
	"three_pointers_attempted" integer,
	"free_throws_made" integer,
	"free_throws_attempted" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "nba_players" (
	"id" text PRIMARY KEY NOT NULL,
	"firstname" varchar NOT NULL,
	"lastname" varchar NOT NULL,
	"birth" jsonb,
	"nba" jsonb,
	"height" jsonb,
	"weight" jsonb,
	"college" varchar,
	"affiliation" varchar,
	"jersey" varchar,
	"active" boolean DEFAULT true,
	"pos" varchar,
	"seasons_active" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"target_id" varchar(255),
	"target_type" varchar(50),
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"target_id" varchar(255) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"emoji" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" integer PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"display_year" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"is_playoffs" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_h2h" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01970b73-12b1-7686-ab15-e3fc272d70d2-mb4r7i5t-cz3kgcshse7-1z6w' NOT NULL,
	"team1_id" varchar(255) NOT NULL,
	"team2_id" varchar(255) NOT NULL,
	"season_id" integer NOT NULL,
	"last_5_games" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"name" varchar(255) NOT NULL,
	"abbreviation" varchar(10) NOT NULL,
	"city" varchar(255) NOT NULL,
	"state" varchar(255) NOT NULL,
	"country" varchar(255) NOT NULL,
	"conference" varchar(255),
	"division" varchar(255),
	"logo_url" varchar(255),
	"primary_color" varchar(7),
	"secondary_color" varchar(7),
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY DEFAULT '01970b73-12a8-7508-b9fe-a95da7e23dfd-mb4r7i5k-jw7otpd4eb9-1z6w' NOT NULL,
	"username" varchar(255) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email_address" varchar(255) NOT NULL,
	"image_url" text NOT NULL,
	"inbound_friendship_ids" text[] DEFAULT '{}' NOT NULL,
	"outbound_friendship_ids" text[] DEFAULT '{}' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (6) with time zone NOT NULL,
	"updated_at" timestamp (6) with time zone NOT NULL,
	"timestamp" timestamp (6) with time zone NOT NULL,
	"last_sign_in_at" timestamp (6) with time zone,
	"password_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verification_strategy" varchar(50),
	"external_id" varchar(255),
	"external_accounts" jsonb DEFAULT '[]' NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	CONSTRAINT "users_email_address_unique" UNIQUE("email_address")
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_users_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_game_id_nba_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."nba_games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_stats" ADD CONSTRAINT "game_stats_game_id_nba_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."nba_games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_stats" ADD CONSTRAINT "game_stats_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_stats" ADD CONSTRAINT "game_stats_home_team_id_teams_id_fk" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_stats" ADD CONSTRAINT "game_stats_away_team_id_teams_id_fk" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_nba_game_id_nba_games_id_fk" FOREIGN KEY ("nba_game_id") REFERENCES "public"."nba_games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_home_team_id_teams_id_fk" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_away_team_id_teams_id_fk" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nba_player_stats" ADD CONSTRAINT "nba_player_stats_player_id_nba_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."nba_players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nba_player_stats" ADD CONSTRAINT "nba_player_stats_game_id_nba_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."nba_games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nba_player_stats" ADD CONSTRAINT "nba_player_stats_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_h2h" ADD CONSTRAINT "team_h2h_team1_id_teams_id_fk" FOREIGN KEY ("team1_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_h2h" ADD CONSTRAINT "team_h2h_team2_id_teams_id_fk" FOREIGN KEY ("team2_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;