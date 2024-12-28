import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchZendeskTickets(subdomain: string, accessToken: string) {
  console.log("Fetching Zendesk tickets...");
  const response = await fetch(
    `https://${subdomain}.zendesk.com/api/v2/tickets.json`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error fetching tickets:", errorText);
    throw new Error(`Failed to fetch tickets: ${errorText}`);
  }

  const data = await response.json();
  return data.tickets || [];
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

    // Fetch Zendesk credentials
    const { data: credentials, error: credentialsError } = await supabase
      .from("zendesk_credentials")
      .select("*")
      .eq("profile_id", user.id)
      .eq("status", "active")
      .single();

    if (credentialsError || !credentials) {
      throw new Error("Zendesk credentials not found");
    }

    // Fetch tickets from Zendesk
    const tickets = await fetchZendeskTickets(
      credentials.subdomain,
      credentials.access_token
    );

    console.log(`Found ${tickets.length} tickets`);

    // Process tickets
    const processedTickets = tickets.map((ticket: any) => ({
      profile_id: user.id,
      platform_connection_id: credentials.id,
      external_ticket_id: ticket.id.toString(),
      created_date: ticket.created_at,
      resolved_date: ticket.solved_at || null,
      status: ticket.status,
      thread: ticket.description,
      customer_id: ticket.requester_id?.toString(),
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

    // Update last_fetched_at for the Zendesk credentials
    await supabase
      .from("zendesk_credentials")
      .update({ last_fetched_at: new Date().toISOString() })
      .eq("id", credentials.id);

    return new Response(
      JSON.stringify({ success: true, count: processedTickets.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in sync-zendesk-tickets:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});