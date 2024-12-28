import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchZohoTickets(orgId: string, accessToken: string) {
  console.log("Fetching Zoho tickets...");
  const response = await fetch(
    `https://desk.zoho.com/api/v1/tickets?limit=100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        orgId: orgId,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error fetching tickets:", errorText);
    throw new Error(`Failed to fetch tickets: ${errorText}`);
  }

  const data = await response.json();
  return data.data || [];
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

    // Fetch Zoho credentials
    const { data: credentials, error: credentialsError } = await supabase
      .from("zoho_credentials")
      .select("*")
      .eq("profile_id", user.id)
      .eq("status", "active")
      .single();

    if (credentialsError || !credentials) {
      throw new Error("Zoho credentials not found");
    }

    // Fetch tickets from Zoho
    const tickets = await fetchZohoTickets(
      credentials.org_id,
      credentials.access_token
    );

    console.log(`Found ${tickets.length} tickets`);

    // Process tickets
    const processedTickets = tickets.map((ticket: any) => ({
      profile_id: user.id,
      platform_connection_id: credentials.id,
      external_ticket_id: ticket.id.toString(),
      created_date: ticket.createdTime,
      resolved_date: ticket.closedTime || null,
      status: ticket.status,
      thread: ticket.subject + "\n" + (ticket.description || ""),
      customer_id: ticket.contactId?.toString(),
      summary: ticket.subject,
      last_fetched_at: new Date().toISOString(),
    }));

    // Upsert tickets
    const { error: upsertError } = await supabase
      .from("tickets")
      .upsert(processedTickets, {
        onConflict: "platform_connection_id,external_ticket_id",
      });

    if (upsertError) {
      throw upsertError;
    }

    // Update last_fetched_at for the Zoho credentials
    await supabase
      .from("zoho_credentials")
      .update({ last_fetched_at: new Date().toISOString() })
      .eq("id", credentials.id);

    return new Response(
      JSON.stringify({ success: true, count: processedTickets.length }),
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