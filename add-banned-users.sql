-- Add banned_users table and real-time ban checking

-- Create banned_users table
CREATE TABLE IF NOT EXISTS banned_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    banned_until TIMESTAMP WITH TIME ZONE NOT NULL,
    banned_by VARCHAR(255) DEFAULT 'admin',
    reason TEXT DEFAULT 'Banned by admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on banned_users
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

-- Create policies for banned_users
DROP POLICY IF EXISTS "Admin can manage bans" ON banned_users;
CREATE POLICY "Admin can manage bans" ON banned_users FOR ALL USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON banned_users(user_id);
CREATE INDEX IF NOT EXISTS idx_banned_users_banned_until ON banned_users(banned_until);

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
GRANT EXECUTE ON FUNCTION is_user_banned(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ban_info(UUID) TO authenticated;

-- Add admin ban and unban functions
CREATE OR REPLACE FUNCTION admin_ban_user(
  target_user_id UUID,
  ban_duration_days INTEGER DEFAULT 30,
  ban_reason TEXT DEFAULT 'Banned by admin'
) RETURNS JSON AS $$
DECLARE
  ban_until TIMESTAMP WITH TIME ZONE;
BEGIN
  ban_until := NOW() + (ban_duration_days || ' days')::INTERVAL;

  INSERT INTO banned_users (user_id, banned_until, banned_by, reason)
  VALUES (target_user_id, ban_until, 'admin', ban_reason)
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

CREATE OR REPLACE FUNCTION admin_unban_user(target_user_id UUID)
RETURNS JSON AS $$
BEGIN
  DELETE FROM banned_users WHERE user_id = target_user_id;
  RETURN json_build_object('success', true, 'user_id', target_user_id, 'unbanned', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add complete user deletion function (deletes from ALL tables including auth.users)
CREATE OR REPLACE FUNCTION admin_delete_user_complete(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  deletion_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Delete from all app tables first
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

  -- NOW DELETE FROM AUTH.USERS (this is the key part)
  DELETE FROM auth.users WHERE id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;

  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'records_deleted', deletion_count,
    'deleted_from_auth', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get auth users for admin panel
CREATE OR REPLACE FUNCTION get_auth_users_admin()
RETURNS TABLE(
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  user_metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email::TEXT,
    u.created_at,
    u.last_sign_in_at,
    u.raw_user_meta_data as user_metadata
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION admin_ban_user(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_unban_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_user_complete(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_auth_users_admin() TO authenticated;
