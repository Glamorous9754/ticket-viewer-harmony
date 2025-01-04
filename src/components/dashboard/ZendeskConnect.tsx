import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";

interface ApiError {
  message?: string;
  error?: string;
}

export const ZendeskConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTickets, setIsFetchingTickets] = useState(false);
  const [searchParams] = useSearchParams();
  const connectionStatus = searchParams.get('connection');

  useEffect(() => {
    if (connectionStatus === 'success') {
      toast({
        title: "Success",
        description: "Successfully connected to Zendesk!",
      });
      onSuccess();
    } else if (connectionStatus === 'error') {
      toast({
        title: "Error",
        description: "Failed to connect to Zendesk. Please try again.",
        variant: "destructive",
      });
    }
  }, [connectionStatus, toast, onSuccess]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.session?.user) {
        throw new Error("You must be logged in to connect Zendesk");
      }

      const { data, error } = await supabase.functions.invoke(
        "initiate-zendesk-oauth",
        {
          body: {}, // You can include additional data here if needed
        }
      );

      if (error) throw error;
      if (!data?.url) throw new Error("No authorization URL received");

      window.location.href = data.url;
    } catch (error: unknown) {
      console.error("Error initiating Zendesk OAuth:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 
          (error as ApiError).message || "Failed to start authentication",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleFetchTickets = async () => {
    setIsFetchingTickets(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("You must be logged in to fetch tickets");
      }

      const response = await fetch("http://sync-tickets.us-east-2.elasticbeanstalk.com/sync-zendesk-tickets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch tickets");
      }

      const data = await response.json();
      console.log("Fetch response:", data);

      toast({
        title: "Success",
        description: data.message || "Successfully synced Zendesk tickets!",
      });
    } catch (error: unknown) {
      console.error("Error fetching Zendesk tickets:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 
          (error as ApiError).message || "Failed to fetch tickets",
        variant: "destructive",
      });
    } finally {
      setIsFetchingTickets(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Connect Zendesk</h2>
      <p className="text-sm text-gray-600">
        Connect your Zendesk account to analyze your support tickets.
      </p>
      <div className="space-y-2">
        <Button 
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Connecting..." : "Connect with Zendesk"}
        </Button>

        <Button
          onClick={handleFetchTickets}
          disabled={isFetchingTickets}
          variant="outline"
          className="w-full"
        >
          {isFetchingTickets ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Fetching...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Fetch Tickets
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};