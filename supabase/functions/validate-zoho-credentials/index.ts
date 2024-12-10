import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getZohoAccessToken(clientId: string, clientSecret: string) {
  console.log('Getting Zoho access token...');
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
    console.error('Token request failed:', response.status, responseText);
    throw new Error(`Failed to fetch access token: ${response.status} ${responseText}`);
  }

  const data = await response.json();
  console.log('Received token response:', { hasAccessToken: !!data.access_token });
  
  if (!data.access_token) {
    throw new Error("No access token received from Zoho");
  }

  return data.access_token;
}

async function validateOrgId(accessToken: string, orgId: string) {
  console.log('Validating org ID...');
  const testUrl = "https://desk.zoho.com/api/v1/tickets?limit=1";
  const response = await fetch(testUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      orgId,
    },
  });

  if (!response.ok) {
    const responseText = await response.text();
    console.error('Validation request failed:', response.status, responseText);
    throw new Error(`Failed to validate org ID: ${response.status} ${responseText}`);
  }

  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting validation process...');
    const { orgId, clientId, clientSecret } = await req.json();

    if (!orgId || !clientId || !clientSecret) {
      throw new Error("Missing required credentials");
    }

    // Get access token and validate
    const accessToken = await getZohoAccessToken(clientId, clientSecret);
    await validateOrgId(accessToken, orgId);

    console.log('Validation successful');
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