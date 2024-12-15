import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orgId } = await req.json();
    
    // Get client credentials from environment
    const clientId = Deno.env.get("ZOHO_CLIENT_ID");
    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/zoho-oauth-callback`;
    
    if (!clientId) {
      throw new Error("Missing Zoho client configuration");
    }

    // Store orgId in database for later use
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error("User must be logged in");
    }

    // Save the org_id to zoho_credentials table
    const { error: insertError } = await supabase
      .from('zoho_credentials')
      .upsert({
        profile_id: session.session.user.id,
        org_id: orgId,
        status: 'pending'
      });

    if (insertError) {
      console.error("Error storing credentials:", insertError);
      throw new Error("Failed to store credentials");
    }

    // Construct Zoho OAuth URL
    const scope = "Desk.tickets.READ";
    const authUrl = `https://accounts.zoho.com/oauth/v2/auth?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `scope=${scope}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `access_type=offline&` +
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