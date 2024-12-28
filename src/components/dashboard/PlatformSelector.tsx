import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { GmailConnect } from "./GmailConnect";
import { ZendeskConnect } from "./ZendeskConnect";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type Platform = "freshdesk" | "zoho" | "gmail" | "zendesk" | null;

type ConnectionStatus = {
  freshdesk: any | null;
  gmail: any | null;
  zoho: any | null;
  zendesk: any | null;
};

export const PlatformSelector = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    freshdesk: null,
    gmail: null,
    zoho: null,
    zendesk: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check platform_connections table for existing connections
      const { data: connections, error } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('profile_id', session.user.id);

      if (error) throw error;

      const status: ConnectionStatus = {
        freshdesk: null,
        gmail: null,
        zoho: null,
        zendesk: null,
      };

      connections?.forEach(connection => {
        status[connection.platform_type as keyof ConnectionStatus] = connection;
      });

      setConnectionStatus(status);
      console.log("Connection status:", status);
    } catch (error) {
      console.error("Error checking connections:", error);
    }
  };

  const handleSuccess = () => {
    setSelectedPlatform(null);
    checkConnections();
  };

  const handleSync = async (platform: Platform) => {
    if (!platform) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke(`sync-${platform}-tickets`);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully synced ${platform} tickets!`,
      });
    } catch (error) {
      console.error(`Error syncing ${platform} tickets:`, error);
      toast({
        title: "Error",
        description: `Failed to sync ${platform} tickets. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedPlatform === "freshdesk") {
    return <FreshDeskConnect onSuccess={handleSuccess} />;
  }

  if (selectedPlatform === "zoho") {
    return <ZohoConnect onSuccess={handleSuccess} />;
  }

  if (selectedPlatform === "gmail") {
    return <GmailConnect onSuccess={handleSuccess} />;
  }

  if (selectedPlatform === "zendesk") {
    return <ZendeskConnect onSuccess={handleSuccess} />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Connect Your Support Platform</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Zoho Desk</h3>
          <p className="text-gray-600 mb-4">
            Connect your Zoho Desk account to analyze customer tickets
          </p>
          {connectionStatus.zoho ? (
            <Button 
              onClick={() => handleSync("zoho")}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Syncing..." : "Sync Zoho Tickets"}
            </Button>
          ) : (
            <Button 
              onClick={() => setSelectedPlatform("zoho")}
              className="w-full"
            >
              Connect Zoho Desk
            </Button>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">FreshDesk</h3>
          <p className="text-gray-600 mb-4">
            Connect your FreshDesk account to analyze customer tickets
          </p>
          {connectionStatus.freshdesk ? (
            <Button 
              onClick={() => handleSync("freshdesk")}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Syncing..." : "Sync Freshdesk Tickets"}
            </Button>
          ) : (
            <Button 
              onClick={() => setSelectedPlatform("freshdesk")}
              className="w-full"
            >
              Connect FreshDesk
            </Button>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Gmail</h3>
          <p className="text-gray-600 mb-4">
            Connect your Gmail account to analyze customer emails
          </p>
          {connectionStatus.gmail ? (
            <Button 
              onClick={() => handleSync("gmail")}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Syncing..." : "Sync Gmail Tickets"}
            </Button>
          ) : (
            <Button 
              onClick={() => setSelectedPlatform("gmail")}
              className="w-full"
            >
              Connect Gmail
            </Button>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Zendesk</h3>
          <p className="text-gray-600 mb-4">
            Connect your Zendesk account to analyze support tickets
          </p>
          {connectionStatus.zendesk ? (
            <Button 
              onClick={() => handleSync("zendesk")}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Syncing..." : "Sync Zendesk Tickets"}
            </Button>
          ) : (
            <Button 
              onClick={() => setSelectedPlatform("zendesk")}
              className="w-full"
            >
              Connect Zendesk
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};