# OAuth Buttons - Visual Guide

## What You'll See

### Login Page
```
┌──────────────────────────────────────┐
│                                      │
│         Se connecter / S'inscrire    │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  [Se connecter] [S'inscrire]   │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │                                │ │
│  │    ┌──────────────────────┐   │ │
│  │    │        [G]           │   │ ← Google button (blue, white G icon)
│  │    └──────────────────────┘   │ │
│  │                                │ │
│  │    ┌──────────────────────┐   │ │
│  │    │        [f]           │   │ ← Facebook button (blue, white f icon)
│  │    └──────────────────────┘   │ │
│  │                                │ │
│  │    ────────── Ou ──────────   │ │
│  │                                │ │
│  │    Email: [____________]       │ │
│  │    Mot de passe: [______]     │ │
│  │                                │ │
│  │    [Se connecter]              │ │
│  │                                │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Signup Page (Client Tab)
```
┌──────────────────────────────────────┐
│                                      │
│         Créer un compte              │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ [Propriétaire] [Vétérinaire]   │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │                                │ │
│  │    ┌──────────────────────┐   │ │
│  │    │        [G]           │   │ ← Google button (blue, white G icon)
│  │    └──────────────────────┘   │ │
│  │                                │ │
│  │    ┌──────────────────────┐   │ │
│  │    │        [f]           │   │ ← Facebook button (blue, white f icon)
│  │    └──────────────────────┘   │ │
│  │                                │ │
│  │    ────────── Ou ──────────   │ │
│  │                                │ │
│  │    Prénom: [____________]      │ │
│  │    Nom: [____________]         │ │
│  │    Email: [____________]       │ │
│  │    Téléphone: [____________]   │ │
│  │    Mot de passe: [______]     │ │
│  │                                │ │
│  │    [Créer un compte]           │ │
│  │                                │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Signup Page (Vétérinaire Tab)
```
┌──────────────────────────────────────┐
│                                      │
│         Créer un compte              │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ [Propriétaire] [Vétérinaire]   │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │                                │ │
│  │    NO OAUTH BUTTONS HERE       │ ← Vets must use email/password
│  │                                │ │
│  │    Nom de la clinique: [____]  │ │
│  │    Email: [____________]       │ │
│  │    Téléphone: [____________]   │ │
│  │    Adresse: [____________]     │ │
│  │    Mot de passe: [______]     │ │
│  │                                │ │
│  │    [Créer un compte]           │ │
│  │                                │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

## Button Colors

### Google Button
- **Background:** `#4285F4` (Google Blue)
- **Hover:** `#357ae8` (Darker Blue)
- **Icon:** White Google "G" logo
- **Size:** Full width, 48px height
- **Border:** 2px solid #4285F4
- **Shadow:** Medium shadow

### Facebook Button
- **Background:** `#1877F2` (Facebook Blue)
- **Hover:** `#166FE5` (Darker Blue)
- **Icon:** White Facebook "f" logo
- **Size:** Full width, 48px height
- **Border:** 2px solid #1877F2
- **Shadow:** Medium shadow

## User Experience Flow

### 1. User Clicks Google Button
```
User on login page
    ↓
Clicks blue Google button (just icon, no text)
    ↓
Google OAuth popup opens
    ↓
User selects Google account
    ↓
Popup closes
    ↓
Redirected to /auth/callback
    ↓
Profile created automatically
    ↓
Redirected to home page
    ↓
User is logged in as CLIENT
```

### 2. User Clicks Facebook Button
```
User on login page
    ↓
Clicks blue Facebook button (just icon, no text)
    ↓
Facebook OAuth popup opens
    ↓
User logs in with Facebook
    ↓
Popup closes
    ↓
Redirected to /auth/callback
    ↓
Profile created automatically
    ↓
Redirected to home page
    ↓
User is logged in as CLIENT
```

### 3. User Uses Traditional Signup
```
User on signup page
    ↓
Scrolls past OAuth buttons
    ↓
Sees "Ou" divider
    ↓
Fills in email/password form
    ↓
Clicks "Créer un compte"
    ↓
Email verification sent
    ↓
User verifies email
    ↓
Can log in
```

## Key Features

✅ **Icon-only buttons** - No text, just recognizable brand icons
✅ **Client-only** - OAuth only for pet owners, not vets
✅ **Fallback available** - Traditional signup still works
✅ **Auto profile creation** - No extra steps needed
✅ **Mobile friendly** - Works in Android WebView
✅ **Instant login** - No email verification needed

## What Users See

### Before OAuth Setup (Current State)
- Buttons appear but won't work yet
- Clicking shows error toast
- Need to configure in Supabase first

### After OAuth Setup (Once Configured)
- Buttons work perfectly
- Smooth OAuth flow
- Instant authentication
- Profile auto-created

## Testing Checklist

- [ ] Google button appears on login page
- [ ] Facebook button appears on login page
- [ ] Google button appears on signup (client tab)
- [ ] Facebook button appears on signup (client tab)
- [ ] NO OAuth buttons on signup (vet tab)
- [ ] Buttons are icon-only (no text)
- [ ] Google button is blue with white G
- [ ] Facebook button is blue with white f
- [ ] "Ou" divider appears below buttons
- [ ] Traditional form appears below divider
- [ ] Clicking Google opens OAuth popup
- [ ] Clicking Facebook opens OAuth popup
- [ ] After OAuth, redirects to home
- [ ] User is logged in as client
- [ ] Profile created in database

## Troubleshooting

### Buttons Don't Appear
- Check you're on the right page (#login)
- Check browser console for errors
- Verify AuthSection.tsx was updated
- Clear browser cache

### OAuth Fails
- Configure providers in Supabase first
- Check redirect URLs match
- Verify Client ID/Secret are correct
- Check Supabase logs

### Wrong User Type
- OAuth users are always "client"
- This is by design
- Vets must use email/password

### Profile Not Created
- Check AuthCallback.tsx
- Verify client_profiles table exists
- Check Supabase logs
- Look for RLS policy issues
