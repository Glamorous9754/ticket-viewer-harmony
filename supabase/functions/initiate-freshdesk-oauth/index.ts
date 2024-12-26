import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const redirectUri = "https://jpbsjrjrmhpojphysrsd.supabase.co/functions/v1/freshdesk-callback";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the user's session from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Generate a unique state parameter for CSRF protection
    const newState = crypto.randomUUID();

    // Store state in Supabase
    const { error: stateError } = await supabase
      .from("oauth_states")
      .insert({
        profile_id: user.id,
        state: newState,
        platform_type: 'freshdesk'
      });

    if (stateError) {
      throw new Error("Failed to store state");
    }

    // Construct Freshdesk OAuth URL
    const authUrl = new URL('https://accounts.freshdesk.com/oauth/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', Deno.env.get("FRESHDESK_CLIENT_ID")!);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', newState);

    return new Response(
      JSON.stringify({ success: true, url: authUrl.toString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("OAuth Initiation Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});