-- PAD REQUEST LOCKING CONSTRAINTS
-- This enforces the 2-hour global lock rule at the database level
-- Run this in your Supabase SQL editor

-- 1. First, allow 'expired' status for auto-expiring old pending requests
ALTER TABLE PAD_requests DROP CONSTRAINT IF EXISTS pad_requests_status_check;
ALTER TABLE PAD_requests ADD CONSTRAINT pad_requests_status_check 
    CHECK (status IN ('pending', 'accepted', 'rejected', 'expired'));

-- 2. Add index for efficient pending request lookups
CREATE INDEX IF NOT EXISTS idx_pad_requests_client_status_created 
    ON PAD_requests(client_id, status, created_at DESC) 
    WHERE status = 'pending';

-- 3. Create function to enforce global 2-hour lock rule
CREATE OR REPLACE FUNCTION check_pad_request_limit()
RETURNS TRIGGER AS $$
DECLARE
    existing_count INTEGER;
    last_pending_time TIMESTAMPTZ;
BEGIN
    -- Only check on INSERT of new pending requests
    IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
        
        -- Check if client has any pending request in last 2 hours
        SELECT COUNT(*), MAX(created_at)
        INTO existing_count, last_pending_time
        FROM PAD_requests 
        WHERE client_id = NEW.client_id 
          AND status = 'pending'
          AND created_at > NOW() - INTERVAL '2 hours';
        
        -- If there's already a pending request within 2 hours, block the insert
        IF existing_count > 0 THEN
            RAISE EXCEPTION 'PAD_LOCKED:Client already has a pending PAD request. Please wait % minutes or until lab responds.',
                CEIL(EXTRACT(EPOCH FROM (last_pending_time + INTERVAL '2 hours' - NOW())) / 60)
                USING ERRCODE = '23514'; -- CHECK_VIOLATION
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to enforce the constraint
DROP TRIGGER IF EXISTS enforce_pad_request_limit ON PAD_requests;
CREATE TRIGGER enforce_pad_request_limit
    BEFORE INSERT ON PAD_requests
    FOR EACH ROW
    EXECUTE FUNCTION check_pad_request_limit();

-- 5. Create function to auto-expire old pending requests (cleanup)
CREATE OR REPLACE FUNCTION expire_old_pad_requests()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Mark pending requests older than 2 hours as expired
    UPDATE PAD_requests 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' 
      AND created_at < NOW() - INTERVAL '2 hours';
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Create a view to easily check active locks per client
CREATE OR REPLACE VIEW active_pad_locks AS
SELECT 
    client_id,
    laboratory_id,
    id as request_id,
    created_at,
    created_at + INTERVAL '2 hours' as expires_at,
    GREATEST(0, EXTRACT(EPOCH FROM (created_at + INTERVAL '2 hours' - NOW())) / 60)::INTEGER as minutes_remaining
FROM PAD_requests
WHERE status = 'pending' 
  AND created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION expire_old_pad_requests() TO authenticated;
GRANT SELECT ON active_pad_locks TO authenticated;

-- Test the constraint (optional - you can run this to verify)
-- This should show current active locks:
-- SELECT * FROM active_pad_locks;

-- This can be used to manually clean up expired requests:
-- SELECT expire_old_pad_requests();

SELECT 'PAD locking constraints added successfully!' as status;
