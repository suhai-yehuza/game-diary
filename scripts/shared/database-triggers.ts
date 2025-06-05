import { sql } from 'drizzle-orm';

import { createDatabaseClient } from '@/lib/db/seed/config';
import { logger } from '@/lib/logger';
import { TriggerSetupOptions } from '@/lib/types/consolidated.types';

export async function createRatingStarsTrigger(
  db: ReturnType<typeof createDatabaseClient>,
  options: TriggerSetupOptions = {}
): Promise<void> {
  logger.info('⚡ Creating rating stars trigger...');

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

  // Drop existing trigger if requested
  if (options.dropExisting) {
    await db.execute(sql`
      DROP TRIGGER IF EXISTS update_rating_stars_trigger ON game_logs;
      DROP FUNCTION IF EXISTS update_rating_stars();
    `);
  }

  // Create the trigger
  await db.execute(sql`
    CREATE TRIGGER update_rating_stars_trigger
      BEFORE INSERT OR UPDATE OF "ratingForGame"
      ON game_logs
      FOR EACH ROW
      EXECUTE FUNCTION update_rating_stars();
  `);

  logger.info('✅ Rating stars trigger created');
}

export async function createGameRatingsTrigger(
  db: ReturnType<typeof createDatabaseClient>,
  options: TriggerSetupOptions = {}
): Promise<void> {
  logger.info('⚡ Creating game ratings trigger...');

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

  // Drop existing trigger if requested
  if (options.dropExisting) {
    await db.execute(sql`
      DROP TRIGGER IF EXISTS game_logs_ratings_trigger ON game_logs;
    `);
  }

  // Create the trigger
  await db.execute(sql`
    CREATE TRIGGER game_logs_ratings_trigger
        AFTER INSERT OR UPDATE OR DELETE ON game_logs
        FOR EACH ROW
        EXECUTE FUNCTION update_game_ratings();
  `);

  logger.info('✅ Game ratings trigger created');
}

export async function checkExistingTriggers(
  db: ReturnType<typeof createDatabaseClient>
): Promise<string[]> {
  logger.info('🔍 Checking for existing triggers...');

  const existingTriggers = await db.execute(sql`
    SELECT trigger_name 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    AND trigger_name IN ('update_rating_stars_trigger', 'game_logs_ratings_trigger');
  `);

  return existingTriggers.rows.map((row: any) => row.trigger_name);
}

export async function verifyTriggers(db: ReturnType<typeof createDatabaseClient>): Promise<void> {
  logger.info('🔍 Verifying triggers...');

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

  logger.info('📋 Installed triggers:');
  triggers.rows.forEach((trigger: any) => {
    logger.info(
      `  - ${trigger.trigger_name} on ${trigger.event_object_table} (${trigger.event_manipulation})`
    );
  });
}

export async function setupAllTriggers(
  db: ReturnType<typeof createDatabaseClient>,
  options: TriggerSetupOptions = {}
): Promise<void> {
  try {
    const existingTriggerNames = options.skipVerification ? [] : await checkExistingTriggers(db);

    // Create rating stars trigger if it doesn't exist
    if (options.dropExisting || !existingTriggerNames.includes('update_rating_stars_trigger')) {
      await createRatingStarsTrigger(db, options);
    } else {
      logger.info('✓ Rating stars trigger already exists');
    }

    // Create game ratings trigger if it doesn't exist
    if (options.dropExisting || !existingTriggerNames.includes('game_logs_ratings_trigger')) {
      await createGameRatingsTrigger(db, options);
    } else {
      logger.info('✓ Game ratings trigger already exists');
    }

    if (!options.skipVerification) {
      await verifyTriggers(db);
    }

    logger.info('🎉 All triggers set up successfully!');
  } catch (error) {
    logger.error('❌ Error setting up triggers:', error);
    throw error;
  }
}
