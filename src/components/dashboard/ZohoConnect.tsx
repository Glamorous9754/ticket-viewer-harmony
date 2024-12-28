import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";

export const ZohoConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [searchParams] = useSearchParams();
  const connectionStatus = searchParams.get('connection');

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (connectionStatus === 'success') {
      toast({
        title: "Success",
        description: "Successfully connected to Zoho!",
      });
      checkConnection();
      onSuccess();
    } else if (connectionStatus === 'error') {
      toast({
        title: "Error",
        description: "Failed to connect to Zoho. Please try again.",
        variant: "destructive",
      });
    }
  }, [connectionStatus, toast, onSuccess]);

  const checkConnection = async () => {
    const { data } = await supabase
      .from("zoho_credentials")
      .select("*")
      .eq("status", "active")
      .single();

    setIsConnected(!!data);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("You must be logged in to connect Zoho");
      }

      const { data, error } = await supabase.functions.invoke(
        "initiate-zoho-oauth",
        {
          body: {},
        }
      );

      if (error) throw error;
      if (!data?.url) throw new Error("No authorization URL received");

      window.location.href = data.url;
    } catch (error) {
      console.error("Error initiating Zoho OAuth:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-zoho-tickets");
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully synced Zoho tickets!",
      });
    } catch (error) {
      console.error("Error syncing Zoho tickets:", error);
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
      <h2 className="text-xl font-semibold">Connect Zoho</h2>
      <p className="text-sm text-gray-600">
        Connect your Zoho Desk account to analyze your support tickets.
      </p>
      <Button 
        onClick={isConnected ? handleSync : handleConnect}
        disabled={isLoading || isSyncing}
        className="w-full"
      >
        {isLoading ? "Connecting..." : 
         isSyncing ? "Syncing..." : 
         isConnected ? "Sync Zoho Tickets" : "Connect with Zoho"}
      </Button>
    </Card>
  );
};