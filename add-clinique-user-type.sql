-- SQL SCRIPT TO ADD CLINIQUE USER TYPE SUPPORT
-- Run this script in your Supabase SQL editor to add clinique support
-- This script is safe to run multiple times (idempotent)

-- 1. Drop and recreate the user_type enum to include 'clinique'
DO $$ 
BEGIN
    -- First, check if there are any columns using the user_type enum
    -- If there are, we need to drop them temporarily or use a different approach
    
    -- Drop the existing enum (this will fail if it's in use, so we use a safer approach)
    -- Instead, we'll use ALTER TYPE to add the new value
    
    -- Check if 'clinique' already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'clinique' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'user_type'
        )
    ) THEN
        -- Add 'clinique' to the existing enum
        ALTER TYPE user_type ADD VALUE 'clinique';
        RAISE NOTICE 'Added clinique to user_type enum';
    ELSE
        RAISE NOTICE 'clinique already exists in user_type enum';
    END IF;
END $$;

-- 2. Create a clinique_profiles table identical to laboratory_profiles
-- This allows cliniques to have the same functionality as laboratories
CREATE TABLE IF NOT EXISTS clinique_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    laboratory_name VARCHAR(255) NOT NULL, -- Keep same field name for compatibility
    lab_name VARCHAR(255), -- Keep same field name for compatibility  
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    opening_hours VARCHAR(100),
    opening_days TEXT[],
    description TEXT,
    services_offered TEXT[],
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for clinique_profiles
CREATE INDEX IF NOT EXISTS idx_clinique_profiles_user_id ON clinique_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_clinique_profiles_verified ON clinique_profiles(is_verified);

-- 4. Enable Row Level Security on clinique_profiles
ALTER TABLE clinique_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for clinique_profiles (same as laboratory_profiles)
DROP POLICY IF EXISTS "Allow all to read clinique profiles" ON clinique_profiles;
DROP POLICY IF EXISTS "Allow all to insert clinique profiles" ON clinique_profiles;  
DROP POLICY IF EXISTS "Users can update own clinique profile" ON clinique_profiles;

CREATE POLICY "Allow all to read clinique profiles" ON clinique_profiles FOR SELECT USING (true);
CREATE POLICY "Allow all to insert clinique profiles" ON clinique_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own clinique profile" ON clinique_profiles FOR UPDATE USING (auth.uid() = user_id);

-- 6. Create updated_at trigger for clinique_profiles
-- First, create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clinique_profiles_updated_at ON clinique_profiles;
CREATE TRIGGER update_clinique_profiles_updated_at 
    BEFORE UPDATE ON clinique_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Create auto-verify function and trigger for cliniques
-- First, create the auto_verify_laboratory function if it doesn't exist
CREATE OR REPLACE FUNCTION auto_verify_laboratory()
RETURNS TRIGGER AS $$
BEGIN
    NEW.is_verified = true;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create auto-verify trigger for cliniques (same as laboratories)
DROP TRIGGER IF EXISTS auto_verify_clinique_trigger ON clinique_profiles;
CREATE TRIGGER auto_verify_clinique_trigger
    BEFORE INSERT ON clinique_profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_verify_laboratory(); -- Reuse the same function

-- 8. Update PAD_requests to support cliniques as service providers
-- No schema changes needed - cliniques can use the laboratory_id field
-- The application will treat clinique users the same as laboratory users

-- 9. Update medical_results to support cliniques
-- No schema changes needed - cliniques can use the laboratory_id field  
-- The application will treat clinique users the same as laboratory users

-- 10. Create a view that combines laboratory and clinique profiles for easier querying
CREATE OR REPLACE VIEW all_service_providers AS
SELECT 
    'laboratory' as provider_type,
    id,
    user_id,
    laboratory_name,
    lab_name,
    email,
    phone,
    address,
    city,
    postal_code,
    latitude,
    longitude,
    opening_hours,
    opening_days,
    description,
    services_offered,
    is_verified,
    created_at,
    updated_at
