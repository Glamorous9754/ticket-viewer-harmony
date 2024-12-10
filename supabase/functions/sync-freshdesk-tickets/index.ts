import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { connectionId } = await req.json();
    console.log(`Fetching tickets for connection ${connectionId}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get connection details
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

    // Calculate date 3 months ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    // Construct proper FreshDesk URL with the .freshdesk.com domain and date filter
    const freshdeskUrl = `https://${domain}.freshdesk.com/api/v2/tickets?updated_since=${threeMonthsAgo.toISOString()}`;
    console.log('Fetching tickets from:', freshdeskUrl);

    // Fetch tickets from FreshDesk
    const response = await fetch(
      freshdeskUrl,
      {
        headers: {
          'Authorization': `Basic ${btoa(apiKey + ':X')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('FreshDesk API error:', response.status, response.statusText);
      const errorBody = await response.text();
      console.error('Error details:', errorBody);
      throw new Error(`FreshDesk API error: ${response.statusText}`);
    }

    const tickets = await response.json();
    console.log(`Fetched ${tickets.length} tickets from FreshDesk`);

    // Store tickets in database
    const { error: insertError } = await supabase
      .from('tickets')
      .upsert(
        tickets.map((ticket: any) => ({
          profile_id: connection.profile_id,
          platform_connection_id: connectionId,
          external_ticket_id: ticket.id.toString(),
          created_date: ticket.created_at,
          resolved_date: ticket.status === 5 ? ticket.updated_at : null,
          status: ticket.status === 5 ? 'Closed' : 'Open',
          thread: ticket.description_text,
          customer_id: ticket.requester_id?.toString(),
          agent_name: ticket.responder_name,
          summary: ticket.subject,
        }))
      );

    if (insertError) {
      console.error('Error inserting tickets:', insertError);
      throw insertError;
    }

    // Update last_fetched_at
    await supabase
      .from('platform_connections')
      .update({ last_fetched_at: new Date().toISOString() })
      .eq('id', connectionId);

    return new Response(
      JSON.stringify({ success: true, count: tickets.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-freshdesk-tickets:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});