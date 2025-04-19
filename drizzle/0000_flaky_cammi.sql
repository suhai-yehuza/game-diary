CREATE TYPE "public"."friendship_status" AS ENUM('pending', 'connected', 'rejected', 'severed');--> statement-breakpoint
CREATE TYPE "public"."reaction_target" AS ENUM('game_log', 'comment');--> statement-breakpoint
CREATE TYPE "public"."watched_setting" AS ENUM('tv', 'arena', 'phone', 'laptop', 'bar', 'home', 'other');--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY DEFAULT '4c596edb-9099-474d-9d71-f736d3579166' NOT NULL,
	"user_id" text,
	"parent_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"subscriber_id" varchar(255),
	"user_id" varchar(255),
	"status" "friendship_status" DEFAULT 'pending' NOT NULL,
	"timestamp" timestamp (6) with time zone NOT NULL,
	CONSTRAINT "friendships_subscriber_id_user_id_unique" UNIQUE("subscriber_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "game_logs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"game_id" text NOT NULL,
	"watched_setting" "watched_setting" DEFAULT 'tv' NOT NULL,
	"watched_date" timestamp (6) with time zone NOT NULL,
	"watched_location" text NOT NULL,
	"rating_for_game" integer NOT NULL,
	"rating_stars" text DEFAULT '',
	"watched_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp (6) with time zone NOT NULL,
	"updated_at" timestamp (6) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_ratings" (
	"id" varchar(255) PRIMARY KEY DEFAULT '0c3e70cc-24e1-4527-9dce-e704ed5efd9e' NOT NULL,
	"game_id" text NOT NULL,
	"average_rating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"total_ratings" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_ratings_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" text PRIMARY KEY DEFAULT 'e7c20ca0-99ae-464c-9833-83e4783d5c44' NOT NULL,
	"user_id" text,
	"target_type" "reaction_target" NOT NULL,
	"target_id" text NOT NULL,
	"emoji" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
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
	CONSTRAINT "users_email_address_unique" UNIQUE("email_address")
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_subscriber_id_users_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_game_id_game_ratings_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game_ratings"("game_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;