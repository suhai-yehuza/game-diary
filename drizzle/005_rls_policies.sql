-- ============================================================================
-- ROW-LEVEL SECURITY POLICIES - Game Diary Database
-- ============================================================================
-- Last Updated: 2024-12-19
-- Purpose: Row-Level Security policies and public views
-- Dependencies: Base schema (000_base_schema.sql), Functions (001_consolidated_functions.sql)
--
-- This file contains:
-- - RLS policies for users table
-- - Public user profiles view
-- - Security context management
-- ============================================================================

-- Note: RLS helper functions are defined in 001_consolidated_functions.sql

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================

-- Enable RLS on users table
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "users_select_own_data" ON "users"
    FOR SELECT
    USING (
        id = get_current_user_id() OR
        (get_current_user_id() IS NOT NULL AND
         (email_address IS NULL OR id = get_current_user_id()) AND
         (phone_number IS NULL OR id = get_current_user_id()))
    );

CREATE POLICY "users_update_own_data" ON "users"
    FOR UPDATE
    USING (id = get_current_user_id())
    WITH CHECK (id = get_current_user_id());

CREATE POLICY "users_insert_own_data" ON "users"
    FOR INSERT
    WITH CHECK (id = get_current_user_id());

CREATE POLICY "users_delete_own_data" ON "users"
    FOR DELETE
    USING (id = get_current_user_id());

-- ============================================================================
-- PUBLIC USER PROFILES VIEW
-- ============================================================================

-- Public user profiles view (without sensitive data)
CREATE OR REPLACE VIEW "public_user_profiles" AS
SELECT
    id,
    username,
    first_name,
    last_name,
    image_url,
    has_image,
    profile_image_url,
    bio,
    timezone,
    preferred_language,
    last_active_at,
    created_at
FROM users
WHERE deleted_at IS NULL;

-- Grant access to the view
GRANT SELECT ON public_user_profiles TO PUBLIC;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

-- Function documentation
COMMENT ON FUNCTION get_current_user_id() IS 'Returns the current user ID from application context for RLS policies';
COMMENT ON FUNCTION set_current_user_context(TEXT) IS 'Sets the current user context for RLS policies';
COMMENT ON FUNCTION clear_current_user_context() IS 'Clears the current user context for RLS policies';

-- View documentation
COMMENT ON VIEW public_user_profiles IS 'Public view of user profiles without sensitive data';
