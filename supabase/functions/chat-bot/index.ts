import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import "https://deno.land/std@0.159.0/dotenv/load.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
  console.error("🔴 Missing Supabase credentials.");
  throw new Error("Missing Supabase credentials.");
}

console.log("✅ Initializing Supabase client...");
const supabase = createClient(supabaseUrl, supabaseKey);

interface Ticket {
  id: string;
  external_ticket_id: string;
  web_url: string;
  summary: string;
  created_at: string; // ISO string
  profile_id: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Fetch tickets from the last 7 days
async function fetchRecentTickets(profileId: string): Promise<Ticket[]> {
  console.log(`🔍 Fetching recent tickets for profile_id: ${profileId}`);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  console.log(`📅 Date range: ${sevenDaysAgoISO} to ${new Date().toISOString()}`);

  const { data, error } = await supabase
    .from<Ticket>("tickets")
    .select("summary, web_url, external_ticket_id, created_at")
    .gte("created_at", sevenDaysAgoISO)
    .eq("profile_id", profileId)
    .limit(300);

  if (error) {
    console.error("🔴 Error fetching tickets from Supabase:", error.message);
    throw new Error("Failed to fetch tickets from the database.");
  }

  console.log(
    `✅ Retrieved ${data?.length ?? 0} tickets for profile_id: ${profileId}`
  );
  return data ?? [];
}

async function sendToOpenRouter(messages: Array<{ role: string; content: string }>): Promise<string> {
  const openRouterKey = Deno.env.get("OPEN_ROUTER_KEY");
  if (!openRouterKey) {
    console.error("🔴 Missing OPEN_ROUTER_KEY environment variable.");
    throw new Error("Missing OPEN_ROUTER_KEY environment variable.");
  }

  // (NEW) We pass the entire array of messages instead of a single "user" prompt
  const payload = {
    model: "deepseek/deepseek-chat",
    messages, // array of { role, content }
  };

  console.log("📡 Sending request to OpenRouter...");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openRouterKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log(`📬 Received response from OpenRouter: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`🔴 OpenRouter API error: ${response.status} - ${errorText}`);
    throw new Error("Failed to communicate with OpenRouter API.");
  }

  const responseData: OpenRouterResponse = await response.json();
  console.log("📥 Parsed OpenRouter response successfully.");

  const summary = responseData.choices?.[0]?.message?.content || "";
  console.log("📝 Generated summary:", summary.substring(0, 100) + "...");
  return summary.trim();
}

async function handler(req: Request): Promise<Response> {
  console.log(`🚀 Received request: ${req.method} ${req.url}`);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("🔄 CORS preflight.");
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only POST
  if (req.method !== "POST") {
    console.warn(`⚠️ Method Not Allowed: ${req.method}. Only POST is allowed.`);
    return new Response(
      JSON.stringify({ error: "Method Not Allowed. Use POST." }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // (NEW) Expecting the client to send { profile_id, conversationHistory: [{ role, content }...] }
    const body = await req.json();
    const { profile_id, conversationHistory } = body;

    if (!Array.isArray(conversationHistory)) {
      return new Response(
        JSON.stringify({ error: "'conversationHistory' must be an array." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!profile_id || typeof profile_id !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid or missing 'profile_id'." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 1) Fetch the last 7 days of tickets
    console.log(`📄 Fetching recent tickets for profile_id: ${profile_id}`);
    const tickets = await fetchRecentTickets(profile_id);

    // 2) If you want to inject tickets as context, create a system message:
    let ticketContext = "No tickets found in the last 7 days.";
    if (tickets.length > 0) {
      const ticketsContext = tickets
        .map((ticket) =>
          `• [Ticket ID: ${ticket.external_ticket_id}] \n Ticket: summary ${ticket.summary}\n  URL: ${ticket.web_url}`
        )
        .join("===END===");
      ticketContext = `Here are your recent tickets (last 7 days):\n\n${ticketsContext}`;
    }

    // (NEW) We'll insert a system message with ticket context
    const systemMessage = {
      role: "system" as const,
      content: ticketContext,
    };

    // 3) Combine the system message + all prior conversation messages
    const openRouterMessages = [
      systemMessage,
      ...conversationHistory, // user + assistant messages from the client
    ];

    // 4) Send messages to OpenRouter
    console.log("✉️ Sending conversation to OpenRouter...");
    const openRouterResponse = await sendToOpenRouter(openRouterMessages);

    // 5) Return the AI's response
    console.log("✅ Sending successful response to client.");
    return new Response(JSON.stringify({ summary: openRouterResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("🔴 Error in Edge Function:", (error as Error).message);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

console.log("🚀 Starting Edge Function server...");
serve(handler);
