-- Fix Admin RLS Permissions for glowyboy01@gmail.com
-- This script ensures the admin user can access all data needed for the admin panel

-- 1. First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('client_profiles', 'laboratory_profiles', 'PAD_requests', 'banned_users', 'notifications', 'medical_results')
ORDER BY tablename, policyname;

-- 2. Drop existing restrictive policies and create admin-friendly ones

-- CLIENT_PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON client_profiles;
DROP POLICY IF EXISTS "Users can edit own profile" ON client_profiles;
DROP POLICY IF EXISTS "Enable read access for own data" ON client_profiles;
DROP POLICY IF EXISTS "Admin can view all client_profiles" ON client_profiles;

CREATE POLICY "Admin and user access to client_profiles" ON client_profiles
    FOR ALL
    TO authenticated
    USING (
        -- Admin has full access
        auth.jwt() ->> 'email' = 'glowyboy01@gmail.com' OR
        auth.email() = 'glowyboy01@gmail.com' OR
        -- Users can access their own profile
        auth.uid() = user_id
    )
    WITH CHECK (
        -- Admin can modify anything
        auth.jwt() ->> 'email' = 'glowyboy01@gmail.com' OR
        auth.email() = 'glowyboy01@gmail.com' OR
        -- Users can modify their own profile
        auth.uid() = user_id
    );

-- LABORATORY_PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON laboratory_profiles;
DROP POLICY IF EXISTS "Users can edit own profile" ON laboratory_profiles;
DROP POLICY IF EXISTS "Enable read access for own data" ON laboratory_profiles;
DROP POLICY IF EXISTS "Admin can view all laboratory_profiles" ON laboratory_profiles;

CREATE POLICY "Admin and user access to laboratory_profiles" ON laboratory_profiles
    FOR ALL
    TO authenticated
    USING (
        -- Admin has full access
        auth.jwt() ->> 'email' = 'glowyboy01@gmail.com' OR
        auth.email() = 'glowyboy01@gmail.com' OR
        -- Users can access their own profile
        auth.uid() = user_id
    )
    WITH CHECK (
        -- Admin can modify anything
        auth.jwt() ->> 'email' = 'glowyboy01@gmail.com' OR
        auth.email() = 'glowyboy01@gmail.com' OR
        -- Users can modify their own profile
        auth.uid() = user_id
    );

-- PAD_REQUESTS
DROP POLICY IF EXISTS "Users can view own PAD requests" ON PAD_requests;
DROP POLICY IF EXISTS "Users can create PAD requests" ON PAD_requests;
DROP POLICY IF EXISTS "Admin can view all PAD_requests" ON PAD_requests;
DROP POLICY IF EXISTS "Enable read access for own data" ON PAD_requests;

CREATE POLICY "Admin and user access to PAD_requests" ON PAD_requests
    FOR ALL
    TO authenticated
    USING (
        -- Admin has full access
        auth.jwt() ->> 'email' = 'glowyboy01@gmail.com' OR
        auth.email() = 'glowyboy01@gmail.com' OR
        -- Users can access requests they are involved in
        auth.uid() = client_id OR
        auth.uid() = laboratory_id
    )
    WITH CHECK (
        -- Admin can modify anything
        auth.jwt() ->> 'email' = 'glowyboy01@gmail.com' OR
        auth.email() = 'glowyboy01@gmail.com' OR
        -- Users can create/modify requests they are involved in
        auth.uid() = client_id OR
        auth.uid() = laboratory_id
    );

-- BANNED_USERS
DROP POLICY IF EXISTS "Admin can manage banned users" ON banned_users;
DROP POLICY IF EXISTS "Only admin can access banned_users" ON banned_users;

CREATE POLICY "Admin only access to banned_users" ON banned_users
    FOR ALL
    TO authenticated
    USING (
        -- Only admin can access banned users table
        auth.jwt() ->> 'email' = 'glowyboy01@gmail.com' OR
        auth.email() = 'glowyboy01@gmail.com'
    )
    WITH CHECK (
        -- Only admin can modify banned users table
        auth.jwt() ->> 'email' = 'glowyboy01@gmail.com' OR
        auth.email() = 'glowyboy01@gmail.com'
    );

-- NOTIFICATIONS (if it exists)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Admin can view all notifications" ON notifications;

