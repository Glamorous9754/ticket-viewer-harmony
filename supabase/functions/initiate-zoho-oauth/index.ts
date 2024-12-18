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

// Hardcode the redirect URI to match Zoho configuration
const redirectUri = "https://preview--ticket-viewer-harmony.lovable.app/features";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  // Handle OAuth callback if code and state are present
  if (code && state) {
    console.log("Handling OAuth callback with code and state");
    try {
      // Verify state to prevent CSRF
      const { data: storedState, error: stateError } = await supabase
        .from('oauth_states')
        .select('*')
        .eq('state', state)
        .single();

      if (stateError || !storedState) {
        console.error("Invalid state:", stateError);
        return new Response(
          JSON.stringify({ error: "Invalid state parameter" }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Exchange code for tokens
      console.log("Exchanging code for tokens");
      const tokenResponse = await fetch('https://accounts.zoho.in/oauth/v2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: Deno.env.get("ZOHO_CLIENT_ID")!,
          client_secret: Deno.env.get("ZOHO_CLIENT_SECRET")!,
          redirect_uri: redirectUri,
          code: code,
        })
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error("Token exchange failed:", tokenData);
        return new Response(
          JSON.stringify({ error: "Failed to exchange code for tokens" }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      const { access_token, refresh_token, expires_in } = tokenData;

      // Store tokens in database
      console.log("Storing tokens in database");
      const { error: insertError } = await supabase
        .from('zoho_credentials')
        .upsert({
          profile_id: storedState.profile_id,
          access_token,
          refresh_token,
          expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
          org_id: Deno.env.get("ZOHO_ORG_ID")!,
          status: 'active'
        });

      if (insertError) {
        console.error("Failed to store tokens:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to store tokens" }),
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Clean up used state
      await supabase
        .from('oauth_states')
        .delete()
        .eq('state', state);

      // Redirect to frontend with success
      return new Response(
        null,
        {
          status: 302,
          headers: {
            ...corsHeaders,
            'Location': `${redirectUri}?success=true`
          }
        }
      );

    } catch (error) {
      console.error("OAuth callback error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  }

  // Handle OAuth initiation
  try {
    // Verify JWT Token only for initiation
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomUUID();

    // Store state in Supabase
    const { error: stateError } = await supabase
      .from('oauth_states')
      .insert({
        profile_id: user.id,
        state: state,
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
      `state=${encodeURIComponent(state)}&` +
      `prompt=consent`;

    return new Response(
      JSON.stringify({ url: authUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("OAuth Initiation Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});