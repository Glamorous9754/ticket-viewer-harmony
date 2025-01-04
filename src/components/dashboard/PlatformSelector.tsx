import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { GmailConnect } from "./GmailConnect";
import { ZendeskConnect } from "./ZendeskConnect";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Platform = "freshdesk" | "zoho" | "gmail" | "zendesk" | null;

interface PlatformConnection {
  platform_type: Platform;
  is_active: boolean;
}

export const PlatformSelector = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Platform[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnectedPlatforms();
  }, []);

  const fetchConnectedPlatforms = async () => {
    try {
      const { data: connections, error } = await supabase
        .from('platform_connections')
        .select('platform_type, is_active')
        .eq('is_active', true);

      if (error) throw error;

      const activePlatforms = connections
        .filter((conn: PlatformConnection) => conn.is_active)
        .map((conn: PlatformConnection) => conn.platform_type as Platform);

      setConnectedPlatforms(activePlatforms);
    } catch (error) {
      console.error('Error fetching platform connections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch platform connections",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth_status');
    const platform = params.get('platform') as Platform;
    
    if (authStatus === 'success' && platform) {
      setIsAuthenticating(false);
      setSelectedPlatform(null);
      fetchConnectedPlatforms(); // Refresh connections after successful auth
    } else if (authStatus === 'error') {
      setIsAuthenticating(false);
      setSelectedPlatform(null);
      const errorMessage = params.get('error_message');
      console.error('Authentication failed:', errorMessage);
    }
    
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  const handleSuccess = () => {
    setIsAuthenticating(false);
    setSelectedPlatform(null);
    fetchConnectedPlatforms(); // Refresh connections after success
  };

  const handleConnect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsAuthenticating(true);
  };

  const handleDisconnect = async (platform: Platform) => {
    try {
      const { error } = await supabase
        .from('platform_connections')
        .update({ is_active: false })
        .eq('platform_type', platform);

      if (error) throw error;

      await fetchConnectedPlatforms(); // Refresh connections after disconnect
      toast({
        title: "Success",
        description: "Platform disconnected successfully",
      });
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect platform",
        variant: "destructive",
      });
    }
  };

  const handleSyncTickets = (platform: string) => {
    toast({
      title: "Syncing Tickets",
      description: `Starting ticket synchronization for ${platform}...`,
    });
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

  const platforms = [
    {
      name: "Zoho Desk",
      id: "zoho" as Platform,
      description: "Connect your Zoho Desk account to analyze customer tickets",
    },
    {
      name: "FreshDesk",
      id: "freshdesk" as Platform,
      description: "Connect your FreshDesk account to analyze customer tickets",
    },
    {
      name: "Gmail",
      id: "gmail" as Platform,
      description: "Connect your Gmail account to analyze customer emails",
    },
    {
      name: "Zendesk",
      id: "zendesk" as Platform,
      description: "Connect your Zendesk account to analyze support tickets",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Connect Your Support Platform</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((platform) => (
          <Card key={platform.id} className="p-6">
            <h3 className="text-xl font-medium mb-4">{platform.name}</h3>
            <p className="text-gray-600 mb-4">{platform.description}</p>
            <div className="space-y-2">
              <Button
                onClick={() => 
                  connectedPlatforms.includes(platform.id)
                    ? handleDisconnect(platform.id)
                    : handleConnect(platform.id)
                }
                className="w-full"
                disabled={isAuthenticating && selectedPlatform !== platform.id || 
                         (connectedPlatforms.length > 0 && !connectedPlatforms.includes(platform.id))}
                variant={connectedPlatforms.includes(platform.id) ? "secondary" : "default"}
              >
                {connectedPlatforms.includes(platform.id)
                  ? "Disconnect" 
                  : `Connect ${platform.name}`}
              </Button>
              {connectedPlatforms.includes(platform.id) && (
                <Button
                  onClick={() => handleSyncTickets(platform.name)}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Tickets
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};