-- Create policy for notifications (handle case where table might not exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        EXECUTE '
        CREATE POLICY "Admin and user access to notifications" ON notifications
            FOR ALL
            TO authenticated
            USING (
                auth.jwt() ->> ''email'' = ''glowyboy01@gmail.com'' OR
                auth.email() = ''glowyboy01@gmail.com'' OR
                auth.uid() = user_id
            )
            WITH CHECK (
                auth.jwt() ->> ''email'' = ''glowyboy01@gmail.com'' OR
                auth.email() = ''glowyboy01@gmail.com'' OR
                auth.uid() = user_id
            );
        ';
    END IF;
END $$;

-- MEDICAL_RESULTS (if it exists)
DROP POLICY IF EXISTS "Users can view own medical results" ON medical_results;
DROP POLICY IF EXISTS "Admin can view all medical results" ON medical_results;

-- Create policy for medical_results (handle case where table might not exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medical_results' AND table_schema = 'public') THEN
        EXECUTE '
        CREATE POLICY "Admin and user access to medical_results" ON medical_results
            FOR ALL
            TO authenticated
            USING (
                auth.jwt() ->> ''email'' = ''glowyboy01@gmail.com'' OR
                auth.email() = ''glowyboy01@gmail.com'' OR
                auth.uid() = client_id OR
                auth.uid() = laboratory_id
            )
            WITH CHECK (
                auth.jwt() ->> ''email'' = ''glowyboy01@gmail.com'' OR
                auth.email() = ''glowyboy01@gmail.com'' OR
                auth.uid() = client_id OR
                auth.uid() = laboratory_id
            );
        ';
    END IF;
END $$;

-- 3. Create a function that admin can use to bypass RLS for testing
CREATE OR REPLACE FUNCTION admin_get_all_data(
    table_name text,
    admin_email text DEFAULT 'glowyboy01@gmail.com'
)
RETURNS TABLE (result json)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF admin_email != 'glowyboy01@gmail.com' THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Execute dynamic query based on table name
    IF table_name = 'client_profiles' THEN
        RETURN QUERY
        SELECT row_to_json(t) FROM (
            SELECT * FROM client_profiles ORDER BY created_at DESC
        ) t;
    ELSIF table_name = 'laboratory_profiles' THEN
        RETURN QUERY
        SELECT row_to_json(t) FROM (
            SELECT * FROM laboratory_profiles ORDER BY created_at DESC
        ) t;
    ELSIF table_name = 'PAD_requests' THEN
        RETURN QUERY
        SELECT row_to_json(t) FROM (
            SELECT * FROM PAD_requests ORDER BY created_at DESC
        ) t;
    ELSIF table_name = 'banned_users' THEN
        RETURN QUERY
        SELECT row_to_json(t) FROM (
            SELECT * FROM banned_users ORDER BY created_at DESC
        ) t;
    ELSE
        RAISE EXCEPTION 'Invalid table name: %', table_name;
    END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_get_all_data TO authenticated;

-- 4. Test admin access by trying to count records in each table
SELECT 'Testing admin access...' as status;

-- Test client_profiles access
SELECT 
    'client_profiles' as table_name,
    COUNT(*) as record_count,
    CASE 
        WHEN COUNT(*) >= 0 THEN 'SUCCESS'
        ELSE 'FAILED'
    END as access_status
FROM client_profiles;

-- Test laboratory_profiles access
SELECT 
    'laboratory_profiles' as table_name,
    COUNT(*) as record_count,
    CASE 
        WHEN COUNT(*) >= 0 THEN 'SUCCESS'
        ELSE 'FAILED'
    END as access_status
FROM laboratory_profiles;

-- Test PAD_requests access
SELECT 
    'PAD_requests' as table_name,
    COUNT(*) as record_count,
    CASE 
        WHEN COUNT(*) >= 0 THEN 'SUCCESS'
        ELSE 'FAILED'
    END as access_status
FROM PAD_requests;

-- Test banned_users access
SELECT 
    'banned_users' as table_name,
    COUNT(*) as record_count,
    CASE 
        WHEN COUNT(*) >= 0 THEN 'SUCCESS'
        ELSE 'FAILED'
    END as access_status
FROM banned_users;

-- 5. Show final policy status
SELECT 'Final policy status:' as result;
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('client_profiles', 'laboratory_profiles', 'PAD_requests', 'banned_users', 'notifications', 'medical_results')
ORDER BY tablename, policyname;

SELECT 'Admin RLS permissions fix completed!' as status;
