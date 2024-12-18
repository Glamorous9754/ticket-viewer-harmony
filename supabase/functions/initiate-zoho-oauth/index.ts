import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.47.8/+esm";

// CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Initialize Supabase Client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Redirect URI (Must match Zoho OAuth settings)
const redirectUri = "https://jpbsjrjrmhpojphysrsd.supabase.co/functions/v1/zoho-callback"; // Update this to your actual redirect URI

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (code && state) {
    // **Handle OAuth Callback**
    try {
      // Verify state to prevent CSRF
      const { data: storedState, error: fetchError } = await supabase
        .from('oauth_states')
        .select('*')
        .eq('state', state)
        .single();

      if (fetchError || !storedState) {
        throw new Error("Invalid or missing state parameter");
      }

      // Exchange authorization code for tokens
      const tokenResponse = await fetch(`https://accounts.zoho.in/oauth/v2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: Deno.env.get("ZOHO_CLIENT_ID")!,
          client_secret: Deno.env.get("ZOHO_CLIENT_SECRET")!,
          redirect_uri: redirectUri,
          code: code,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`);
      }

      const { access_token, refresh_token, expires_in } = tokenData;

      // Store tokens in Supabase
      const { error: insertError } = await supabase
        .from('oauth_tokens')
        .insert({
          profile_id: storedState.profile_id,
          access_token,
          refresh_token,
          expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
          platform_type: 'zoho_desk',
        });

      if (insertError) {
        throw new Error("Failed to store tokens");
      }

      // Optionally, delete the used state to prevent reuse
      await supabase
        .from('oauth_states')
        .delete()
        .eq('state', state);

      // Redirect user to frontend after successful OAuth
      return new Response(null, {
        status: 302,
        headers: {
          "Location": "https://preview--ticket-viewer-harmony.lovable.app/features", // Update to your frontend success page
          ...corsHeaders,
        },
      });

    } catch (error) {
      console.error("OAuth Callback Error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  // **Handle OAuth Initiation**
  try {
    // Require Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ code: 401, message: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify JWT Token with Supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ code: 401, message: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a unique state parameter for CSRF protection
    const newState = crypto.randomUUID();

    // Store state in Supabase
    const { error: stateError } = await supabase
      .from('oauth_states')
      .insert({
        profile_id: user.id,
        state: newState,
        platform_type: 'zoho_desk',
      });

    if (stateError) {
      throw new Error("Failed to store state");
    }

    // Construct Zoho OAuth URL
    const scope = "Desk.tickets.READ";
    const authUrl = `https://accounts.zoho.in/oauth/v2/auth?` +
      `response_type=code&` +
      `client_id=${encodeURIComponent(Deno.env.get("ZOHO_CLIENT_ID")!)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `access_type=offline&` +
      `state=${encodeURIComponent(newState)}&` +
      `prompt=consent`;

    return new Response(
      JSON.stringify({ success: true, url: authUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("OAuth Initiation Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
