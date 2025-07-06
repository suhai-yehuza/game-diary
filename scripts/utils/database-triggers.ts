#!/usr/bin/env tsx

import { sql } from 'drizzle-orm';

import { logger } from '@lib/core/logger';
import type { createDatabaseClient } from '@src/lib/db';
import type { ITriggerSetupOptions } from '@src/lib/types';

async function createGameRatingsTrigger(
  db: ReturnType<typeof createDatabaseClient>,
  options: ITriggerSetupOptions = {}
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
            IF NOT EXISTS (SELECT 1 FROM game_logs WHERE game_id = OLD.game_id) THEN
                DELETE FROM game_ratings WHERE game_id = OLD.game_id;
            ELSE
                UPDATE game_ratings
                SET
                    average_rating = (
                        SELECT ROUND(AVG(rating_for_game)::numeric, 2)
                        FROM game_logs
                        WHERE game_id = OLD.game_id
                    ),
                    total_ratings = (
                        SELECT COUNT(*)
                        FROM game_logs
                        WHERE game_id = OLD.game_id
                    ),
                    updated_at = NOW()
                WHERE game_id = OLD.game_id;
            END IF;
            RETURN OLD;
        END IF;

        IF (TG_OP = 'INSERT') THEN
            INSERT INTO game_ratings (id, game_id, average_rating, total_ratings, created_at, updated_at)
            SELECT
                gen_random_uuid()::text,
                NEW.game_id,
                ROUND(AVG(rating_for_game)::numeric, 2),
                COUNT(*),
                NOW(),
                NOW()
            FROM game_logs
            WHERE game_id = NEW.game_id
            ON CONFLICT (game_id) DO UPDATE
            SET
                average_rating = EXCLUDED.average_rating,
                total_ratings = EXCLUDED.total_ratings,
                updated_at = NOW();
            RETURN NEW;
        END IF;

        IF (TG_OP = 'UPDATE') THEN
            UPDATE game_ratings
            SET
                average_rating = (
                    SELECT ROUND(AVG(rating_for_game)::numeric, 2)
                    FROM game_logs
                    WHERE game_id = NEW.game_id
                ),
                total_ratings = (
                    SELECT COUNT(*)
                    FROM game_logs
                    WHERE game_id = NEW.game_id
                ),
                updated_at = NOW()
            WHERE game_id = NEW.game_id;
            RETURN NEW;
        END IF;

        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Drop existing trigger if requested
  if (options.dropExisting) {
    await db.execute(sql`DROP TRIGGER IF EXISTS game_logs_ratings_trigger ON game_logs`);
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

async function createNotificationTriggers(
  db: ReturnType<typeof createDatabaseClient>,
  options: ITriggerSetupOptions = {}
): Promise<void> {
  logger.info('⚡ Creating notification triggers...');

  // Create UUID generation function
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION generate_uuid_v4()
    RETURNS VARCHAR AS $$
    BEGIN
        RETURN gen_random_uuid()::VARCHAR;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create friendship notification function and trigger
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION create_friend_request_notification()
    RETURNS TRIGGER AS $$
    DECLARE
        sender_username VARCHAR;
        sender_name VARCHAR;
    BEGIN
        -- Create notification for new pending friend requests
        IF NEW.status = 'Pending' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'Pending')) THEN
            -- Get sender's username and name
            SELECT username, CONCAT(first_name, ' ', last_name)
            INTO sender_username, sender_name
            FROM users
            WHERE id = NEW.user_id;

            -- Use username if name is not available
            IF sender_name IS NULL OR sender_name = ' ' THEN
                sender_name := sender_username;
            END IF;

            -- Create notification for the recipient
            INSERT INTO notifications (
                id, user_id, type, title, message, target_id, target_type,
                resolved, created_at, updated_at
            ) VALUES (
                generate_uuid_v4(), NEW.friend_id, 'friend_request', 'New Friend Request',
                sender_name || ' sent you a friend request', NEW.id, 'friendship',
                false, NOW(), NOW()
            );
        END IF;

        -- Create notification when friend request is accepted
        IF NEW.status = 'Accepted' AND TG_OP = 'UPDATE' AND OLD.status = 'Pending' THEN
            -- Get acceptor's username and name
            SELECT username, CONCAT(first_name, ' ', last_name)
            INTO sender_username, sender_name
            FROM users
            WHERE id = NEW.friend_id;

            -- Use username if name is not available
            IF sender_name IS NULL OR sender_name = ' ' THEN
                sender_name := sender_username;
            END IF;

            -- Create notification for the original sender
            INSERT INTO notifications (
                id, user_id, type, title, message, target_id, target_type,
                resolved, created_at, updated_at
            ) VALUES (
                generate_uuid_v4(), NEW.user_id, 'friend_request_accepted', 'Friend Request Accepted',
                sender_name || ' accepted your friend request', NEW.id, 'friendship',
                false, NOW(), NOW()
            );
        END IF;

        -- Create notification when friend request is rejected
        IF NEW.status = 'Rejected' AND TG_OP = 'UPDATE' AND OLD.status = 'Pending' THEN
            -- Get rejector's username and name
            SELECT username, CONCAT(first_name, ' ', last_name)
            INTO sender_username, sender_name
            FROM users
            WHERE id = NEW.friend_id;

            -- Use username if name is not available
            IF sender_name IS NULL OR sender_name = ' ' THEN
                sender_name := sender_username;
            END IF;

            -- Create notification for the original sender
            INSERT INTO notifications (
                id, user_id, type, title, message, target_id, target_type,
                resolved, created_at, updated_at
            ) VALUES (
                generate_uuid_v4(), NEW.user_id, 'friend_request_rejected', 'Friend Request Declined',
                sender_name || ' declined your friend request', NEW.id, 'friendship',
                false, NOW(), NOW()
            );
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create comment notification function
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION create_comment_notification()
    RETURNS TRIGGER AS $$
    DECLARE
        commenter_username VARCHAR;
        commenter_name VARCHAR;
        target_owner_id VARCHAR;
        target_content TEXT;
    BEGIN
        -- Skip if user is commenting on their own content
        IF TG_OP = 'INSERT' THEN
            -- Get commenter's info
            SELECT username, CONCAT(first_name, ' ', last_name)
            INTO commenter_username, commenter_name
            FROM users
            WHERE id = NEW.user_id;

            -- Use username if name is not available
            IF commenter_name IS NULL OR commenter_name = ' ' THEN
                commenter_name := commenter_username;
            END IF;

            -- Handle different parent types
            IF NEW.parent_type = 'GAME_LOG' THEN
                -- Get game log owner and content
                SELECT user_id, notes
                INTO target_owner_id, target_content
                FROM game_logs
                WHERE id = NEW.parent_id;

                -- Skip if commenting on own game log
                IF target_owner_id = NEW.user_id THEN
                    RETURN NEW;
                END IF;

                -- Create notification for game log owner
                INSERT INTO notifications (
                    id, user_id, type, title, message, target_id, target_type,
                    resolved, created_at, updated_at
                ) VALUES (
                    generate_uuid_v4(), target_owner_id, 'comment_added', 'New Comment on Your Game Log',
                    commenter_name || ' commented on your game log', NEW.id, 'comment',
                    false, NOW(), NOW()
                );

            ELSIF NEW.parent_type = 'COMMENT' THEN
                -- Get parent comment owner and content
                SELECT user_id, content
                INTO target_owner_id, target_content
                FROM comments
                WHERE id = NEW.parent_id;

                -- Skip if replying to own comment
                IF target_owner_id = NEW.user_id THEN
                    RETURN NEW;
                END IF;

                -- Create notification for parent comment owner
                INSERT INTO notifications (
                    id, user_id, type, title, message, target_id, target_type,
                    resolved, created_at, updated_at
                ) VALUES (
                    generate_uuid_v4(), target_owner_id, 'comment_reply', 'New Reply to Your Comment',
                    commenter_name || ' replied to your comment', NEW.id, 'comment',
                    false, NOW(), NOW()
                );
            END IF;
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create reaction notification function
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION create_reaction_notification()
    RETURNS TRIGGER AS $$
    DECLARE
        reactor_username VARCHAR;
        reactor_name VARCHAR;
        target_owner_id VARCHAR;
        target_content VARCHAR;
        target_type_name VARCHAR;
    BEGIN
        -- Skip if user is reacting to their own content
        IF TG_OP = 'INSERT' THEN
            -- Get reactor's info
            SELECT username, CONCAT(first_name, ' ', last_name)
            INTO reactor_username, reactor_name
            FROM users
            WHERE id = NEW.user_id;

            -- Use username if name is not available
            IF reactor_name IS NULL OR reactor_name = ' ' THEN
                reactor_name := reactor_username;
            END IF;

            -- Handle different target types
            IF NEW.target_type = 'GAME_LOG' THEN
                -- Get game log owner and content
                SELECT user_id, notes
                INTO target_owner_id, target_content
                FROM game_logs
                WHERE id = NEW.target_id;

                -- Skip if reacting to own game log
                IF target_owner_id = NEW.user_id THEN
                    RETURN NEW;
                END IF;

                target_type_name := 'game log';

            ELSIF NEW.target_type = 'COMMENT' THEN
                -- Get comment owner and content
                SELECT user_id, content
                INTO target_owner_id, target_content
                FROM comments
                WHERE id = NEW.target_id;

                -- Skip if reacting to own comment
                IF target_owner_id = NEW.user_id THEN
                    RETURN NEW;
                END IF;

                target_type_name := 'comment';
            END IF;

            -- Create notification for content owner
            INSERT INTO notifications (
                id, user_id, type, title, message, target_id, target_type,
                resolved, created_at, updated_at
            ) VALUES (
                generate_uuid_v4(), target_owner_id, 'reaction_added', 'New Reaction on Your ' || target_type_name,
                reactor_name || ' reacted with ' || NEW.emoji || ' to your ' || target_type_name, NEW.id, 'reaction',
                false, NOW(), NOW()
            );
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Drop existing triggers if requested
  if (options.dropExisting) {
    await db.execute(sql`DROP TRIGGER IF EXISTS friendship_notification_trigger ON friendships`);
    await db.execute(sql`DROP TRIGGER IF EXISTS comment_notification_trigger ON comments`);
    await db.execute(sql`DROP TRIGGER IF EXISTS reaction_notification_trigger ON reactions`);
  }

  // Create all notification triggers
  await db.execute(sql`
    CREATE TRIGGER friendship_notification_trigger
        AFTER INSERT OR UPDATE ON friendships
        FOR EACH ROW
        EXECUTE FUNCTION create_friend_request_notification();
  `);

  await db.execute(sql`
    CREATE TRIGGER comment_notification_trigger
        AFTER INSERT ON comments
        FOR EACH ROW
        EXECUTE FUNCTION create_comment_notification();
  `);

  await db.execute(sql`
    CREATE TRIGGER reaction_notification_trigger
        AFTER INSERT ON reactions
        FOR EACH ROW
        EXECUTE FUNCTION create_reaction_notification();
  `);

  logger.info('✅ Notification triggers created');
}

