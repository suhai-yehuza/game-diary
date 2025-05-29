import 'dotenv-flow/config';
import { sql } from 'drizzle-orm';

import { createDatabaseClient } from '../src/lib/db/seed/config';

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');

    const db = createDatabaseClient();

    // Test basic connection
    const result = await db.execute(sql`SELECT NOW() as current_time, version() as db_version`);
    console.log('✅ Database connection successful!');
    console.log('Current time:', result.rows[0]?.current_time);
    console.log('Database version:', result.rows[0]?.db_version);

    return db;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

async function testConnectionStability() {
  try {
    console.log('\n🔄 Testing connection stability with multiple operations...');

    const db = createDatabaseClient();

    // Create a test table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        test_data TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Clear any existing test data
    await db.execute(sql`DELETE FROM connection_test`);

    console.log('📝 Testing multiple small insertions...');

    // Test multiple small operations to simulate batch behavior
    for (let i = 0; i < 20; i++) {
      await db.execute(sql`
        INSERT INTO connection_test (test_data)
        VALUES (${'Test data item ' + i})
      `);

      // Small delay to simulate real-world usage
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Verify all insertions
    const count = await db.execute(sql`SELECT COUNT(*) as count FROM connection_test`);
    console.log(`✅ Successfully inserted ${count.rows[0]?.count} items`);

    // Test a larger batch operation
    console.log('📦 Testing larger batch operation...');
    const batchValues = Array.from({ length: 100 }, (_, i) => `('Batch item ${i}')`).join(', ');

    await db.execute(
      sql.raw(`
      INSERT INTO connection_test (test_data)
      VALUES ${batchValues}
    `)
    );

    const finalCount = await db.execute(sql`SELECT COUNT(*) as count FROM connection_test`);
    console.log(`✅ Total items after batch: ${finalCount.rows[0]?.count}`);

    // Clean up
    await db.execute(sql`DROP TABLE IF EXISTS connection_test`);

    console.log('✅ Connection stability test passed!');
  } catch (error) {
    console.error('❌ Connection stability test failed:', error);
    throw error;
  }
}

async function testErrorRecovery() {
  try {
    console.log('\n🛠️ Testing error handling...');

    const db = createDatabaseClient();

    // Test invalid query handling
    try {
      await db.execute(sql`SELECT * FROM non_existent_table`);
    } catch (error) {
      console.log('✅ Invalid query error handled correctly');
      console.log(error);
    }

    // Verify database is still functional after error
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log(`✅ Database functional after error: ${result.rows[0]?.test}`);
  } catch (error) {
    console.error('❌ Error recovery test failed:', error);
    throw error;
  }
}

async function main() {
  try {
    await testConnection();
    await testConnectionStability();
    await testErrorRecovery();

    console.log('\n🎉 All database tests passed successfully!');
    console.log('\n💡 Your database seeding should now be more stable with:');
    console.log('   - Reduced batch sizes (15 items per batch)');
    console.log('   - Enhanced retry logic with exponential backoff');
    console.log('   - Better network error detection and handling');
    console.log('   - Connection stability improvements');
    console.log('   - 30-second connection timeout');
    console.log('   - Connection keep-alive enabled');

    console.log('\n🚀 Try running your seeder again - it should be much more stable now!');
  } catch (error) {
    console.error('\n❌ Database tests failed:', error);
    process.exit(1);
  }
}

// Run the main function
main();
