-- Create function to update game ratings
CREATE OR REPLACE FUNCTION update_game_ratings()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a DELETE operation
    IF (TG_OP = 'DELETE') THEN
        -- Delete the game rating if no logs remain
        IF NOT EXISTS (SELECT 1 FROM game_logs WHERE game_id = OLD.game_id) THEN
            DELETE FROM game_ratings WHERE game_id = OLD.game_id;
        ELSE
            -- Update the average rating and total count
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

    -- If this is an INSERT operation
    IF (TG_OP = 'INSERT') THEN
        -- Insert or update the game rating
        INSERT INTO game_ratings (game_id, average_rating, total_ratings, created_at, updated_at)
        SELECT 
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

    -- If this is an UPDATE operation
    IF (TG_OP = 'UPDATE') THEN
        -- Update the game rating
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

-- Create triggers
DROP TRIGGER IF EXISTS game_logs_ratings_trigger ON game_logs;
CREATE TRIGGER game_logs_ratings_trigger
    AFTER INSERT OR UPDATE OR DELETE ON game_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_game_ratings(); 