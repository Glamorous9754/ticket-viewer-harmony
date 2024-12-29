// supabase/functions/sync-zoho-tickets/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, User } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import "https://deno.land/std@0.159.0/dotenv/load.ts";
import { z } from "https://deno.land/x/zod/mod.ts";

// Define environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ZOHO_CLIENT_ID = Deno.env.get("ZOHO_CLIENT_ID");
const ZOHO_CLIENT_SECRET = Deno.env.get("ZOHO_CLIENT_SECRET");
const OPEN_ROUTER_KEY = Deno.env.get("OPEN_ROUTER_KEY");


// Verify that all required environment variables are set
if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !ZOHO_CLIENT_ID ||
  !ZOHO_CLIENT_SECRET ||
  !OPEN_ROUTER_KEY
) {
  console.error("🔴 Missing required environment variables.");
  Deno.exit(1);
}

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper function to clean HTML content
const cleanHTMLContent = (html: string | null): string => {
  if (!html) return "";
  // Simple regex to remove HTML tags
  return html.replace(/<[^>]*>/g, "").trim();
};

// Interface definitions for Zoho Desk API responses
interface ZohoComment {
  content: string | null;
  type: string;
  from: {
    name: string;
  };
  createdTime: string;
  id: string;
}

interface ZohoTicket {
  id: string;
  createdTime: string;
  closedTime?: string;
  status: string;
  assignee?: {
    name: string;
  };
  contactId?: string;
  subject?: string;
}

// Interface for detailed thread information
interface ZohoThreadDetails {
  content: string | null;
  type: string;
  from: {
    name: string;
  };
  createdTime: string;
  id: string;
}

// Interface for Supabase tickets
interface SupabaseTicket {
  profile_id: string;
  platform_connection_id: string | null;
  external_ticket_id: string;
  created_date: string;
  resolved_date: string | null;
  status: string;
  thread: string;
  comments: string;
  agent_id: string;
  customer_id: string;
  summary: string;
  last_fetched_at: string;
  created_at: string;
  updated_at: string;
}

// Interface for Zoho Credentials with org_id
interface ZohoCredentials {
  refresh_token: string;
  org_id: string;
}

// Function to refresh the Zoho access token using a provided refresh token
const refreshZohoAccessToken = async (refreshToken: string): Promise<string> => {
  const tokenUrl = "https://accounts.zoho.in/oauth/v2/token";
  const params = new URLSearchParams();
  params.append("refresh_token", refreshToken);
  params.append("client_id", ZOHO_CLIENT_ID!);
  params.append("client_secret", ZOHO_CLIENT_SECRET!);
  params.append("grant_type", "refresh_token");

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    console.log("🔵 Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `🔴 Failed to refresh Zoho access token. Status: ${response.status}`
      );
      console.error(`Response: ${errorText}`);
      throw new Error("Failed to refresh Zoho access token.");
    }

    const data = await response.json();
    const access_token = data.access_token;
    if (!access_token) {
      console.error("🔴 Access token not found in Zoho response.");
      throw new Error("Unable to retrieve Zoho access token.");
    }

    console.log("✅ Zoho access token refreshed successfully.");
    return access_token;
  } catch (error: any) {
    console.error(
      `🔴 Error refreshing Zoho access token: ${error.message || error}`
    );
    throw new Error("Error refreshing Zoho access token.");
  }
};

