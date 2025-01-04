import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.47.8/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Supabase init
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// This is the redirect URI you have configured in Zoho OAuth settings.
// When the user approves, Zoho will send them *back* to this URI, 
// which you can then handle in another endpoint or in your frontend.
const redirectUri = "https://iedlbysyadijjcpwgbvd.supabase.co/functions/v1/zoho-oauth-callback";

serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      console.log("CORS preflight request received.");
      return new Response(null, { headers: corsHeaders });
    }

    // Must be POST
    if (req.method !== "POST") {
      console.log("Invalid method:", req.method);
      return new Response(
        JSON.stringify({ error: "Method Not Allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.log("Missing authorization header.");
      return new Response(
        JSON.stringify({ code: 401, message: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("Authorization header found:", authHeader);

    // Validate Supabase auth token, get user info
    const token = authHeader.replace("Bearer ", "");
    console.log("Extracted bearer token:", token);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.log("Invalid or no user found from Supabase auth:", userError);
      return new Response(
        JSON.stringify({ code: 401, message: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a new credential ID to use as our 'state'
    const newCredentialId = crypto.randomUUID();
    console.log("Generated new credential ID (state):", newCredentialId);

    // Insert a pending record in the DB
    const { error: insertError } = await supabase
      .from("zoho_credentials")
      .insert({
        id: newCredentialId,
        profile_id: user.id,
        status: "pending",
      });

    if (insertError) {
      console.error("Error creating Zoho credential record:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create credential record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("Credential record created with state:", newCredentialId);

    // Build the Zoho Auth URL to return
    const clientId = Deno.env.get("ZOHO_CLIENT_ID")!;
    console.log("Using Zoho Client ID:", clientId);

    const authUrl =
      `https://accounts.zoho.in/oauth/v2/auth` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&scope=${encodeURIComponent("Desk.tickets.READ")}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&access_type=offline` +
      `&state=${encodeURIComponent(newCredentialId)}` +
      `&prompt=consent`;

    console.log("Constructed Zoho auth URL:", authUrl);

    // Return JSON with the authorization URL
    return new Response(
      JSON.stringify({ success: true, url: authUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Unexpected Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
