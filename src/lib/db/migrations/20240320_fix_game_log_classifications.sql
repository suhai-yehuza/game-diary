-- Create the classification enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE classification_type AS ENUM ('PRIVATE', 'PROTECTED', 'PUBLIC');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update existing 'nba' values to 'PROTECTED'
UPDATE game_logs
SET classification = 'PROTECTED'
WHERE classification = 'nba';

-- Add a check constraint to ensure only valid values are used
ALTER TABLE game_logs
DROP CONSTRAINT IF EXISTS game_logs_classification_check;

ALTER TABLE game_logs
ADD CONSTRAINT game_logs_classification_check
CHECK (classification::text IN ('PRIVATE', 'PROTECTED', 'PUBLIC'));

-- Update the column type to use the enum and set default to 'PROTECTED'
ALTER TABLE game_logs
ALTER COLUMN classification TYPE classification_type
USING classification::classification_type,
ALTER COLUMN classification SET DEFAULT 'PROTECTED'; 