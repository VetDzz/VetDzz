# 📋 Manual Edge Function Deployment Guide

## Your Service Role Key:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsd2ZiZXF0dXBib2VlcnFpcGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYwNDM3OSwiZXhwIjoyMDc4MTgwMzc5fQ.xK6NlOt-QRD-wMgImHtbRbZM0x07RNO6dYbHM4oJEy8
```

---

## 🎯 Step-by-Step Manual Deployment

### Go to Edge Functions:
👉 https://plwfbeqtupboeerqiplw.supabase.co/project/plwfbeqtupboeerqiplw/functions

---

## Function #1: get-nearby-vets

1. Click **"Create a new function"**
2. Name: `get-nearby-vets`
3. Click **"Create function"**
4. **Delete all code** and paste this:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { latitude, longitude, radius = 50 } = await req.json()

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const latDelta = radius / 111
    const lonDelta = radius / (111 * Math.cos(latitude * Math.PI / 180))

    const { data, error } = await supabase
      .from('vet_profiles')
      .select('*')
      .gte('latitude', latitude - latDelta)
      .lte('latitude', latitude + latDelta)
      .gte('longitude', longitude - lonDelta)
      .lte('longitude', longitude + lonDelta)
      .eq('is_verified', true)
      .limit(100)

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const vetsWithDistance = data.map(vet => {
      const distance = calculateDistance(latitude, longitude, vet.latitude, vet.longitude)
      return { ...vet, distance }
    })
      .filter(vet => vet.distance <= radius)
      .sort((a, b) => a.distance - b.distance)

    return new Response(
      JSON.stringify({ data: vetsWithDistance, count: vetsWithDistance.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
```

5. Click **"Deploy"**
6. Wait for deployment to finish

---

## Function #2: check-user-status

1. Click **"Create a new function"**
2. Name: `check-user-status`
3. Click **"Create function"**
4. **Delete all code** and paste this:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ exists: false, banned: false, error: 'User not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: banInfo, error: banError } = await supabase.rpc('get_ban_info', {
      check_user_id: user.id
    })

    if (banError) {
      console.error('Ban check error:', banError)
    }

    const isBanned = !banError && banInfo?.banned === true

    return new Response(
      JSON.stringify({
        exists: true,
        banned: isBanned,
        banInfo: isBanned ? banInfo : null,
        userId: user.id,
        email: user.email
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

5. Click **"Deploy"**
6. Wait for deployment to finish

---

## Function #3: admin-stats

1. Click **"Create a new function"**
2. Name: `admin-stats`
3. Click **"Create function"**
4. **Delete all code** and paste this:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_EMAIL = 'glowyboy01@gmail.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user || user.email !== ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const [
      clientsResult,
      vetsResult,
      padRequestsResult,
      bannedUsersResult,
      authUsersResult
    ] = await Promise.all([
      supabase.from('client_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('vet_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('pad_requests').select('id', { count: 'exact', head: true }),
      supabase.from('banned_users').select('user_id', { count: 'exact', head: true }),
      supabase.auth.admin.listUsers()
    ])

    const { data: padByStatus } = await supabase
      .from('pad_requests')
      .select('status')

    const statusCounts = {
      pending: 0,
      accepted: 0,
      rejected: 0
    }

    padByStatus?.forEach(req => {
      if (req.status in statusCounts) {
        statusCounts[req.status as keyof typeof statusCounts]++
      }
    })

    return new Response(
      JSON.stringify({
        totalClients: clientsResult.count || 0,
        totalVets: vetsResult.count || 0,
        totalPADRequests: padRequestsResult.count || 0,
        totalBannedUsers: bannedUsersResult.count || 0,
        totalAuthUsers: authUsersResult.data?.users?.length || 0,
        padRequestsByStatus: statusCounts,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

5. Click **"Deploy"**
6. Wait for deployment to finish

---

## Function #4: admin-users-paginated

1. Click **"Create a new function"**
2. Name: `admin-users-paginated`
3. Click **"Create function"**
4. **Delete all code** and paste this:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_EMAIL = 'glowyboy01@gmail.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { page = 1, limit = 50, userType = 'all', searchTerm = '' } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user || user.email !== ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query
    let profileData

    if (userType === 'clients' || userType === 'all') {
      query = supabase
        .from('client_profiles')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      }

      const { data: clients, error: clientError, count: clientCount } = await query

      if (userType === 'clients') {
        return new Response(
          JSON.stringify({
            data: clients,
            error: clientError,
            totalCount: clientCount,
            totalPages: Math.ceil((clientCount || 0) / limit),
            currentPage: page,
            userType: 'clients'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      profileData = { clients, clientCount }
    }

    if (userType === 'vets' || userType === 'all') {
      query = supabase
        .from('vet_profiles')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`clinic_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      }

      const { data: vets, error: vetError, count: vetCount } = await query

      if (userType === 'vets') {
        return new Response(
          JSON.stringify({
            data: vets,
            error: vetError,
            totalCount: vetCount,
            totalPages: Math.ceil((vetCount || 0) / limit),
            currentPage: page,
            userType: 'vets'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      profileData = { ...profileData, vets, vetCount }
    }

    return new Response(
      JSON.stringify({
        data: profileData,
        totalPages: Math.ceil(((profileData?.clientCount || 0) + (profileData?.vetCount || 0)) / limit),
        currentPage: page,
        userType: 'all'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

5. Click **"Deploy"**
6. Wait for deployment to finish

---

## ✅ After All 4 Functions Are Deployed

### Set Environment Variables:

1. Go to: https://plwfbeqtupboeerqiplw.supabase.co/project/plwfbeqtupboeerqiplw/settings/functions
2. Click on **"Manage secrets"** or **"Environment variables"**
3. Add these 3 secrets:

**Secret 1:**
- Name: `SUPABASE_URL`
- Value: `https://plwfbeqtupboeerqiplw.supabase.co`

**Secret 2:**
- Name: `SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsd2ZiZXF0dXBib2VlcnFpcGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDQzNzksImV4cCI6MjA3ODE4MDM3OX0.2wmux6ErWdE0er8zgb8p-YdR4OfbwBz4yPP0B3yEKjc`

**Secret 3:**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsd2ZiZXF0dXBib2VlcnFpcGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYwNDM3OSwiZXhwIjoyMDc4MTgwMzc5fQ.xK6NlOt-QRD-wMgImHtbRbZM0x07RNO6dYbHM4oJEy8`

---

## 🎉 Done!

Once all 4 functions are deployed and secrets are set, tell me:

**"All 4 functions deployed!"**

Then I'll update your React code to use these functions! 🚀
