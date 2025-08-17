-- SIMPLE ADMIN USER CREATION SCRIPT
-- Run this in Supabase SQL Editor to create admin user

-- Step 1: Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client', 'laboratory')),
  phone TEXT,
  address TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Step 4: Create simple policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Step 5: Delete existing admin users if they exist
DELETE FROM public.profiles WHERE email = 'sihaaexpress@gmail.com';
DELETE FROM auth.users WHERE email = 'sihaaexpress@gmail.com';
DELETE FROM public.profiles WHERE email = 'glowyboy01@gmail.com';
DELETE FROM auth.users WHERE email = 'glowyboy01@gmail.com';

-- Step 6: Create admin user
DO $$
DECLARE
  new_admin_id UUID;
BEGIN
  -- Generate UUID
  new_admin_id := gen_random_uuid();
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_admin_id,
    'authenticated',
    'authenticated',
    'sihaaexpress@gmail.com',
    crypt('Sihaaexpress123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
  );
  
  -- Insert into profiles
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    new_admin_id,
    'sihaaexpress@gmail.com',
    'SihaaExpress Administrator',
    'admin',
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Admin user created successfully!';
  RAISE NOTICE 'Email: sihaaexpress@gmail.com';
  RAISE NOTICE 'Password: Sihaaexpress123';
END $$;

-- Step 7: Verify admin creation
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role,
  p.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'sihaaexpress@gmail.com';
