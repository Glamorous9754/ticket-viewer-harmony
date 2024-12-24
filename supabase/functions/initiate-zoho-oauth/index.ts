import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.47.8/+esm";

// CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Initialize Supabase Client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Redirect URI (Must match Zoho OAuth settings)
const redirectUri = "https://preview--ticket-viewer-harmony.lovable.app/features";

serve(async (req) => {
  try {
    console.log("Incoming request method:", req.method);
    console.log("Incoming request URL:", req.url);

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      console.log("Handling CORS preflight...");
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    console.log("Query Params -> code:", code, " state:", state);

    // **Handle OAuth Callback**
    if (code && state) {
      console.log("Detected OAuth callback with code & state. Handling Zoho callback flow...");

      try {
        const stateData = JSON.parse(state);
        const referrer = stateData.referrer || "https://default.page/";
        console.log("Parsed state object from query:", stateData);
        console.log("Referrer from state:", referrer);

        // Verify state to prevent CSRF
        console.log("Verifying state in 'oauth_states' table...");
        const { data: storedState, error: fetchError } = await supabase
          .from("oauth_states")
          .select("*")
          .eq("state", stateData.uuid)
          .single();

        if (fetchError) {
          console.error("Error fetching state from DB:", fetchError);
          throw new Error("Invalid or missing state parameter");
        }
        if (!storedState) {
          console.error("No matching state record found in DB for:", stateData.uuid);
          throw new Error("Invalid or missing state parameter");
        }

        // Exchange authorization code for tokens
        console.log("Exchanging authorization code for Zoho tokens...");
        const tokenResponse = await fetch(`https://accounts.zoho.in/oauth/v2/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: Deno.env.get("ZOHO_CLIENT_ID")!,
            client_secret: Deno.env.get("ZOHO_CLIENT_SECRET")!,
            redirect_uri: redirectUri,
            code: code,
          }),
        });

        const tokenData = await tokenResponse.json();
        console.log("Zoho Token response data:", tokenData);

        if (!tokenResponse.ok) {
          console.error("Token exchange failed with status:", tokenResponse.status);
          throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`);
        }

        const { access_token, refresh_token, expires_in } = tokenData;
        if (!refresh_token) {
          console.error("Zoho response did not provide a refresh token.");
          throw new Error("Zoho did not provide a refresh token.");
        }

        // Store tokens in Supabase
        console.log("Storing tokens in 'oauth_tokens' table...");
        const { error: insertError } = await supabase
          .from("oauth_tokens")
          .insert({
            profile_id: storedState.profile_id,
            access_token,
            refresh_token,
            expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
            platform_type: "zoho_desk",
          });

        if (insertError) {
          console.error("Failed to insert tokens into DB:", insertError);
          throw new Error("Failed to store tokens");
        }

        // Optionally, delete the used state to prevent reuse
        console.log("Deleting used state to prevent reuse...");
        await supabase
          .from("oauth_states")
          .delete()
          .eq("state", stateData.uuid);

        // Redirect user to frontend after successful OAuth
        console.log("OAuth callback successful. Redirecting user to referrer:", referrer);
        return new Response(null, {
          status: 302,
          headers: {
            Location: referrer,
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error("OAuth Callback Error:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // **Handle OAuth Initiation**
    console.log("No code/state detected. Handling OAuth initiation...");
    try {
      // Require Authorization header
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        console.error("Missing authorization header on OAuth initiation");
        return new Response(
          JSON.stringify({ code: 401, message: "Missing authorization header" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify JWT Token with Supabase
      const token = authHeader.replace("Bearer ", "");
      console.log("Verifying Supabase Auth token...");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token);

      if (userError || !user) {
        console.error("Invalid token or user not found in Supabase");
        return new Response(
          JSON.stringify({ code: 401, message: "Invalid token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("User verified. ID:", user.id);

      // Generate a unique state parameter for CSRF protection
      const newState = crypto.randomUUID();
      const referrer = req.headers.get("referer") || "https://default.page/";
      console.log("Generated new state (UUID):", newState);
      console.log("Referrer is:", referrer);

      // Store state in Supabase
      console.log("Inserting new state record into 'oauth_states' table...");
      const { error: stateError } = await supabase
        .from("oauth_states")
        .insert({
          profile_id: user.id,
          state: JSON.stringify({ uuid: newState, referrer }),
          platform_type: "zoho_desk",
        });

      if (stateError) {
        console.error("Failed to store OAuth state:", stateError);
        throw new Error("Failed to store state");
      }

      // Construct Zoho OAuth URL
      console.log("Constructing Zoho OAuth URL...");
      const scope = "Desk.tickets.READ";
      const clientId = Deno.env.get("ZOHO_CLIENT_ID")!;
      const authUrl =
        `https://accounts.zoho.in/oauth/v2/auth?` +
        `response_type=code&` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `access_type=offline&` +
        `state=${encodeURIComponent(JSON.stringify({ uuid: newState, referrer }))}&` +
        `prompt=consent`;

      console.log("Final Zoho Auth URL:", authUrl);

      return new Response(
        JSON.stringify({ success: true, url: authUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("OAuth Initiation Error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    // Catch-all error
    console.error("Unknown error in the main serve handler:", err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
