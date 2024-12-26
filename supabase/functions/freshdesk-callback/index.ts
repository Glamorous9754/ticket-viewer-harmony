import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const redirectUri = "https://jpbsjrjrmhpojphysrsd.supabase.co/functions/v1/freshdesk-callback";

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing code or state parameter" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify state to prevent CSRF
    const { data: storedState, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .single();

    if (stateError || !storedState) {
      throw new Error("Invalid state parameter");
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://accounts.freshdesk.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: Deno.env.get("FRESHDESK_CLIENT_ID")!,
        client_secret: Deno.env.get("FRESHDESK_CLIENT_SECRET")!,
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Store tokens in Supabase
    const { error: insertError } = await supabase
      .from('freshdesk_credentials')
      .insert({
        profile_id: storedState.profile_id,
        access_token,
        refresh_token,
        expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        status: 'active',
      });

    if (insertError) {
      throw new Error("Failed to store tokens");
    }

    // Clean up the used state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);

    // Redirect to frontend with success status
    return new Response(null, {
      status: 302,
      headers: {
        'Location': 'https://preview-ticket-viewer-harmony.lovable.app/features?connection=success',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error("OAuth Callback Error:", error);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': 'https://preview-ticket-viewer-harmony.lovable.app/features?connection=error',
        ...corsHeaders
      }
    });
  }
});