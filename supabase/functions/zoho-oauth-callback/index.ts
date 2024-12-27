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
    const tokenResponse = await fetch("https://accounts.zoho.in/oauth/v2/token", {
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

    // 3) Update `zoho_credentials` using the `state` as the record ID
    console.log(`💾 Updating zoho_credentials record with id=${state}...`);
    const expiry = new Date(Date.now() + expires_in * 1000).toISOString();

    const { error: updateError } = await supabase
      .from("zoho_credentials")
      .update({
        access_token,
        refresh_token,
        expires_at: expiry,
        status: "connected", // or any valid enum value
      })
      .eq("id", state);

    if (updateError) {
      throw new Error("Failed to store tokens in the database: " + updateError.message);
    }

    console.log("✅ Credentials updated successfully");

    // 4) Redirect user to your front page (or a success page)
    const frontPageUrl = "https://preview--ticket-viewer-harmony.lovable.app/features"; // <-- Put your real URL here
    // Return a 302 Found redirect
    return Response.redirect(frontPageUrl, 302);

  } catch (error) {
    console.error("❌ Error in Zoho OAuth Callback:", error);

    // Optionally, you could redirect to an "error" page
    // or just return an error JSON response:
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
