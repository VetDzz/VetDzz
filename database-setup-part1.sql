-- DATABASE SETUP PART 1: Clean up and basic setup
-- Run this first in your Supabase SQL editor

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

-- Medical results table (THIS IS THE MISSING TABLE CAUSING THE ERROR)
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

SELECT 'Part 1 complete - Tables created!' as status;
