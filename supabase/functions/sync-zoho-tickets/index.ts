import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getZohoAccessToken() {
  try {
    const clientId = Deno.env.get('ZOHO_CLIENT_ID');
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      console.error('Missing Zoho credentials:', { clientId: !!clientId, clientSecret: !!clientSecret });
      throw new Error('Zoho credentials not configured in Supabase secrets');
    }

    console.log('Requesting Zoho access token with credentials...');
    
    const tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'Desk.tickets.READ',
    });

    console.log('Making request to:', tokenUrl);
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const responseText = await response.text();
    console.log('Zoho token response status:', response.status);
    console.log('Zoho token response:', responseText);
    
    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText} - ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Zoho response:', e);
      throw new Error(`Invalid JSON response from Zoho: ${responseText}`);
    }

    if (!data.access_token) {
      console.error('No access token in response:', data);
      throw new Error('No access token received from Zoho. Response: ' + JSON.stringify(data));
    }
    
    console.log('Successfully obtained Zoho access token');
    return data.access_token;
  } catch (error) {
    console.error('Error getting Zoho access token:', error);
    throw error;
  }
}

async function fetchZohoTickets(accessToken: string) {
  try {
    const organizationId = Deno.env.get('ZOHO_ORG_ID');
    if (!organizationId) {
      console.error('Missing Zoho organization ID');
      throw new Error('Zoho organization ID not configured in Supabase secrets');
    }

    console.log('Fetching Zoho tickets...');
    
    const response = await fetch(
      'https://desk.zoho.com/api/v1/tickets',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'orgId': organizationId,
        },
      }
    );
    
    const responseText = await response.text();
    console.log('Zoho tickets response status:', response.status);
    console.log('Zoho tickets response:', responseText);

    if (!response.ok) {
      throw new Error(`Failed to fetch tickets: ${response.status} ${response.statusText} - ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Zoho tickets response:', e);
      throw new Error(`Invalid JSON response from Zoho tickets API: ${responseText}`);
    }
  } catch (error) {
    console.error('Error fetching Zoho tickets:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Zoho ticket sync...');
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Zoho access token using secrets
    console.log('Getting Zoho access token...');
    const accessToken = await getZohoAccessToken();
    
    // Fetch tickets from Zoho
    console.log('Fetching tickets from Zoho...');
    const tickets = await fetchZohoTickets(accessToken);

    if (!tickets || !tickets.data) {
      throw new Error('No ticket data received from Zoho');
    }

    // Process and store tickets
    console.log('Processing tickets...');
    const processedTickets = [];
    
    for (const ticket of tickets.data) {
      console.log('Processing ticket:', ticket.id);
      
      const { error: upsertError } = await supabase
        .from('tickets')
        .upsert({
          profile_id: req.headers.get('x-user-id'),
          external_ticket_id: ticket.id,
          created_date: ticket.createdTime,
          resolved_date: ticket.closedTime || null,
          status: ticket.status === 'Closed' ? 'Closed' : 
                 ticket.status === 'Open' ? 'Open' : 'In_Progress',
          thread: ticket.threadContent || '',
          comments: ticket.comments || [],
          agent_name: ticket.assignee?.name || null,
          customer_id: ticket.contactId || null,
          summary: ticket.subject || null,
          last_fetched_at: new Date().toISOString(),
        });

      if (upsertError) {
        console.error('Error upserting ticket:', upsertError);
        throw upsertError;
      }

      processedTickets.push(ticket.id);
    }

    console.log('Sync completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${processedTickets.length} tickets`,
        processed: processedTickets 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in sync-zoho-tickets function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});