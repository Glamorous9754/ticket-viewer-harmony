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

const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const googleRedirectUri = "https://iedlbysyadijjcpwgbvd.supabase.co/functions/v1/google-oauth-callback";

serve(async (req) => {
  console.log("🔵 Google OAuth callback function invoked:", {
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

    console.log("📝 Received query param `code`:", code);

    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: googleRedirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(
        `Token exchange failed: ${tokenData.error_description || tokenData.error}`
      );
    }

    const { access_token, refresh_token, expires_in, scope, token_type } = tokenData;

    console.log("📦 Token response from Google:", tokenData);

    // Find the latest pending record
    const { data: pendingRecord, error: fetchError } = await supabase
      .from("gmail_credentials")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError || !pendingRecord || pendingRecord.length === 0) {
      throw new Error("No pending record found for the authenticated user.");
    }

    const recordId = pendingRecord[0].id;

    // Update the record with access token
    const { error: updateError } = await supabase
      .from("gmail_credentials")
      .update({
        access_token,
        refresh_token,
        expires_at: new Date(Date.now() + expires_in * 1000).toISOString(), 
        //scope,
        token_type,
        status: "connected",
      })
      .eq("id", state);

    if (updateError) {
      throw new Error("Failed to store token in the database: " + updateError.message);
    }

    console.log("✅ Credentials updated successfully for record ID:", recordId);

    // Redirect to the front page
    const frontPageUrl = "https://preview--ticket-viewer-harmony.lovable.app/features";
    return Response.redirect(frontPageUrl, 302);
  } catch (error) {
    console.error("❌ Error in Google OAuth Callback:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
