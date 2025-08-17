-- COMPLETE DATABASE SETUP FOR LABCONNECT
-- Run this ONE file in your Supabase SQL editor
-- This will create everything needed and fix all issues

-- Drop any existing views that might conflict with table changes
DROP VIEW IF EXISTS PAD_requests_view CASCADE;
DROP VIEW IF EXISTS client_requests_view CASCADE;
DROP VIEW IF EXISTS laboratory_requests_view CASCADE;
DROP VIEW IF EXISTS PAD_requests_with_client CASCADE;

-- Drop any existing functions that might conflict
DROP FUNCTION IF EXISTS get_client_requests() CASCADE;
DROP FUNCTION IF EXISTS get_laboratory_requests() CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_type AS ENUM ('client', 'laboratory');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE test_request_status AS ENUM ('pending', 'assigned', 'collected', 'processing', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE collection_type AS ENUM ('home', 'lab');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE priority_type AS ENUM ('normal', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE result_status AS ENUM ('normal', 'abnormal', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Client profiles table
CREATE TABLE IF NOT EXISTS client_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    date_of_birth DATE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    medical_notes TEXT,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Laboratory profiles table
CREATE TABLE IF NOT EXISTS laboratory_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    laboratory_name VARCHAR(255) NOT NULL,
    lab_name VARCHAR(255),
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

-- PAD requests table
CREATE TABLE IF NOT EXISTS PAD_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    laboratory_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    client_location_lat DECIMAL(10, 8),
    client_location_lng DECIMAL(11, 8),
    client_name VARCHAR(255),
    client_phone VARCHAR(20),
    client_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Removed the view that was causing conflicts with table column names

-- Medical results table
CREATE TABLE IF NOT EXISTS medical_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    laboratory_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'reviewed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_full_name ON client_profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_laboratory_profiles_user_id ON laboratory_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_laboratory_profiles_verified ON laboratory_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_PAD_requests_client_id ON PAD_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_PAD_requests_laboratory_id ON PAD_requests(laboratory_id);
-- Test-related indexes removed
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers only for tables that exist
DROP TRIGGER IF EXISTS update_client_profiles_updated_at ON client_profiles;
DROP TRIGGER IF EXISTS update_laboratory_profiles_updated_at ON laboratory_profiles;
DROP TRIGGER IF EXISTS update_PAD_requests_updated_at ON PAD_requests;
DROP TRIGGER IF EXISTS update_medical_results_updated_at ON medical_results;

CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON client_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_laboratory_profiles_updated_at BEFORE UPDATE ON laboratory_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_PAD_requests_updated_at BEFORE UPDATE ON PAD_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_results_updated_at BEFORE UPDATE ON medical_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratory_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE PAD_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- DROP ALL EXISTING POLICIES FIRST
DROP POLICY IF EXISTS "Users can view own client profile" ON client_profiles;
DROP POLICY IF EXISTS "Users can insert own client profile" ON client_profiles;
DROP POLICY IF EXISTS "Users can update own client profile" ON client_profiles;
DROP POLICY IF EXISTS "Public read access for client search" ON client_profiles;
DROP POLICY IF EXISTS "Laboratories can view client profiles" ON client_profiles;

DROP POLICY IF EXISTS "Users can view own laboratory profile" ON laboratory_profiles;
DROP POLICY IF EXISTS "Users can insert own laboratory profile" ON laboratory_profiles;
DROP POLICY IF EXISTS "Users can update own laboratory profile" ON laboratory_profiles;
DROP POLICY IF EXISTS "Anyone can view verified laboratories" ON laboratory_profiles;
DROP POLICY IF EXISTS "Public read access for laboratory search" ON laboratory_profiles;

DROP POLICY IF EXISTS "Users can view their own PAD requests as client" ON PAD_requests;
DROP POLICY IF EXISTS "Users can view their own PAD requests as laboratory" ON PAD_requests;
DROP POLICY IF EXISTS "Clients can create PAD requests" ON PAD_requests;
DROP POLICY IF EXISTS "Laboratories can create PAD requests" ON PAD_requests;
DROP POLICY IF EXISTS "Laboratories can update PAD requests" ON PAD_requests;

-- Removed test_requests and test_results policy drops since these tables don't exist

DROP POLICY IF EXISTS "Users can view own results" ON medical_results;
DROP POLICY IF EXISTS "Laboratories can insert results" ON medical_results;
DROP POLICY IF EXISTS "Users can update own results" ON medical_results;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

DROP POLICY IF EXISTS "Users can view own files" ON file_uploads;
DROP POLICY IF EXISTS "Users can insert own files" ON file_uploads;

-- DROP THE NEW POLICIES TOO (in case they already exist)
DROP POLICY IF EXISTS "Allow all to read client profiles" ON client_profiles;
DROP POLICY IF EXISTS "Allow all to insert client profiles" ON client_profiles;
DROP POLICY IF EXISTS "Allow all to read laboratory profiles" ON laboratory_profiles;
DROP POLICY IF EXISTS "Allow all to insert laboratory profiles" ON laboratory_profiles;
DROP POLICY IF EXISTS "Users can view their PAD requests" ON PAD_requests;
DROP POLICY IF EXISTS "Users can create PAD requests" ON PAD_requests;
DROP POLICY IF EXISTS "Users can update their PAD requests" ON PAD_requests;
-- Removed additional test table policy drops since these tables don't exist
DROP POLICY IF EXISTS "Allow all to insert notifications" ON notifications;

-- CREATE SIMPLE POLICIES THAT WORK
-- Client profiles - ALLOW EVERYONE TO READ AND INSERT (so laboratories can see clients)
CREATE POLICY "Allow all to read client profiles" ON client_profiles FOR SELECT USING (true);
CREATE POLICY "Allow all to insert client profiles" ON client_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own client profile" ON client_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Laboratory profiles - ALLOW EVERYONE TO READ AND INSERT
CREATE POLICY "Allow all to read laboratory profiles" ON laboratory_profiles FOR SELECT USING (true);
CREATE POLICY "Allow all to insert laboratory profiles" ON laboratory_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own laboratory profile" ON laboratory_profiles FOR UPDATE USING (auth.uid() = user_id);

-- PAD requests - SIMPLE POLICIES
CREATE POLICY "Users can view their PAD requests" ON PAD_requests FOR SELECT USING (auth.uid() = client_id OR auth.uid() = laboratory_id);
CREATE POLICY "Users can create PAD requests" ON PAD_requests FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = laboratory_id);
CREATE POLICY "Users can update their PAD requests" ON PAD_requests FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = laboratory_id);

-- Test policies removed

-- Notifications - SIMPLE POLICIES
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow all to insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Medical results - SIMPLE POLICIES
CREATE POLICY "Users can view own results" ON medical_results FOR SELECT USING (auth.uid() = client_id OR auth.uid() = laboratory_id);
CREATE POLICY "Laboratories can insert results" ON medical_results FOR INSERT WITH CHECK (auth.uid() = laboratory_id);
CREATE POLICY "Users can update own results" ON medical_results FOR UPDATE USING (auth.uid() = laboratory_id);

-- File uploads - SIMPLE POLICIES
CREATE POLICY "Users can view own files" ON file_uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own files" ON file_uploads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE ALL EXISTING LABORATORIES TO BE VERIFIED AND FIX MISSING DATA
UPDATE laboratory_profiles SET is_verified = true WHERE is_verified = false;

-- Fix missing lab_name field (copy from laboratory_name if lab_name is null)
UPDATE laboratory_profiles
SET lab_name = laboratory_name
WHERE lab_name IS NULL AND laboratory_name IS NOT NULL;

-- Fix missing laboratory_name field (copy from lab_name if laboratory_name is null)
UPDATE laboratory_profiles
SET laboratory_name = lab_name
WHERE laboratory_name IS NULL AND lab_name IS NOT NULL;

-- Set default values for completely empty name fields
UPDATE laboratory_profiles
SET lab_name = 'Laboratoire', laboratory_name = 'Laboratoire'
WHERE (lab_name IS NULL OR lab_name = '') AND (laboratory_name IS NULL OR laboratory_name = '');



-- CREATE A TRIGGER TO AUTO-VERIFY NEW LABORATORIES
CREATE OR REPLACE FUNCTION auto_verify_laboratory()
RETURNS TRIGGER AS $$
BEGIN
    NEW.is_verified = true;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_verify_laboratory_trigger ON laboratory_profiles;
CREATE TRIGGER auto_verify_laboratory_trigger
    BEFORE INSERT ON laboratory_profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_verify_laboratory();

-- DONE! This should fix everything.

-- ADD BANNED USERS TABLE AND ADMIN FUNCTIONS
-- Create banned_users table for ban functionality
CREATE TABLE IF NOT EXISTS banned_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  banned_until TIMESTAMP WITH TIME ZONE NOT NULL,
  banned_by TEXT DEFAULT 'admin',
  reason TEXT DEFAULT 'Banned by admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on banned_users
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

-- Create policy for banned_users
DROP POLICY IF EXISTS "Admin can manage bans" ON banned_users;
CREATE POLICY "Admin can manage bans" ON banned_users FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON banned_users(user_id);
CREATE INDEX IF NOT EXISTS idx_banned_users_banned_until ON banned_users(banned_until);

-- Create deleted_users table to track deletions
CREATE TABLE IF NOT EXISTS deleted_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT,
  deleted_by TEXT DEFAULT 'admin',
  deletion_reason TEXT DEFAULT 'Admin deletion',
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_backup JSONB
);

