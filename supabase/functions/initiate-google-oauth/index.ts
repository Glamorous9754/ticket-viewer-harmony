// supabase/functions/initiate-google-oauth/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.47.8/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Supabase initialization
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Google OAuth details
const googleRedirectUri = "https://iedlbysyadijjcpwgbvd.supabase.co/functions/v1/google-oauth-callback";

// Frontend Redirect URL
const frontendRedirectUri = "https://preview--ticket-viewer-harmony.lovable.app/profile/integrations"; // Replace with your actual frontend URL

serve(async (req) => {
  console.log("🔵 Request received:", { method: req.method, url: req.url });

  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      console.log("🟡 Handling CORS preflight");
      return new Response(null, { headers: corsHeaders });
    }

    // Must be POST
    if (req.method !== "POST") {
      console.log("🔴 Invalid request method:", req.method);
      return new Response(
        JSON.stringify({ error: "Method Not Allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("🟢 Processing POST request");

    // Check authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.log("🔴 Missing Authorization header");
      return new Response(
        JSON.stringify({ code: 401, message: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("🟢 Authorization header found:", authHeader);

    // Extract and validate Supabase user
    const token = authHeader.replace("Bearer ", "");
    console.log("🔵 Supabase token extracted:", token);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.log("🔴 Supabase auth failed:", userError);
      return new Response(
        JSON.stringify({ code: 401, message: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("🟢 Supabase user validated:", user);

    // Check if the user already has Gmail credentials
    const { data: existingCredentials, error: fetchError } = await supabase
      .from("gmail_credentials")
      .select("*")
      .eq("profile_id", user.id)
      .single(); // Assuming one credential per user

    if (fetchError && fetchError.code !== "PGRST116") { // PGRST116: Row not found
      console.error("🔴 Failed to fetch existing credentials:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch existing credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingCredentials) {
      console.log("🟢 Existing Gmail credentials found for user:", user.id);
      
      // Check if access_token and refresh_token are present
      if (
        existingCredentials.access_token &&
        existingCredentials.refresh_token
      ) {
        console.log("🟢 All credentials are present. User is already connected.");
        
        // Construct the frontend redirect URL with query parameters
        const redirectUrl = new URL(frontendRedirectUri);
        redirectUrl.searchParams.set("auth_status", "success");
        redirectUrl.searchParams.set("platform", "gmail");
        redirectUrl.searchParams.set("timestamp", Date.now().toString());

        // Construct the full URL with query parameters
        const fullRedirectUrl = redirectUrl.toString();

        const responseBody = {
          status: "connected",
          message: "Google is already connected.",
          url: fullRedirectUrl, // Ensure 'url' field is present
        };

        console.log("🔵 Responding with connected status:", responseBody);
        return new Response(JSON.stringify(responseBody), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        console.log("🟢 Incomplete credentials found. Proceeding with OAuth flow.");
        // Proceed to OAuth flow
      }
    }

    // If no existing credentials or incomplete, proceed to create a new OAuth flow
    console.log("🟢 No existing Gmail credentials found or incomplete. Proceeding to create new OAuth flow.");

    // Generate a new credential ID to use as our 'state'
    const newCredentialId = crypto.randomUUID();
    console.log("🔵 Generated new credential ID (state):", newCredentialId);

    // Insert a pending record in the DB
    const { error: insertError } = await supabase
      .from("gmail_credentials")
      .insert({
        id: newCredentialId,
        profile_id: user.id,
        status: "pending",
      });

    if (insertError) {
      console.error("🔴 Error creating Gmail credential record:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create credential record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("🟢 Credential record created with state:", newCredentialId);

    // Build the Google Auth URL to return
    const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID")!; // Ensure you have this in your environment variables

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(googleClientId)}` +
      `&scope=${encodeURIComponent("https://www.googleapis.com/auth/gmail.readonly")}` +
      `&redirect_uri=${encodeURIComponent(googleRedirectUri)}` +
      `&access_type=offline` +
      `&state=${encodeURIComponent(newCredentialId)}` +
      `&prompt=consent`;

    console.log("Constructed Google auth URL:", googleAuthUrl);

    // Return JSON with the authorization URL
    const authResponseBody = {
      status: "auth_required",
      url: googleAuthUrl, // Ensure 'url' field is present
    };

    console.log("🔵 Responding with auth_required status:", authResponseBody);
    return new Response(JSON.stringify(authResponseBody), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Unexpected Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
