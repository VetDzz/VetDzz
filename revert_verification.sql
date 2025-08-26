-- Revert verification changes - show all laboratories regardless of verification status

-- Set all laboratories back to verified so they show up in search
UPDATE laboratory_profiles SET is_verified = true;

-- Restore the auto-verification trigger for new registrations
CREATE OR REPLACE FUNCTION auto_verify_laboratory()
RETURNS TRIGGER AS $$
BEGIN
    NEW.is_verified = true;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS auto_verify_laboratory_trigger ON laboratory_profiles;
CREATE TRIGGER auto_verify_laboratory_trigger
    BEFORE INSERT ON laboratory_profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_verify_laboratory();

-- Set default back to true for new laboratories
ALTER TABLE laboratory_profiles ALTER COLUMN is_verified SET DEFAULT TRUE;

-- Show results
SELECT 'Verification revert complete - all labs will now show!' as status;
SELECT 
  'Total laboratories:' as description, 
  COUNT(*) as count, 
  COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count,
  COUNT(CASE WHEN is_verified = false THEN 1 END) as unverified_count
FROM laboratory_profiles;
