# 🚀 Edge Functions & Data Optimization Guide for VetDz

## 📊 Current Data Usage Analysis

### What's Using Your Supabase Data?

Your VetDz platform currently makes these types of database calls:

1. **Authentication Queries** (Low usage)
   - Login/logout
   - User session checks
   - ~10-50 KB per user per day

2. **Profile Queries** (Medium usage)
   - Client profiles
   - Vet profiles
   - ~100-500 KB per user per day

3. **PAD Requests** (Medium-High usage)
   - Real-time PAD request updates
   - Status changes
   - ~500 KB - 2 MB per active user per day

4. **Map/Location Queries** (HIGH usage ⚠️)
   - Loading all vet locations on map
   - Distance calculations
   - **~5-20 MB per user per day** (BIGGEST DATA DRAIN!)

5. **Admin Panel** (HIGH usage when active ⚠️)
   - Loading all users
   - Loading all profiles
   - Loading all PAD requests
   - **~10-50 MB per admin session**

6. **Real-time Subscriptions** (Medium-High usage)
   - Notification updates
   - PAD request status changes
   - ~1-5 MB per active user per day

---

## 🎯 Do You Need Edge Functions?

### ✅ YES, You Should Use Edge Functions If:

1. **You have 100+ users** - Data usage will scale quickly
2. **Admin panel is used frequently** - Each admin session loads massive amounts of data
3. **Map is heavily used** - Loading all vet locations repeatedly
4. **You want to reduce costs** - Edge functions can reduce database reads by 60-80%

### ❌ NO, You Don't Need Edge Functions Yet If:

1. **You have < 50 users** - Current usage is manageable
2. **Admin panel rarely used** - Not a major data drain
3. **You're still in testing phase** - Focus on features first

---

## 💡 Recommended Edge Functions for VetDz

### 1. **Get Nearby Vets** (HIGHEST PRIORITY 🔥)
**Problem**: Currently loads ALL vets from database, then filters in browser
**Solution**: Edge function that only returns vets within radius

**Data Savings**: 80-90% reduction in map queries

