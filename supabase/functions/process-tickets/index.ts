import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function summarizeWithGemini(text: string) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('GOOGLE_API_KEY')}`,
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Summarize this support ticket concisely: ${text}`,
        }],
      }],
    }),
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function analyzeWithClaude(summaries: string[]) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Analyze these support ticket summaries and identify: 
          1. Common themes and patterns
          2. Potential feature requests
          3. Customer pain points
          4. Suggested improvements
          
          Summaries: ${JSON.stringify(summaries)}`,
      }],
    }),
  });

  const data = await response.json();
  return data.content[0].text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get tickets without summaries
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .is('summary', null)
      .limit(50); // Process in batches

    if (ticketsError) throw ticketsError;

    // Process each ticket with Gemini
    for (const ticket of tickets) {
      const summary = await summarizeWithGemini(ticket.thread);
      
      await supabase
        .from('tickets')
        .update({ summary })
        .eq('id', ticket.id);
    }

    // Get all summaries for Claude analysis
    const { data: allTickets, error: allTicketsError } = await supabase
      .from('tickets')
      .select('summary')
      .not('summary', 'is', null)
      .limit(100);

    if (allTicketsError) throw allTicketsError;

    const summaries = allTickets.map(t => t.summary);
    const analysis = await analyzeWithClaude(summaries);

    // Store analysis results (you might want to create a new table for this)
    console.log('Claude Analysis:', analysis);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in process-tickets function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});