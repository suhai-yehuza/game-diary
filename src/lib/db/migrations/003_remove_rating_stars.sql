-- Drop the rating stars trigger
DROP TRIGGER IF EXISTS update_rating_stars_trigger ON game_logs;

-- Drop the rating stars function
DROP FUNCTION IF EXISTS update_rating_stars();

-- Remove the ratingStars column
ALTER TABLE game_logs DROP COLUMN IF EXISTS "ratingStars"; 