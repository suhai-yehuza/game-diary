-- 001_rls_policies.sql
-- Row-Level Security policies and helper functions
--
-- This file contains:
-- - RLS helper functions
-- - RLS policies for users table
-- - Public user profiles view

-- ============================================================================
-- RLS HELPER FUNCTIONS
-- ============================================================================

-- RLS helper functions
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_current_user_context(user_id TEXT)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION clear_current_user_context()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', '', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
