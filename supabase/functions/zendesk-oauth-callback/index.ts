import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const zendeskClientId = Deno.env.get("ZENDESK_CLIENT_ID");
const zendeskClientSecret = Deno.env.get("ZENDESK_CLIENT_SECRET")!;
const zendeskRedirectUri = "https://iedlbysyadijjcpwgbvd.supabase.co/functions/v1/zendesk-oauth-callback";

serve(async (req) => {
  console.log("🔵 Zendesk OAuth callback function invoked:", {
    method: req.method,
    url: req.url,
  });

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code) {
      throw new Error("Missing code in query string");
    }

    if (!state) {
      throw new Error("Missing state in query string");
    }

    console.log("📝 Received query params `code`:", code, " and `state`:", state);

    // Exchange code for access token
    const tokenResponse = await fetch("https://tanmaypro.zendesk.com/oauth/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: zendeskClientId,
        client_secret: zendeskClientSecret,
        redirect_uri: zendeskRedirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(
        `Token exchange failed: ${tokenData.error_description || tokenData.error}`
      );
    }

    const { access_token, token_type, scope } = tokenData;

    console.log("📦 Token response from Zendesk:", tokenData);

    // Update the record with matching state
    const { error: updateError } = await supabase
      .from("zendesk_credentials")
      .update({
        access_token,
        token_type,
        //scope,
        status: "connected", // Update status to "connected"
      })
      .eq("id", state); // Use the `state` value to match the record

    if (updateError) {
      throw new Error("Failed to store token in the database: " + updateError.message);
    }

    console.log("✅ Credentials updated successfully for state ID:", state);

    // Redirect to the front page
    const frontPageUrl = "https://preview--ticket-viewer-harmony.lovable.app/features";
    return Response.redirect(frontPageUrl, 302);
  } catch (error) {
    console.error("❌ Error in Zendesk OAuth Callback:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: corsHeaders },
    );
  }
});
