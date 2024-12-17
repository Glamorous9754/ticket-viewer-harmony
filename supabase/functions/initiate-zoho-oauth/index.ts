import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.47.8/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code"); // Authorization code from Zoho
  const state = url.searchParams.get("state"); // CSRF state parameter

  if (!code || !state) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing authorization code or state parameter" }),
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate CSRF State from the Database
    const { data: stateRecord, error: stateError } = await supabase
      .from("oauth_states")
      .select("*")
      .eq("state", state)
      .single();

    if (stateError || !stateRecord) {
      throw new Error("Invalid state parameter");
    }

    // Exchange Authorization Code for Access & Refresh Tokens
    const clientId = Deno.env.get("ZOHO_CLIENT_ID");
    const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET");
    const redirectUri = "https://jpbsjrjrmhpojphysrsd.supabase.co/functions/v1/zoho-callback";

    const tokenResponse = await fetch("https://accounts.zoho.in/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.refresh_token || !tokenData.access_token) {
      throw new Error("Failed to retrieve tokens from Zoho.");
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    // Save Tokens to Supabase
    const { error: upsertError } = await supabase
      .from("zoho_tokens")
      .upsert([
        {
          profile_id: stateRecord.profile_id, // User ID tied to the state
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt.toISOString(),
        },
      ]);

    if (upsertError) {
      console.error("Error saving tokens to Supabase:", upsertError);
      throw new Error("Failed to save tokens.");
    }

    // Optional: Delete State Record for Security
    await supabase.from("oauth_states").delete().eq("state", state);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Tokens captured and saved successfully!",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error handling callback:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
