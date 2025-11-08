-- COMPLETE DATABASE SETUP FOR VETDZ
-- Veterinary Medical Platform for Algeria
-- Run this ONE file in your Supabase SQL editor
-- This will create everything needed for the veterinary platform

-- Drop any existing views that might conflict with table changes
DROP VIEW IF EXISTS PAD_requests_view CASCADE;
DROP VIEW IF EXISTS client_requests_view CASCADE;
DROP VIEW IF EXISTS vet_requests_view CASCADE;
DROP VIEW IF EXISTS PAD_requests_with_client CASCADE;
DROP VIEW IF EXISTS all_service_providers CASCADE;

-- Drop any existing functions that might conflict
DROP FUNCTION IF EXISTS get_client_requests() CASCADE;
DROP FUNCTION IF EXISTS get_vet_requests() CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $ BEGIN
    CREATE TYPE user_type AS ENUM ('client', 'vet');
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

DO $ BEGIN
    CREATE TYPE test_request_status AS ENUM ('pending', 'assigned', 'collected', 'processing', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

DO $ BEGIN
    CREATE TYPE collection_type AS ENUM ('home', 'clinic');
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

DO $ BEGIN
    CREATE TYPE priority_type AS ENUM ('normal', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

DO $ BEGIN
    CREATE TYPE result_status AS ENUM ('normal', 'abnormal', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

DO $ BEGIN
    CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

-- Client profiles table (pet owners)
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

-- Veterinarian profiles table (replaces laboratory_profiles)
CREATE TABLE IF NOT EXISTS vet_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    vet_name VARCHAR(255) NOT NULL,
    clinic_name VARCHAR(255),
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

-- PAD requests table (Prélèvement à Domicile - Home Collection Requests)
CREATE TABLE IF NOT EXISTS PAD_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vet_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    client_location_lat DECIMAL(10, 8),
    client_location_lng DECIMAL(11, 8),
    client_name VARCHAR(255),
    client_phone VARCHAR(20),
    client_address TEXT,
    pet_name VARCHAR(255),
    pet_species VARCHAR(100),
    pet_breed VARCHAR(100),
    requested_tests TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical results table
CREATE TABLE IF NOT EXISTS medical_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vet_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'reviewed')),
    pet_name VARCHAR(255),
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
CREATE INDEX IF NOT EXISTS idx_vet_profiles_user_id ON vet_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_vet_profiles_verified ON vet_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_PAD_requests_client_id ON PAD_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_PAD_requests_vet_id ON PAD_requests(vet_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_client_profiles_updated_at ON client_profiles;
DROP TRIGGER IF EXISTS update_vet_profiles_updated_at ON vet_profiles;
DROP TRIGGER IF EXISTS update_PAD_requests_updated_at ON PAD_requests;
DROP TRIGGER IF EXISTS update_medical_results_updated_at ON medical_results;

CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON client_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vet_profiles_updated_at BEFORE UPDATE ON vet_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_PAD_requests_updated_at BEFORE UPDATE ON PAD_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_results_updated_at BEFORE UPDATE ON medical_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE PAD_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- DROP ALL EXISTING POLICIES FIRST
DROP POLICY IF EXISTS "Users can view own client profile" ON client_profiles;
DROP POLICY IF EXISTS "Users can insert own client profile" ON client_profiles;
DROP POLICY IF EXISTS "Users can update own client profile" ON client_profiles;
DROP POLICY IF EXISTS "Public read access for client search" ON client_profiles;
DROP POLICY IF EXISTS "Vets can view client profiles" ON client_profiles;
DROP POLICY IF EXISTS "Allow all to read client profiles" ON client_profiles;
DROP POLICY IF EXISTS "Allow all to insert client profiles" ON client_profiles;

DROP POLICY IF EXISTS "Users can view own vet profile" ON vet_profiles;
DROP POLICY IF EXISTS "Users can insert own vet profile" ON vet_profiles;
DROP POLICY IF EXISTS "Users can update own vet profile" ON vet_profiles;
DROP POLICY IF EXISTS "Anyone can view verified vets" ON vet_profiles;
DROP POLICY IF EXISTS "Public read access for vet search" ON vet_profiles;
DROP POLICY IF EXISTS "Allow all to read vet profiles" ON vet_profiles;
DROP POLICY IF EXISTS "Allow all to insert vet profiles" ON vet_profiles;

DROP POLICY IF EXISTS "Users can view their own PAD requests as client" ON PAD_requests;
DROP POLICY IF EXISTS "Users can view their own PAD requests as vet" ON PAD_requests;
DROP POLICY IF EXISTS "Clients can create PAD requests" ON PAD_requests;
DROP POLICY IF EXISTS "Vets can create PAD requests" ON PAD_requests;
DROP POLICY IF EXISTS "Vets can update PAD requests" ON PAD_requests;
DROP POLICY IF EXISTS "Users can view their PAD requests" ON PAD_requests;
DROP POLICY IF EXISTS "Users can create PAD requests" ON PAD_requests;
DROP POLICY IF EXISTS "Users can update their PAD requests" ON PAD_requests;

DROP POLICY IF EXISTS "Users can view own results" ON medical_results;
DROP POLICY IF EXISTS "Vets can insert results" ON medical_results;
DROP POLICY IF EXISTS "Users can update own results" ON medical_results;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all to insert notifications" ON notifications;

DROP POLICY IF EXISTS "Users can view own files" ON file_uploads;
DROP POLICY IF EXISTS "Users can insert own files" ON file_uploads;

-- CREATE SIMPLE POLICIES THAT WORK
-- Client profiles - ALLOW EVERYONE TO READ AND INSERT (so vets can see clients)
CREATE POLICY "Allow all to read client profiles" ON client_profiles FOR SELECT USING (true);
CREATE POLICY "Allow all to insert client profiles" ON client_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own client profile" ON client_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Vet profiles - ALLOW EVERYONE TO READ AND INSERT
CREATE POLICY "Allow all to read vet profiles" ON vet_profiles FOR SELECT USING (true);
CREATE POLICY "Allow all to insert vet profiles" ON vet_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own vet profile" ON vet_profiles FOR UPDATE USING (auth.uid() = user_id);

-- PAD requests - SIMPLE POLICIES
CREATE POLICY "Users can view their PAD requests" ON PAD_requests FOR SELECT USING (auth.uid() = client_id OR auth.uid() = vet_id);
CREATE POLICY "Users can create PAD requests" ON PAD_requests FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = vet_id);
CREATE POLICY "Users can update their PAD requests" ON PAD_requests FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = vet_id);

