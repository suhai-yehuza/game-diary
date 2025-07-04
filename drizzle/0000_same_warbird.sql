CREATE TABLE "comments" (
	"id" varchar(255) PRIMARY KEY DEFAULT '700df261-f799-4d0b-bdc9-371940836770' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	"user_id" varchar(255),
	"parent_id" varchar(255) NOT NULL,
	"parent_type" varchar(50) NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" varchar(255) PRIMARY KEY DEFAULT '700df261-f799-4d0b-bdc9-371940836770' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	"friend_id" varchar(255),
	"user_id" varchar(255),
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	CONSTRAINT "friendships_friend_id_user_id_unique" UNIQUE("friend_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "game_logs" (
	"id" varchar(255) PRIMARY KEY DEFAULT '700df261-f799-4d0b-bdc9-371940836770' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	"user_id" varchar(255),
	"game_id" varchar(255) NOT NULL,
	"classification" varchar(50) DEFAULT 'PROTECTED' NOT NULL,
	"watched_setting" varchar(50) DEFAULT 'TV' NOT NULL,
	"watched_scope" varchar(50) DEFAULT 'FULL_GAME' NOT NULL,
	"watched_date" timestamp (6) with time zone NOT NULL,
	"watched_location" varchar(255) DEFAULT '',
	"rating_for_game" integer NOT NULL,
	"notes" text DEFAULT '',
	"tags" text[] DEFAULT '{}',
	CONSTRAINT "game_logs_user_id_game_id_unique" UNIQUE("user_id","game_id")
);
--> statement-breakpoint
CREATE TABLE "game_ratings" (
	"id" varchar(255) PRIMARY KEY DEFAULT '700df261-f799-4d0b-bdc9-371940836770' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	"game_id" varchar(255) NOT NULL,
	"average_rating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"total_ratings" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "game_ratings_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" varchar(255) PRIMARY KEY DEFAULT '700df261-f799-4d0b-bdc9-371940836770' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	"game_type" varchar(50) DEFAULT 'nba' NOT NULL,
	"nba_game_id" varchar(255),
	"date" timestamp NOT NULL,
	"home_team_id" varchar(255) NOT NULL,
	"away_team_id" varchar(255) NOT NULL,
	"home_team_score" integer,
	"away_team_score" integer,
	"status" varchar(50) NOT NULL
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
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp DEFAULT null,
	"read" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" varchar(255) PRIMARY KEY DEFAULT '700df261-f799-4d0b-bdc9-371940836770' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	"user_id" varchar(255),
	"target_type" varchar(50) NOT NULL,
	"target_id" varchar(255) NOT NULL,
	"emoji" varchar(10) NOT NULL,
	CONSTRAINT "reactions_user_id_target_type_target_id_emoji_unique" UNIQUE("user_id","target_type","target_id","emoji")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	"object" varchar(10) DEFAULT 'user' NOT NULL,
	"username" varchar(255),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"image_url" text,
	"has_image" boolean DEFAULT false NOT NULL,
	"profile_image_url" text,
	"primary_email_address_id" varchar(255),
	"primary_phone_number_id" varchar(255),
	"email_address" varchar(255),
	"external_id" varchar(255),
	"last_active_at" timestamp (6) with time zone,
	"last_sign_in_at" timestamp (6) with time zone,
	"bio" text,
	"timezone" varchar(50),
	"preferred_language" varchar(10) DEFAULT 'en',
	"inbound_friendship_ids" varchar(255)[] DEFAULT '{}' NOT NULL,
	"outbound_friendship_ids" varchar(255)[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_users_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_ratings" ADD CONSTRAINT "game_ratings_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;