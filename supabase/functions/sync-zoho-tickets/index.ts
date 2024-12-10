import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getZohoAccessToken(supabase: any, userId: string) {
  try {
    console.log('Starting Zoho access token request process...');
    
    const clientId = Deno.env.get('ZOHO_CLIENT_ID');
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      console.error('Missing Zoho credentials:', { clientId: !!clientId, clientSecret: !!clientSecret });
      throw new Error('Zoho credentials not configured');
    }

    // Get user's Zoho credentials
    const { data: credentials, error: credentialsError } = await supabase
      .from('zoho_credentials')
      .select('*')
      .eq('profile_id', userId)
      .single();

    if (credentialsError || !credentials) {
      console.error('Error fetching Zoho credentials:', credentialsError);
      throw new Error('No Zoho credentials found for user');
    }

    console.log('Found Zoho credentials, requesting access token...');
    
    const tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'Desk.tickets.READ',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error('Token request failed:', response.status, responseText);
      throw new Error(`Failed to get access token: ${response.status} ${responseText}`);
    }

    const data = await response.json();
    console.log('Received response from Zoho:', { hasAccessToken: !!data.access_token });
    
    if (!data.access_token) {
      console.error('No access token in response:', data);
      throw new Error('No access token received from Zoho');
    }

    // Update stored credentials with new token
    const { error: updateError } = await supabase
      .from('zoho_credentials')
      .update({
        access_token: data.access_token,
        token_type: data.token_type,
        expires_at: new Date(Date.now() + (data.expires_in * 1000)).toISOString(),
      })
      .eq('profile_id', userId);

    if (updateError) {
      console.error('Error updating credentials:', updateError);
    }
    
    console.log('Successfully obtained and stored Zoho access token');
    return { accessToken: data.access_token, orgId: credentials.org_id };
  } catch (error) {
    console.error('Error in getZohoAccessToken:', error);
    throw error;
  }
}

async function fetchZohoTickets(accessToken: string, orgId: string) {
  try {
    console.log('Starting Zoho ticket fetch...');
    
    // Calculate date range for last 3 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    
    const params = new URLSearchParams({
      createdTimeRange: `${startDate.toISOString()},${endDate.toISOString()}`,
      limit: '100',
    });

    const response = await fetch(
      `https://desk.zoho.com/api/v1/tickets?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'orgId': orgId,
        },
      }
    );
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Tickets request failed:', response.status, responseText);
      throw new Error(`Failed to fetch tickets: ${response.status} ${responseText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched tickets:', { count: data.data?.length || 0 });
    return data;
  } catch (error) {
    console.error('Error in fetchZohoTickets:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Zoho ticket sync process...');
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization')?.split(' ')[1];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user) {
      throw new Error('Failed to get user');
    }

    // Get Zoho access token
    console.log('Getting Zoho access token...');
    const { accessToken, orgId } = await getZohoAccessToken(supabase, user.id);
    
    // Fetch tickets from Zoho
    console.log('Fetching tickets from Zoho...');
    const tickets = await fetchZohoTickets(accessToken, orgId);

    if (!tickets || !tickets.data) {
      throw new Error('No ticket data received from Zoho');
    }

    // Process and store tickets
    console.log('Processing tickets...');
    const processedTickets = [];
    
    for (const ticket of tickets.data) {
      const { error: upsertError } = await supabase
        .from('tickets')
        .upsert({
          profile_id: user.id,
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