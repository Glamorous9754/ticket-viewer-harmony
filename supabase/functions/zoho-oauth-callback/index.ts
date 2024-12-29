// supabase/functions/zoho-oauth-callback/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import "https://deno.land/std@0.159.0/dotenv/load.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  console.log("🔵 Zoho OAuth callback function invoked:", {
    method: req.method,
    url: req.url,
  });

  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 🟢 Let GET requests through because Zoho typically does GET
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 1) Parse query params for `code` and `state`
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      throw new Error("Missing code or state in query string");
    }

    console.log("📝 Received query params:", { code, state });

    // 2) Exchange code for tokens with Zoho
    const tokenResponse = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: Deno.env.get("ZOHO_CLIENT_ID")!,
        client_secret: Deno.env.get("ZOHO_CLIENT_SECRET")!,
        redirect_uri: "https://iedlbysyadijjcpwgbvd.supabase.co/functions/v1/zoho-oauth-callback",
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log("📦 Token response from Zoho:", tokenData);

    if (!tokenResponse.ok) {
      throw new Error(
        `Token exchange failed: ${tokenData.error_description || tokenData.error}`
      );
    } 

    const { access_token, refresh_token, expires_in } = tokenData;
    if (!refresh_token) {
      throw new Error("Zoho did not provide a refresh token");
    }

    // 3) Fetch `org_id` from Zoho Desk
    const orgsResponse = await fetch("https://desk.zoho.com/api/v1/organizations", {
      method: "GET",
      headers: {
        Authorization: `Zoho-oauthtoken ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    const orgsData = await orgsResponse.json();
    console.log("📦 Organizations response from Zoho:", orgsData);

    if (!orgsResponse.ok) {
      throw new Error(`Failed to fetch organizations: ${orgsData.message || orgsResponse.statusText}`);
    }

    const organizations = orgsData.data;
    if (!organizations || organizations.length === 0) {
      throw new Error("No organizations found in Zoho response.");
    }

    // Assuming the user has access to only one organization
    const org_id = organizations[0].id;

    console.log(`🔑 Retrieved org_id: ${org_id}`);

    // 4) Update `zoho_credentials` using the `state` as the record ID
    console.log(`💾 Updating zoho_credentials record with id=${state}...`);
    const expiry = new Date(Date.now() + expires_in * 1000).toISOString();

    const { error: updateError } = await supabase
      .from("zoho_credentials")
      .update({
        access_token,
        refresh_token,
        expires_at: expiry,
        status: "connected",
        org_id : org_id, // Store org_id
      })
      .eq("id", state);

    if (updateError) {
      throw new Error("Failed to store tokens in the database: " + updateError.message);
    }

    console.log("✅ Credentials updated successfully with org_id");

    // 5) Redirect with success status and platform
    const frontPageUrl = new URL("https://preview--ticket-viewer-harmony.lovable.app/profile/integrations");
    frontPageUrl.searchParams.set("auth_status", "success");
    frontPageUrl.searchParams.set("platform", "zoho");
    frontPageUrl.searchParams.set("timestamp", Date.now().toString());
    return Response.redirect(frontPageUrl.toString(), 302);

  } catch (error) {
    console.error("❌ Error in Zoho OAuth Callback:", error);
    
    // Redirect with error status and platform
    const frontPageUrl = new URL("https://preview--ticket-viewer-harmony.lovable.app/profile/integrations");
    frontPageUrl.searchParams.set("auth_status", "error");
    frontPageUrl.searchParams.set("platform", "zoho");
    frontPageUrl.searchParams.set("error_message", encodeURIComponent((error as Error).message));
    return Response.redirect(frontPageUrl.toString(), 302);
  }
});