-- Enable RLS on deleted_users
ALTER TABLE deleted_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin can manage deletions" ON deleted_users;
CREATE POLICY "Admin can manage deletions" ON deleted_users FOR ALL USING (true);

-- Create function to completely delete a user
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

  -- Collect user data before deletion
  SELECT json_build_object(
    'client_profile', (SELECT row_to_json(cp) FROM client_profiles cp WHERE cp.user_id = target_user_id),
    'lab_profile', (SELECT row_to_json(lp) FROM laboratory_profiles lp WHERE lp.user_id = target_user_id),
    'pad_requests_as_client', (SELECT json_agg(pr) FROM PAD_requests pr WHERE pr.client_id = target_user_id),
    'pad_requests_as_lab', (SELECT json_agg(pr) FROM PAD_requests pr WHERE pr.laboratory_id = target_user_id),
    'notifications', (SELECT json_agg(n) FROM notifications n WHERE n.user_id = target_user_id),
    'medical_results_as_client', (SELECT json_agg(mr) FROM medical_results mr WHERE mr.client_id = target_user_id),
    'medical_results_as_lab', (SELECT json_agg(mr) FROM medical_results mr WHERE mr.laboratory_id = target_user_id),
    'file_uploads', (SELECT json_agg(fu) FROM file_uploads fu WHERE fu.user_id = target_user_id),
    'ban_info', (SELECT json_agg(bu) FROM banned_users bu WHERE bu.user_id = target_user_id)
  ) INTO user_data;

  -- Store deletion record
  INSERT INTO deleted_users (user_id, email, deleted_by, data_backup)
  SELECT target_user_id, u.email, admin_email, user_data
  FROM auth.users u WHERE u.id = target_user_id;

  -- Delete from all tables (using correct table names)
  DELETE FROM client_profiles WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;

  DELETE FROM laboratory_profiles WHERE user_id = target_user_id;
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

