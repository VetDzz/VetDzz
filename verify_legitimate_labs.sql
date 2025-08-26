-- Script to manually verify legitimate laboratories
-- Replace the email/laboratory names with the actual ones you want to verify

-- Method 1: Verify by email
-- UPDATE laboratory_profiles 
-- SET is_verified = true 
-- WHERE email = 'legitimate_lab@example.com';

-- Method 2: Verify by laboratory name
-- UPDATE laboratory_profiles 
-- SET is_verified = true 
-- WHERE laboratory_name = 'Your Legitimate Lab Name';

-- Method 3: Verify by user_id (if you know it)
-- UPDATE laboratory_profiles 
-- SET is_verified = true 
-- WHERE user_id = 'user-uuid-here';

-- Method 4: List all laboratories to see which ones to verify
SELECT 
  id,
  user_id,
  laboratory_name,
  lab_name,
  email,
  phone,
  address,
  city,
  is_verified,
  created_at
FROM laboratory_profiles 
ORDER BY created_at DESC;

-- After you identify the legitimate ones, use this template:
-- UPDATE laboratory_profiles 
-- SET is_verified = true 
-- WHERE laboratory_name = 'REPLACE_WITH_ACTUAL_NAME';

-- To verify multiple labs at once by name:
-- UPDATE laboratory_profiles 
-- SET is_verified = true 
-- WHERE laboratory_name IN (
--   'Lab Name 1',
--   'Lab Name 2', 
--   'Lab Name 3'
-- );

-- Check results after verification
-- SELECT 
--   'Verification Results:' as status,
--   COUNT(*) as total_labs,
--   COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_labs,
--   COUNT(CASE WHEN is_verified = false THEN 1 END) as unverified_labs
-- FROM laboratory_profiles;
