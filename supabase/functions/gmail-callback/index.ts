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
      .eq('platform_type', 'gmail')
      .single()

    if (stateError || !stateData) {
      throw new Error('Invalid state')
    }

    // Exchange code for tokens
    const clientId = Deno.env.get('GMAIL_CLIENT_ID')
    const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET')
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/gmail-callback`

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(tokens.error_description || 'Failed to exchange code for tokens')
    }

    // Get user email
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    const userInfo = await userInfoResponse.json()

    // Store credentials
    await supabaseClient.from('gmail_credentials').upsert({
      profile_id: stateData.profile_id,
      email: userInfo.email,
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
    console.error('Gmail callback error:', error)
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: `${new URL(req.url).origin}/features?connection=error`,
      },
    })
  }
})