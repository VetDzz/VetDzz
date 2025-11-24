# Enable OAuth Authentication - Quick Start

## ⚡ Quick Summary
Your OAuth buttons are already implemented and ready to use! You just need to configure the providers in Supabase (takes 10 minutes).

## 🎯 What's Already Done
✅ Google and Facebook icon buttons added to login/signup
✅ Icon-only design (no text, just like your reference image)
✅ OAuth callback handler implemented
✅ Automatic profile creation for OAuth users
✅ Works on both web and Android

## 🚀 Enable OAuth in 3 Steps

### Step 1: Configure Google OAuth (5 minutes)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a Project** (if you don't have one)
   - Click "Select a project" → "New Project"
   - Name: "VetDz"
   - Click "Create"

3. **Enable Google Identity**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Identity"
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: External
     - App name: VetDz
     - User support email: your email
     - Developer contact: your email
     - Save and continue through all steps
   
   - Back to "Create OAuth client ID":
     - Application type: **Web application**
     - Name: **VetDz Web**
     
     - Authorized JavaScript origins:
       ```
       http://localhost:5173
       https://vetdz.com
       ```
     
     - Authorized redirect URIs:
       ```
       https://plwfbeqtupboeerqiplw.supabase.co/auth/v1/callback
       http://localhost:5173/auth/callback
       https://vetdz.com/auth/callback
       ```
   
   - Click "Create"
   - **COPY** the Client ID and Client Secret (you'll need these!)

5. **Configure in Supabase**
   - Go to: https://supabase.com/dashboard/project/plwfbeqtupboeerqiplw/auth/providers
   - Find "Google" in the list
   - Toggle it ON
   - Paste your **Client ID**
   - Paste your **Client Secret**
   - Click "Save"

### Step 2: Configure Facebook OAuth (5 minutes)

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/
   - Sign in with your Facebook account

2. **Create an App**
   - Click "Create App"
   - Choose "Consumer" as app type
   - Click "Next"
   - App name: **VetDz**
   - App contact email: your email
   - Click "Create App"

3. **Add Facebook Login**
   - In your app dashboard, find "Add Products"
   - Find "Facebook Login" → Click "Set Up"
   - Choose "Web" platform
   - Site URL: `https://vetdz.com`
   - Click "Save" → "Continue"

4. **Configure OAuth Settings**
   - In left sidebar: "Facebook Login" → "Settings"
   - Valid OAuth Redirect URIs:
     ```
     https://plwfbeqtupboeerqiplw.supabase.co/auth/v1/callback
     http://localhost:5173/auth/callback
     https://vetdz.com/auth/callback
     ```
   - Enable "Client OAuth Login": YES
   - Enable "Web OAuth Login": YES
   - Click "Save Changes"

5. **Get App Credentials**
   - In left sidebar: "Settings" → "Basic"
   - Copy your **App ID**
   - Click "Show" next to App Secret
   - Copy your **App Secret**

6. **Make App Live**
   - At the top, toggle from "Development" to "Live"
   - Confirm the switch

7. **Configure in Supabase**
   - Go to: https://supabase.com/dashboard/project/plwfbeqtupboeerqiplw/auth/providers
   - Find "Facebook" in the list
   - Toggle it ON
   - Paste your **App ID** (as Client ID)
   - Paste your **App Secret** (as Client Secret)
   - Click "Save"

### Step 3: Test It! (2 minutes)

1. **Start your dev server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   - Go to: http://localhost:5173/#login

3. **Test Google Login**
   - Click the blue Google button (with G icon)
   - Select your Google account
   - Should redirect back and log you in
   - Check you're logged in (look for user menu)

4. **Test Facebook Login**
   - Log out first
   - Click the blue Facebook button (with f icon)
   - Log in with Facebook
   - Should redirect back and log you in

## ✅ Success Checklist

After completing the steps above, verify:

- [ ] Google button appears on login page
- [ ] Facebook button appears on signup page (client tab)
- [ ] Clicking Google opens OAuth popup
- [ ] Clicking Facebook opens OAuth popup
- [ ] After OAuth, you're redirected to home page
- [ ] You're logged in (can see user menu)
- [ ] Your profile exists in database (check Supabase)

## 🔍 Verify in Database

1. Go to Supabase Dashboard
2. Navigate to: Table Editor → client_profiles
3. You should see your OAuth user with:
   - `user_id` (from auth.users)
   - `full_name` (from Google/Facebook)
   - `email` (from Google/Facebook)
   - `is_verified` = true

## 🐛 Troubleshooting

### "Error: Invalid OAuth credentials"
- Double-check Client ID and Secret in Supabase
- Make sure you copied them correctly (no extra spaces)
- Verify the provider is enabled (toggle is ON)

### "Redirect URI mismatch"
- Check the redirect URIs in Google/Facebook match exactly
- Must include: `https://plwfbeqtupboeerqiplw.supabase.co/auth/v1/callback`
- No trailing slashes

### Buttons don't appear
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors

### OAuth popup blocked
- Allow popups for localhost in browser settings
- Try in incognito mode
- Check browser extensions aren't blocking

### Profile not created
- Check Supabase logs (Dashboard → Logs)
- Verify client_profiles table exists
- Check RLS policies allow inserts

## 📱 Android Testing

Once web OAuth works:

1. Build the Android APK:
   ```powershell
   .\BUILD-ANDROID-APP.ps1
   ```

2. Install on your device

3. OAuth should work in the WebView automatically!

## 🎨 What Users Will See

### Login Page
```
┌─────────────────────────┐
│   [Google Icon]         │ ← Blue button, white G
├─────────────────────────┤
│   [Facebook Icon]       │ ← Blue button, white f
├─────────────────────────┤
│      ─── Ou ───         │
├─────────────────────────┤
│   Email: [_______]      │
│   Password: [_____]     │
│   [Se connecter]        │
└─────────────────────────┘
```

## 📚 Additional Resources

- **Full OAuth Setup Guide:** `OAUTH-SETUP-GUIDE.md`
- **Visual Guide:** `OAUTH-VISUAL-GUIDE.md`
- **Implementation Details:** `OAUTH-BUTTONS-UPDATED.md`

## 🎉 That's It!

Once you complete these 3 steps, your users can:
- Sign up with Google (1 click)
- Sign up with Facebook (1 click)
- Or use traditional email/password

All OAuth users are automatically created as "client" type with verified profiles.

## 💡 Pro Tips

1. **Test in incognito** - Easier to test multiple accounts
2. **Use test accounts** - Don't use your main Google/Facebook
3. **Check Supabase logs** - Great for debugging
4. **Start with Google** - Usually easier to set up
5. **Facebook takes longer** - App review process can be slow

## 🆘 Need Help?

If you get stuck:
1. Check the error message in browser console
2. Look at Supabase logs (Dashboard → Logs)
3. Verify all redirect URIs match exactly
4. Make sure providers are enabled in Supabase
5. Try in incognito mode to rule out cache issues

## 🚀 Next Steps

After OAuth is working:
1. Deploy to production
2. Update redirect URIs with production URL
3. Test on production site
4. Build and test Android app
5. Celebrate! 🎉
