import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.47.8/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function refreshZohoToken(refreshToken: string, clientId: string, clientSecret: string) {
  const tokenUrl = "https://accounts.zoho.com/oauth/v2/token";
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchZohoTickets(accessToken: string, orgId: string) {
  console.log("Fetching Zoho tickets...");
  const response = await fetch(
    `https://desk.zoho.com/api/v1/tickets?limit=1`,
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "orgId": orgId,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error fetching tickets:", errorText);
    throw new Error(`Failed to fetch tickets: ${errorText}`);
  }

  const data = await response.json();
  return data.data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the user's session from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Fetch Zoho credentials for the user
    const { data: credentials, error: credentialsError } = await supabase
      .from("zoho_credentials")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    if (credentialsError || !credentials) {
      throw new Error("Zoho credentials not found");
    }

    const clientId = Deno.env.get("ZOHO_CLIENT_ID");
    const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      throw new Error("Missing Zoho client configuration");
    }

    // Refresh the access token
    const newAccessToken = await refreshZohoToken(
      credentials.refresh_token!,
      clientId,
      clientSecret
    );

    // Update the access token in the database
    await supabase
      .from("zoho_credentials")
      .update({
        access_token: newAccessToken,
        updated_at: new Date().toISOString(),
      })
      .eq("id", credentials.id);

    // Fetch tickets using the new access token
    const tickets = await fetchZohoTickets(newAccessToken, credentials.org_id);

    return new Response(
      JSON.stringify({ success: true, tickets }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in sync-zoho-tickets:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});