// supabase/functions/sync-zendesk-tickets/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, User } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import "https://deno.land/std@0.159.0/dotenv/load.ts";
import { z } from "https://deno.land/x/zod/mod.ts";

// Define environment variables for better type safety
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ZENDESK_SUBDOMAIN = Deno.env.get("ZENDESK_SUBDOMAIN");


if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !ZENDESK_SUBDOMAIN
) {
  console.error("🔴 Missing required environment variables.");
  Deno.exit(1);
}

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Function to initialize Supabase client
const initializeSupabase = () => {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
};

// Helper function to clean HTML content
const cleanHTMLContent = (html: string | null): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
};

interface ZendeskComment {
  body: string | null;
  status: string;
  author_id: string;
}

interface ZendeskTicket {
  id: string | number;
  created_at: string;
  due_at?: string;
  status: string;
  assignee_id?: string;
  requester_id?: string;
  subject?: string;
}

interface ZendeskCredentials {
  access_token: string;
}

const RequestBodySchema = z.object({
  // No fields since we're removing the request body dependency
});

// Function to fetch Zendesk credentials from Supabase using profileId
const getZendeskCredentialsByProfileId = async (
  supabase: ReturnType<typeof createClient>,
  profileId: string
): Promise<ZendeskCredentials> => {
  const { data, error } = await supabase
    .from("zendesk_credentials")
    .select("access_token")
    .eq("profile_id", profileId)
    .single();

  if (error || !data) {
    console.error("🔴 Error fetching Zendesk credentials:", error?.message);
    throw new Error("Failed to fetch Zendesk credentials.");
  }

  return data as ZendeskCredentials;
};

// Function to fetch comments for a ticket
const fetchTicketComments = async (
  ticketId: string,
  headers: Record<string, string>
): Promise<string> => {
  const commentsUrl = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/tickets/${ticketId}/comments.json`;
  const comments: string[] = [];
  let nextPage: string | null = commentsUrl;

  try {
    while (nextPage) {
      const response = await fetch(nextPage, { headers });
      if (!response.ok) {
        console.error(`🔴 Failed to fetch comments for ticket ${ticketId}. Status: ${response.status}`);
        return "No comments available.";
      }
      const data = await response.json();
      const fetchedComments: ZendeskComment[] = data.comments || [];
      comments.push(
        ...fetchedComments.map((comment: ZendeskComment) => {
          const body = cleanHTMLContent(comment.body || "");
          return `${comment.status === "public" ? "Public" : "Private"} comment by ${
            comment.author_id
          }:\n"${body}"`;
        })
      );
      nextPage = data.next_page;
    }
    return comments.join("\n\n");
  } catch (error: Error | unknown) {
    console.error(`🔴 Error fetching comments for ticket ${ticketId}:`, error instanceof Error ? error.message : "Fetch failed");
    return "No comments available.";
  }
};

// Function to fetch all tickets and insert them into Supabase
const fetchAndSaveTickets = async (req: Request): Promise<Response> => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Initialize Supabase client inside the handler
  const supabase = initializeSupabase();

  // Ensure the request method is POST
  if (req.method !== "POST") {
    console.warn("🔴 Invalid request method:", req.method);
    return new Response(
      JSON.stringify({ code: 405, message: "Method Not Allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // Since there's no body, we can skip parsing and validation
  // Proceed to authenticate and fetch credentials

  // Get the Authorization header
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("🔴 Missing or invalid Authorization header");
    return new Response(
      JSON.stringify({ code: 401, message: "Missing or invalid authorization header" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const token = authHeader.replace("Bearer ", "").trim();

  // Authenticate the user using Supabase
  let user: User;
  try {
    const { data, error: userError } = await supabase.auth.getUser(token);
    if (userError || !data?.user) {
      console.error("🔴 Invalid Supabase user:", userError?.message);
      return new Response(
        JSON.stringify({ code: 401, message: "Invalid Supabase user" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    user = data.user;
    console.log(`✅ Authenticated user: ${user.email} (ID: ${user.id})`);
  } catch (error: Error | unknown) {
    console.error("🔴 Error authenticating user:", error instanceof Error ? error.message : "Authentication failed");
    return new Response(
      JSON.stringify({ code: 500, message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const profileId = user.id;

  try {
    // Step 1: Fetch Zendesk credentials from Supabase using profileId
    const zendeskCredentials = await getZendeskCredentialsByProfileId(supabase, profileId);
    console.log("✅ Fetched Zendesk credentials.");

    // Use the existing access token directly
    const zendeskHeaders = {
      Authorization: `Bearer ${zendeskCredentials.access_token}`,
      "Content-Type": "application/json",
    };

    // Step 2: Fetch tickets from Zendesk
    const ticketsUrl = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/tickets.json`;
    const tickets: ZendeskTicket[] = [];
    let nextPage: string | null = ticketsUrl;

    console.log("📥 Starting to fetch Zendesk tickets.");

    while (nextPage) {
      const response = await fetch(nextPage, { headers: zendeskHeaders });
      if (!response.ok) {
        console.error(`🔴 Failed to fetch tickets. Status: ${response.status}`);
        break;
      }
      const data = await response.json();
      const fetchedTickets: ZendeskTicket[] = data.tickets || [];
      tickets.push(...fetchedTickets);
      nextPage = data.next_page;
      console.log(`📄 Fetched ${fetchedTickets.length} tickets. Next page: ${nextPage}`);
    }

    console.log(`✅ Total tickets fetched: ${tickets.length}`);

    // Step 3: Fetch comments for all tickets
    const ticketRows = await Promise.all(
      tickets.map(async (ticket) => {
        const comments = await fetchTicketComments(ticket.id.toString(), zendeskHeaders);
        return {
          profile_id: profileId,
          platform_connection_id: null, // Set this if relevant
          external_ticket_id: ticket.id.toString(),
          created_date: ticket.created_at,
          resolved_date: ticket.due_at || null,
          status: ticket.status,
          thread: comments,
          comments: ticket.subject || "No Subject",
          agent_id: ticket.assignee_id || "Unassigned",
          customer_id: ticket.requester_id || "Unknown",
          summary: "Summarizing",
          last_fetched_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      })
    );

    console.log("📦 Prepared ticket data for insertion into Supabase.");

    // Step 4: Insert data into Supabase
    const { error: insertError } = await supabase.from("tickets").insert(ticketRows);
    if (insertError) {
      console.error("🔴 Error inserting tickets into Supabase:", insertError.message);
      throw new Error("Failed to save tickets to the database.");
    }

    console.log("✅ Tickets successfully fetched and saved to Supabase.");
    return new Response(
      JSON.stringify({ message: "Tickets successfully fetched and saved to Supabase." }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: Error | unknown) {
    console.error("🔴 Error during ticket fetch and save process:", error instanceof Error ? error.message : error);
    return new Response(
      JSON.stringify({ code: 500, message: error instanceof Error ? error.message : "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

// Start the server with updated CORS headers
serve(async (req: Request) => {
  const response = await fetchAndSaveTickets(req);
  // Ensure CORS headers are always included
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", corsHeaders["Access-Control-Allow-Origin"]);
  headers.set("Access-Control-Allow-Headers", corsHeaders["Access-Control-Allow-Headers"]);
  headers.set("Access-Control-Allow-Methods", corsHeaders["Access-Control-Allow-Methods"]);

  return new Response(response.body, {
    status: response.status,
    headers: headers,
  });
});
