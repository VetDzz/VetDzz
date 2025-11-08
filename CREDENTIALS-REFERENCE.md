# VetDz - Supabase Credentials Reference

## ✅ Credentials Configured

Your `.env` file has been updated with your Supabase credentials.

### Project Details:
- **Project URL**: https://plwfbeqtupboeerqiplw.supabase.co
- **Project Ref**: plwfbeqtupboeerqiplw

### API Keys:

#### Anon Key (Public - Safe for Frontend):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsd2ZiZXF0dXBib2VlcnFpcGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDQzNzksImV4cCI6MjA3ODE4MDM3OX0.2wmux6ErWdE0er8zgb8p-YdR4OfbwBz4yPP0B3yEKjc
```

#### Service Role Key (Secret - Server Only):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsd2ZiZXF0dXBib2VlcnFpcGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYwNDM3OSwiZXhwIjoyMDc4MTgwMzc5fQ.xK6NlOt-QRD-wMgImHtbRbZM0x07RNO6dYbHM4oJEy8
```

⚠️ **IMPORTANT**: Never expose the Service Role Key in your frontend code!

## Next Steps:

### 1. Run the SQL Setup
1. Go to: https://plwfbeqtupboeerqiplw.supabase.co
2. Click "SQL Editor" in the sidebar
3. Open `VETDZ-COMPLETE-SETUP.sql`
4. Copy all content and paste into SQL Editor
5. Click "Run"
6. Wait for: "VetDz database setup completed successfully!"

### 2. Test the Application
The dev server is running at: **http://localhost:8080/**

Try:
- ✅ Register as a pet owner
- ✅ Register as a veterinarian
- ✅ Login with your account
- ✅ Test the features

### 3. Verify Database
After running the SQL, check in Supabase:
- **Table Editor** - Should see 8 tables
- **Storage** - Should see 5 buckets
- **Database** → **Functions** - Should see 5 admin functions

## Troubleshooting

### Can't connect to Supabase?
- Check if the URL is correct in `.env`
- Restart the dev server: `npm run dev`
- Check Supabase project is active

### SQL errors?
- Make sure you're in the correct project
- Run the entire `VETDZ-COMPLETE-SETUP.sql` file
- Check for any error messages in Supabase

### Authentication not working?
- Verify the anon key is correct
- Check Supabase Auth settings
- Enable email authentication in Supabase dashboard

## Admin Access

To access admin features:
1. Create an account with email: `vetdz@gmail.com`
2. Navigate to: http://localhost:8080/admin
3. You'll have full admin privileges

## Support

- Check `SQL-SETUP-INSTRUCTIONS.md` for SQL setup
- Check `SETUP-GUIDE.md` for complete setup
- Check `FIXES-APPLIED.md` for recent fixes
