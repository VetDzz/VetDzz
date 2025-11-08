# VetDz Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Git

## Step 1: Database Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 1.2 Run SQL Setup
1. Open Supabase SQL Editor
2. Copy and paste the contents of `complete-database-setup.sql`
3. Execute the script
4. Copy and paste the contents of `setup-storage-buckets.sql`
5. Execute the script

### 1.3 Configure Storage
1. Go to Storage in Supabase dashboard
2. Verify these buckets were created:
   - `medical-results`
   - `avatars`
   - `vet-certificates`
   - `pet-photos`
   - `documents`

## Step 2: Environment Configuration

### 2.1 Create .env file
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace with your actual Supabase credentials.

### 2.2 Update Admin Email (Optional)
If you want to change the admin email from `vetdz@gmail.com`:
1. Open `complete-database-setup.sql`
2. Find all occurrences of `vetdz@gmail.com`
3. Replace with your admin email
4. Re-run the SQL script in Supabase

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Run Development Server

```bash
npm run dev
```

The application should now be running at `http://localhost:5173`

## Step 5: Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Step 6: Deploy

### Option 1: Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Option 2: Netlify
1. Push code to GitHub
2. Import project in Netlify
3. Add environment variables
4. Deploy

## Features Overview

### For Pet Owners (Clients):
- Register and create profile
- Add pet information
- Find nearby veterinarians
- Request home visits
- View medical records
- Track appointments

### For Veterinarians:
- Register clinic profile
- Manage appointments
- Upload medical results
- Accept/reject home visit requests
- Manage client communications

### For Admins:
- User management
- Ban/unban users
- Delete users
- View statistics
- Monitor PAD requests

## Admin Access

To access admin panel:
1. Create an account with email: `vetdz@gmail.com`
2. Navigate to `/admin`
3. You'll have full admin privileges

## Database Schema

### Main Tables:
- `client_profiles` - Pet owner information
- `vet_profiles` - Veterinarian/clinic information
- `PAD_requests` - Home visit requests (includes pet info)
- `medical_results` - Veterinary test results
- `notifications` - User notifications
- `file_uploads` - File management
- `banned_users` - User ban management
- `deleted_users` - Deleted user backup

### Key Fields in PAD_requests:
- `pet_name` - Name of the pet
- `pet_species` - Type of animal (dog, cat, etc.)
- `pet_breed` - Breed information
- `requested_tests` - Array of requested services

## Color Scheme

The platform uses a dark blue color scheme:
- Primary: `#1E3A8A` (Dark Blue)
- Secondary: `#2563EB` (Blue)
- Dark: `#0F172A` (Slate)
- Light: `#EFF6FF` (Blue Tint)
- Accent: `#3B82F6` (Sky Blue)
- Muted: `#DBEAFE` (Light Blue)

## Troubleshooting

### Database Connection Issues
- Verify Supabase URL and anon key in `.env`
- Check if Supabase project is active
- Verify RLS policies are enabled

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm run build -- --force`

### Authentication Issues
- Check Supabase Auth settings
- Verify email templates are configured
- Check redirect URLs in Supabase dashboard

## Support

For issues or questions:
- Email: support@vetdz.com
- Check VETDZ-CHANGES.md for detailed change log

## License

This project is proprietary software for VetDz.
