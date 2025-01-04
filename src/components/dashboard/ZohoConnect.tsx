import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlatformCard } from "./PlatformCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ApiError {
  message: string;
}

export const ZohoConnect = () => {
  const [isFetchingTickets, setIsFetchingTickets] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("You must be logged in to connect to Zoho");
      }

      // Initiate Zoho OAuth flow
      const response = await fetch(
        "https://iedlbysyadijjcpwgbvd.supabase.co/functions/v1/initiate-zoho-oauth",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to initiate Zoho connection");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error connecting to Zoho:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect to Zoho",
        variant: "destructive",
      });
    }
  };

  const handleFetchTickets = async () => {
    setIsFetchingTickets(true);
    try {
      // 1. Retrieve the current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("You must be logged in to fetch tickets");
      }

      // 2. Call your Express API
      const response = await fetch("http://ticket-server.us-east-2.elasticbeanstalk.com/sync-zoho-tickets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch tickets");
      }

      // 3. Handle JSON response from the Express server
      const data = await response.json();
      console.log("Fetch response:", data);

      if (data?.message) {
        toast({
          title: "Success",
          description: data.message || "Successfully synced Zoho tickets!",
        });
      } else {
        toast({
          title: "Warning",
          description: "Unexpected response from the server. Please try again.",
          variant: "warning",
        });
        console.warn("⚠️ Unexpected response structure:", data);
      }
    } catch (error: unknown) {
      console.error("Error fetching Zoho tickets:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : (error as ApiError).message || "Failed to fetch tickets",
        variant: "destructive",
      });
    } finally {
      setIsFetchingTickets(false);
    }
  };

  return (
    <PlatformCard
      title="Zoho"
      description="Connect your Zoho account to sync support tickets"
      isConnected={false}
      actions={
        <div className="space-y-2">
          <Button onClick={handleConnect} className="w-full">
            Connect Zoho
          </Button>
          <Button 
            onClick={handleFetchTickets} 
            className="w-full"
            disabled={isFetchingTickets}
          >
            {isFetchingTickets ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing Tickets...
              </>
            ) : (
              'Sync Tickets'
            )}
          </Button>
        </div>
      }
    />
  );
};