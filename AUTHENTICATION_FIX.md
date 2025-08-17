# Authentication Issue Fix

## Problem
Laboratory accounts are created in the database but users can't login because:
1. Supabase requires email verification by default
2. Users try to login before verifying email
3. Login fails even though profile exists in database

## Solution Options

### Option 1: Disable Email Verification (Quick Fix for Development)
Go to your Supabase Dashboard:
1. Go to Authentication → Settings
2. Find "Enable email confirmations" 
3. **Turn it OFF** for development
4. This allows immediate login without email verification

### Option 2: Proper Email Verification Flow (Production Ready)
The code is already updated to handle this:
1. User creates account → gets verification email
2. User clicks verification link in email
3. User is redirected to `/auth/callback`
4. User can now login normally

## Current Status
- ✅ Location form with Google Map works
- ✅ Additional lab info (opening hours, phone, etc.) is saved
- ✅ Account creation works
- ✅ Profile is created in database
- ❌ Login fails due to email verification requirement

## Quick Test
1. Create laboratory account
2. Check your email for verification link
3. Click the verification link
4. Try to login again

## Recommended Action
For development: **Disable email verification** in Supabase Dashboard
For production: Keep email verification enabled
