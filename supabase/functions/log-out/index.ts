import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/dotenv/load.ts";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req: Request) => {
  // 1. Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("OPTIONS preflight request received");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Request received:", req.method);

    // 2. Read environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error("🔴 Missing Supabase credentials.");
      throw new Error("Missing Supabase credentials.");
    }

    // 3. Create a "User Auth" client with the anon key to verify the user's JWT
    //    We pass the user's token from 'Authorization' header so that
    //    supabaseClient.auth.getUser() knows which user to look up.
    const authHeader = req.headers.get("Authorization") || "";
    console.log("Using auth header:", authHeader);

    const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader, // pass the user's token for getUser()
        },
      },
    });

    // 4. Check if there's a valid user session
    console.log("Retrieving authenticated user via supabaseAuthClient...");
    const {
      data: { user },
      error: authError,
    } = await supabaseAuthClient.auth.getUser();

    if (authError || !user) {
      console.error("User authentication failed:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("Authenticated user:", user.id);

    // 5. Parse the request body to see which platform we are disconnecting
    console.log("Parsing request body...");
    const reqBody = await req.json();
    const { platform } = reqBody;
    if (!platform) {
      console.error("Platform not provided in request body");
      return new Response(
        JSON.stringify({ error: "Missing platform in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    console.log("Platform to disconnect:", platform);

    // 6. Create a "Service Role" client to perform the privileged delete operation
    console.log("Initializing service role client...");
    const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);

    // 7. Map the platform to its respective table
    let tableName: string | null = null;
    switch (platform) {
      case "zoho":
        tableName = "zoho_credentials";
        break;
      case "gmail":
        tableName = "gmail_credentials";
        break;
      case "zendesk":
        tableName = "zendesk_credentials";
        break;
      // Add more if needed
      default:
        console.error("Unknown or unsupported platform:", platform);
        return new Response(
          JSON.stringify({ error: "Unknown or unsupported platform." }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    // 8. Attempt to delete the row for the user from the mapped table
    console.log(
      `Deleting credentials from table '${tableName}' for user ID '${user.id}'`
    );
    const { error: deleteError } = await supabaseServiceClient
      .from(tableName)
      .delete()
      .eq("profile_id", user.id);

    if (deleteError) {
      console.error("Delete operation failed:", deleteError);
      throw deleteError;
    }
    console.log("Delete operation successful");

    // 9. Return success response
    const response = new Response(
      JSON.stringify({ message: `Successfully disconnected from ${platform}` }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    console.log("Returning success response");
    return response;
  } catch (error) {
    console.error("Error in disconnect edge function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
