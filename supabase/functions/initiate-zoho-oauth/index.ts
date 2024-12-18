import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.47.8/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const url = new URL(req.url);
  
  // Check if it's a callback request by looking for 'code' and 'state' parameters
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (code && state) {
    // Handle OAuth callback
    try {
      // Verify the state parameter to prevent CSRF
      const { data: storedState, error: fetchError } = await supabase
        .from('oauth_states')
        .select('*')
        .eq('state', state)
        .single();

      if (fetchError || !storedState) {
        throw new Error("Invalid or missing state parameter");
      }

      // Exchange authorization code for access and refresh tokens
      const clientId = Deno.env.get("ZOHO_CLIENT_ID")!;
      const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET")!;
      const redirectUri = "https://jpbsjrjrmhpojphysrsd.supabase.co/functions/v1/zoho-callback";

      const tokenResponse = await fetch(`https://accounts.zoho.in/oauth/v2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code: code,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`);
      }

      const { access_token, refresh_token, expires_in } = tokenData;

      // Store tokens securely in your database
      const { error: insertError } = await supabase
        .from('oauth_tokens')
        .insert({
          profile_id: storedState.profile_id,
          access_token,
          refresh_token,
          expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
          platform_type: 'zoho_desk',
        });

      if (insertError) {
        throw new Error("Failed to store tokens");
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: "OAuth successfully completed",
        }),
        { 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );

    } catch (error) {
      console.error("Error handling OAuth callback:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
  }

  // Handle OAuth initiation
  try {
    // Require Authorization header for initiating OAuth
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          code: 401,
          message: "Missing authorization header"
        }),
        { 
          status: 401,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Extract and verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("User verification failed:", userError);
      return new Response(
        JSON.stringify({ 
          code: 401,
          message: "User must be logged in"
        }),
        { 
          status: 401,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Retrieve Zoho client configuration
    const clientId = Deno.env.get("ZOHO_CLIENT_ID");
    if (!clientId) {
      throw new Error("Missing Zoho client configuration");
    }

    const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET");
    if (!clientSecret) {
      throw new Error("Missing Zoho client secret");
    }

    // Define the redirect URI (must match Zoho configuration)
    const redirectUri = "https://jpbsjrjrmhpojphysrsd.supabase.co/functions/v1/zoho-callback";
    
    // Generate a unique state parameter for CSRF protection
    const newState = crypto.randomUUID();
    
    // Store the state in the database for later verification
    const { error: stateError } = await supabase
      .from('oauth_states')
      .insert({
        profile_id: user.id,
        state: newState,
        platform_type: 'zoho_desk',
      });

    if (stateError) {
      console.error("Error storing OAuth state:", stateError);
      throw new Error("Failed to store OAuth state");
    }

    // Construct the Zoho OAuth authorization URL
    const scope = "Desk.tickets.READ";
    const authUrl = `https://accounts.zoho.in/oauth/v2/auth?` +
      `response_type=code&` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `access_type=offline&` +
      `state=${encodeURIComponent(newState)}&` +
      `prompt=consent`;

    console.log("Generated auth URL:", authUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        url: authUrl
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error("Error initiating OAuth:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
