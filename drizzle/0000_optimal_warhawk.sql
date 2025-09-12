CREATE TABLE "audit_logs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"category" varchar(50) NOT NULL,
	"action" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"user_id" varchar(255),
	"session_id" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"resource_type" varchar(50),
	"resource_id" varchar(255),
	"table_name" varchar(100),
	"column_name" varchar(100),
	"request_id" varchar(255),
	"endpoint" varchar(500),
	"method" varchar(10),
	"description" text,
	"details" jsonb,
	"metadata" jsonb,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"error_code" varchar(50),
	"duration_ms" integer,
	"compliance_tags" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "basketball_games" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"season" varchar(20),
	"game_id" varchar(255),
	"date" timestamp NOT NULL,
	"stage" integer,
	"teams" jsonb,
	"status" jsonb,
	"scores" jsonb,
	"arena" jsonb,
	"periods" jsonb,
	"officials" text[],
	"times_tied" integer,
	"lead_changes" integer,
	"nugget" text,
	"average_rating" numeric(4, 2) DEFAULT '0.00' NOT NULL,
	"total_ratings" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "basketball_players" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"first_name" varchar(100) DEFAULT 'missing-first-name' NOT NULL,
	"last_name" varchar(100) DEFAULT 'missing-last-name' NOT NULL,
	"birth" jsonb,
	"nba" jsonb,
	"height" jsonb,
	"weight" jsonb,
	"college" varchar(100),
	"affiliation" varchar(100),
	"teams" jsonb,
	"leagues" jsonb,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "basketball_teams" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"nickname" varchar(100),
	"code" varchar(10),
	"city" varchar(100),
	"logo" text,
	"all_star" boolean DEFAULT false NOT NULL,
	"nba_franchise" boolean DEFAULT false NOT NULL,
	"conference" varchar(100),
	"leagues" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"user_id" varchar(255),
	"parent_id" varchar(255) NOT NULL,
	"parent_type" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"childComments" jsonb[] DEFAULT '{}',
	"depth" integer DEFAULT 0 NOT NULL,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"friend_id" varchar(255),
	"user_id" varchar(255),
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"canonical_id" varchar(512),
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	CONSTRAINT "friendships_canonical_id_unique" UNIQUE("canonical_id")
);
--> statement-breakpoint
CREATE TABLE "game_logs" (
	"user_id" varchar(255),
	"game_id" varchar(255) NOT NULL,
	"classification" varchar(50) DEFAULT 'PROTECTED' NOT NULL,
	"watched_setting" varchar(50) DEFAULT 'TV' NOT NULL,
	"watched_scope" varchar(50) DEFAULT 'FULL_GAME' NOT NULL,
	"watched_date" timestamp (6) with time zone NOT NULL,
	"watched_location" varchar(255) DEFAULT '',
	"rating_for_game" integer DEFAULT 3 NOT NULL,
	"notes" text DEFAULT '',
	"tags" text[] DEFAULT '{}',
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	CONSTRAINT "game_logs_user_id_game_id_unique" UNIQUE("user_id","game_id")
);
--> statement-breakpoint
CREATE TABLE "game_ratings" (
	"game_id" varchar(255) NOT NULL,
	"average_rating" numeric(4, 2) DEFAULT '0.00' NOT NULL,
	"total_ratings" integer DEFAULT 0 NOT NULL,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	CONSTRAINT "game_ratings_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE "key_rotation_logs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"key_id" varchar(255) NOT NULL,
	"key_version" varchar(100) NOT NULL,
	"environment" varchar(50) NOT NULL,
	"rotation_type" varchar(50) NOT NULL,
	"previous_key_id" varchar(255),
	"new_key_id" varchar(255),
	"rotated_by" varchar(255) NOT NULL,
	"rotation_reason" text,
	"affected_records_count" integer,
	"re_encryption_required" boolean DEFAULT false NOT NULL,
	"re_encryption_completed" boolean DEFAULT false NOT NULL,
	"rotation_started_at" timestamp NOT NULL,
	"rotation_completed_at" timestamp,
	"re_encryption_started_at" timestamp,
	"re_encryption_completed_at" timestamp,
	"status" varchar(50) DEFAULT 'in_progress' NOT NULL,
	"details" jsonb,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leagues" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "leagues_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"user_id" varchar(255),
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"target_id" varchar(255),
	"target_type" varchar(50),
	"resolved" boolean DEFAULT false NOT NULL,
	"read" boolean DEFAULT false,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "public_comments" (
	"user_id" varchar(255),
	"anonymous_name" varchar(255),
	"anonymous_email" varchar(255),
	"parent_id" varchar(255) NOT NULL,
	"parent_type" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"childComments" jsonb[] DEFAULT '{}',
	"depth" integer DEFAULT 0 NOT NULL,
	"is_approved" boolean DEFAULT true NOT NULL,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "public_reactions" (
	"user_id" varchar(255),
	"anonymous_name" varchar(255),
	"anonymous_email" varchar(255),
	"target_type" varchar(50) NOT NULL,
	"target_id" varchar(255) NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"is_approved" boolean DEFAULT true NOT NULL,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	CONSTRAINT "public_reactions_user_id_anonymous_name_target_type_target_id_emoji_unique" UNIQUE("user_id","anonymous_name","target_type","target_id","emoji")
);
--> statement-breakpoint
CREATE TABLE "reaction_emojis" (
	"emoji" varchar(10) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"user_id" varchar(255),
	"target_type" varchar(50) NOT NULL,
	"target_id" varchar(255) NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	CONSTRAINT "reactions_user_id_target_type_target_id_emoji_unique" UNIQUE("user_id","target_type","target_id","emoji")
);
--> statement-breakpoint
CREATE TABLE "rls_access_logs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"requesting_user_id" varchar(255) NOT NULL,
	"target_user_id" varchar(255) NOT NULL,
	"table_name" varchar(100) NOT NULL,
	"operation" varchar(20) NOT NULL,
	"rls_context_set" boolean NOT NULL,
	"rls_policy_applied" varchar(100),
	"access_granted" boolean NOT NULL,
	"rows_affected" integer,
	"sensitive_fields_accessed" varchar(500),
	"request_id" varchar(255),
	"endpoint" varchar(500),
	"query_hash" varchar(64),
	"query_duration_ms" integer,
	"ip_address" varchar(45),
	"user_agent" text,
	"details" jsonb,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	CONSTRAINT "seasons_year_unique" UNIQUE("year")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
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
	"phone_number" text,
	"external_id" varchar(255),
	"last_active_at" timestamp (6) with time zone,
	"last_sign_in_at" timestamp (6) with time zone,
	"bio" text,
	"timezone" varchar(50),
	"preferred_language" varchar(10) DEFAULT 'en',
	"isAdmin" boolean DEFAULT false NOT NULL,
	"inbound_friendship_ids" varchar(255)[] DEFAULT '{}' NOT NULL,
	"outbound_friendship_ids" varchar(255)[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	CONSTRAINT "users_email_address_unique" UNIQUE("email_address")
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_users_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_game_id_basketball_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."basketball_games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_ratings" ADD CONSTRAINT "game_ratings_game_id_basketball_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."basketball_games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_comments" ADD CONSTRAINT "public_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_reactions" ADD CONSTRAINT "public_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_emoji_reaction_emojis_emoji_fk" FOREIGN KEY ("emoji") REFERENCES "public"."reaction_emojis"("emoji") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "public_comments_parent_id_parent_type_idx" ON "public_comments" USING btree ("parent_id","parent_type");--> statement-breakpoint
CREATE INDEX "public_comments_parent_id_parent_type_created_at_idx" ON "public_comments" USING btree ("parent_id","parent_type","created_at");--> statement-breakpoint
CREATE INDEX "public_comments_user_id_idx" ON "public_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "public_comments_anonymous_name_idx" ON "public_comments" USING btree ("anonymous_name");--> statement-breakpoint
CREATE INDEX "public_comments_is_approved_idx" ON "public_comments" USING btree ("is_approved");--> statement-breakpoint
CREATE INDEX "public_comments_created_at_idx" ON "public_comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "public_comments_content_gin_idx" ON "public_comments" USING gin (to_tsvector('english', content));--> statement-breakpoint
CREATE INDEX "public_reactions_target_id_target_type_idx" ON "public_reactions" USING btree ("target_id","target_type");--> statement-breakpoint
CREATE INDEX "public_reactions_user_id_idx" ON "public_reactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "public_reactions_anonymous_name_idx" ON "public_reactions" USING btree ("anonymous_name");--> statement-breakpoint
CREATE INDEX "public_reactions_emoji_idx" ON "public_reactions" USING btree ("emoji");--> statement-breakpoint
CREATE INDEX "public_reactions_is_approved_idx" ON "public_reactions" USING btree ("is_approved");--> statement-breakpoint
CREATE INDEX "public_reactions_created_at_idx" ON "public_reactions" USING btree ("created_at");