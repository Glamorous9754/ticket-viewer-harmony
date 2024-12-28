import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";

export const ZendeskConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [searchParams] = useSearchParams();
  const connectionStatus = searchParams.get('connection');

  useEffect(() => {
    if (connectionStatus === 'success') {
      toast({
        title: "Success",
        description: "Successfully connected to Zendesk!",
      });
      setIsConnected(true);
      onSuccess();
    } else if (connectionStatus === 'error') {
      toast({
        title: "Error",
        description: "Failed to connect to Zendesk. Please try again.",
        variant: "destructive",
      });
    }
    checkConnection();
  }, [connectionStatus, toast, onSuccess]);

  const checkConnection = async () => {
    const { data: connection } = await supabase
      .from("platform_connections")
      .select("*")
      .eq("platform_type", "zendesk")
      .single();

    setIsConnected(!!connection);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("You must be logged in to connect Zendesk");
      }

      const { data, error } = await supabase.functions.invoke(
        "initiate-zendesk-oauth",
        {
          body: {},
        }
      );

      if (error) throw error;
      if (!data?.url) throw new Error("No authorization URL received");

      window.location.href = data.url;
    } catch (error) {
      console.error("Error initiating Zendesk OAuth:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start authentication",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("You must be logged in to sync tickets");
      }

      const { data, error } = await supabase.functions.invoke(
        "sync-zendesk-tickets",
        {
          body: {},
        }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully synced Zendesk tickets!",
      });

      onSuccess();
    } catch (error) {
      console.error("Error syncing Zendesk tickets:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sync tickets",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Connect Zendesk</h2>
      <p className="text-sm text-gray-600">
        Connect your Zendesk account to analyze your support tickets.
      </p>
      <Button 
        onClick={isConnected ? handleSync : handleConnect}
        disabled={isLoading || isSyncing}
        className="w-full"
      >
        {isLoading ? "Connecting..." : 
         isSyncing ? "Syncing..." : 
         isConnected ? "Sync Tickets" : "Connect with Zendesk"}
      </Button>
    </Card>
  );
};