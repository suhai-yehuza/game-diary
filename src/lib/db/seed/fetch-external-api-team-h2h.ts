import { sql, and, eq } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import * as schema from '@/lib/db/schema';
import { generateUUID } from '@/lib/utils/index.processing';

export async function fetchAndProcessTeamH2H(db: NeonHttpDatabase<typeof schema>, season: number) {
  console.log(`Seeding team head-to-head stats for the ${season} season...`);

  // Get all games for the season
  const games = await db.query.nba_games.findMany({
    where: sql`season_id = ${season}`,
  });

  // Create a map to store h2h stats for each team pair
  const h2hMap = new Map<
    string,
    {
      team1_id: string;
      team2_id: string;
      total_games: number;
      team1_wins: number;
      team2_wins: number;
      last_5_games: string[];
      total_points_team1: number;
      total_points_team2: number;
      times_tied: number;
      lead_changes: number;
    }
  >();

  // Process each game
  for (const game of games) {
    const teamsData = game.teams as {
      visitors: { id: string; name: string; nickname: string; code: string };
      home: { id: string; name: string; nickname: string; code: string };
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

    const team1Id = teamsData.visitors.id;
    const team2Id = teamsData.home.id;

    // Create a unique key for the team pair (always use smaller ID first)
    const key = [team1Id, team2Id].sort().join('-');

    if (!h2hMap.has(key)) {
      h2hMap.set(key, {
        team1_id: [team1Id, team2Id].sort()[0],
        team2_id: [team1Id, team2Id].sort()[1],
        total_games: 0,
        team1_wins: 0,
        team2_wins: 0,
        last_5_games: [],
        total_points_team1: 0,
        total_points_team2: 0,
        times_tied: 0,
        lead_changes: 0,
      });
    }

    const h2h = h2hMap.get(key)!;
    h2h.total_games++;

    // Update points and wins
    const team1Points = scoresData.visitors.points;
    const team2Points = scoresData.home.points;

    if (team1Id < team2Id) {
      h2h.total_points_team1 += team1Points;
      h2h.total_points_team2 += team2Points;
      if (team1Points > team2Points) {
        h2h.team1_wins++;
      } else {
        h2h.team2_wins++;
      }
    } else {
      h2h.total_points_team1 += team2Points;
      h2h.total_points_team2 += team1Points;
      if (team2Points > team1Points) {
        h2h.team1_wins++;
      } else {
        h2h.team2_wins++;
      }
    }

    // Update times tied and lead changes
    h2h.times_tied += game.times_tied || 0;
    h2h.lead_changes += game.lead_changes || 0;

    // Update last 5 games
    h2h.last_5_games.push(game.id);
    if (h2h.last_5_games.length > 5) {
      h2h.last_5_games.shift();
    }
  }

  // Insert or update h2h stats into database
  for (const h2h of Array.from(h2hMap.values())) {
    // Check if record already exists
    const existingRecord = await db.query.team_h2h.findFirst({
      where: and(
        eq(schema.team_h2h.season_id, season),
        eq(schema.team_h2h.team1_id, h2h.team1_id),
        eq(schema.team_h2h.team2_id, h2h.team2_id)
      ),
    });

    const statsData = {
      team1_id: h2h.team1_id,
      team2_id: h2h.team2_id,
      season_id: season,
      total_games: h2h.total_games,
      team1_wins: h2h.team1_wins,
      team2_wins: h2h.team2_wins,
      last_5_games: h2h.last_5_games,
      average_points_team1: String((h2h.total_points_team1 / h2h.total_games).toFixed(2)),
      average_points_team2: String((h2h.total_points_team2 / h2h.total_games).toFixed(2)),
      updated_at: new Date(),
    };

    if (existingRecord) {
      // Update existing record
      await db
        .update(schema.team_h2h)
        .set(statsData)
        .where(eq(schema.team_h2h.id, existingRecord.id));
      console.log(`Updated H2H stats for teams ${h2h.team1_id} vs ${h2h.team2_id}`);
    } else {
      // Insert new record
      await db.insert(schema.team_h2h).values({
        id: generateUUID(),
        ...statsData,
        created_at: new Date(),
      });
      console.log(`Inserted new H2H stats for teams ${h2h.team1_id} vs ${h2h.team2_id}`);
    }
  }

  console.log(`Team head-to-head stats seeded for the ${season} season`);
}
