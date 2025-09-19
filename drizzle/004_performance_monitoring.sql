-- ============================================================================
-- PERFORMANCE MONITORING - Game Diary Database
-- ============================================================================
-- Last Updated: 2024-12-19
-- Purpose: Performance monitoring tables and functions
-- Dependencies: Base schema (000_base_schema.sql), Functions (001_consolidated_functions.sql)
--
-- This file adds:
-- - Query performance tracking tables
-- - Migration version control
-- - Database health monitoring
-- - Performance analysis tools
-- ============================================================================

-- ============================================================================
-- PERFORMANCE MONITORING TABLES
-- ============================================================================

-- Query performance log table
CREATE TABLE IF NOT EXISTS "query_performance_log" (
    "id" serial PRIMARY KEY NOT NULL,
    "query_hash" varchar(64) NOT NULL,
    "execution_time_ms" integer NOT NULL,
    "query_text" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Migration versions table
CREATE TABLE IF NOT EXISTS "migration_versions" (
    "id" serial PRIMARY KEY NOT NULL,
    "file_name" varchar(255) NOT NULL,
    "version" varchar(50) NOT NULL,
    "applied_at" timestamp DEFAULT now() NOT NULL,
    "checksum" varchar(64),
    "rollback_sql" text,
    CONSTRAINT "migration_versions_file_name_unique" UNIQUE("file_name")
);

-- Database health metrics table
CREATE TABLE IF NOT EXISTS "database_health_metrics" (
    "id" serial PRIMARY KEY NOT NULL,
    "metric_name" varchar(100) NOT NULL,
    "metric_value" numeric(15, 4) NOT NULL,
    "metric_unit" varchar(20),
    "recorded_at" timestamp DEFAULT now() NOT NULL,
    "metadata" jsonb
);

-- Index usage statistics table
CREATE TABLE IF NOT EXISTS "index_usage_stats" (
    "id" serial PRIMARY KEY NOT NULL,
    "table_name" varchar(100) NOT NULL,
    "index_name" varchar(100) NOT NULL,
    "index_scans" bigint NOT NULL,
    "index_tuples_read" bigint NOT NULL,
    "index_tuples_fetched" bigint NOT NULL,
    "recorded_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================================================
-- PERFORMANCE MONITORING INDEXES
-- ============================================================================

-- Query performance log indexes
CREATE INDEX IF NOT EXISTS "idx_query_performance_log_hash" ON "query_performance_log" ("query_hash");
CREATE INDEX IF NOT EXISTS "idx_query_performance_log_created_at" ON "query_performance_log" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_query_performance_log_execution_time" ON "query_performance_log" ("execution_time_ms" DESC);

-- Migration versions indexes
CREATE INDEX IF NOT EXISTS "idx_migration_versions_file_name" ON "migration_versions" ("file_name");
CREATE INDEX IF NOT EXISTS "idx_migration_versions_applied_at" ON "migration_versions" ("applied_at" DESC);

-- Database health metrics indexes
CREATE INDEX IF NOT EXISTS "idx_database_health_metrics_name" ON "database_health_metrics" ("metric_name");
CREATE INDEX IF NOT EXISTS "idx_database_health_metrics_recorded_at" ON "database_health_metrics" ("recorded_at" DESC);

-- Index usage stats indexes
CREATE INDEX IF NOT EXISTS "idx_index_usage_stats_table_name" ON "index_usage_stats" ("table_name");
CREATE INDEX IF NOT EXISTS "idx_index_usage_stats_index_name" ON "index_usage_stats" ("index_name");
CREATE INDEX IF NOT EXISTS "idx_index_usage_stats_recorded_at" ON "index_usage_stats" ("recorded_at" DESC);

-- ============================================================================
-- PERFORMANCE MONITORING FUNCTIONS
-- ============================================================================

-- Function to record migration version
DROP FUNCTION IF EXISTS record_migration_version(TEXT, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION record_migration_version(
    p_file_name TEXT,
    p_version TEXT,
    p_checksum TEXT DEFAULT NULL,
    p_rollback_sql TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO migration_versions (file_name, version, checksum, rollback_sql, applied_at)
    VALUES (p_file_name, p_version, p_checksum, p_rollback_sql, NOW())
    ON CONFLICT (file_name) DO UPDATE SET
        version = EXCLUDED.version,
        checksum = EXCLUDED.checksum,
        rollback_sql = EXCLUDED.rollback_sql,
        applied_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to collect database health metrics
CREATE OR REPLACE FUNCTION collect_database_health_metrics()
RETURNS VOID AS $$
DECLARE
    total_connections INTEGER;
    active_connections INTEGER;
    database_size BIGINT;
    cache_hit_ratio NUMERIC;
    slow_queries_count INTEGER;
BEGIN
    -- Get connection metrics
    SELECT COUNT(*) INTO total_connections FROM pg_stat_activity;
    SELECT COUNT(*) INTO active_connections FROM pg_stat_activity WHERE state = 'active';

    -- Get database size
    SELECT pg_database_size(current_database()) INTO database_size;

    -- Get cache hit ratio
    SELECT ROUND(
        (sum(blks_hit) * 100.0 / (sum(blks_hit) + sum(blks_read))), 2
    ) INTO cache_hit_ratio
    FROM pg_stat_database
    WHERE datname = current_database();

    -- Get slow queries count (queries taking more than 1 second)
    SELECT COUNT(*) INTO slow_queries_count
    FROM query_performance_log
    WHERE created_at >= NOW() - INTERVAL '1 hour'
      AND execution_time_ms > 1000;

    -- Insert metrics
    INSERT INTO database_health_metrics (metric_name, metric_value, metric_unit, recorded_at)
    VALUES
        ('total_connections', total_connections, 'count', NOW()),
        ('active_connections', active_connections, 'count', NOW()),
        ('database_size_bytes', database_size, 'bytes', NOW()),
        ('cache_hit_ratio', cache_hit_ratio, 'percentage', NOW()),
        ('slow_queries_last_hour', slow_queries_count, 'count', NOW());

    -- Clean up old metrics (keep only last 7 days)
    DELETE FROM database_health_metrics
    WHERE recorded_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Function to collect index usage statistics
CREATE OR REPLACE FUNCTION collect_index_usage_stats()
RETURNS VOID AS $$
BEGIN
    -- Insert current index usage statistics
    INSERT INTO index_usage_stats (table_name, index_name, index_scans, index_tuples_read, index_tuples_fetched, recorded_at)
    SELECT
        schemaname || '.' || relname as table_name,
        indexrelname as index_name,
        idx_scan as index_scans,
        idx_tup_read as index_tuples_read,
        idx_tup_fetch as index_tuples_fetched,
        NOW() as recorded_at
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public';

    -- Clean up old stats (keep only last 30 days)
    DELETE FROM index_usage_stats
    WHERE recorded_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to get performance summary
CREATE OR REPLACE FUNCTION get_performance_summary()
RETURNS TABLE (
    metric_name TEXT,
    current_value NUMERIC,
    unit TEXT,
    trend TEXT,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_metrics AS (
        SELECT
            metric_name,
            metric_value,
            metric_unit,
            LAG(metric_value) OVER (PARTITION BY metric_name ORDER BY recorded_at) as prev_value
        FROM database_health_metrics
        WHERE recorded_at >= NOW() - INTERVAL '1 hour'
        ORDER BY recorded_at DESC
    ),
    trend_analysis AS (
        SELECT
            metric_name,
            metric_value as current_value,
            metric_unit as unit,
            CASE
                WHEN prev_value IS NULL THEN 'no_data'
                WHEN metric_value > prev_value * 1.1 THEN 'increasing'
                WHEN metric_value < prev_value * 0.9 THEN 'decreasing'
                ELSE 'stable'
            END as trend
        FROM recent_metrics
        WHERE metric_name IN (
            'total_connections',
            'active_connections',
            'cache_hit_ratio',
            'slow_queries_last_hour'
        )
    )
    SELECT
        ta.metric_name,
        ta.current_value,
        ta.unit,
        ta.trend,
        CASE
            WHEN ta.metric_name = 'cache_hit_ratio' AND ta.current_value < 95 THEN 'Consider increasing shared_buffers'
            WHEN ta.metric_name = 'slow_queries_last_hour' AND ta.current_value > 10 THEN 'Review slow queries and add indexes'
            WHEN ta.metric_name = 'active_connections' AND ta.current_value > 80 THEN 'Consider connection pooling'
            ELSE 'No action needed'
        END as recommendation
    FROM trend_analysis ta;
END;
$$ LANGUAGE plpgsql;

-- Function to identify unused indexes
CREATE OR REPLACE FUNCTION identify_unused_indexes()
RETURNS TABLE (
    table_name TEXT,
    index_name TEXT,
    index_size TEXT,
    last_scan_date TIMESTAMP,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.table_name::TEXT,
        i.indexname::TEXT,
        pg_size_pretty(pg_relation_size(i.indexrelid)) as index_size,
        COALESCE(
            (SELECT MAX(recorded_at) FROM index_usage_stats
             WHERE index_usage_stats.index_name = i.indexname),
            '1970-01-01'::timestamp
        ) as last_scan_date,
        CASE
            WHEN i.idx_scan = 0 THEN 'Consider dropping - never used'
            WHEN i.idx_scan < 10 THEN 'Consider dropping - rarely used'
            ELSE 'Keep - actively used'
        END as recommendation
    FROM pg_stat_user_indexes i
    JOIN pg_stat_user_tables t ON i.relid = t.relid
    WHERE i.schemaname = 'public'
      AND i.idx_scan < 10
    ORDER BY pg_relation_size(i.indexrelid) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AUTOMATED CLEANUP FUNCTIONS
-- ============================================================================

-- Function to clean up old performance data
CREATE OR REPLACE FUNCTION cleanup_performance_data()
RETURNS VOID AS $$
BEGIN
    -- Clean up old query performance logs (keep only last 7 days)
    DELETE FROM query_performance_log
    WHERE created_at < NOW() - INTERVAL '7 days';

    -- Clean up old database health metrics (keep only last 30 days)
    DELETE FROM database_health_metrics
    WHERE recorded_at < NOW() - INTERVAL '30 days';

    -- Clean up old index usage stats (keep only last 90 days)
    DELETE FROM index_usage_stats
    WHERE recorded_at < NOW() - INTERVAL '90 days';

    RAISE NOTICE 'Performance data cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PERFORMANCE MONITORING TRIGGERS
-- ============================================================================

-- Trigger to automatically log query performance (if enabled)
-- Note: This would need to be set up at the application level
-- as PostgreSQL doesn't have built-in query logging triggers

-- ============================================================================
-- INITIAL DATA SETUP
-- ============================================================================

-- Record this migration
SELECT record_migration_version(
    '004_performance_monitoring.sql',
    '1.0.0',
    'initial_performance_monitoring_setup'
);

-- Collect initial metrics
SELECT collect_database_health_metrics();
SELECT collect_index_usage_stats();

-- ============================================================================
-- FUNCTION DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE query_performance_log IS 'Logs query performance metrics for monitoring and optimization';
COMMENT ON TABLE migration_versions IS 'Tracks applied database migrations with version control';
COMMENT ON TABLE database_health_metrics IS 'Stores database health metrics over time';
COMMENT ON TABLE index_usage_stats IS 'Tracks index usage statistics for optimization';

COMMENT ON FUNCTION record_migration_version(TEXT, TEXT, TEXT, TEXT) IS 'Records a migration version in the migration_versions table';
COMMENT ON FUNCTION collect_database_health_metrics() IS 'Collects and stores current database health metrics';
COMMENT ON FUNCTION collect_index_usage_stats() IS 'Collects and stores current index usage statistics';
COMMENT ON FUNCTION get_performance_summary() IS 'Returns a summary of current performance metrics with trends and recommendations';
COMMENT ON FUNCTION identify_unused_indexes() IS 'Identifies potentially unused indexes that could be dropped';
COMMENT ON FUNCTION cleanup_performance_data() IS 'Cleans up old performance monitoring data to prevent table bloat';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Note: This performance monitoring setup provides:
-- - Query performance tracking
-- - Migration version control
-- - Database health monitoring
-- - Index usage analysis
-- - Automated cleanup functions
-- - Performance recommendations
--
-- To enable automatic monitoring, set up cron jobs or scheduled tasks to run:
-- - collect_database_health_metrics() every 5 minutes
-- - collect_index_usage_stats() every hour
-- - cleanup_performance_data() daily
