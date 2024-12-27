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

// Replace with your Google OAuth details
const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const googleRedirectUri = "https://iedlbysyadijjcpwgbvd.supabase.co/functions/v1/google-oauth-callback";

serve(async (req) => {
  console.log("🔵 Request received:", { method: req.method, url: req.url });

  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      console.log("🟡 Handling CORS preflight");
      return new Response(null, { headers: corsHeaders });
    }

    // Ensure the request method is POST
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

    // Validate Authorization header
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

    // Generate a unique state to prevent CSRF
    const newCredentialId = crypto.randomUUID();
    console.log("🔵 Generated unique state (credential ID):", newCredentialId);

    // Insert a pending record in Supabase
    const { error: insertError } = await supabase
      .from("gmail_credentials")
      .insert({
        id: newCredentialId,
        profile_id: user.id,
        status: "pending",
      });

    if (insertError) {
      console.error("🔴 Failed to insert credential record:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create credential record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("🟢 Credential record inserted successfully");

    // Construct the Google OAuth URL
    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(googleClientId)}` +
      `&redirect_uri=${encodeURIComponent(googleRedirectUri)}` +
      `&scope=${encodeURIComponent("https://www.googleapis.com/auth/gmail.readonly")}` +
      `&state=${encodeURIComponent(newCredentialId)}` +
      `&access_type=offline` +
      `&prompt=consent`;

    console.log("🔵 Constructed Google auth URL:", googleAuthUrl);

    // Return the authorization URL
    return new Response(
      JSON.stringify({ success: true, url: googleAuthUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("❌ Unexpected Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
