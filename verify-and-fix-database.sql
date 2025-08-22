-- Verify and Fix Database Schema for Admin Panel
-- This script checks table existence and fixes foreign key relationships

-- 1. Verify table existence and structure
SELECT 'Checking PAD_requests table...' as step;
SELECT COUNT(*) as pad_requests_count FROM PAD_requests;
SELECT * FROM PAD_requests LIMIT 3;

SELECT 'Checking client_profiles table...' as step;
SELECT COUNT(*) as client_profiles_count FROM client_profiles;
SELECT user_id, full_name, email, phone FROM client_profiles LIMIT 3;

SELECT 'Checking laboratory_profiles table...' as step;
SELECT COUNT(*) as laboratory_profiles_count FROM laboratory_profiles;
SELECT user_id, lab_name, email, phone FROM laboratory_profiles LIMIT 3;

-- 2. Check current foreign key constraints
SELECT 'Checking foreign keys on PAD_requests...' as step;
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    conkey as constrained_columns,
    confkey as referenced_columns,
    confrelid::regclass as referenced_table
FROM pg_constraint 
WHERE conrelid = 'PAD_requests'::regclass 
AND contype = 'f';

-- 3. Check if foreign key relationships exist
SELECT 'Checking PAD_requests with client_profiles join...' as step;
SELECT 
    p.id,
    p.client_id,
    c.full_name as client_name,
    c.email as client_email,
    p.laboratory_id,
    p.status
FROM PAD_requests p
LEFT JOIN client_profiles c ON c.user_id = p.client_id
LIMIT 5;

SELECT 'Checking PAD_requests with laboratory_profiles join...' as step;
SELECT 
    p.id,
    p.laboratory_id,
    l.lab_name,
    l.email as lab_email,
    p.client_id,
    p.status
FROM PAD_requests p
LEFT JOIN laboratory_profiles l ON l.user_id = p.laboratory_id
LIMIT 5;

-- 4. Add missing foreign key constraints if they don't exist
-- First, let's ensure the columns exist and have correct types
ALTER TABLE PAD_requests 
ADD CONSTRAINT fk_pad_requests_client 
FOREIGN KEY (client_id) REFERENCES client_profiles(user_id) 
ON DELETE CASCADE;

ALTER TABLE PAD_requests 
ADD CONSTRAINT fk_pad_requests_laboratory 
FOREIGN KEY (laboratory_id) REFERENCES laboratory_profiles(user_id) 
ON DELETE CASCADE;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pad_requests_client_id ON PAD_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_pad_requests_laboratory_id ON PAD_requests(laboratory_id);
CREATE INDEX IF NOT EXISTS idx_pad_requests_status ON PAD_requests(status);
CREATE INDEX IF NOT EXISTS idx_pad_requests_created_at ON PAD_requests(created_at);

-- 6. Update admin functions to use consistent email
CREATE OR REPLACE FUNCTION get_pad_requests_with_details(admin_email text DEFAULT 'glowyboy01@gmail.com')
RETURNS TABLE (
    id bigint,
    client_id uuid,
    laboratory_id uuid,
    status text,
    message text,
    created_at timestamptz,
    updated_at timestamptz,
    client_name text,
    client_email text,
    client_phone text,
    lab_name text,
    lab_email text,
    lab_phone text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF admin_email != 'glowyboy01@gmail.com' THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.client_id,
        p.laboratory_id,
        p.status,
        p.message,
        p.created_at,
        p.updated_at,
        c.full_name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        l.lab_name,
        l.email as lab_email,
        l.phone as lab_phone
    FROM PAD_requests p
    LEFT JOIN client_profiles c ON c.user_id = p.client_id
    LEFT JOIN laboratory_profiles l ON l.user_id = p.laboratory_id
    ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_pad_requests_with_details TO authenticated;

-- 7. Ensure RLS policies allow admin access
-- Enable RLS on tables if not already enabled
ALTER TABLE PAD_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratory_profiles ENABLE ROW LEVEL SECURITY;

-- Create admin policy for PAD_requests
DROP POLICY IF EXISTS "Admin can view all PAD_requests" ON PAD_requests;
CREATE POLICY "Admin can view all PAD_requests" ON PAD_requests
    FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'email' = 'glowyboy01@gmail.com' OR
        auth.email() = 'glowyboy01@gmail.com'
    );

-- Create admin policy for client_profiles
DROP POLICY IF EXISTS "Admin can view all client_profiles" ON client_profiles;
CREATE POLICY "Admin can view all client_profiles" ON client_profiles
    FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'email' = 'glowyboy01@gmail.com' OR
        auth.email() = 'glowyboy01@gmail.com' OR
        auth.uid() = user_id
    );

-- Create admin policy for laboratory_profiles
DROP POLICY IF EXISTS "Admin can view all laboratory_profiles" ON laboratory_profiles;
CREATE POLICY "Admin can view all laboratory_profiles" ON laboratory_profiles
    FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'email' = 'glowyboy01@gmail.com' OR
        auth.email() = 'glowyboy01@gmail.com' OR
        auth.uid() = user_id
    );

-- 8. Test the relationships with a comprehensive query
SELECT 'Testing comprehensive PAD_requests query...' as step;
SELECT 
    p.id,
    p.status,
    p.created_at,
    COALESCE(c.full_name, 'Client Unknown') as client_name,
    COALESCE(c.email, 'No Email') as client_email,
    COALESCE(l.lab_name, 'Lab Unknown') as lab_name,
    COALESCE(l.email, 'No Email') as lab_email
FROM PAD_requests p
LEFT JOIN client_profiles c ON c.user_id = p.client_id
LEFT JOIN laboratory_profiles l ON l.user_id = p.laboratory_id
ORDER BY p.created_at DESC
LIMIT 10;

-- 9. Final verification
SELECT 'Final counts verification:' as step;
SELECT 
    (SELECT COUNT(*) FROM PAD_requests) as total_pad_requests,
    (SELECT COUNT(*) FROM client_profiles) as total_clients,
    (SELECT COUNT(*) FROM laboratory_profiles) as total_labs,
    (SELECT COUNT(*) FROM PAD_requests WHERE client_id IS NOT NULL) as pad_requests_with_client,
    (SELECT COUNT(*) FROM PAD_requests WHERE laboratory_id IS NOT NULL) as pad_requests_with_lab;

-- 10. Show any orphaned records
SELECT 'Checking for orphaned PAD_requests (no client)...' as step;
SELECT p.id, p.client_id, p.laboratory_id, p.status 
FROM PAD_requests p
LEFT JOIN client_profiles c ON c.user_id = p.client_id
WHERE p.client_id IS NOT NULL AND c.user_id IS NULL;

SELECT 'Checking for orphaned PAD_requests (no lab)...' as step;
SELECT p.id, p.client_id, p.laboratory_id, p.status 
FROM PAD_requests p
LEFT JOIN laboratory_profiles l ON l.user_id = p.laboratory_id
WHERE p.laboratory_id IS NOT NULL AND l.user_id IS NULL;

SELECT 'Database verification and fix completed!' as result;
