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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT Token with Supabase
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