FROM laboratory_profiles
UNION ALL
SELECT 
    'clinique' as provider_type,
    id,
    user_id,
    laboratory_name,
    lab_name,
    email,
    phone,
    address,
    city,
    postal_code,
    latitude,
    longitude,
    opening_hours,
    opening_days,
    description,
    services_offered,
    is_verified,
    created_at,
    updated_at
FROM clinique_profiles;

-- 11. Update the admin functions to handle cliniques
-- Update the admin_delete_user function to include clinique_profiles
CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID, admin_email TEXT DEFAULT 'sihaaexpress@gmail.com')
RETURNS JSON AS $$
DECLARE
  user_data JSONB;
  deletion_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Check if admin
  IF admin_email != 'sihaaexpress@gmail.com' THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Collect user data before deletion (including clinique profile)
  SELECT json_build_object(
    'client_profile', (SELECT row_to_json(cp) FROM client_profiles cp WHERE cp.user_id = target_user_id),
    'lab_profile', (SELECT row_to_json(lp) FROM laboratory_profiles lp WHERE lp.user_id = target_user_id),
    'clinique_profile', (SELECT row_to_json(clp) FROM clinique_profiles clp WHERE clp.user_id = target_user_id),
    'pad_requests_as_client', (SELECT json_agg(pr) FROM PAD_requests pr WHERE pr.client_id = target_user_id),
    'pad_requests_as_provider', (SELECT json_agg(pr) FROM PAD_requests pr WHERE pr.laboratory_id = target_user_id),
    'notifications', (SELECT json_agg(n) FROM notifications n WHERE n.user_id = target_user_id),
    'medical_results_as_client', (SELECT json_agg(mr) FROM medical_results mr WHERE mr.client_id = target_user_id),
    'medical_results_as_provider', (SELECT json_agg(mr) FROM medical_results mr WHERE mr.laboratory_id = target_user_id),
    'file_uploads', (SELECT json_agg(fu) FROM file_uploads fu WHERE fu.user_id = target_user_id),
    'ban_info', (SELECT json_agg(bu) FROM banned_users bu WHERE bu.user_id = target_user_id)
  ) INTO user_data;

  -- Store deletion record
  INSERT INTO deleted_users (user_id, email, deleted_by, data_backup)
  SELECT target_user_id, u.email, admin_email, user_data
  FROM auth.users u WHERE u.id = target_user_id;

  -- Delete from all tables (including clinique_profiles)
  DELETE FROM client_profiles WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;

  DELETE FROM laboratory_profiles WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;

  DELETE FROM clinique_profiles WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;

  DELETE FROM PAD_requests WHERE client_id = target_user_id OR laboratory_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;

  DELETE FROM notifications WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;

  DELETE FROM medical_results WHERE client_id = target_user_id OR laboratory_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;

  DELETE FROM file_uploads WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;

  DELETE FROM banned_users WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;

  -- Try to delete from auth.users (requires admin privileges)
  BEGIN
    DELETE FROM auth.users WHERE id = target_user_id;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deletion_count := deletion_count + temp_count;
  EXCEPTION WHEN OTHERS THEN
    -- If auth deletion fails, that's okay - user is effectively deleted
    NULL;
  END;

  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'records_deleted', deletion_count,
    'backup_created', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Show completion status
SELECT 'Clinique user type support added successfully!' as status;
SELECT 'Laboratory profiles:' as table_name, COUNT(*) as count FROM laboratory_profiles;
SELECT 'Clinique profiles:' as table_name, COUNT(*) as count FROM clinique_profiles;
SELECT 'All service providers:' as view_name, COUNT(*) as count FROM all_service_providers;

-- 13. Verification query - show the updated enum values
SELECT enumlabel as user_types 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_type')
ORDER BY enumlabel;
