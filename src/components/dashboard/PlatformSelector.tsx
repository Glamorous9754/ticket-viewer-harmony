import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Link2Off } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Platform } from "./types/platform";

export const PlatformSelector = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<Platform>(null);
  const [isFetchingTickets, setIsFetchingTickets] = useState(false);
  const [searchParams] = useSearchParams();
  const [authenticatedPlatform, setAuthenticatedPlatform] = useState<Platform>(() => {
    const stored = localStorage.getItem('authenticatedPlatform');
    return stored as Platform || null;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth_status');
    const platform = params.get('platform') as Platform;
    
    if (authStatus === 'success' && platform) {
      setIsLoading(null);
      setAuthenticatedPlatform(platform);
      localStorage.setItem('authenticatedPlatform', platform);
      toast({
        title: "Success",
        description: `Successfully connected to ${platform}!`,
      });
    } else if (authStatus === 'error') {
      setIsLoading(null);
      const errorMessage = params.get('error_message');
      console.error('Authentication failed:', errorMessage);
      localStorage.removeItem('authenticatedPlatform');
      toast({
        title: "Error",
        description: "Failed to connect. Please try again.",
        variant: "destructive",
      });
    }
    
    window.history.replaceState({}, '', window.location.pathname);
  }, [toast]);

  const handleConnect = async (platform: Platform) => {
    setIsLoading(platform);
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.session?.user) {
        throw new Error("You must be logged in to connect platforms");
      }

      let functionName = '';
      switch (platform) {
        case 'freshdesk':
          functionName = 'initiate-freshdesk-oauth';
          break;
        case 'zoho':
          functionName = 'initiate-zoho-oauth';
          break;
        case 'gmail':
          functionName = 'initiate-google-oauth';
          break;
        case 'zendesk':
          functionName = 'initiate-zendesk-oauth';
          break;
        default:
          throw new Error("Invalid platform");
      }

      const { data, error } = await supabase.functions.invoke(functionName);

      if (error) throw error;
      if (!data?.url) throw new Error("No authorization URL received");

      window.location.href = data.url;
    } catch (error) {
      console.error(`Error initiating ${platform} OAuth:`, error);
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
        description: `Successfully disconnected from ${platform}!`,
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

  const handleFetchData = async (platform: Platform) => {
    setIsFetchingTickets(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error("Failed to fetch session: " + sessionError.message);
      }

      if (!sessionData?.session?.access_token) {
        throw new Error("You must be logged in to fetch data.");
      }

      let endpoint = '';
      switch (platform) {
        case 'zoho':
          endpoint = 'https://topaitools.pro/sync-zoho-tickets';
          break;
        case 'zendesk':
          endpoint = 'https://topaitools.pro/sync-zendesk-tickets';
          break;
        case 'gmail':
          endpoint = 'https://topaitools.pro/sync-gmail-tickets';
          break;
        default:
          throw new Error("Invalid platform for fetching data");
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to sync ${platform} data.`);
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: data.message || `Successfully synced ${platform} data!`,
      });
    } catch (error: any) {
      console.error(`Error fetching ${platform} data:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch data.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingTickets(false);
    }
  };

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
                  authenticatedPlatform === platform.id 
                    ? handleDisconnect(platform.id)
                    : handleConnect(platform.id)
                }
                className="w-full"
                disabled={isLoading !== null || 
                         (authenticatedPlatform && authenticatedPlatform !== platform.id)}
                variant={authenticatedPlatform === platform.id ? "destructive" : "default"}
              >
                {isLoading === platform.id ? (
                  "Connecting..."
                ) : authenticatedPlatform === platform.id ? (
                  <>
                    <Link2Off className="mr-2 h-4 w-4" />
                    Disconnect
                  </>
                ) : (
                  `Connect ${platform.name}`
                )}
              </Button>

              {authenticatedPlatform === platform.id && (
                <Button
                  onClick={() => handleFetchData(platform.id)}
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
                      {platform.id === 'gmail' ? 'Fetch Emails' : 'Fetch Tickets'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
