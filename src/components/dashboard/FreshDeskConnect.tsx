import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";

export const FreshDeskConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTickets, setIsFetchingTickets] = useState(false);
  const [searchParams] = useSearchParams();
  const connectionStatus = searchParams.get('connection');

  useEffect(() => {
    if (connectionStatus === 'success') {
      toast({
        title: "Success",
        description: "Successfully connected to Freshdesk!",
      });
      onSuccess();
    } else if (connectionStatus === 'error') {
      toast({
        title: "Error",
        description: "Failed to connect to Freshdesk. Please try again.",
        variant: "destructive",
      });
    }
  }, [connectionStatus, toast, onSuccess]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("You must be logged in to connect Freshdesk");
      }

      const { data, error } = await supabase.functions.invoke(
        "initiate-freshdesk-oauth",
        {
          body: {},
        }
      );

      if (error) throw error;
      if (!data?.url) throw new Error("No authorization URL received");

      window.location.href = data.url;
    } catch (error) {
      console.error("Error initiating Freshdesk OAuth:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start authentication",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleFetchTickets = async () => {
    setIsFetchingTickets(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to fetch tickets");
      }

      // Get the connection ID for Freshdesk
      const { data: connections, error: connectionError } = await supabase
        .from('platform_connections')
        .select('id')
        .eq('profile_id', session.user.id)
        .eq('platform_type', 'freshdesk')
        .single();

      if (connectionError || !connections) {
        throw new Error("Freshdesk connection not found");
      }

      const { error } = await supabase.functions.invoke("sync-freshdesk-tickets", {
        body: { connectionId: connections.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully synced Freshdesk tickets!",
      });
    } catch (error) {
      console.error("Error fetching Freshdesk tickets:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch tickets",
        variant: "destructive",
      });
    } finally {
      setIsFetchingTickets(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Connect Freshdesk</h2>
      <p className="text-sm text-gray-600">
        Connect your Freshdesk account to analyze your support tickets.
      </p>
      <div className="space-y-2">
        <Button 
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Connecting..." : "Connect with Freshdesk"}
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