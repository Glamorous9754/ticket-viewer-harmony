import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { GmailConnect } from "./GmailConnect";
import { ZendeskConnect } from "./ZendeskConnect";
import { PlatformCard } from "./PlatformCard";
import { PlatformActions } from "./PlatformActions";
import { Platform } from "./types/platform";

interface ApiError {
  message?: string;
  error?: string;
}

export const PlatformSelector = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingPlatform, setSyncingPlatform] = useState<Platform>(null);
  const { toast } = useToast();
  const [authenticatedPlatform, setAuthenticatedPlatform] = useState<Platform>(() => {
    const stored = localStorage.getItem('authenticatedPlatform');
    return stored as Platform;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth_status');
    const platform = params.get('platform') as Platform;
    
    if (authStatus === 'success' && platform) {
      setIsAuthenticating(false);
      setSelectedPlatform(null);
      setAuthenticatedPlatform(platform);
      localStorage.setItem('authenticatedPlatform', platform);
    } else if (authStatus === 'error') {
      setIsAuthenticating(false);
      setSelectedPlatform(null);
      const errorMessage = params.get('error_message');
      console.error('Authentication failed:', errorMessage);
      localStorage.removeItem('authenticatedPlatform');
    }
    
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  useEffect(() => {
    if (authenticatedPlatform) {
      localStorage.setItem('authenticatedPlatform', authenticatedPlatform);
    } else {
      localStorage.removeItem('authenticatedPlatform');
    }
  }, [authenticatedPlatform]);

  const handleSuccess = () => {
    setIsAuthenticating(false);
    setSelectedPlatform(null);
  };

  const handleConnect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsAuthenticating(true);
  };

  const handleDisconnect = async (platform: Platform) => {
    try {
      setAuthenticatedPlatform(null);
      localStorage.removeItem('authenticatedPlatform');
      toast({
        title: "Platform Disconnected",
        description: `Successfully disconnected from ${platform}`,
      });
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect from platform",
        variant: "destructive",
      });
    }
  };

  const handleSync = async (platform: Platform) => {
    if (!platform || isSyncing) return;

    setIsSyncing(true);
    setSyncingPlatform(platform);

    // Show immediate toast notification about the sync process
    toast({
      title: "Sync Started",
      description: "Please wait for several minutes. Changes will be reflected in the dashboard once the process is complete.",
    });

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("You must be logged in to sync tickets");
      }

      const endpoints = {
        zoho: 'http://sync-tickets.us-east-2.elasticbeanstalk.com/sync-zoho-tickets',
        gmail: 'http://ticket-server.us-east-2.elasticbeanstalk.com/sync-gmail-tickets',
        zendesk: 'http://sync-tickets.us-east-2.elasticbeanstalk.com/sync-zendesk-tickets'
      };

      const endpoint = endpoints[platform];
      if (!endpoint) {
        throw new Error(`No endpoint configured for platform: ${platform}`);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to sync tickets");
      }

      const data = await response.json();
      console.log(`Sync response for ${platform}:`, data);

      if (data?.message) {
        toast({
          title: "Success",
          description: data.message || `Successfully initiated sync for ${platform} tickets!`,
        });
      } else {
        toast({
          title: "Warning",
          description: "Unexpected response from the server. The sync process has started but may take several minutes to complete.",
          variant: "warning",
        });
        console.warn("⚠️ Unexpected response structure:", data);
      }
    } catch (error) {
      console.error(`Failed to sync ${platform} tickets:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 
          (error as ApiError).message || `Failed to sync tickets from ${platform}`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
      setSyncingPlatform(null);
    }
  };

  if (selectedPlatform === "freshdesk") return <FreshDeskConnect onSuccess={handleSuccess} />;
  if (selectedPlatform === "zoho") return <ZohoConnect onSuccess={handleSuccess} />;
  if (selectedPlatform === "gmail") return <GmailConnect onSuccess={handleSuccess} />;
  if (selectedPlatform === "zendesk") return <ZendeskConnect onSuccess={handleSuccess} />;

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
      comingSoon: true,
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
          <PlatformCard
            key={platform.id}
            title={platform.name}
            description={platform.description}
            isConnected={authenticatedPlatform === platform.id}
            actions={
              <PlatformActions
                platform={platform.id}
                isConnected={authenticatedPlatform === platform.id}
                activePlatform={authenticatedPlatform}
                isSyncing={isSyncing && syncingPlatform === platform.id}
                isLoading={selectedPlatform}
                onConnect={handleConnect}
                onSync={handleSync}
                onDisconnect={handleDisconnect}
              />
            }
          />
        ))}
      </div>
    </div>
  );
};