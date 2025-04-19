import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  timestamp,
  varchar,
  pgEnum,
  boolean,
  unique,
  numeric,
} from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

export const friendshipStatusEnum = pgEnum("friendship_status", [
  "pending",
  "connected",
  "rejected",
  "severed",
]);

export const watched_settingEnum = pgEnum("watched_setting", [
  "tv",
  "arena",
  "phone",
  "laptop",
  "bar",
  "home",
  "other",
]);

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  first_name: varchar("first_name", { length: 255 }).notNull(),
  last_name: varchar("last_name", { length: 255 }).notNull(),
  email_address: varchar("email_address", { length: 255 }).notNull().unique(),
  image_url: text("image_url").notNull(),
  inbound_friendship_ids: text("inbound_friendship_ids")
    .array()
    .notNull()
    .default([]),
  outbound_friendship_ids: text("outbound_friendship_ids")
    .array()
    .notNull()
    .default([]),
  banned: boolean("banned").notNull().default(false),
  created_at: timestamp({ precision: 6, withTimezone: true }).notNull(),
  updated_at: timestamp({ precision: 6, withTimezone: true }).notNull(),
  timestamp: timestamp({ precision: 6, withTimezone: true }).notNull(),
});

export const friendships = pgTable(
  "friendships",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    subscriber_id: varchar("subscriber_id", {
      length: 255,
    }).references(() => users.id),
    user_id: varchar("user_id", {
      length: 255,
    }).references(() => users.id),
    status: friendshipStatusEnum("status").notNull().default("pending"),
    timestamp: timestamp({ precision: 6, withTimezone: true }).notNull(),
  },
  (table) => ({
    uniqueFriendship: unique().on(table.subscriber_id, table.user_id),
  })
);

export const game_logs = pgTable(
  "game_logs",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id),
    game_id: text("game_id")
      .notNull()
      .references(() => game_ratings.game_id),
    watched_setting: watched_settingEnum("watched_setting")
      .notNull()
      .default("tv"),
    watched_date: timestamp({ precision: 6, withTimezone: true }).notNull(),
    watched_location: text("watched_location").notNull(),
    rating_for_game: integer("rating_for_game").notNull(),
    rating_stars: text("rating_stars").default(""),
    watched_count: integer("watched_count").notNull().default(0),
    created_at: timestamp({ precision: 6, withTimezone: true }).notNull(),
    updated_at: timestamp({ precision: 6, withTimezone: true }).notNull(),
  },
  (t) => [sql`CHECK (${t.rating_for_game} >= 1 AND ${t.rating_for_game} <= 5)`]
);

export const game_ratings = pgTable("game_ratings", {
  id: varchar("id", { length: 255 }).primaryKey().default(uuidv4()),
  game_id: text("game_id").notNull().unique(),
  average_rating: numeric("average_rating", { precision: 3, scale: 2 })
    .notNull()
    .default("0.00"),
  total_ratings: integer("total_ratings").notNull().default(0),
  created_at: timestamp({ precision: 6, withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp({ precision: 6, withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reactionTargetEnum = pgEnum("reaction_target_type", [
  "game_log",
  "comment",
]);

export const reactions = pgTable("reactions", {
  id: text("id").primaryKey().default(uuidv4()),
  user_id: text("user_id").references(() => users.id),
  target_type: reactionTargetEnum("target_type").notNull(),
  target_id: text("target_id").notNull(), // Either game_log_id or comment_id
  emoji: text("emoji").notNull(), // Store the emoji character
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey().default(uuidv4()),
  user_id: text("user_id").references(() => users.id),
  parent_id: text("parent_id").notNull(), // References either game_logs.id or comments.id
  content: text("content").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.user_id],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  initiated_friendship_ids: many(friendships, { relationName: "initiator" }),
  received_friendship_ids: many(friendships, { relationName: "responder" }),
  game_logs: many(game_logs),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  initiator: one(users, {
    fields: [friendships.subscriber_id],
    references: [users.id],
    relationName: "initiator",
  }),
  responder: one(users, {
    fields: [friendships.user_id],
    references: [users.id],
    relationName: "responder",
  }),
}));

export const gameLogsRelations = relations(game_logs, ({ one }) => ({
  user: one(users, {
    fields: [game_logs.user_id],
    references: [users.id],
  }),
  game: one(game_ratings, {
    fields: [game_logs.game_id],
    references: [game_ratings.id],
  }),
}));

export const gameRatingsRelations = relations(game_ratings, ({ many }) => ({
  game_logs: many(game_logs),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.user_id],
    references: [users.id],
  }),
}));
