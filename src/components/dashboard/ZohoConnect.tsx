import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/lib/hooks/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ZohoConnectProps {
  onSuccess?: () => void;
}

export const ZohoConnect = ({ onSuccess }: ZohoConnectProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingTickets, setIsFetchingTickets] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      // Logic to check if connected to Zoho
      // Simulating an API call
      const response = await fetch('/api/check-zoho-connection');
      const data = await response.json();
      setIsConnected(data.isConnected);
      setIsLoading(false);
    };

    checkConnection();
  }, [user, toast]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // Logic to connect to Zoho
      const response = await fetch('/api/connect-zoho', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "Successfully connected to Zoho Desk.",
        });
        if (onSuccess) onSuccess();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to Zoho Desk.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      // Logic to disconnect from Zoho
      const response = await fetch('/api/disconnect-zoho', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setIsConnected(false);
        toast({
          title: "Disconnected",
          description: "Successfully disconnected from Zoho Desk.",
        });
        if (onSuccess) onSuccess();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect from Zoho Desk.",
        variant: "destructive",
      });
    } finally {
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

      const response = await fetch("http://sync-tickets.us-east-2.elasticbeanstalk.com/sync-zoho-tickets", {
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
        description: data.message || "Successfully synced Zoho tickets!",
      });
    } catch (error) {
      console.error("Error fetching Zoho tickets:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch tickets",
        variant: "destructive",
      });
    } finally {
      setIsFetchingTickets(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Zoho Desk Integration</CardTitle>
        <CardDescription>
          Connect your Zoho Desk account to import and analyze support tickets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-2">
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              className="w-full"
            >
              Disconnect from Zoho
            </Button>
            <Button
              variant="outline"
              onClick={handleFetchTickets}
              disabled={isFetchingTickets}
              className="w-full"
            >
              {isFetchingTickets ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Tickets
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            onClick={handleConnect}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Connect to Zoho
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
