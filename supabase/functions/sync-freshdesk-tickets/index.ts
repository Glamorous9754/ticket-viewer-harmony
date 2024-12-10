import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fetch all tickets using pagination
async function fetchTickets(domain: string, apiKey: string): Promise<any[]> {
  const tickets = [];
  let page = 1;

  while (true) {
    console.log(`Fetching page ${page} of tickets...`);
    const response = await fetch(
      `https://${domain}.freshdesk.com/api/v2/tickets?page=${page}&per_page=100`,
      {
        headers: {
          'Authorization': `Basic ${btoa(apiKey + ':X')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`Error fetching tickets page ${page}:`, response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
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
async function fetchThreads(domain: string, apiKey: string, ticketId: string): Promise<string[]> {
  console.log(`Fetching threads for ticket ${ticketId}...`);
  const response = await fetch(
    `https://${domain}.freshdesk.com/api/v2/tickets/${ticketId}/conversations`,
    {
      headers: {
        'Authorization': `Basic ${btoa(apiKey + ':X')}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    console.error(`Error fetching threads for ticket ${ticketId}:`, response.status);
    const errorText = await response.text();
    console.error('Error details:', errorText);
    return [];
  }

  const threads = await response.json();
  return threads.map((thread: any) => thread.body_text || thread.body || '');
}

// Process tickets and structure data
async function processTickets(domain: string, apiKey: string, connection: any) {
  const tickets = await fetchTickets(domain, apiKey);
  console.log(`Fetched ${tickets.length} tickets`);

  const processedTickets = await Promise.all(
    tickets.map(async (ticket: any) => {
      const threads = await fetchThreads(domain, apiKey, ticket.id.toString());

      return {
        profile_id: connection.profile_id,
        platform_connection_id: connection.id,
        external_ticket_id: ticket.id.toString(),
        created_date: ticket.created_at,
        resolved_date: ticket.status === 5 ? ticket.updated_at : null, // Status 5 = Closed
        status: ticket.status === 5 ? 'Closed' : 'Open',
        thread: threads.join('\n'),
        comments: JSON.stringify(threads),
        agent_name: ticket.responder_name,
        customer_id: ticket.requester_id?.toString(),
        summary: ticket.subject,
        last_fetched_at: new Date().toISOString(),
      };
    })
  );

  return processedTickets;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { connectionId } = await req.json();
    console.log(`Processing tickets for connection ${connectionId}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Retrieve connection details
    const { data: connection, error: connectionError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (connectionError || !connection) {
      console.error('Connection not found:', connectionError);
      throw new Error('Connection not found');
    }

    const { auth_tokens } = connection;
    const apiKey = auth_tokens.apiKey;
    const domain = auth_tokens.domain;

    // Process and fetch ticket data
    const processedTickets = await processTickets(domain, apiKey, connection);

    // Upsert tickets into database
    const { error: insertError } = await supabase
      .from('tickets')
      .upsert(processedTickets);

    if (insertError) {
      console.error('Error inserting tickets:', insertError);
      throw insertError;
    }

    // Update last_fetched_at timestamp for the connection
    await supabase
      .from('platform_connections')
      .update({ last_fetched_at: new Date().toISOString() })
      .eq('id', connectionId);

    return new Response(
      JSON.stringify({ success: true, count: processedTickets.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-freshdesk-tickets:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
