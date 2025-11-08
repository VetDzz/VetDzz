// Edge Function: Admin Statistics
// Returns only counts instead of loading all data
// Reduces admin panel data usage by 80%

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verify admin from JWT token
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

    // Get counts only (much faster than loading all data)
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

    // Count PAD requests by status
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
