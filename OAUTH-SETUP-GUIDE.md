# OAuth Setup Guide for VetDz

## Overview
This guide explains how to set up Google (Gmail) and Facebook OAuth authentication for client users in VetDz. OAuth buttons appear as icon-only buttons (no text) for both login and signup.

## Important Notes
- OAuth is **ONLY available for CLIENT users** (not for veterinarians)
- OAuth users are automatically created as clients
- The normal email/password signup remains available below the OAuth buttons
- OAuth works on both web and Android app

## Supabase OAuth Configuration

### 1. Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click "Enable"

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "VetDz Web"
   - Authorized JavaScript origins:
     ```
     https://vetdz.com
     http://localhost:5173
     ```
   - Authorized redirect URIs:
     ```
     https://plwfbeqtupboeerqiplw.supabase.co/auth/v1/callback
     https://vetdz.com/auth/callback
     http://localhost:5173/auth/callback
     ```
   - Click "Create"
   - Copy the **Client ID** and **Client Secret**

4. **Create Android OAuth Credentials** (for Android app)
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Android"
   - Name: "VetDz Android"
   - Package name: `dz.vet.vetdz`
   - SHA-1 certificate fingerprint: (get from your keystore)
   - Click "Create"

5. **Configure in Supabase**
   - Go to your Supabase Dashboard: https://supabase.com/dashboard/project/plwfbeqtupboeerqiplw
   - Navigate to: Authentication > Providers > Google
   - Enable Google provider
   - Paste your Client ID and Client Secret (from Web credentials)
   - Save

### 2. Facebook OAuth Setup

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/
   - Create a new app or select existing one
   - Choose "Consumer" as app type

2. **Add Facebook Login Product**
   - In your app dashboard, click "Add Product"
   - Find "Facebook Login" and click "Set Up"

3. **Configure OAuth Settings**
   - Go to Facebook Login > Settings
   - Add Valid OAuth Redirect URIs:
     ```
     https://plwfbeqtupboeerqiplw.supabase.co/auth/v1/callback
     https://vetdz.com/auth/callback
     http://localhost:5173/auth/callback
     ```
   - Enable "Client OAuth Login"
   - Enable "Web OAuth Login"
   - Save changes

4. **Configure for Android**
   - Go to Settings > Basic
   - Click "Add Platform" > "Android"
   - Package Name: `dz.vet.vetdz`
   - Class Name: `dz.vet.vetdz.MainActivity`
   - Key Hashes: (generate from your keystore)
   - Save

5. **Get App Credentials**
   - Go to Settings > Basic
   - Copy your **App ID** and **App Secret**
   - Make sure app is in "Live" mode (not Development)

6. **Configure in Supabase**
   - Go to your Supabase Dashboard: https://supabase.com/dashboard/project/plwfbeqtupboeerqiplw
   - Navigate to: Authentication > Providers > Facebook
   - Enable Facebook provider
   - Paste your App ID and App Secret
   - Save

## Environment Variables

Add these to your `.env` file (optional, Supabase handles this):

```env
# Already configured in Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Testing OAuth

### Web Testing

1. **Test Google Login**
   - Go to http://localhost:5173/#login or your deployed site
   - Click the blue Google icon button (no text)
   - Select your Google account
   - Should redirect to home page with authentication

2. **Test Facebook Login**
   - Go to http://localhost:5173/#login or your deployed site
   - Click the blue Facebook icon button (no text)
   - Log in with Facebook
   - Should redirect to home page with authentication

### Android Testing

1. **Build and install the APK**
   - Follow instructions in `HOW-TO-BUILD-ANDROID-APP.md`
   - Install on your device

2. **Test OAuth in WebView**
   - Open the app
   - Navigate to login/signup
   - Click Google or Facebook button
   - Complete OAuth flow in WebView
   - Should return to app authenticated

## User Profile Creation

OAuth users automatically get:
- A `client_profiles` entry created
- `full_name` from their OAuth provider
- `email` from their OAuth account
- `is_verified` set to `true`
- User type set to `client`

## Database Schema

The `users` table should have:
- `phone` column (text, nullable)
- OAuth users will have `email` from their provider
- `provider` column to track auth method (google, facebook, email)

## Troubleshooting

### Google OAuth Issues
- Ensure redirect URI matches exactly (including https://)
- Check that Google+ API is enabled
- Verify Client ID and Secret are correct

### Facebook OAuth Issues
- Ensure app is in "Live" mode (not Development)
- Check redirect URI is added to Valid OAuth Redirect URIs
- Verify App ID and Secret are correct

### Phone Number Not Saving
- Check database permissions (RLS policies)
- Ensure `phone` column exists in `users` table
- Check browser console for errors

## Security Notes

- OAuth tokens are managed by Supabase
- Never expose Client Secrets in frontend code
- Phone numbers are optional but recommended
- All auth data is encrypted by Supabase