```typescript
// File: supabase/functions/get-nearby-vets/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { latitude, longitude, radius = 50 } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Calculate bounding box (much faster than distance calculation)
  const latDelta = radius / 111 // 1 degree latitude ≈ 111 km
  const lonDelta = radius / (111 * Math.cos(latitude * Math.PI / 180))

  const { data, error } = await supabase
    .from('vet_profiles')
    .select('*')
    .gte('latitude', latitude - latDelta)
    .lte('latitude', latitude + latDelta)
    .gte('longitude', longitude - lonDelta)
    .lte('longitude', longitude + lonDelta)
    .eq('is_verified', true)
    .limit(50)

  return new Response(JSON.stringify({ data, error }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

### 2. **Admin Statistics** (HIGH PRIORITY 🔥)
**Problem**: Admin panel loads ALL users, profiles, and requests
**Solution**: Edge function that returns pre-calculated statistics

**Data Savings**: 70-80% reduction in admin queries

```typescript
// File: supabase/functions/admin-stats/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Verify admin (check email from JWT)
  const authHeader = req.headers.get('Authorization')!
  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabase.auth.getUser(token)
  
  if (user?.email !== 'glowyboy01@gmail.com') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // Get counts only (much faster than loading all data)
  const [clients, vets, padRequests, bannedUsers] = await Promise.all([
    supabase.from('client_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('vet_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('PAD_requests').select('id', { count: 'exact', head: true }),
    supabase.from('banned_users').select('id', { count: 'exact', head: true })
  ])

  return new Response(JSON.stringify({
    totalClients: clients.count || 0,
    totalVets: vets.count || 0,
    totalPADRequests: padRequests.count || 0,
    totalBannedUsers: bannedUsers.count || 0
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

### 3. **Paginated User List** (MEDIUM PRIORITY)
**Problem**: Admin loads all users at once
**Solution**: Load users in pages of 20-50

**Data Savings**: 50-60% reduction

```typescript
// File: supabase/functions/admin-users/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { page = 1, limit = 50, userType = 'all' } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Verify admin
  const authHeader = req.headers.get('Authorization')!
  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabase.auth.getUser(token)
  
  if (user?.email !== 'glowyboy01@gmail.com') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('client_profiles')
    .select('*, user:auth.users(*)', { count: 'exact' })
    .range(from, to)

  if (userType === 'clients') {
    query = supabase.from('client_profiles').select('*', { count: 'exact' }).range(from, to)
  } else if (userType === 'vets') {
    query = supabase.from('vet_profiles').select('*', { count: 'exact' }).range(from, to)
  }

  const { data, error, count } = await query

  return new Response(JSON.stringify({ 
    data, 
    error, 
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page 
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## 📁 Where to Put Edge Functions

### Directory Structure:
```
VetDz/
├── supabase/
│   └── functions/
│       ├── get-nearby-vets/
│       │   └── index.ts
│       ├── admin-stats/
│       │   └── index.ts
│       └── admin-users/
│           └── index.ts
├── src/
└── ...
```

---

## 🛠️ How to Deploy Edge Functions

### Step 1: Install Supabase CLI

**Windows (PowerShell):**
```powershell
# Using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# OR using npm
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link Your Project
```bash
supabase link --project-ref plwfbeqtupboeerqiplw
```

### Step 4: Deploy Functions
```bash
# Deploy all functions
supabase functions deploy

# OR deploy specific function
supabase functions deploy get-nearby-vets
```

### Step 5: Set Environment Variables
```bash
supabase secrets set SUPABASE_URL=https://plwfbeqtupboeerqiplw.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 💻 How to Use Edge Functions in Your Code

### Example: Using Get Nearby Vets

**Before (Current - High Data Usage):**
```typescript
// Loads ALL vets, then filters in browser
const { data: allVets } = await supabase
  .from('vet_profiles')
  .select('*')
  .eq('is_verified', true)

// Filter in browser (wastes bandwidth)
const nearbyVets = allVets.filter(vet => 
  calculateDistance(userLat, userLon, vet.latitude, vet.longitude) < 50
)
```

**After (Edge Function - Low Data Usage):**
```typescript
// Only loads nearby vets
const { data: nearbyVets } = await supabase.functions.invoke('get-nearby-vets', {
  body: {
    latitude: userLat,
    longitude: userLon,
    radius: 50 // km
  }
})
```

---

## 📈 Expected Data Savings

| Feature | Current Usage | With Edge Functions | Savings |
|---------|--------------|---------------------|---------|
| Map Loading | 5-20 MB/user/day | 0.5-2 MB/user/day | **85-90%** |
| Admin Panel | 10-50 MB/session | 2-5 MB/session | **80%** |
| User Lists | 5-10 MB/load | 0.5-1 MB/load | **85%** |
| **TOTAL** | **~100 GB/month** (1000 users) | **~15 GB/month** | **85%** |

---

## 🎯 My Recommendation

### Phase 1: Immediate (Do Now)
1. ✅ **Fix all "Laboratoire" → "Vétérinaire"** (DONE!)
2. ✅ **Create admin account** (Instructions provided)
3. ⏳ **Monitor your Supabase usage** for 1 week
   - Go to: https://plwfbeqtupboeerqiplw.supabase.co/project/plwfbeqtupboeerqiplw/settings/billing
   - Check "Database" usage

### Phase 2: If Usage > 50% of Free Tier
1. 🚀 Deploy **"Get Nearby Vets"** edge function (saves 80% of map data)
2. 🚀 Deploy **"Admin Stats"** edge function (saves 70% of admin data)

### Phase 3: If Usage > 80% of Free Tier
1. 🚀 Deploy **"Paginated User List"** edge function
2. 🚀 Add caching to reduce real-time subscriptions

---

## 📊 Supabase Free Tier Limits

- **Database Size**: 500 MB
- **Bandwidth**: 5 GB/month
- **Edge Function Invocations**: 500,000/month
- **Storage**: 1 GB

**Your current setup should be fine for:**
- Up to 200-300 active users without edge functions
- Up to 1000+ active users WITH edge functions

---

## ✅ Summary

**Do you need edge functions NOW?**
- If you have < 100 users: **NO, not yet**
- If you have 100-500 users: **YES, deploy Phase 2**
- If you have 500+ users: **YES, deploy all phases**

**I recommend:**
1. Monitor usage for 1 week
2. If you see high bandwidth usage, deploy the "Get Nearby Vets" function first
3. The admin panel functions can wait unless you use admin panel daily

Let me know if you want me to create the actual edge function files for you! 🚀
