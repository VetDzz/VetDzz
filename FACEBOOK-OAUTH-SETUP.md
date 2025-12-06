# Facebook OAuth Setup Guide for VetDZ

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Consumer" as the app type
4. Enter app name: "VetDZ" (or your preferred name)
5. Enter contact email
6. Click "Create App"

## Step 2: Configure Facebook Login

1. In your app dashboard, find "Facebook Login" and click "Set Up"
2. Select "Web" as the platform
3. Enter your site URL: `https://vetdzz-2.onrender.com`
4. Click "Save" → "Continue"

## Step 3: Get App Credentials

1. Go to Settings → Basic
2. Copy your **App ID**
3. Copy your **App Secret** (click "Show" to reveal)

## Step 4: Configure Valid OAuth Redirect URIs

1. Go to Facebook Login → Settings
2. In "Valid OAuth Redirect URIs", add:
   ```
   https://iqranmwwmwmwswtgantj.supabase.co/auth/v1/callback
   ```
3. Click "Save Changes"

## Step 5: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Authentication → Providers
4. Find "Facebook" and enable it
5. Enter:
   - **Facebook Client ID**: Your App ID from Step 3
   - **Facebook Secret**: Your App Secret from Step 3
6. Click "Save"

## Step 6: Make App Live (Required for Production)

1. In Facebook Developers, go to your app
2. At the top, toggle "App Mode" from "Development" to "Live"
3. You may need to:
   - Add a Privacy Policy URL
   - Add Terms of Service URL
   - Complete Data Use Checkup

## Privacy Policy & Terms URLs

Use these URLs for your Facebook app:
- Privacy Policy: `https://vetdzz-2.onrender.com/#/privacy-policy`
- Terms of Service: `https://vetdzz-2.onrender.com/#/privacy-policy`

## Testing

1. After setup, go to your VetDZ site
2. Click the Facebook login button
3. You should be redirected to Facebook to authorize
4. After authorization, you'll be redirected back to VetDZ

## Troubleshooting

### "App Not Setup" Error
- Make sure your app is in "Live" mode
- Verify the redirect URI is correct in Facebook settings

### "Invalid Redirect URI" Error
- Double-check the Supabase callback URL is added to Facebook's Valid OAuth Redirect URIs
- The URL must match exactly: `https://iqranmwwmwmwswtgantj.supabase.co/auth/v1/callback`

### User Can't Login
- Make sure the user's email is verified on Facebook
- Check that Facebook Login product is properly configured

## Required Facebook Permissions

The default permissions requested are:
- `email` - To get user's email address
- `public_profile` - To get user's name and profile picture

These are automatically requested by Supabase.