// Function to fetch all open Zoho tickets using limit and from for pagination
const fetchZohoOpenTickets = async (
  accessToken: string,
  orgId: string
): Promise<ZohoTicket[]> => {
  const tickets: ZohoTicket[] = [];
  let offset = 0;
  const batchSize = 100; // Adjust batch size as needed
  let apiCallCount = 0;
  const baseUrl = "https://desk.zoho.in/api/v1";
  const ticketsUrl = `${baseUrl}/tickets`;

  try {
    while (true) {
      // Prepare query parameters
      const params = new URLSearchParams({
        limit: batchSize.toString(),
        from: offset.toString(),
        status: "Open",
      });

      // Increment API call counter before making the request
      apiCallCount += 1;
      console.log(
        `📞 API Call #${apiCallCount}: Fetching tickets from offset ${offset} for Org ID ${orgId}`
      );

      // Make the API request
      const response = await fetch(`${ticketsUrl}?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          orgId: orgId,
          "Content-Type": "application/json",
        },
      });

      // Check for successful response
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔴 Failed to fetch tickets. Status: ${response.status}`);
        console.error(`Response: ${errorText}`);
        console.warn("⚠️ Stopping ticket fetch due to API failure.");
        break; // Exit the loop on failure
      }

      // Parse the response data
      let data: any;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("🔴 Failed to parse JSON response:", jsonError);
        console.warn("⚠️ Stopping ticket fetch due to JSON parsing error.");
        break; // Exit the loop on JSON parsing failure
      }

      const fetchedTickets: ZohoTicket[] = data.data || [];

      // If no tickets are fetched, exit the loop
      if (fetchedTickets.length === 0) {
        console.log("📄 No more tickets to fetch.");
        break;
      }

      // Add fetched tickets to the array
      tickets.push(...fetchedTickets);
      console.log(`✅ Fetched ${fetchedTickets.length} tickets.`);

      // Update the offset for the next batch
      offset += batchSize;
    }

    console.log(`📦 Total tickets fetched: ${tickets.length}`);
    return tickets;
  } catch (error: any) {
    console.error(`🔴 Error fetching Zoho tickets: ${error.message || error}`);
    console.warn("⚠️ Returning tickets fetched before the error occurred.");
    return tickets; // Return the tickets fetched so far
  }
};

// Function to fetch detailed thread information for a specific thread
const fetchThreadDetails = async (
  ticketId: string,
  threadId: string,
  accessToken: string,
  orgId: string
): Promise<ZohoThreadDetails | null> => {
  const threadDetailsUrl = `https://desk.zoho.in/api/v1/tickets/${ticketId}/threads/${threadId}`;
  try {
    const response = await fetch(threadDetailsUrl, {
      method: "GET",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        orgId: orgId,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `🔴 Failed to fetch details for Thread ID ${threadId}. Status: ${response.status}`
      );
      console.error(`Response: ${errorText}`);
      return null;
    }

    const threadDetails: ZohoThreadDetails = await response.json();
    return threadDetails;
  } catch (error: any) {
    console.error(
      `🔴 Error fetching details for Thread ID ${threadId}: ${error.message || error}`
    );
    return null;
  }
};