async function checkExistingTriggers(
  db: ReturnType<typeof createDatabaseClient>
): Promise<string[]> {
  logger.info('🔍 Checking for existing triggers...');

  const existingTriggers = (await db.execute(sql`
    SELECT trigger_name
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name IN (
      'update_rating_stars_trigger',
      'game_logs_ratings_trigger',
      'friendship_notification_trigger',
      'comment_notification_trigger',
      'reaction_notification_trigger'
    );
  `)) as unknown as { rows: { trigger_name: string }[] };

  return existingTriggers.rows.map(row => row.trigger_name);
}

async function verifyTriggers(db: ReturnType<typeof createDatabaseClient>): Promise<void> {
  logger.info('🔍 Verifying triggers...');

  const triggers = (await db.execute(sql`
    SELECT
      trigger_name,
      event_manipulation,
      event_object_table,
      action_statement
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name IN (
      'update_rating_stars_trigger',
      'game_logs_ratings_trigger',
      'friendship_notification_trigger',
      'comment_notification_trigger',
      'reaction_notification_trigger'
    )
    ORDER BY trigger_name;
  `)) as unknown as {
    rows: Array<{
      trigger_name: string;
      event_object_table: string;
      event_manipulation: string;
      action_statement: string;
    }>;
  };

  logger.info('📋 Installed triggers:');
  triggers.rows.forEach(trigger => {
    logger.info(
      `  - ${trigger.trigger_name} on ${trigger.event_object_table} (${trigger.event_manipulation})`
    );
  });
}

export async function setupAllTriggers(
  db: ReturnType<typeof createDatabaseClient>,
  options: ITriggerSetupOptions = {}
): Promise<void> {
  try {
    const existingTriggerNames = options.skipVerification ? [] : await checkExistingTriggers(db);

    // Create game ratings trigger
    if (options.dropExisting || !existingTriggerNames.includes('game_logs_ratings_trigger')) {
      await createGameRatingsTrigger(db, options);
    } else {
      logger.info('✓ Game ratings trigger already exists');
    }

    // Create notification triggers
    if (
      options.dropExisting ||
      !existingTriggerNames.includes('friendship_notification_trigger') ||
      !existingTriggerNames.includes('comment_notification_trigger') ||
      !existingTriggerNames.includes('reaction_notification_trigger')
    ) {
      await createNotificationTriggers(db, options);
    } else {
      logger.info('✓ Notification triggers already exist');
    }
  } catch (err) {
    logger.error('❌ Error setting up triggers:', err);
    throw err;
  }
}