-- Notifications - SIMPLE POLICIES
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow all to insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Medical results - SIMPLE POLICIES
CREATE POLICY "Users can view own results" ON medical_results FOR SELECT USING (auth.uid() = client_id OR auth.uid() = vet_id);
CREATE POLICY "Vets can insert results" ON medical_results FOR INSERT WITH CHECK (auth.uid() = vet_id);
CREATE POLICY "Users can update own results" ON medical_results FOR UPDATE USING (auth.uid() = vet_id);

-- File uploads - SIMPLE POLICIES
CREATE POLICY "Users can view own files" ON file_uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own files" ON file_uploads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE ALL EXISTING VETS TO BE VERIFIED AND FIX MISSING DATA
UPDATE vet_profiles SET is_verified = true WHERE is_verified = false;

-- Fix missing clinic_name field (copy from vet_name if clinic_name is null)
UPDATE vet_profiles
SET clinic_name = vet_name
WHERE clinic_name IS NULL AND vet_name IS NOT NULL;

-- Fix missing vet_name field (copy from clinic_name if vet_name is null)
UPDATE vet_profiles
SET vet_name = clinic_name
WHERE vet_name IS NULL AND clinic_name IS NOT NULL;

-- Set default values for completely empty name fields
UPDATE vet_profiles
SET vet_name = 'Vétérinaire', clinic_name = 'Clinique Vétérinaire'
WHERE (vet_name IS NULL OR vet_name = '') AND (clinic_name IS NULL OR clinic_name = '');

