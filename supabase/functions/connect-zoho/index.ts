import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.47.8/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, state } = await req.json();

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
    const tokenResponse = await fetch('https://accounts.zoho.in/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: Deno.env.get("ZOHO_CLIENT_ID")!,
        client_secret: Deno.env.get("ZOHO_CLIENT_SECRET")!,
        redirect_uri: 'https://preview--ticket-viewer-harmony.lovable.app/features',
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error("Token exchange error:", tokenData);
      throw new Error(tokenData.error_description || "Failed to exchange code for tokens");
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    // Store tokens in Supabase
    const { error: insertError } = await supabase
      .from('zoho_credentials')
      .insert([
        {
          profile_id: storedState.profile_id,
          access_token,
          refresh_token,
          expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
          org_id: Deno.env.get("ZOHO_ORG_ID")!,
        },
      ]);

    if (insertError) {
      throw new Error("Failed to store tokens");
    }

    // Clean up the used state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("OAuth Callback Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});