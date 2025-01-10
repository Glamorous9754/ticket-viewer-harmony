import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user ID from request
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      req.headers.get("Authorization")?.split(" ")[1] ?? ""
    );

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Fetch tickets for the authenticated user
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select("external_ticket_id, web_url, summary")
      .eq("profile_id", user.id)
      .order("created_date", { ascending: false })
      .limit(500);

    if (ticketsError) {
      console.error("Error fetching tickets:", ticketsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch tickets" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Format ticket data
    const formattedTickets = tickets
      .map(ticket => 
        `[${ticket.external_ticket_id}](${ticket.web_url}): ${ticket.summary}`
      )
      .join("\n\n");

    return new Response(
      JSON.stringify({ ticketContext: formattedTickets }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});