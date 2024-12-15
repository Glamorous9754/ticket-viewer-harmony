import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, state } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const clientId = Deno.env.get("ZOHO_CLIENT_ID")!;
    const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify state from database
    const { data: stateData, error: stateError } = await supabase
      .from("oauth_states")
      .select("profile_id")
      .eq("state", state)
      .single();

    if (stateError || !stateData) {
      throw new Error("Invalid state parameter");
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${Deno.env.get("PUBLIC_URL")}/oauth/zoho`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();

    // Store the connection
    const { error: insertError } = await supabase
      .from("platform_connections")
      .insert({
        profile_id: stateData.profile_id,
        platform_name: "zoho",
        platform_type: "zoho_desk",
        auth_tokens: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_in: tokenData.expires_in,
        },
      });

    if (insertError) {
      throw insertError;
    }

    // Clean up the state
    await supabase
      .from("oauth_states")
      .delete()
      .eq("state", state);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in Zoho connection:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});