// Function to fetch threads/comments for a specific ticket and compile narrative
const fetchTicketThreads = async (
  ticketId: string,
  accessToken: string,
  orgId: string
): Promise<string> => {
  const threadsUrl = `https://desk.zoho.in/api/v1/tickets/${ticketId}/threads`;
  const comments: string[] = [];
  let apiCallCount = 0;

  try {
    const response = await fetch(threadsUrl, {
      method: "GET",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        orgId: orgId,
        "Content-Type": "application/json",
      },
    });

    // Increment API call counter
    apiCallCount += 1;
    console.log(
      `📞 API Call #${apiCallCount}: Fetching threads for Ticket ID ${ticketId} for Org ID ${orgId}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `🔴 Failed to fetch threads for Ticket ID ${ticketId}. Status: ${response.status}`
      );
      console.error(`Response: ${errorText}`);
      return "No threads available.";
    }

    const data = await response.json();
    const fetchedThreads: ZohoComment[] = data.data || [];

    if (fetchedThreads.length === 0) {
      console.log(`📄 No threads found for Ticket ID ${ticketId}.`);
      return "No threads available.";
    }

    // Fetch detailed thread information in parallel
    const detailedThreadsPromises = fetchedThreads.map(async (thread) => {
      const threadDetails = await fetchThreadDetails(
        ticketId,
        thread.id,
        accessToken,
        orgId // Pass orgId here
      );
      if (!threadDetails) {
        return null;
      }
      return threadDetails;
    });

    const detailedThreads = (await Promise.all(detailedThreadsPromises)).filter(
      (thread): thread is ZohoThreadDetails => thread !== null
    );

    // Compile threads into a narrative
    const narrative = detailedThreads
      .map((thread) => {
        const content = cleanHTMLContent(thread.content || "");
        const sender = thread.from?.name || "Unknown Sender";
        const threadType = thread.type || "Unknown Type";
        const createdTime = thread.createdTime || "Unknown Time";

        // Format createdTime
        let formattedTime = "Unknown Time";
        if (createdTime !== "Unknown Time") {
          try {
            const dateObj = new Date(createdTime);
            formattedTime = dateObj.toLocaleString();
          } catch {
            formattedTime = "Invalid Date";
          }
        }

        // Escape double quotes
        const safeContent = content.replace(/"/g, '""');

        // Compile narrative based on thread type
        if (threadType.toLowerCase() === "reply") {
          return `"${sender}" replied at ${formattedTime}: "${safeContent}"`;
        } else if (threadType.toLowerCase() === "comment") {
          return `Internal comment at ${formattedTime} by ${sender}: "${safeContent}"`;
        } else {
          return `System message at ${formattedTime}: "${safeContent}"`;
        }
      })
      .join("\n\n");

    console.log(
      `✅ Compiled threads narrative for Ticket ID ${ticketId}. Threads Count: ${detailedThreads.length}`
    );

    return narrative;
  } catch (error: any) {
    console.error(
      `🔴 Error fetching threads for Ticket ID ${ticketId}: ${error.message || error}`
    );
    return "No threads available.";
  }
};

// Updated Function to Generate Summary Using OpenRouter.ai
const getThreadSummary = async (threadNarrative: string): Promise<string> => {
  if (!threadNarrative || threadNarrative === "No threads available.") {
    return "No content to summarize.";
  }

  const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

  try {
    const prompt = `Please provide a concise summary of this support ticket conversation. Focus on the main issue, any solutions provided, and the current status. Here's the conversation:\n\n${threadNarrative}`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPEN_ROUTER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat", // Optional: Specify the model if needed
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        // You can add additional parameters here if required by OpenRouter.ai
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("🔴 OpenRouter.ai API error:", errorData);
      return "Error generating summary.";
    }

    const data = await response.json();

    // Adjust the parsing logic based on the actual response structure from OpenRouter.ai
    const summary = data.choices && data.choices[0] && data.choices[0].message.content
      ? data.choices[0].message.content
      : "Summary not available.";

    return summary.trim();

  } catch (error: any) {
    console.error("🔴 Error getting summary from OpenRouter.ai:", error.message || error);
    return "Error generating summary.";
  }
};

// Function to fetch the active Zoho credentials for a user
const getZohoCredentials = async (profileId: string): Promise<ZohoCredentials> => {
  const { data, error } = await supabase
    .from("zoho_credentials")
    .select("refresh_token, org_id")
    .eq("profile_id", profileId)
    .eq("status", "connected") // Assuming there's a 'status' field to indicate active credentials
    .single(); // Assuming one active credential per user

  if (error) {
    console.error("🔴 Error fetching Zoho credentials:", error.message);
    throw new Error("Failed to retrieve Zoho credentials.");
  }

  if (!data || !data.refresh_token || !data.org_id) {
    console.error("🔴 No active Zoho credentials found for the user.");
    throw new Error(
      "No active Zoho credentials found. Please connect your Zoho account."
    );
  }

  return {
    refresh_token: data.refresh_token,
    org_id: data.org_id,
  };
};

