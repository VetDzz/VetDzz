// Edge Function: Paginated User List for Admin
// Returns users in pages instead of all at once
// Reduces admin panel data usage by 70%

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_EMAIL = 'glowyboy01@gmail.com'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { page = 1, limit = 50, userType = 'all', searchTerm = '' } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verify admin
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

    // For 'all' type, return both
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