-- CREATE A TRIGGER TO AUTO-VERIFY NEW VETS
CREATE OR REPLACE FUNCTION auto_verify_vet()
RETURNS TRIGGER AS $
BEGIN
    NEW.is_verified = true;
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_verify_vet_trigger ON vet_profiles;
CREATE TRIGGER auto_verify_vet_trigger
    BEFORE INSERT ON vet_profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_verify_vet();

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
CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID, admin_email TEXT DEFAULT 'vetdz@gmail.com')
RETURNS JSON AS $
DECLARE
  user_data JSONB;
  deletion_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Check if admin
  IF admin_email != 'vetdz@gmail.com' THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Collect user data before deletion
  SELECT json_build_object(
    'client_profile', (SELECT row_to_json(cp) FROM client_profiles cp WHERE cp.user_id = target_user_id),
    'vet_profile', (SELECT row_to_json(vp) FROM vet_profiles vp WHERE vp.user_id = target_user_id),
    'pad_requests_as_client', (SELECT json_agg(pr) FROM PAD_requests pr WHERE pr.client_id = target_user_id),
    'pad_requests_as_vet', (SELECT json_agg(pr) FROM PAD_requests pr WHERE pr.vet_id = target_user_id),
    'notifications', (SELECT json_agg(n) FROM notifications n WHERE n.user_id = target_user_id),
    'medical_results_as_client', (SELECT json_agg(mr) FROM medical_results mr WHERE mr.client_id = target_user_id),
    'medical_results_as_vet', (SELECT json_agg(mr) FROM medical_results mr WHERE mr.vet_id = target_user_id),
    'file_uploads', (SELECT json_agg(fu) FROM file_uploads fu WHERE fu.user_id = target_user_id),
    'ban_info', (SELECT json_agg(bu) FROM banned_users bu WHERE bu.user_id = target_user_id)
  ) INTO user_data;

  -- Store deletion record
  INSERT INTO deleted_users (user_id, email, deleted_by, data_backup)
  SELECT target_user_id, u.email, admin_email, user_data
  FROM auth.users u WHERE u.id = target_user_id;

  -- Delete from all tables
  DELETE FROM client_profiles WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;

  DELETE FROM vet_profiles WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;

  DELETE FROM PAD_requests WHERE client_id = target_user_id OR vet_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;

  DELETE FROM notifications WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;

  DELETE FROM medical_results WHERE client_id = target_user_id OR vet_id = target_user_id;
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
    NULL;
  END;

  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'records_deleted', deletion_count,
    'backup_created', true
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to ban a user
CREATE OR REPLACE FUNCTION admin_ban_user(
  target_user_id UUID,
  ban_duration_days INTEGER DEFAULT 30,
  ban_reason TEXT DEFAULT 'Banned by admin',
  admin_email TEXT DEFAULT 'vetdz@gmail.com'
)
RETURNS JSON AS $
DECLARE
  ban_until TIMESTAMP WITH TIME ZONE;
BEGIN
  IF admin_email != 'vetdz@gmail.com' THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  ban_until := NOW() + (ban_duration_days || ' days')::INTERVAL;

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
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to unban a user
CREATE OR REPLACE FUNCTION admin_unban_user(target_user_id UUID, admin_email TEXT DEFAULT 'vetdz@gmail.com')
RETURNS JSON AS $
BEGIN
  IF admin_email != 'vetdz@gmail.com' THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  DELETE FROM banned_users WHERE user_id = target_user_id;

  RETURN json_build_object('success', true, 'user_id', target_user_id, 'unbanned', true);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(check_user_id UUID)
RETURNS BOOLEAN AS $
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM banned_users
        WHERE user_id = check_user_id
        AND banned_until > NOW()
    );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get ban info
CREATE OR REPLACE FUNCTION get_ban_info(check_user_id UUID)
RETURNS JSON AS $
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
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION admin_delete_user(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_ban_user(UUID, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_unban_user(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_banned(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ban_info(UUID) TO authenticated;

-- DONE! VetDz database setup complete.
