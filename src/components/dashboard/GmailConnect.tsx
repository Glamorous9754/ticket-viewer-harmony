import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export const GmailConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const { data: connection } = await supabase
      .from("platform_connections")
      .select("*")
      .eq("platform_type", "gmail")
      .single();

    setIsConnected(!!connection);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("You must be logged in to connect Gmail");
      }

      const { data, error } = await supabase.functions.invoke(
        "initiate-gmail-oauth",
        {
          body: {},
        }
      );

      if (error) throw error;
      if (!data?.url) throw new Error("No authorization URL received");

      window.location.href = data.url;
    } catch (error) {
      console.error("Error initiating Gmail OAuth:", error);
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
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("You must be logged in to sync emails");
      }

      const { data, error } = await supabase.functions.invoke(
        "sync-gmail-messages",
        {
          body: {},
        }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully synced Gmail messages!",
      });

      onSuccess();
    } catch (error) {
      console.error("Error syncing Gmail messages:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sync messages",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Connect Gmail</h2>
      <p className="text-sm text-gray-600">
        Connect your Gmail account to analyze your customer emails.
      </p>
      <Button 
        onClick={isConnected ? handleSync : handleConnect}
        disabled={isLoading || isSyncing}
        className="w-full"
      >
        {isLoading ? "Connecting..." : 
         isSyncing ? "Syncing..." : 
         isConnected ? "Sync Messages" : "Connect with Gmail"}
      </Button>
    </Card>
  );
};