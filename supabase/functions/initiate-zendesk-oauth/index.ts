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

// Replace with your Zendesk details
const zendeskBaseUrl = "https://tanmaypro.zendesk.com";
const zendeskClientId = Deno.env.get("ZENDESK_CLIENT_ID")!;
const zendeskRedirectUri = "https://iedlbysyadijjcpwgbvd.supabase.co/functions/v1/zendesk-oauth-callback";

// Frontend Redirect URL
const frontendRedirectUri = Deno.env.get("FRONTEND_REDIRECT_URI")!; // e.g., "https://yourfrontend.com/oauth-success"

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

    // Check if the user already has Zendesk credentials
    const { data: existingCredentials, error: fetchError } = await supabase
      .from("zendesk_credentials")
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
      console.log("🟢 Existing Zendesk credentials found for user:", user.id);
      
      // Optionally, you can check the status of existing credentials
      if (existingCredentials.status === "active") {
        // Redirect to frontend indicating that Zendesk is already connected
        const redirectUrl = `${frontendRedirectUri}?status=already_connected`;
        console.log("🔵 Redirecting to frontend:", redirectUrl);
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            Location: redirectUrl,
          },
        });
      } else if (existingCredentials.status === "pending") {
        // If there's a pending OAuth process, redirect or inform the frontend accordingly
        const redirectUrl = `${frontendRedirectUri}?status=pending`;
        console.log("🔵 Redirecting to frontend:", redirectUrl);
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            Location: redirectUrl,
          },
        });
      } else {
        // Handle other statuses as needed
        const redirectUrl = `${frontendRedirectUri}?status=${existingCredentials.status}`;
        console.log("🔵 Redirecting to frontend:", redirectUrl);
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            Location: redirectUrl,
          },
        });
      }
    }

    // If no existing credentials, proceed to create a new OAuth flow
    console.log("🟢 No existing Zendesk credentials found. Proceeding to create new OAuth flow.");

    // Generate a unique state to prevent CSRF
    const newCredentialId = crypto.randomUUID();
    console.log("🔵 Generated unique state (credential ID):", newCredentialId);

    // Insert a pending record in Supabase
    const { error: insertError } = await supabase
      .from("zendesk_credentials")
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

    // Construct the Zendesk OAuth URL
    const zendeskAuthUrl =
      `${zendeskBaseUrl}/oauth/authorizations/new` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(zendeskClientId)}` +
      `&redirect_uri=${encodeURIComponent(zendeskRedirectUri)}` +
      `&scope=${encodeURIComponent("read")}` +
      `&state=${encodeURIComponent(newCredentialId)}`;

    console.log("🔵 Constructed Zendesk auth URL:", zendeskAuthUrl);

    // Return the authorization URL
    return new Response(
      JSON.stringify({ success: true, url: zendeskAuthUrl }),
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
