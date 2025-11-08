# VetDz - Storage Buckets Setup Guide

## Quick Answer: Bucket Names

You need to create these 5 buckets in Supabase:

1. **medical-results** (10MB limit)
2. **avatars** (2MB limit)
3. **vet-certificates** (10MB limit)
4. **pet-photos** (5MB limit)
5. **documents** (10MB limit)

## How to Create Buckets in Supabase

### Method 1: Using SQL (Easiest - Already Done!)

If you ran the `VETDZ-COMPLETE-SETUP.sql` file, the buckets are **already created**! ✅

The SQL file includes this section that creates all buckets automatically.

### Method 2: Manual Creation (If SQL didn't work)

1. **Go to Supabase Dashboard**
   - Open: https://plwfbeqtupboeerqiplw.supabase.co
   - Click "Storage" in the left sidebar

2. **Create Each Bucket**
   
   Click "New bucket" button and create these:

   **Bucket 1: medical-results**
   - Name: `medical-results`
   - Public: ✅ Yes
   - File size limit: 10 MB (10485760 bytes)
   - Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`, `image/jpg`

   **Bucket 2: avatars**
   - Name: `avatars`
   - Public: ✅ Yes
   - File size limit: 2 MB (2097152 bytes)
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/jpg`

   **Bucket 3: vet-certificates**
   - Name: `vet-certificates`
   - Public: ✅ Yes
   - File size limit: 10 MB (10485760 bytes)
   - Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`

   **Bucket 4: pet-photos**
   - Name: `pet-photos`
   - Public: ✅ Yes
   - File size limit: 5 MB (5242880 bytes)
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/jpg`

   **Bucket 5: documents**
   - Name: `documents`
   - Public: ✅ Yes
   - File size limit: 10 MB (10485760 bytes)
   - Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`, `image/jpg`

## What Each Bucket Is For:

- **medical-results**: Veterinary test results, medical reports (PDF/images)
- **avatars**: User profile pictures (clients and vets)
- **vet-certificates**: Veterinarian licenses, diplomas, certifications
- **pet-photos**: Photos of pets uploaded by clients
- **documents**: General documents (contracts, forms, etc.)

## Verify Buckets Were Created

1. Go to Storage in Supabase
2. You should see 5 buckets listed
3. Click on each to verify they exist

## If Buckets Are Missing

If the SQL didn't create them automatically:

1. Go to Storage → Click "New bucket"
2. Enter the bucket name exactly as shown above
3. Check "Public bucket"
4. Set the file size limit
5. Click "Create bucket"
6. Repeat for all 5 buckets

## Storage Policies

The SQL file also creates policies for each bucket that:
- Allow public read access (anyone can view files)
- Allow authenticated users to upload
- Allow users to update/delete only their own files

These policies are already set if you ran the SQL file!

## Testing Storage

After creating buckets, test by:
1. Register as a vet
2. Try uploading a result to a client
3. Check if the file appears in the `medical-results` bucket

## Troubleshooting

**Error: "Bucket not found"**
- Create the bucket manually in Supabase Storage
- Make sure the name matches exactly (lowercase, with hyphens)

**Error: "Permission denied"**
- Run the storage policies section of the SQL file
- Or set bucket to "Public" in Supabase dashboard

**Files not uploading**
- Check file size limits
- Verify MIME types are allowed
- Check browser console for errors
