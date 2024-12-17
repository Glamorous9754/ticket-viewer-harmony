import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase_supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("User verification failed:", userError);
      throw new Error("User must be logged in");
    }

    // Get client credentials from environment
    const clientId = Deno.env.get("ZOHO_CLIENT_ID");
    const redirectUri = `${Deno.env.get("PUBLIC_URL")}/oauth/zoho`;
    
    if (!clientId) {
      throw new Error("Missing Zoho client configuration");
    }

    // Generate a random state for CSRF protection
    const state = crypto.randomUUID();
    
    // Store state in database for verification during callback
    const { error: stateError } = await supabase
      .from('oauth_states')
      .insert({
        profile_id: user.id,
        state: state,
        platform_type: 'zoho_desk',
      });

    if (stateError) {
      console.error("Error storing OAuth state:", stateError);
      throw new Error("Failed to store OAuth state");
    }

    // Construct Zoho OAuth URL
    const scope = "Desk.tickets.READ";
    const authUrl = `https://accounts.zoho.in/oauth/v2/auth?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `scope=${scope}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `access_type=offline&` +
      `state=${state}&` +
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