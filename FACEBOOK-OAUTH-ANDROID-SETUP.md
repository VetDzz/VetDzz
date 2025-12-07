# Facebook OAuth Setup for Android App

## What Was Implemented

### 1. **Facebook OAuth Buttons**
- Added Facebook login/signup buttons alongside Google OAuth
- Side-by-side icon layout for clean UI
- Separate intent tracking for login vs signup

### 2. **Deep Linking Configuration**
- **App ID**: `dz.vet.vetdz`
- **Deep Link Scheme**: `dz.vet.vetdz://auth/callback`
- Configured in `capacitor.config.ts` and `AndroidManifest.xml`

### 3. **OAuth Flow Logic**
- **Login Intent**: If user tries to login but has no account → Shows "Account not found" message
- **Signup Intent**: If user signs up → Redirects to profile completion page
- **Existing User**: Logs in and redirects based on user type

### 4. **Navigation Rules**
- **Client users** → Navigate to `/find-laboratory` (find vet)
- **Vet users** → Navigate to `/vet-dashboard` (find client)

## Supabase Configuration Required

### In Supabase Dashboard:

1. Go to **Authentication** → **Providers** → **Facebook**
2. Enable Facebook provider
3. Enter your Facebook App credentials:
   - **Facebook App ID**: `1731216847834446`
   - **Facebook App Secret**: `7af9fc3ff7dd8ec3d7444be0085e747b`
4. **Scopes**: Set to `public_profile` (NOT `email` - that's invalid!)
5. **Redirect URLs**: Add these URLs:
   ```
   dz.vet.vetdz://auth/callback
   https://plwfbeqtupboeerqiplw.supabase.co/auth/v1/callback
   ```

### In Facebook Developers Console:

1. Go to https://developers.facebook.com/apps/1731216847834446/
2. **Use Cases** → **Authentication and account creation** → **Customize**
3. Click **"+ Add"** next to the `email` permission
4. Add **OAuth Redirect URIs**:
   ```
   dz.vet.vetdz://auth/callback
   https://plwfbeqtupboeerqiplw.supabase.co/auth/v1/callback
   ```
5. Save changes

## How It Works

### For Android App:

1. User clicks Facebook button (login or signup)
2. `localStorage.setItem('oauthIntent', 'login')` or `'signup'`
3. Opens Facebook OAuth with redirect: `dz.vet.vetdz://auth/callback`
4. After Facebook auth, deep link opens the app
5. `App.tsx` listens for deep link and navigates to `/auth/callback`
6. `AuthCallback.tsx` checks:
   - If profile exists → Login successful
   - If no profile + login intent → "Account not found"
   - If no profile + signup intent → Complete profile setup
7. Redirects based on user type:
   - Client → Find Vet page
   - Vet → Find Client page

### Deep Link Handling:

The app uses Capacitor's App plugin to listen for deep links:
```typescript
CapacitorApp.addListener('appUrlOpen', (data) => {
  // Handles: dz.vet.vetdz://auth/callback#access_token=...
  navigate('/auth/callback' + hash);
});
```

## Testing

1. Build the Android app: `npm run build:android`
2. Install on device/emulator
3. Try Facebook login/signup
4. Verify deep link returns to app (not browser)
5. Check navigation goes to correct page based on user type

## Important Notes

- **Facebook Scope**: Use `public_profile` only (email is included automatically)
- **Deep Link**: Must match exactly in Supabase, Facebook, and AndroidManifest.xml
- **Navigation**: Client finds vets, Vet finds clients (opposite of what you might expect!)
- **Intent Tracking**: Uses localStorage to differentiate login vs signup attempts

## Files Modified

1. `capacitor.config.ts` - Deep link configuration
2. `android/app/src/main/AndroidManifest.xml` - Intent filter for deep links
3. `Android Version/src/components/AuthSection.tsx` - Facebook OAuth buttons
4. `Android Version/src/pages/AuthCallback.tsx` - OAuth callback handling
5. `Android Version/src/App.tsx` - Deep link listener

## Troubleshooting

**If OAuth redirects to browser instead of app:**
- Check AndroidManifest.xml has correct intent filter
- Verify deep link scheme matches in all configs
- Rebuild the Android app after changes

**If "Account not found" appears incorrectly:**
- Check if profile exists in `client_profiles` or `vet_profiles` tables
- Verify `oauthIntent` is being set correctly in localStorage

**If navigation goes to wrong page:**
- Check user type in database (`client_profiles` vs `vet_profiles`)
- Verify navigation logic in `AuthCallback.tsx`
