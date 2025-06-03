import { sql, and, eq } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import * as schema from '@/lib/db/schema';
import { seedLogger } from '@/lib/logger';
import { generateUUID } from '@/lib/utils/index.processing';
export async function fetchAndProcessTeamH2H(db: NeonHttpDatabase<typeof schema>, season: number) {
  seedLogger.info(`Seeding team head-to-head stats for the ${season} season...`);

  // Get all games for the season
  const games = await db.query.nba_games.findMany({
    where: sql`season = ${season}`,
  });

  // Create a map to store h2h stats for each team pair
  const h2hMap = new Map<
    string,
    {
      team1Id: string;
      team2Id: string;
      totalGames: number;
      team1Wins: number;
      team2Wins: number;
      last5Games: string[];
      total_points_team1: number;
      total_points_team2: number;
      timesTied: number;
      leadChanges: number;
    }
  >();

  // Process each game
  for (const game of games) {
    const teamsData = game.teams as {
      visitors: { id: number; name: string; nickname: string; code: string; logo: string };
      home: { id: number; name: string; nickname: string; code: string; logo: string };
    };
    const scoresData = game.scores as {
      visitors: {
        points: number;
        win: number;
        loss: number;
        series: { win: number; loss: number };
      };
      home: { points: number; win: number; loss: number; series: { win: number; loss: number } };
    };

    if (!teamsData?.visitors?.id || !teamsData?.home?.id) continue;

    const team1Id = teamsData.visitors.id.toString();
    const team2Id = teamsData.home.id.toString();

    // Create a unique key for the team pair (always use smaller ID first)
    const key = [team1Id, team2Id].sort().join('-');

    if (!h2hMap.has(key)) {
      h2hMap.set(key, {
        team1Id: [team1Id, team2Id].sort()[0],
        team2Id: [team1Id, team2Id].sort()[1],
        totalGames: 0,
        team1Wins: 0,
        team2Wins: 0,
        last5Games: [],
        total_points_team1: 0,
        total_points_team2: 0,
        timesTied: 0,
        leadChanges: 0,
      });
    }

    const h2h = h2hMap.get(key);
    if (!h2h) {
      seedLogger.error(`H2H data not found for key: ${key}`);
      continue;
    }
    h2h.totalGames++;

    // Update points and wins
    const team1Points = scoresData.visitors.points;
    const team2Points = scoresData.home.points;

    if (team1Id < team2Id) {
      h2h.total_points_team1 += team1Points;
      h2h.total_points_team2 += team2Points;
      if (team1Points > team2Points) {
        h2h.team1Wins++;
      } else {
        h2h.team2Wins++;
      }
    } else {
      h2h.total_points_team1 += team2Points;
      h2h.total_points_team2 += team1Points;
      if (team2Points > team1Points) {
        h2h.team1Wins++;
      } else {
        h2h.team2Wins++;
      }
    }

    // Update times tied and lead changes
    h2h.timesTied += game.timesTied || 0;
    h2h.leadChanges += game.leadChanges || 0;

    // Update last 5 games
    h2h.last5Games.push(game.id);
    if (h2h.last5Games.length > 5) {
      h2h.last5Games.shift();
    }
  }

  // Insert or update h2h stats into database
  for (const h2h of Array.from(h2hMap.values())) {
    // Check if record already exists
    const existingRecord = await db.query.team_h2h.findFirst({
      where: and(
        eq(schema.team_h2h.season, season),
        eq(schema.team_h2h.team1Id, h2h.team1Id),
        eq(schema.team_h2h.team2Id, h2h.team2Id)
      ),
    });

    const statsData = {
      team1Id: h2h.team1Id,
      team2Id: h2h.team2Id,
      season: season,
      totalGames: h2h.totalGames,
      team1Wins: h2h.team1Wins,
      team2Wins: h2h.team2Wins,
      last5Games: h2h.last5Games,
      averagePointsTeam1: String((h2h.total_points_team1 / h2h.totalGames).toFixed(2)),
      averagePointsTeam2: String((h2h.total_points_team2 / h2h.totalGames).toFixed(2)),
      updatedAt: new Date(),
    };

    if (existingRecord) {
      // Update existing record
      await db
        .update(schema.team_h2h)
        .set(statsData)
        .where(eq(schema.team_h2h.id, existingRecord.id));
      seedLogger.info(`Updated H2H stats for teams ${h2h.team1Id} vs ${h2h.team2Id}`);
    } else {
      // Insert new record
      await db.insert(schema.team_h2h).values({
        id: generateUUID(),
        ...statsData,
        createdAt: new Date(),
      });
      seedLogger.info(`Inserted new H2H stats for teams ${h2h.team1Id} vs ${h2h.team2Id}`);
    }
  }

  seedLogger.info(`Team head-to-head stats seeded for the ${season} season`);
}
