DROP FUNCTION IF EXISTS update_game_ratings() CASCADE;

-- Create function to update game ratings
CREATE OR REPLACE FUNCTION update_game_ratings()
RETURNS TRIGGER AS $$
DECLARE
    v_id VARCHAR(255);
BEGIN
    -- If this is a DELETE operation
    IF (TG_OP = 'DELETE') THEN
        -- Delete the game rating if no logs remain
        IF NOT EXISTS (SELECT 1 FROM game_logs WHERE "gameId" = OLD."gameId") THEN
            DELETE FROM game_ratings WHERE "gameId" = OLD."gameId";
        ELSE
            -- Update the average rating and total count
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

    -- If this is an INSERT operation
    IF (TG_OP = 'INSERT') THEN
        -- Insert or update the game rating
        INSERT INTO game_ratings ("gameId", "averageRating", "totalRatings", "createdAt", "updatedAt")
        SELECT 
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

    -- If this is an UPDATE operation
    IF (TG_OP = 'UPDATE') THEN
        -- Update the game rating
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

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS game_logs_ratings_trigger ON game_logs;

-- Create the trigger
CREATE TRIGGER game_logs_ratings_trigger
    AFTER INSERT OR UPDATE OR DELETE ON game_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_game_ratings(); 