//<reference types="https://deno.land/x/edge_runtime@1.1.0/globals.d.ts" />;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// ... existing code ...
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
serve(async (req) => {
  try {
    // Parse URL parameters
    const url = new URL(req.url);
    const stateParam = url.searchParams.get('state');
    const code = url.searchParams.get('code');

    // Parse the state JSON string
    const stateObj = JSON.parse(decodeURIComponent(stateParam || ''));
    const state = stateObj.uuid;
    
    // Get profile_id from your authentication context
    // You'll need to determine how to get the profile_id since it's not in the URL parameters
    const profile_id = ""; // You need to set this based on your auth context

    // Verify state from database
    const { data: storedState, error: stateError } = await supabase
      .from("oauth_states")
      .select("*")
      .eq("state", state)
      .single();

    if (stateError || !storedState) {
      throw new Error("Invalid state parameter");
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.zoho.in/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: Deno.env.get("ZOHO_CLIENT_ID")!,
        client_secret: Deno.env.get("ZOHO_CLIENT_SECRET")!,
        redirect_uri: `${Deno.env.get("PUBLIC_URL")!}/oauth/zoho`,
        code: code!,
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();

    const {data: tokenDataDb, error: tokenError} = await supabase.from('zoho_credentials')
      .select("*")
      .eq("profile_id", profile_id)
      .eq("platform_type", "zoho_desk")
      .single();

    if(tokenError || !tokenDataDb){
      throw new Error("Error getting tokens")
    }

    // Store the connection
    const { error: insertError } = await supabase
      .from("platform_connections")
      .insert([
        {
          profile_id: profile_id,
          platform_name: "zoho",
          auth_tokens: tokenData,
        },
      ]);

    if (insertError) {
      throw new Error(`Failed to store connection`);
    }

    // Clean up the used state
    await supabase.from("oauth_states").delete().eq("state", state);

    return new Response(JSON.stringify({success: true}), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in Zoho connection", error);
    return new Response(JSON.stringify({success: false, error: error.message}), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});