// Function to fetch all open tickets and insert them into Supabase
const fetchAndSaveTickets = async (req: Request): Promise<Response> => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Ensure the request method is POST
  if (req.method !== "POST") {
    console.warn("🔴 Invalid request method:", req.method);
    return new Response(
      JSON.stringify({ code: 405, message: "Method Not Allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  // Get the Authorization header
  const authHeader =
    req.headers.get("Authorization") || req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("🔴 Missing or invalid Authorization header");
    return new Response(
      JSON.stringify({
        code: 401,
        message: "Missing or invalid authorization header",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
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
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    user = data.user;
    console.log(`✅ Authenticated user: ${user.email} (ID: ${user.id})`);
  } catch (error: Error | unknown) {
    console.error(
      "🔴 Error authenticating user:",
      error instanceof Error ? error.message : "Authentication failed"
    );
    return new Response(
      JSON.stringify({ code: 500, message: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  const profileId = user.id;

  try {
    // Step 1: Retrieve Zoho credentials (including org_id) from the database
    const zohoCredentials = await getZohoCredentials(profileId);
    const refreshToken = zohoCredentials.refresh_token;
    const orgId = zohoCredentials.org_id;

    // Step 2: Refresh Zoho access token using the retrieved refresh token
    const accessToken = await refreshZohoAccessToken(refreshToken);

    // Step 3: Fetch open tickets from Zoho Desk with pagination and API call tracking
    const tickets = await fetchZohoOpenTickets(accessToken, orgId);
    console.log(`✅ Fetched ${tickets.length} open tickets from Zoho Desk.`);

    if (tickets.length === 0) {
      console.log("📄 No open tickets found.");
      return new Response(
        JSON.stringify({ message: "No open tickets found to sync." }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Step 4: Fetch comments/threads for all tickets
    const ticketRows: SupabaseTicket[] = await Promise.all(
      tickets.map(async (ticket) => {
        const threadNarrative = await fetchTicketThreads(
          ticket.id.toString(),
          accessToken,
          orgId // Pass orgId here
        );

        const summary = await getThreadSummary(threadNarrative);
        console.log(`✅ Generated summary for ticket ${ticket.id}`);

        return {
          profile_id: profileId,
          platform_connection_id: null, // Set this if relevant
          external_ticket_id: ticket.id.toString(),
          created_date: ticket.createdTime,
          resolved_date: ticket.closedTime || null,
          status: ticket.status,
          thread: threadNarrative,
          comments: ticket.subject || "No Subject",
          agent_id: ticket.assignee?.name || "Unassigned",
          customer_id: ticket.contactId || "Unknown",
          summary: summary,
          last_fetched_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      })
    );

    console.log("📦 Prepared ticket data for insertion into Supabase.");

    // Step 5: Insert data into Supabase
    const { error: insertError } = await supabase
      .from("tickets")
      .insert(ticketRows);

    if (insertError) {
      console.error(
        "🔴 Error inserting tickets into Supabase:",
        insertError.message
      );
      throw new Error("Failed to save tickets to the database.");
    }

    console.log("✅ Tickets successfully fetched and saved to Supabase.");
    return new Response(
      JSON.stringify({ message: "Tickets successfully fetched and saved to Supabase." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: Error | unknown) {
    console.error(
      "🔴 Error during ticket fetch and save process:",
      error instanceof Error ? error.message : error
    );
    return new Response(
      JSON.stringify({
        code: 500,
        message: error instanceof Error ? error.message : "Internal Server Error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Start the server with updated CORS headers
serve(async (req: Request) => {
  const response = await fetchAndSaveTickets(req);
  // Ensure CORS headers are always included
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", corsHeaders["Access-Control-Allow-Origin"]);
  headers.set(
    "Access-Control-Allow-Headers",
    corsHeaders["Access-Control-Allow-Headers"]
  );
  headers.set(
    "Access-Control-Allow-Methods",
    corsHeaders["Access-Control-Allow-Methods"]
  );

  return new Response(response.body, {
    status: response.status,
    headers: headers,
  });
});