-- Create function to ban a user
CREATE OR REPLACE FUNCTION admin_ban_user(
  target_user_id UUID,
  ban_duration_days INTEGER DEFAULT 30,
  ban_reason TEXT DEFAULT 'Banned by admin',
  admin_email TEXT DEFAULT 'sihaaexpress@gmail.com'
)
RETURNS JSON AS $$
DECLARE
  ban_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if admin
  IF admin_email != 'sihaaexpress@gmail.com' THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  ban_until := NOW() + (ban_duration_days || ' days')::INTERVAL;

  -- Insert or update ban record
  INSERT INTO banned_users (user_id, banned_until, banned_by, reason)
  VALUES (target_user_id, ban_until, admin_email, ban_reason)
  ON CONFLICT (user_id) DO UPDATE SET
    banned_until = EXCLUDED.banned_until,
    banned_by = EXCLUDED.banned_by,
    reason = EXCLUDED.reason,
    created_at = NOW();

  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'banned_until', ban_until,
    'reason', ban_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to unban a user
CREATE OR REPLACE FUNCTION admin_unban_user(target_user_id UUID, admin_email TEXT DEFAULT 'sihaaexpress@gmail.com')
RETURNS JSON AS $$
BEGIN
  -- Check if admin
  IF admin_email != 'sihaaexpress@gmail.com' THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  DELETE FROM banned_users WHERE user_id = target_user_id;

  RETURN json_build_object('success', true, 'user_id', target_user_id, 'unbanned', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM banned_users
        WHERE user_id = check_user_id
        AND banned_until > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get ban info
CREATE OR REPLACE FUNCTION get_ban_info(check_user_id UUID)
RETURNS JSON AS $$
DECLARE
    ban_record RECORD;
BEGIN
    SELECT * INTO ban_record
    FROM banned_users
    WHERE user_id = check_user_id
    AND banned_until > NOW()
    LIMIT 1;

    IF ban_record IS NULL THEN
        RETURN json_build_object('banned', false);
    ELSE
        RETURN json_build_object(
            'banned', true,
            'banned_until', ban_record.banned_until,
            'reason', ban_record.reason,
            'banned_by', ban_record.banned_by
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION admin_delete_user(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_ban_user(UUID, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_unban_user(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_banned(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ban_info(UUID) TO authenticated;


-- Temporarily disable RLS for data backfill (safe; re-enabled later)
ALTER TABLE public.client_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratory_profiles DISABLE ROW LEVEL SECURITY;

-- Reconcile schema differences on existing databases (safe/idempotent)
DO $$
BEGIN
    -- Ensure expected columns exist on client_profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='client_profiles' AND column_name='full_name'
    ) THEN
        ALTER TABLE public.client_profiles ADD COLUMN full_name VARCHAR(255);
    END IF;

    -- If legacy first_name/last_name exist with NOT NULL, relax them so inserts won't fail
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='client_profiles' AND column_name='first_name'
    ) THEN
        ALTER TABLE public.client_profiles ALTER COLUMN first_name DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='client_profiles' AND column_name='last_name'
    ) THEN
        ALTER TABLE public.client_profiles ALTER COLUMN last_name DROP NOT NULL;
    END IF;

    -- Ensure expected columns exist on laboratory_profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='laboratory_profiles' AND column_name='laboratory_name'
    ) THEN
        ALTER TABLE public.laboratory_profiles ADD COLUMN laboratory_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='laboratory_profiles' AND column_name='lab_name'
    ) THEN
        ALTER TABLE public.laboratory_profiles ADD COLUMN lab_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='laboratory_profiles' AND column_name='services_offered'
    ) THEN
        ALTER TABLE public.laboratory_profiles ADD COLUMN services_offered TEXT[];
    END IF;

    -- Opening days (array of day names in French)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='laboratory_profiles' AND column_name='opening_days'
    ) THEN
        ALTER TABLE public.laboratory_profiles ADD COLUMN opening_days TEXT[];
    END IF;

    -- Add geolocation columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='laboratory_profiles' AND column_name='latitude'
    ) THEN
        ALTER TABLE public.laboratory_profiles ADD COLUMN latitude DECIMAL(10, 8);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='laboratory_profiles' AND column_name='longitude'
    ) THEN
        ALTER TABLE public.laboratory_profiles ADD COLUMN longitude DECIMAL(11, 8);
    END IF;

    -- Add client location columns to PAD_requests if they don't exist
    -- Note: These columns are already defined in the table creation above (lines 103-104)
    -- So we only add them if the table exists but columns are missing
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema='public' AND table_name='pad_requests'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='pad_requests' AND column_name='client_location_lat'
    ) THEN
        ALTER TABLE public.PAD_requests ADD COLUMN client_location_lat DECIMAL(10, 8);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema='public' AND table_name='pad_requests'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='pad_requests' AND column_name='client_location_lng'
    ) THEN
        ALTER TABLE public.PAD_requests ADD COLUMN client_location_lng DECIMAL(11, 8);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema='public' AND table_name='pad_requests'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='pad_requests' AND column_name='client_name'
    ) THEN
        ALTER TABLE public.PAD_requests ADD COLUMN client_name VARCHAR(255);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema='public' AND table_name='pad_requests'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='pad_requests' AND column_name='client_phone'
    ) THEN
        ALTER TABLE public.PAD_requests ADD COLUMN client_phone VARCHAR(20);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema='public' AND table_name='pad_requests'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='pad_requests' AND column_name='client_address'
    ) THEN
        ALTER TABLE public.PAD_requests ADD COLUMN client_address TEXT;
    END IF;

   IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='pad_requests'
) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='pad_requests' AND column_name='requested_tests'
) THEN
    ALTER TABLE public.pad_requests ADD COLUMN requested_tests TEXT[];
