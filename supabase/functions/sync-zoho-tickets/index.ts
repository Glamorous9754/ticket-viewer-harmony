import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getZohoAccessToken(refreshToken: string, clientId: string, clientSecret: string) {
  const response = await fetch(
    'https://accounts.zoho.com/oauth/v2/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
      }),
    }
  );
  
  const data = await response.json();
  if (!data.access_token) {
    throw new Error('Failed to get access token: ' + JSON.stringify(data));
  }
  return data.access_token;
}

async function fetchZohoTickets(accessToken: string, from: string) {
  const response = await fetch(
    `https://desk.zoho.com/api/v1/tickets?from=${from}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'orgId': Deno.env.get('ZOHO_ORG_ID')!,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch tickets: ' + await response.text());
  }
  return response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active Zoho connections
    const { data: connections, error: connectionsError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('platform_name', 'zoho')
      .eq('is_active', true);

    if (connectionsError) throw connectionsError;

    const results = [];
    for (const connection of connections) {
      const { client_id, client_secret, refresh_token } = connection.auth_tokens;
      
      // Get access token
      const accessToken = await getZohoAccessToken(refresh_token, client_id, client_secret);
      
      // Calculate date 15 days ago
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 15);
      
      // Fetch tickets
      const tickets = await fetchZohoTickets(accessToken, fromDate.toISOString());
      
      // Transform and store tickets
      for (const ticket of tickets.data) {
        const { error: upsertError } = await supabase
          .from('tickets')
          .upsert({
            profile_id: connection.profile_id,
            platform_connection_id: connection.id,
            external_ticket_id: ticket.id,
            created_date: ticket.createdTime,
            resolved_date: ticket.closedTime,
            status: ticket.status === 'Closed' ? 'Closed' : 
                   ticket.status === 'Open' ? 'Open' : 'In_Progress',
            thread: ticket.threadContent,
            comments: ticket.comments,
            agent_name: ticket.assignee?.name,
            customer_id: ticket.contactId,
            last_fetched_at: new Date().toISOString(),
          }, {
            onConflict: 'profile_id,platform_connection_id,external_ticket_id'
          });

        if (upsertError) throw upsertError;
        results.push(ticket.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-zoho-tickets function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});