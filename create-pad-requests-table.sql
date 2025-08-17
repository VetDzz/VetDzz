-- CREATE PAD_REQUESTS TABLE
-- Run this in your Supabase SQL Editor to fix the PAD request functionality

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create PAD_requests table if it doesn't exist
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

-- Enable Row Level Security
ALTER TABLE PAD_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their PAD requests" ON PAD_requests;
DROP POLICY IF EXISTS "Users can create PAD requests" ON PAD_requests;
DROP POLICY IF EXISTS "Users can update their PAD requests" ON PAD_requests;

-- Create RLS policies for PAD_requests
CREATE POLICY "Users can view their PAD requests" ON PAD_requests 
    FOR SELECT USING (auth.uid() = client_id OR auth.uid() = laboratory_id);

CREATE POLICY "Users can create PAD requests" ON PAD_requests 
    FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = laboratory_id);

CREATE POLICY "Users can update their PAD requests" ON PAD_requests 
    FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = laboratory_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pad_requests_client_id ON PAD_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_pad_requests_laboratory_id ON PAD_requests(laboratory_id);
CREATE INDEX IF NOT EXISTS idx_pad_requests_status ON PAD_requests(status);
CREATE INDEX IF NOT EXISTS idx_pad_requests_created_at ON PAD_requests(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pad_requests_updated_at ON PAD_requests;
CREATE TRIGGER update_pad_requests_updated_at
    BEFORE UPDATE ON PAD_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify table creation
SELECT 'PAD_requests table created successfully!' as result;
