import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Platform } from "./types/platform";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Link2Off } from "lucide-react";

type PlatformInfo = {
  name: string;
  id: Platform;
  description: string;
};

export const PlatformSelector = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<Platform | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authenticatedPlatform, setAuthenticatedPlatform] = useState<Platform>(() => {
    const stored = localStorage.getItem('authenticatedPlatform');
    return stored as Platform;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth_status');
    const platform = params.get('platform') as Platform;
    
    if (authStatus === 'success' && platform) {
      setAuthenticatedPlatform(platform);
      localStorage.setItem('authenticatedPlatform', platform);
      toast({
        title: "Success",
        description: `Successfully connected to ${platform}!`,
      });
    } else if (authStatus === 'error') {
      const errorMessage = params.get('error_message');
      console.error('Authentication failed:', errorMessage);
      toast({
        title: "Error",
        description: "Authentication failed. Please try again.",
        variant: "destructive",
      });
      localStorage.removeItem('authenticatedPlatform');
    }
    
    window.history.replaceState({}, '', window.location.pathname);
  }, [toast]);

  const handleConnect = async (platform: Platform) => {
    setIsLoading(platform);
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.session?.user) {
        throw new Error("You must be logged in to connect a platform");
      }

      const functionName = `initiate-${platform}-oauth`;
      const { data, error } = await supabase.functions.invoke(functionName);

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start authentication",
        variant: "destructive",
      });
      setIsLoading(null);
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    try {
      setAuthenticatedPlatform(null);
      localStorage.removeItem('authenticatedPlatform');
      toast({
        title: "Success",
        description: `Disconnected from ${platform}`,
      });
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSync = async (platform: Platform) => {
    setIsSyncing(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("You must be logged in to fetch data");
      }

      let endpoint = '';
      if (platform === 'zoho_desk') {
        endpoint = 'http://zoho-server-env.eba-hsu363pe.us-east-2.elasticbeanstalk.com/sync-zoho-tickets';
      } else {
        endpoint = `http://ticket-server.us-east-2.elasticbeanstalk.com/sync-${platform}-tickets`;
      }

      toast({
        title: "Info",
        description: `Please wait while we fetch the ${platform === 'gmail' ? 'emails' : 'tickets'} for you. They will automatically be updated inside the dashboard.`,
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to sync ${platform}`);
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: data.message || `Successfully synced ${platform === 'gmail' ? 'emails' : 'tickets'}!`,
      });
    } catch (error) {
      console.error(`Error syncing ${platform}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sync data",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const platforms: PlatformInfo[] = [
    {
      name: "Zoho Desk",
      id: "zoho_desk",
      description: "Connect your Zoho Desk account to analyze customer tickets",
    },
    {
      name: "Gmail",
      id: "gmail",
      description: "Connect your Gmail account to analyze customer emails",
    },
    {
      name: "Zendesk",
      id: "zendesk",
      description: "Connect your Zendesk account to analyze support tickets",
    },
    {
      name: "Freshdesk",
      id: "freshdesk",
      description: "Connect your FreshDesk account to analyze customer tickets",
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
              {authenticatedPlatform === platform.id ? (
                <>
                  <Button
                    onClick={() => handleDisconnect(platform.id)}
                    variant="destructive"
                    disabled={isLoading === platform.id}
                    className="w-full"
                  >
                    <Link2Off className="mr-2 h-4 w-4" />
                    {isLoading === platform.id ? "Disconnecting..." : "Disconnect"}
                  </Button>
                  <Button
                    onClick={() => handleSync(platform.id)}
                    variant="outline"
                    disabled={isSyncing}
                    className="w-full"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : `Fetch ${platform.id === 'gmail' ? 'Emails' : 'Tickets'}`}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handleConnect(platform.id)}
                  disabled={!!authenticatedPlatform || isLoading === platform.id || platform.id === 'freshdesk'}
                  className="w-full"
                >
                  {platform.id === 'freshdesk' ? 'Coming Soon' : 
                    isLoading === platform.id ? 'Connecting...' : `Connect ${platform.name}`}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};