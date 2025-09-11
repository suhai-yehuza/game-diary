#!/usr/bin/env tsx

/**
 * Debug script to test the games API and database connection
 * Helps identify the root cause of 500 errors
 */

import { db } from '../src/lib/db';
import { basketball_games } from '../src/lib/db/schema';
import { sql } from 'drizzle-orm';
import { logger } from '../src/lib/utils/logger';

class GamesAPIDebugger {
  async testDatabaseConnection(): Promise<void> {
    console.log('🔍 Testing Database Connection\n');

    try {
      const database = db();
      if (!database) {
        console.log('❌ Database connection not available');
        return;
      }

      console.log('✅ Database connection established');

      // Test basic query
      const result = await database.select({ count: sql<number>`count(*)` }).from(basketball_games);
      console.log(`✅ Games table accessible, total games: ${result[0]?.count || 0}`);
    } catch (error) {
      console.log(`❌ Database connection failed: ${error}`);
    }
  }

  async testGamesQuery(): Promise<void> {
    console.log('\n🎮 Testing Games Query\n');

    try {
      const database = db();
      if (!database) {
        console.log('❌ Database connection not available');
        return;
      }

      // Test basic games query
      const games = await database.query.basketball_games.findMany({
        limit: 5,
        orderBy: [basketball_games.date],
      });

      console.log(`✅ Found ${games.length} games`);

      if (games.length > 0) {
        const firstGame = games[0];
        console.log('📋 Sample game data:');
        console.log(`   ID: ${firstGame.id}`);
        console.log(`   Date: ${firstGame.date}`);
        console.log(`   Season: ${firstGame.season}`);
        console.log(`   Status: ${firstGame.game_status}`);
        console.log(`   Teams: ${JSON.stringify(firstGame.teams)}`);
      }
    } catch (error) {
      console.log(`❌ Games query failed: ${error}`);
    }
  }

  async testSeasonsQuery(): Promise<void> {
    console.log('\n📅 Testing Seasons Query\n');

    try {
      const database = db();
      if (!database) {
        console.log('❌ Database connection not available');
        return;
      }

      // Test seasons query
      const seasons = await database
        .select({ season: basketball_games.season })
        .from(basketball_games)
        .groupBy(basketball_games.season)
        .orderBy(basketball_games.season);

      console.log(`✅ Found ${seasons.length} seasons:`);
      seasons.forEach(({ season }) => {
        console.log(`   - ${season}`);
      });
    } catch (error) {
      console.log(`❌ Seasons query failed: ${error}`);
    }
  }

  async testStatusQuery(): Promise<void> {
    console.log('\n🏷️  Testing Status Query\n');

    try {
      const database = db();
      if (!database) {
        console.log('❌ Database connection not available');
        return;
      }

      // Test status query
      const statuses = await database
        .select({ status: basketball_games.game_status })
        .from(basketball_games)
        .groupBy(basketball_games.game_status)
        .orderBy(basketball_games.game_status);

      console.log(`✅ Found ${statuses.length} statuses:`);
      statuses.forEach(({ status }) => {
        console.log(`   - ${status}`);
      });
    } catch (error) {
      console.log(`❌ Status query failed: ${error}`);
    }
  }

  async testAPIEndpoint(): Promise<void> {
    console.log('\n🌐 Testing API Endpoint\n');

    const testCases = [
      { name: 'Basic query', url: 'http://localhost:3000/api/games?page=1&limit=5' },
      { name: 'Season 2024', url: 'http://localhost:3000/api/games?season=2024&page=1&limit=5' },
      {
        name: 'Finished games',
        url: 'http://localhost:3000/api/games?status=finished&page=1&limit=5',
      },
      { name: 'All seasons', url: 'http://localhost:3000/api/games?season=all&page=1&limit=5' },
    ];

    for (const testCase of testCases) {
      try {
        console.log(`🧪 Testing: ${testCase.name}`);
        const response = await fetch(testCase.url);

        if (response.ok) {
          const data = await response.json();
          console.log(
            `   ✅ Success: ${data.data?.length || 0} games, total: ${data.pagination?.totalCount || 0}`
          );
        } else {
          console.log(`   ❌ Failed: HTTP ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error}`);
      }
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Games API Debug Tests\n');

    await this.testDatabaseConnection();
    await this.testGamesQuery();
    await this.testSeasonsQuery();
    await this.testStatusQuery();
    await this.testAPIEndpoint();

    console.log('\n🎉 Debug Tests Complete!');
  }
}

// Main execution
async function main() {
  const apiDebugger = new GamesAPIDebugger();

  try {
    await apiDebugger.runAllTests();
  } catch (error) {
    console.error('❌ Debug test execution failed:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);

export { GamesAPIDebugger };
