import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    if (error) {
      throw new Error(error)
    }

    if (!code || !state) {
      throw new Error('Missing code or state')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify state and get profile_id
    const { data: stateData, error: stateError } = await supabaseClient
      .from('oauth_states')
      .select('profile_id')
      .eq('state', state)
      .eq('platform_type', 'zendesk')
      .single()

    if (stateError || !stateData) {
      throw new Error('Invalid state')
    }

    // Exchange code for tokens
    const clientId = Deno.env.get('ZENDESK_CLIENT_ID')
    const clientSecret = Deno.env.get('ZENDESK_CLIENT_SECRET')
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/zendesk-callback`

    const tokenResponse = await fetch('https://accounts.zendesk.com/oauth/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        scope: 'read write',
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(tokens.error_description || 'Failed to exchange code for tokens')
    }

    // Store credentials
    await supabaseClient.from('zendesk_credentials').upsert({
      profile_id: stateData.profile_id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      status: 'active',
    })

    // Clean up state
    await supabaseClient
      .from('oauth_states')
      .delete()
      .match({ state })

    // Redirect back to app
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: `${url.origin}/features?connection=success`,
      },
    })
  } catch (error) {
    console.error('Zendesk callback error:', error)
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: `${new URL(req.url).origin}/features?connection=error`,
      },
    })
  }
})