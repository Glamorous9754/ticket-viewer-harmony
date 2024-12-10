import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Status mapping
const STATUS_MAP = {
  2: "Open",
  3: "Pending",
  4: "Resolved",
  5: "Closed",
};

// Helper function to clean HTML content
function cleanText(html) {
  return html
    .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

// Fetch all tickets using pagination
async function fetchTickets(domain, apiKey) {
  const tickets = [];
  let page = 1;

  while (true) {
    console.log(`Fetching page ${page} of tickets...`);
    const response = await fetch(
      `https://${domain}.freshdesk.com/api/v2/tickets?page=${page}&per_page=100`,
      {
        headers: {
          Authorization: `Basic ${btoa(apiKey + ":X")}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`Error fetching tickets page ${page}:`, response.status);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      break;
    }

    const data = await response.json();
    tickets.push(...data);

    if (data.length < 100) break; // Exit if no more pages
    page++;
  }

  return tickets;
}

// Fetch threads for a specific ticket
async function fetchThreads(domain, apiKey, ticketId) {
  console.log(`Fetching threads for ticket ${ticketId}...`);
  const response = await fetch(
    `https://${domain}.freshdesk.com/api/v2/tickets/${ticketId}/conversations`,
    {
      headers: {
        Authorization: `Basic ${btoa(apiKey + ":X")}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.error(`Error fetching threads for ticket ${ticketId}:`, response.status);
    const errorText = await response.text();
    console.error("Error details:", errorText);
    return [];
  }

  const threads = await response.json();

  // Combine and clean conversation content
  const combinedThread = threads
    .map((thread) => cleanText(thread.body_text || thread.body || ""))
    .join("\n");

  return combinedThread;
}

// Process tickets and structure data
async function processTickets(domain, apiKey, connection) {
  const tickets = await fetchTickets(domain, apiKey);
  console.log(`Fetched ${tickets.length} tickets`);

  const processedTickets = await Promise.all(
    tickets.map(async (ticket) => {
      const thread = await fetchThreads(domain, apiKey, ticket.id.toString());

      return {
        profile_id: connection.profile_id,
        platform_connection_id: connection.id,
        external_ticket_id: ticket.id.toString(),
        created_date: ticket.created_at,
        resolved_date: ticket.status === 5 ? ticket.updated_at : null, // Status 5 = Closed
        status: STATUS_MAP[ticket.status] || "Unknown", // Convert status to text
        thread, // Populated from combined threads
        comments: null, // Set comments to null or remove if unnecessary
        agent_name: ticket.responder_name,
        customer_id: ticket.requester_id?.toString(),
        summary: ticket.subject,
        last_fetched_at: new Date().toISOString(),
      };
    })
  );

  return processedTickets;
}

// Sync tickets into the database with conflict handling
async function syncTickets(domain, apiKey, connectionId, supabase) {
  // Fetch connection details
  const { data: connection, error: connectionError } = await supabase
    .from("platform_connections")
    .select("*")
    .eq("id", connectionId)
    .single();

  if (connectionError || !connection) {
    console.error("Connection not found:", connectionError);
    throw new Error("Connection not found");
  }

  const processedTickets = await processTickets(domain, apiKey, connection);

  if (processedTickets.length === 0) {
    console.log("No tickets to process.");
    return { success: true, count: 0 };
  }

  // Upsert tickets with conflict resolution
  const { error: upsertError } = await supabase
    .from("tickets")
    .upsert(processedTickets, {
      onConflict: ["platform_connection_id", "external_ticket_id"],
    });

  if (upsertError) {
    console.error("Error upserting tickets:", upsertError);
    throw upsertError;
  }

  // Update last_fetched_at for the connection
  await supabase
    .from("platform_connections")
    .update({ last_fetched_at: new Date().toISOString() })
    .eq("id", connectionId);

  console.log(`Successfully synced ${processedTickets.length} tickets.`);
  return { success: true, count: processedTickets.length };
}

// Serve the edge function
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { connectionId } = await req.json();
    console.log(`Processing tickets for connection ${connectionId}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch connection credentials and sync tickets
    const { data: connection, error: connectionError } = await supabase
      .from("platform_connections")
      .select("auth_tokens")
      .eq("id", connectionId)
      .single();

    if (connectionError || !connection) {
      console.error("Error fetching connection:", connectionError);
      throw new Error("Connection not found.");
    }

    const { auth_tokens } = connection;
    const apiKey = auth_tokens.apiKey;
    const domain = auth_tokens.domain;

    const result = await syncTickets(domain, apiKey, connectionId, supabase);

    return new Response(
      JSON.stringify({ success: true, count: result.count }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in sync-freshdesk-tickets:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
