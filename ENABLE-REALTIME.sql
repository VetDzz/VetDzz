-- ============================================================================
-- ENABLE REALTIME FOR BAN DETECTION
-- ============================================================================
-- 
-- Run this in your Supabase SQL Editor to enable real-time ban notifications
-- 
-- INSTRUCTIONS:
-- 1. Go to: https://plwfbeqtupboeerqiplw.supabase.co/project/plwfbeqtupboeerqiplw/sql/new
-- 2. Copy and paste this entire file
-- 3. Click "Run"
-- 
-- ============================================================================

-- Enable Realtime for banned_users table
ALTER PUBLICATION supabase_realtime ADD TABLE banned_users;

-- Verify it's enabled (should return 1 row)
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'banned_users';

-- ============================================================================
-- DONE! Real-time ban detection is now enabled!
-- ============================================================================
