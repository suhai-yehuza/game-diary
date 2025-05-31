import { sql } from 'drizzle-orm';
import { createDatabaseClient } from '../src/lib/db/seed/config';

// Get environment from command line argument or default to development
const environment = process.argv[2] || 'development';

async function setupTriggers() {
  console.log(`🔧 Setting up database triggers for ${environment} environment...`);
  console.log('================================================\n');

  const db = createDatabaseClient({ env: environment, logger: true });

  try {
    // Check if triggers already exist
    console.log('🔍 Checking for existing triggers...');

    const existingTriggers = await db.execute(sql`
      SELECT trigger_name 
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public' 
      AND trigger_name IN ('update_rating_stars_trigger', 'game_logs_ratings_trigger');
    `);

    const existingTriggerNames = existingTriggers.rows.map((row: any) => row.trigger_name);

    // Create rating stars trigger if it doesn't exist
    if (!existingTriggerNames.includes('update_rating_stars_trigger')) {
      console.log('\n⚡ Creating rating stars trigger...');

      // Create or replace the function
      await db.execute(sql`
        CREATE OR REPLACE FUNCTION update_rating_stars()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW."ratingStars" = REPEAT('⭐', NEW."ratingForGame");
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Create the trigger
      await db.execute(sql`
        CREATE TRIGGER update_rating_stars_trigger
          BEFORE INSERT OR UPDATE OF "ratingForGame"
          ON game_logs
          FOR EACH ROW
          EXECUTE FUNCTION update_rating_stars();
      `);

      console.log('✅ Rating stars trigger created');
    } else {
      console.log('✓ Rating stars trigger already exists');
    }

    // Create game ratings trigger if it doesn't exist
    if (!existingTriggerNames.includes('game_logs_ratings_trigger')) {
      console.log('\n⚡ Creating game ratings trigger...');

      // Create or replace the function
      await db.execute(sql`
        CREATE OR REPLACE FUNCTION update_game_ratings()
        RETURNS TRIGGER AS $$
        DECLARE
            v_id VARCHAR(255);
        BEGIN
            IF (TG_OP = 'DELETE') THEN
                IF NOT EXISTS (SELECT 1 FROM game_logs WHERE "gameId" = OLD."gameId") THEN
                    DELETE FROM game_ratings WHERE "gameId" = OLD."gameId";
                ELSE
                    UPDATE game_ratings
                    SET 
                        "averageRating" = (
                            SELECT ROUND(AVG("ratingForGame")::numeric, 2)
                            FROM game_logs
                            WHERE "gameId" = OLD."gameId"
                        ),
                        "totalRatings" = (
                            SELECT COUNT(*)
                            FROM game_logs
                            WHERE "gameId" = OLD."gameId"
                        ),
                        "updatedAt" = NOW()
                    WHERE "gameId" = OLD."gameId";
                END IF;
                RETURN OLD;
            END IF;

            IF (TG_OP = 'INSERT') THEN
                INSERT INTO game_ratings ("id", "gameId", "averageRating", "totalRatings", "createdAt", "updatedAt")
                SELECT 
                    gen_random_uuid()::text,
                    NEW."gameId",
                    ROUND(AVG("ratingForGame")::numeric, 2),
                    COUNT(*),
                    NOW(),
                    NOW()
                FROM game_logs
                WHERE "gameId" = NEW."gameId"
                ON CONFLICT ("gameId") DO UPDATE
                SET 
                    "averageRating" = EXCLUDED."averageRating",
                    "totalRatings" = EXCLUDED."totalRatings",
                    "updatedAt" = NOW();
                RETURN NEW;
            END IF;

            IF (TG_OP = 'UPDATE') THEN
                UPDATE game_ratings
                SET 
                    "averageRating" = (
                        SELECT ROUND(AVG("ratingForGame")::numeric, 2)
                        FROM game_logs
                        WHERE "gameId" = NEW."gameId"
                    ),
                    "totalRatings" = (
                        SELECT COUNT(*)
                        FROM game_logs
                        WHERE "gameId" = NEW."gameId"
                    ),
                    "updatedAt" = NOW()
                WHERE "gameId" = NEW."gameId";
                RETURN NEW;
            END IF;

            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Create the trigger
      await db.execute(sql`
        CREATE TRIGGER game_logs_ratings_trigger
            AFTER INSERT OR UPDATE OR DELETE ON game_logs
            FOR EACH ROW
            EXECUTE FUNCTION update_game_ratings();
      `);

      console.log('✅ Game ratings trigger created');
    } else {
      console.log('✓ Game ratings trigger already exists');
    }

    // Verify triggers are working
    console.log('\n🔍 Verifying triggers...');

    const triggers = await db.execute(sql`
      SELECT 
        trigger_name,
        event_manipulation,
        event_object_table,
        action_statement
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public' 
      AND trigger_name IN ('update_rating_stars_trigger', 'game_logs_ratings_trigger')
      ORDER BY trigger_name;
    `);

    console.log('\n📋 Installed triggers:');
    triggers.rows.forEach((trigger: any) => {
      console.log(
        `  - ${trigger.trigger_name} on ${trigger.event_object_table} (${trigger.event_manipulation})`
      );
    });

    // Success summary
    console.log('\n================================================');
    console.log('🎉 Trigger setup completed successfully!');
    console.log('================================================\n');

    console.log('📝 Next steps:');
    console.log('1. Run "npx tsx src/lib/db/seed/test-trigger.ts" to test the triggers');
    console.log('2. Use your application - triggers will automatically update ratings');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during trigger setup:', error);
    console.error('\n💡 Troubleshooting tips:');
    console.error('1. Make sure your database tables exist (run "pnpm db:setup" first)');
    console.error('2. Check your database connection in .env');
    console.error('3. Ensure you have the necessary permissions to create triggers');
    process.exit(1);
  }
}

// Run the setup
setupTriggers();
