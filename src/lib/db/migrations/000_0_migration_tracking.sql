-- Create migration tracking table
CREATE TABLE IF NOT EXISTS migration_versions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  checksum VARCHAR(64) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  execution_time_ms INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'success',
  error_message TEXT,
  rollback_script TEXT,
  rollback_executed BOOLEAN DEFAULT false
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_migration_versions_name ON migration_versions(name); 