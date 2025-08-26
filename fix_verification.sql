-- Fix laboratory auto-verification issue
-- This removes the trigger that auto-verifies all laboratories
-- and sets the default to unverified

-- Remove the auto-verification trigger
DROP TRIGGER IF EXISTS auto_verify_laboratory_trigger ON laboratory_profiles;

-- Remove the auto-verification function
DROP FUNCTION IF EXISTS auto_verify_laboratory();

-- Update default to false for new laboratories
ALTER TABLE laboratory_profiles ALTER COLUMN is_verified SET DEFAULT FALSE;

-- Set all existing laboratories to unverified
-- (You can manually verify the legitimate ones later)
UPDATE laboratory_profiles SET is_verified = FALSE;

-- Show results
SELECT 'Laboratory verification fix complete!' as status;
SELECT 
  'Total laboratories:' as description, 
  COUNT(*) as count, 
  COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count,
  COUNT(CASE WHEN is_verified = false THEN 1 END) as unverified_count
FROM laboratory_profiles;
