import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { apiKey, domain } = await req.json()
    console.log('Validating FreshDesk credentials for domain:', domain)

    // Test the credentials by making a request to list tickets
    const response = await fetch(`https://${domain}.freshdesk.com/api/v2/tickets`, {
      headers: {
        'Authorization': 'Basic ' + btoa(apiKey + ':X'),
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('FreshDesk API validation failed:', response.status)
      throw new Error('Invalid credentials')
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error validating FreshDesk credentials:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})