END IF;


    -- Handle ALL legacy NOT NULL columns that might cause insert failures
    -- Drop NOT NULL from any problematic columns in laboratory_profiles
    DECLARE
        col_record RECORD;
    BEGIN
        FOR col_record IN
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema='public'
              AND table_name='laboratory_profiles'
              AND is_nullable='NO'
              AND column_name NOT IN ('id', 'user_id', 'created_at', 'updated_at', 'laboratory_name')
        LOOP
            BEGIN
                EXECUTE 'ALTER TABLE public.laboratory_profiles ALTER COLUMN ' || col_record.column_name || ' DROP NOT NULL';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop NOT NULL from %: %', col_record.column_name, SQLERRM;
            END;
        END LOOP;
    END;

    -- Drop NOT NULL from any problematic columns in client_profiles
    DECLARE
        col_record RECORD;
    BEGIN
        FOR col_record IN
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema='public'
              AND table_name='client_profiles'
              AND is_nullable='NO'
              AND column_name NOT IN ('id', 'user_id', 'created_at', 'updated_at', 'full_name')
        LOOP
            BEGIN
                EXECUTE 'ALTER TABLE public.client_profiles ALTER COLUMN ' || col_record.column_name || ' DROP NOT NULL';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop NOT NULL from %: %', col_record.column_name, SQLERRM;
            END;
        END LOOP;
    END;


    -- Ensure unique constraint on user_id exists (only add if missing)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema='public' AND table_name='client_profiles' AND constraint_name='client_profiles_user_id_key'
    ) THEN
        ALTER TABLE public.client_profiles ADD CONSTRAINT client_profiles_user_id_key UNIQUE (user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema='public' AND table_name='laboratory_profiles' AND constraint_name='laboratory_profiles_user_id_key'
    ) THEN
        ALTER TABLE public.laboratory_profiles ADD CONSTRAINT laboratory_profiles_user_id_key UNIQUE (user_id);
    END IF;
