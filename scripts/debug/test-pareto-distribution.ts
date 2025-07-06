import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { seedUserData } from '@src/lib/db/seed/user-data-seed';

config();

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';
if (!databaseUrl) throw new Error('DATABASE_URL required');

const sql = neon(databaseUrl);
const db = drizzle(sql);

async function testParetoDistribution() {
  console.log('🧪 Testing Pareto distribution with larger dataset...\n');

  // Custom configuration with more game logs to demonstrate Pareto distribution
  const testConfig = {
    userCount: 50, // Fewer users but more game logs per user
    gameLogsPerUser: {
      min: 20, // Much more game logs per user
      max: 50,
    },
    commentsPerGameLog: {
      min: 1,
      max: 3,
    },
    friendshipsPerUser: {
      min: 2,
      max: 8,
    },
    reactionsPerGameLog: {
      min: 1,
      max: 3,
    },
    reactionsPerComment: {
      min: 0,
      max: 2,
    },
    childCommentChance: 0.3,
  };

  console.log('📊 Test Configuration:');
  console.log(`   Users: ${testConfig.userCount}`);
  console.log(
    `   Game Logs per User: ${testConfig.gameLogsPerUser.min}-${testConfig.gameLogsPerUser.max}`
  );
  console.log(
    `   Expected Total Game Logs: ~${testConfig.userCount * ((testConfig.gameLogsPerUser.min + testConfig.gameLogsPerUser.max) / 2)}`
  );

  try {
    // Seed with custom configuration
    await seedUserData(testConfig);

    console.log('\n✅ Seeding completed. Now checking distribution...\n');

    // Check the distribution
    const gameLogsResult = (await db.execute('SELECT COUNT(*) as count FROM game_logs')) as any;
    const gameLogsCount = parseInt(gameLogsResult.rows[0].count);

    const uniqueGamesResult = (await db.execute(
      'SELECT COUNT(DISTINCT game_id) as count FROM game_logs'
    )) as any;
    const uniqueGamesCount = parseInt(uniqueGamesResult.rows[0].count);

    console.log('📊 Distribution Summary:');
    console.log(`   Total game logs: ${gameLogsCount}`);
    console.log(`   Unique games with logs: ${uniqueGamesCount}`);

    // Get top 20 games by log count
    const topGamesResult = (await db.execute(`
      SELECT game_id, COUNT(*) as log_count
      FROM game_logs
      GROUP BY game_id
      ORDER BY log_count DESC
      LIMIT 20
    `)) as any;

    console.log('\n🔍 Top 20 Most Logged Games:');
    topGamesResult.rows.forEach((row: any, index: number) => {
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
    console.log(`   Total games with logs: ${allGamesResult.rows.length}`);
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

    // Show distribution breakdown
    console.log('\n📊 Distribution Breakdown:');
    const top10PercentCount = Math.ceil(allGamesResult.rows.length * 0.1);
    const top10PercentLogs = allGamesResult.rows
      .slice(0, top10PercentCount)
      .reduce((sum: number, row: any) => sum + parseInt(row.log_count), 0);

    console.log(
      `   Top 10% of games: ${((top10PercentLogs / totalLogs) * 100).toFixed(1)}% of logs`
    );
    console.log(
      `   Top 20% of games: ${((top20PercentLogs / totalLogs) * 100).toFixed(1)}% of logs`
    );
    console.log(
      `   Top 50% of games: ${((allGamesResult.rows.slice(0, Math.ceil(allGamesResult.rows.length * 0.5)).reduce((sum: number, row: any) => sum + parseInt(row.log_count), 0) / totalLogs) * 100).toFixed(1)}% of logs`
    );
  } catch (error) {
    console.error('❌ Error testing Pareto distribution:', error);
  }
}

testParetoDistribution().catch(console.error);
