import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

config();

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';
if (!databaseUrl) throw new Error('DATABASE_URL required');

const sql = neon(databaseUrl);
const db = drizzle(sql);

async function checkGameDistribution() {
  console.log('🎮 Checking game log vs game rating distribution...\n');

  // Count game logs
  const gameLogsResult = (await db.execute('SELECT COUNT(*) as count FROM game_logs')) as any;
  const gameLogsCount = parseInt(gameLogsResult.rows[0].count);

  // Count game ratings
  const gameRatingsResult = (await db.execute('SELECT COUNT(*) as count FROM game_ratings')) as any;
  const gameRatingsCount = parseInt(gameRatingsResult.rows[0].count);

  // Count unique games in game logs
  const uniqueGamesResult = (await db.execute(
    'SELECT COUNT(DISTINCT game_id) as count FROM game_logs'
  )) as any;
  const uniqueGamesCount = parseInt(uniqueGamesResult.rows[0].count);

  // Count total available games
  const totalGamesResult = (await db.execute('SELECT COUNT(*) as count FROM nba_games')) as any;
  const totalGamesCount = parseInt(totalGamesResult.rows[0].count);

  console.log('📊 Distribution Summary:');
  console.log(`   Total game logs: ${gameLogsCount}`);
  console.log(`   Total game ratings: ${gameRatingsCount}`);
  console.log(`   Unique games with logs: ${uniqueGamesCount}`);
  console.log(`   Total available games: ${totalGamesCount}`);
  console.log(`   Coverage: ${((uniqueGamesCount / totalGamesCount) * 100).toFixed(1)}%`);

  // Check if Pareto distribution is working by looking at game log distribution
  console.log('\n🔍 Game Log Distribution (Top 10 most logged games):');
  const topGamesResult = (await db.execute(`
    SELECT game_id, COUNT(*) as log_count
    FROM game_logs
    GROUP BY game_id
    ORDER BY log_count DESC
    LIMIT 10
  `)) as any;

  topGamesResult.rows.forEach((row: any, index: number) => {
    console.log(`   ${index + 1}. Game ${row.game_id}: ${row.log_count} logs`);
  });

  // Check bottom 10 games
  console.log('\n🔍 Game Log Distribution (Bottom 10 least logged games):');
  const bottomGamesResult = (await db.execute(`
    SELECT game_id, COUNT(*) as log_count
    FROM game_logs
    GROUP BY game_id
    ORDER BY log_count ASC
    LIMIT 10
  `)) as any;

  bottomGamesResult.rows.forEach((row: any, index: number) => {
    console.log(`   ${index + 1}. Game ${row.game_id}: ${row.log_count} logs`);
  });

  // Calculate Pareto distribution metrics
  const allGamesResult = (await db.execute(`
    SELECT game_id, COUNT(*) as log_count
    FROM game_logs
    GROUP BY game_id
    ORDER BY log_count DESC
  `)) as any;

  const totalLogs = allGamesResult.rows.reduce(
    (sum: number, row: any) => sum + parseInt(row.log_count),
    0
  );
  const top20PercentCount = Math.ceil(allGamesResult.rows.length * 0.2);
  const top20PercentLogs = allGamesResult.rows
    .slice(0, top20PercentCount)
    .reduce((sum: number, row: any) => sum + parseInt(row.log_count), 0);

  console.log('\n📈 Pareto Distribution Analysis:');
  console.log(`   Top 20% of games: ${top20PercentCount} games`);
  console.log(`   Logs in top 20%: ${top20PercentLogs} logs`);
  console.log(`   Total logs: ${totalLogs} logs`);
  console.log(`   Top 20% share: ${((top20PercentLogs / totalLogs) * 100).toFixed(1)}%`);
  console.log(`   Expected (80/20 rule): 80.0%`);

  if (top20PercentLogs / totalLogs > 0.7) {
    console.log('   ✅ Pareto distribution is working correctly!');
  } else {
    console.log('   ❌ Pareto distribution is not working as expected');
  }
}

checkGameDistribution().catch(console.error);
