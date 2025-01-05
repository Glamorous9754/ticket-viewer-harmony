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

      if (error) {
        throw new Error(typeof error === "string" ? error : error.message || "Failed to initiate OAuth");
      }

      if (data?.url) {
        console.log("🔗 Redirecting to Zendesk OAuth URL:", data.url);
        window.location.href = data.url;
        return;
      } else if (data?.redirect_url && data?.query_params) {
        const redirectUrl = new URL(data.redirect_url);
        Object.entries(data.query_params).forEach(([key, value]) => {
          redirectUrl.searchParams.set(key, String(value));
        });
        const fullRedirectUrl = redirectUrl.toString();
        console.log("🔗 Redirecting to constructed URL:", fullRedirectUrl);
        window.location.href = fullRedirectUrl;
        return;
      } else {
        toast({
          title: "Error",
          description: "Unexpected response from the server. Please try again.",
          variant: "destructive",
        });
        console.warn("⚠️ Unexpected response structure:", data);
      }
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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error("Failed to fetch session: " + sessionError.message);
      }

      if (!sessionData?.session?.access_token) {
        throw new Error("You must be logged in to fetch tickets.");
      }

      const response = await fetch('http://ticket-server.us-east-2.elasticbeanstalk.com/sync-zoho-tickets/sync-zendesk-tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(typeof errorData.message === 'string' ? errorData.message : "Failed to sync Zendesk tickets.");
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: typeof data.message === 'string' ? data.message : "Successfully synced Zendesk tickets!",
      });
    } catch (error: any) {
      console.error("Error fetching Zendesk tickets:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch tickets.",
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