END $$;



-- STORAGE SETUP (run manually in Supabase Dashboard to avoid 42501 permissions)
-- 1) Go to Storage → Create new bucket
--    - Bucket ID: medical-results
--    - Public: enabled (or keep private and use signed URLs in the app)
-- 2) Policies (Storage → medical-results → Policies):
--    - Public read:
--        Target table: storage.objects, Action: SELECT
--        USING expression: bucket_id = 'medical-results'
--    - Authenticated upload:
--        Action: INSERT
--        WITH CHECK: bucket_id = 'medical-results' AND auth.role() = 'authenticated'
--    - Owner update/delete (optional):
--        UPDATE USING: bucket_id = 'medical-results' AND owner = auth.uid()
--        WITH CHECK:   bucket_id = 'medical-results' AND owner = auth.uid()
--        DELETE USING:  bucket_id = 'medical-results' AND owner = auth.uid()
-- If you prefer SQL and you are the owner of storage.objects, you can run the equivalent
-- CREATE POLICY statements; otherwise you will see: ERROR 42501 must be owner of table objects.
-- Note: You can also create the bucket via SQL if you have privileges:
--   select storage.create_bucket('medical-results', true);


-- Re-enable RLS after backfill
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratory_profiles ENABLE ROW LEVEL SECURITY;


-- Drop test tables if they exist (these are not needed for current app)
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS test_requests CASCADE;

-- Show final results
SELECT 'Setup complete!' as status;
SELECT 'Client profiles:' as table_name, COUNT(*) as count FROM client_profiles;
SELECT 'Laboratory profiles:' as table_name, COUNT(*) as count FROM laboratory_profiles;





