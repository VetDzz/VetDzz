-- Simple admin functions that should work with RLS

-- Create function to completely delete a user (simplified)
CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID, admin_email TEXT DEFAULT 'glowyboy01@gmail.com')
RETURNS JSON AS $$
DECLARE
  deletion_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Check if admin (simplified check)
  IF admin_email != 'glowyboy01@gmail.com' THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Delete from all tables (simplified - no backup for now)
  DELETE FROM client_profiles WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;
  
  DELETE FROM laboratory_profiles WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;
  
  DELETE FROM pad_requests WHERE client_id = target_user_id OR laboratory_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;
  
  DELETE FROM notifications WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;
  
  DELETE FROM medical_results WHERE client_id = target_user_id OR laboratory_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;
  
  DELETE FROM banned_users WHERE user_id = target_user_id;
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deletion_count := deletion_count + temp_count;

  RETURN json_build_object(
    'success', true, 
    'user_id', target_user_id,
    'records_deleted', deletion_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to ban a user (simplified)
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

-- Create function to unban a user (simplified)
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION admin_delete_user(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_ban_user(UUID, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_unban_user(UUID, TEXT) TO authenticated;
