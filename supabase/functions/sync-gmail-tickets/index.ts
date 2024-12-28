import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchGmailThreads(accessToken: string) {
  console.log("Fetching Gmail threads...");
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads?q=in:inbox`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error fetching threads:", errorText);
    throw new Error(`Failed to fetch threads: ${errorText}`);
  }

  const data = await response.json();
  return data.threads || [];
}

async function fetchThreadDetails(threadId: string, accessToken: string) {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch thread details: ${await response.text()}`);
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the user's session from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Fetch Gmail credentials
    const { data: credentials, error: credentialsError } = await supabase
      .from("gmail_credentials")
      .select("*")
      .eq("profile_id", user.id)
      .eq("status", "active")
      .single();

    if (credentialsError || !credentials) {
      throw new Error("Gmail credentials not found");
    }

    // Fetch threads from Gmail
    const threads = await fetchGmailThreads(credentials.access_token);
    console.log(`Found ${threads.length} threads`);

    // Process each thread
    const processedThreads = await Promise.all(
      threads.slice(0, 50).map(async (thread: any) => {
        const threadDetails = await fetchThreadDetails(thread.id, credentials.access_token);
        const messages = threadDetails.messages || [];
        const firstMessage = messages[0];
        const lastMessage = messages[messages.length - 1];

        return {
          profile_id: user.id,
          platform_connection_id: credentials.id,
          external_ticket_id: thread.id,
          created_date: new Date(parseInt(firstMessage.internalDate)).toISOString(),
          resolved_date: null,
          status: "Open",
          thread: messages.map((msg: any) => msg.snippet).join("\n"),
          customer_id: firstMessage.from?.emailAddress,
          summary: firstMessage.subject || "No subject",
          last_fetched_at: new Date().toISOString(),
        };
      })
    );

    // Upsert threads into tickets table
    const { error: upsertError } = await supabase
      .from("tickets")
      .upsert(processedThreads, {
        onConflict: "platform_connection_id,external_ticket_id",
      });

    if (upsertError) {
      throw upsertError;
    }

    // Update last_fetched_at for the Gmail credentials
    await supabase
      .from("gmail_credentials")
      .update({ last_fetched_at: new Date().toISOString() })
      .eq("id", credentials.id);

    return new Response(
      JSON.stringify({ success: true, count: processedThreads.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in sync-gmail-tickets:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});