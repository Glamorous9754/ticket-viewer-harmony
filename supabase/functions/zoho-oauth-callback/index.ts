import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ZOHO_TOKEN_URL = "https://accounts.zoho.in/oauth/v2/token";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, state } = await req.json();
    console.log("Received OAuth callback with state:", state);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify state and get profile_id
    const { data: stateData, error: stateError } = await supabase
      .from("oauth_states")
      .select("profile_id")
      .eq("state", state)
      .single();

    if (stateError || !stateData) {
      throw new Error("Invalid state parameter");
    }

    // Exchange code for access token
    const tokenResponse = await fetch(ZOHO_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: Deno.env.get("ZOHO_CLIENT_ID")!,
        client_secret: Deno.env.get("ZOHO_CLIENT_SECRET")!,
        redirect_uri: `${Deno.env.get("PUBLIC_URL")}/oauth/zoho`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();
    console.log("Received token data:", { hasAccessToken: !!tokenData.access_token });

    // Update zoho_credentials with tokens
    const { error: updateError } = await supabase
      .from("zoho_credentials")
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type,
        expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
        status: "active",
      })
      .eq("profile_id", stateData.profile_id);

    if (updateError) {
      console.error("Error updating credentials:", updateError);
      throw new Error("Failed to store tokens");
    }

    // Clean up the used state
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
    console.error("Error in OAuth callback:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});