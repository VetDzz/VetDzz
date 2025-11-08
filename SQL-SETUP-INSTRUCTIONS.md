# VetDz SQL Setup - Simple Instructions

## You Only Need ONE File! 🎯

**File**: `VETDZ-COMPLETE-SETUP.sql`

This single file contains EVERYTHING:
- ✅ All database tables
- ✅ Storage buckets for files
- ✅ Security policies
- ✅ Admin functions
- ✅ Triggers and indexes

## How to Run (3 Easy Steps)

### Step 1: Open Supabase
1. Go to [supabase.com](https://supabase.com)
2. Open your VetDz project
3. Click on "SQL Editor" in the left sidebar

### Step 2: Copy & Paste
1. Open the file `VETDZ-COMPLETE-SETUP.sql`
2. Select ALL the content (Ctrl+A)
3. Copy it (Ctrl+C)
4. Paste it into the Supabase SQL Editor (Ctrl+V)

### Step 3: Run
1. Click the "Run" button (or press Ctrl+Enter)
2. Wait 10-30 seconds
3. You should see: "VetDz database setup completed successfully!"

## That's It! ✅

Your database is now ready with:

### Tables Created:
- `client_profiles` - Pet owners
- `vet_profiles` - Veterinarians
- `PAD_requests` - Home visit requests (with pet info)
- `medical_results` - Test results and medical records
- `notifications` - User notifications
- `file_uploads` - File management
- `banned_users` - User ban management
- `deleted_users` - Deleted user backups

### Storage Buckets Created:
- `medical-results` - Medical documents (10MB limit)
- `avatars` - Profile pictures (2MB limit)
- `vet-certificates` - Vet credentials (10MB limit)
- `pet-photos` - Pet photos (5MB limit)
- `documents` - General documents (10MB limit)

### Admin Functions Available:
- `admin_delete_user()` - Delete a user completely
- `admin_ban_user()` - Ban a user temporarily
- `admin_unban_user()` - Unban a user
- `is_user_banned()` - Check if user is banned
- `get_ban_info()` - Get ban details

## Admin Email
Default admin email: `vetdz@gmail.com`

To change it, search for `vetdz@gmail.com` in the SQL file and replace with your email.

## What About the Other SQL Files?

You can **IGNORE** all other SQL files! They are:
- Old versions
- Partial setups
- Fix scripts for specific issues

The `VETDZ-COMPLETE-SETUP.sql` file is the ONLY one you need.

## Troubleshooting

### Error: "relation already exists"
This is normal if you're running it again. The script handles this automatically.

### Error: "permission denied"
Make sure you're running this in your Supabase project's SQL Editor, not locally.

### Storage buckets not created
Storage bucket creation might fail if you don't have permissions. You can create them manually:
1. Go to Storage in Supabase dashboard
2. Click "New bucket"
3. Create each bucket with the names listed above

## Next Steps

After running the SQL:
1. Update your `.env` file with Supabase credentials
2. Run `npm run dev` to start the app
3. Test registration and login
4. Upload some test data

## Need Help?

Check these files:
- `SETUP-GUIDE.md` - Complete setup guide
- `VETDZ-CHANGES.md` - What changed from SihaaExpress
- `FIXES-APPLIED.md` - Recent fixes applied
