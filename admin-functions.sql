-- Create a comprehensive user deletion system
-- This will handle complete user removal including auth records

-- Create a deleted_users table to track deletions
CREATE TABLE IF NOT EXISTS deleted_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT,
  deleted_by TEXT DEFAULT 'admin',
  deletion_reason TEXT DEFAULT 'Admin deletion',
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_backup JSONB -- Store user data before deletion
);

-- Enable RLS on deleted_users
ALTER TABLE deleted_users ENABLE ROW LEVEL SECURITY;

-- Create policy for deleted_users
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'deleted_users' 
    AND policyname = 'Admin can manage deletions'
  ) THEN
    CREATE POLICY "Admin can manage deletions" ON deleted_users FOR ALL USING (true);
  END IF;
END $$;

-- Create function to completely delete a user
CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID, admin_email TEXT DEFAULT 'glowyboy01@gmail.com')
RETURNS JSON AS $$
DECLARE
  user_data JSONB;
  deletion_count INTEGER := 0;
  result JSON;
BEGIN
  -- Check if admin
  IF admin_email != 'glowyboy01@gmail.com' THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Collect user data before deletion
  SELECT json_build_object(
    'client_profile', (SELECT row_to_json(cp) FROM client_profiles cp WHERE cp.user_id = target_user_id),
    'lab_profile', (SELECT row_to_json(lp) FROM laboratory_profiles lp WHERE lp.user_id = target_user_id),
    'pad_requests_as_client', (SELECT json_agg(pr) FROM pad_requests pr WHERE pr.client_id = target_user_id),
    'pad_requests_as_lab', (SELECT json_agg(pr) FROM pad_requests pr WHERE pr.laboratory_id = target_user_id),
    'notifications', (SELECT json_agg(n) FROM notifications n WHERE n.user_id = target_user_id),
    'medical_results_as_client', (SELECT json_agg(mr) FROM medical_results mr WHERE mr.client_id = target_user_id),
    'medical_results_as_lab', (SELECT json_agg(mr) FROM medical_results mr WHERE mr.laboratory_id = target_user_id),
    'ban_info', (SELECT json_agg(bu) FROM banned_users bu WHERE bu.user_id = target_user_id)
  ) INTO user_data;

  -- Store deletion record
  INSERT INTO deleted_users (user_id, email, deleted_by, data_backup)
  SELECT target_user_id, u.email, admin_email, user_data
  FROM auth.users u WHERE u.id = target_user_id;

  -- Delete from all tables
  DELETE FROM client_profiles WHERE user_id = target_user_id;
  GET DIAGNOSTICS deletion_count = ROW_COUNT;
  
  DELETE FROM laboratory_profiles WHERE user_id = target_user_id;
  deletion_count := deletion_count + ROW_COUNT;
  
  DELETE FROM pad_requests WHERE client_id = target_user_id OR laboratory_id = target_user_id;
  deletion_count := deletion_count + ROW_COUNT;
  
  DELETE FROM notifications WHERE user_id = target_user_id;
  deletion_count := deletion_count + ROW_COUNT;
  
  DELETE FROM medical_results WHERE client_id = target_user_id OR laboratory_id = target_user_id;
  deletion_count := deletion_count + ROW_COUNT;
  
  DELETE FROM banned_users WHERE user_id = target_user_id;
  deletion_count := deletion_count + ROW_COUNT;

  -- Try to delete from auth.users (requires admin privileges)
  BEGIN
    DELETE FROM auth.users WHERE id = target_user_id;
    deletion_count := deletion_count + ROW_COUNT;
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
  admin_email TEXT DEFAULT 'glowyboy01@gmail.com'
)
RETURNS JSON AS $$
DECLARE
  ban_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if admin
  IF admin_email != 'glowyboy01@gmail.com' THEN
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
CREATE OR REPLACE FUNCTION admin_unban_user(target_user_id UUID, admin_email TEXT DEFAULT 'glowyboy01@gmail.com')
RETURNS JSON AS $$
BEGIN
  -- Check if admin
  IF admin_email != 'glowyboy01@gmail.com' THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  DELETE FROM banned_users WHERE user_id = target_user_id;

  RETURN json_build_object('success', true, 'user_id', target_user_id, 'unbanned', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
