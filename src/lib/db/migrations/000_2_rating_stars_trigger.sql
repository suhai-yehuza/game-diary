-- Create the trigger function
CREATE OR REPLACE FUNCTION update_rating_stars()
RETURNS TRIGGER AS $$
BEGIN
  NEW."ratingStars" = REPEAT('⭐', NEW."ratingForGame");
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_rating_stars_trigger ON game_logs;
CREATE TRIGGER update_rating_stars_trigger
  BEFORE INSERT OR UPDATE OF "ratingForGame"
  ON game_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_stars(); 