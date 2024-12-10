import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getZohoAccessToken(clientId: string, clientSecret: string) {
  const tokenUrl = "https://accounts.zoho.com/oauth/v2/token";
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "Desk.tickets.READ",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Failed to fetch access token: ${response.status} ${responseText}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("No access token received from Zoho");
  }

  return data.access_token;
}

async function validateOrgId(accessToken: string, orgId: string) {
  const testUrl = "https://desk.zoho.com/api/v1/tickets";
  const response = await fetch(testUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      orgId,
    },
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Failed to validate org ID: ${response.status} ${responseText}`);
  }

  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orgId } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const clientId = Deno.env.get("ZOHO_CLIENT_ID")!;
    const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Zoho Access Token
    const accessToken = await getZohoAccessToken(clientId, clientSecret);

    // Validate orgId with Zoho
    await validateOrgId(accessToken, orgId);

    // Update database with validated flag
    const { error: updateError } = await supabase
      .from("zoho_credentials")
      .update({ validated: true })
      .eq("org_id", orgId);

    if (updateError) {
      throw new Error("Failed to update database with validation status");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error validating Zoho credentials:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
