import { relations } from "drizzle-orm/relations";
import { users, comments, teams, teamH2H, friendships, gameLogs, nbaGames, gameStats, seasons, games, nbaPlayers, nbaPlayerStats, notifications, reactions } from "./schema";

export const commentsRelations = relations(comments, ({one}) => ({
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	comments: many(comments),
	friendships_friendId: many(friendships, {
		relationName: "friendships_friendId_users_id"
	}),
	friendships_userId: many(friendships, {
		relationName: "friendships_userId_users_id"
	}),
	gameLogs: many(gameLogs),
	notifications: many(notifications),
	reactions: many(reactions),
}));

export const teamH2HRelations = relations(teamH2H, ({one}) => ({
	team_team1Id: one(teams, {
		fields: [teamH2H.team1Id],
		references: [teams.id],
		relationName: "teamH2H_team1Id_teams_id"
	}),
	team_team2Id: one(teams, {
		fields: [teamH2H.team2Id],
		references: [teams.id],
		relationName: "teamH2H_team2Id_teams_id"
	}),
}));

export const teamsRelations = relations(teams, ({many}) => ({
	teamH2HS_team1Id: many(teamH2H, {
		relationName: "teamH2H_team1Id_teams_id"
	}),
	teamH2HS_team2Id: many(teamH2H, {
		relationName: "teamH2H_team2Id_teams_id"
	}),
	gameStats_homeTeamId: many(gameStats, {
		relationName: "gameStats_homeTeamId_teams_id"
	}),
	gameStats_awayTeamId: many(gameStats, {
		relationName: "gameStats_awayTeamId_teams_id"
	}),
	games_homeTeamId: many(games, {
		relationName: "games_homeTeamId_teams_id"
	}),
	games_awayTeamId: many(games, {
		relationName: "games_awayTeamId_teams_id"
	}),
	nbaPlayerStats: many(nbaPlayerStats),
}));

export const friendshipsRelations = relations(friendships, ({one}) => ({
	user_friendId: one(users, {
		fields: [friendships.friendId],
		references: [users.id],
		relationName: "friendships_friendId_users_id"
	}),
	user_userId: one(users, {
		fields: [friendships.userId],
		references: [users.id],
		relationName: "friendships_userId_users_id"
	}),
}));

export const gameLogsRelations = relations(gameLogs, ({one}) => ({
	user: one(users, {
		fields: [gameLogs.userId],
		references: [users.id]
	}),
	nbaGame: one(nbaGames, {
		fields: [gameLogs.gameId],
		references: [nbaGames.id]
	}),
}));

export const nbaGamesRelations = relations(nbaGames, ({many}) => ({
	gameLogs: many(gameLogs),
	gameStats: many(gameStats),
	games: many(games),
	nbaPlayerStats: many(nbaPlayerStats),
}));

export const gameStatsRelations = relations(gameStats, ({one}) => ({
	nbaGame: one(nbaGames, {
		fields: [gameStats.gameId],
		references: [nbaGames.id]
	}),
	season: one(seasons, {
		fields: [gameStats.seasonId],
		references: [seasons.id]
	}),
	team_homeTeamId: one(teams, {
		fields: [gameStats.homeTeamId],
		references: [teams.id],
		relationName: "gameStats_homeTeamId_teams_id"
	}),
	team_awayTeamId: one(teams, {
		fields: [gameStats.awayTeamId],
		references: [teams.id],
		relationName: "gameStats_awayTeamId_teams_id"
	}),
}));

export const seasonsRelations = relations(seasons, ({many}) => ({
	gameStats: many(gameStats),
}));

export const gamesRelations = relations(games, ({one}) => ({
	nbaGame: one(nbaGames, {
		fields: [games.nbaGameId],
		references: [nbaGames.id]
	}),
	team_homeTeamId: one(teams, {
		fields: [games.homeTeamId],
		references: [teams.id],
		relationName: "games_homeTeamId_teams_id"
	}),
	team_awayTeamId: one(teams, {
		fields: [games.awayTeamId],
		references: [teams.id],
		relationName: "games_awayTeamId_teams_id"
	}),
}));

export const nbaPlayerStatsRelations = relations(nbaPlayerStats, ({one}) => ({
	nbaPlayer: one(nbaPlayers, {
		fields: [nbaPlayerStats.playerId],
		references: [nbaPlayers.id]
	}),
	nbaGame: one(nbaGames, {
		fields: [nbaPlayerStats.gameId],
		references: [nbaGames.id]
	}),
	team: one(teams, {
		fields: [nbaPlayerStats.teamId],
		references: [teams.id]
	}),
}));

export const nbaPlayersRelations = relations(nbaPlayers, ({many}) => ({
	nbaPlayerStats: many(nbaPlayerStats),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const reactionsRelations = relations(reactions, ({one}) => ({
	user: one(users, {
		fields: [reactions.userId],
		references: [users.id]
	}),
}));