import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { GmailConnect } from "./GmailConnect";
import { ZendeskConnect } from "./ZendeskConnect";
import { PlatformCard } from "./PlatformCard";
import { PlatformActions } from "./PlatformActions";
import { Platform } from "./types/platform";
import { ZohoConnect } from "./ZohoConnect";

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
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${platform}`,
      });
    } else if (authStatus === 'error') {
      setIsAuthenticating(false);
      setSelectedPlatform(null);
      const errorMessage = params.get('error_message');
      console.error('Authentication failed:', errorMessage);
      localStorage.removeItem('authenticatedPlatform');
      toast({
        title: "Connection Failed",
        description: errorMessage || "Failed to connect to platform",
        variant: "destructive",
      });
    }
    
    window.history.replaceState({}, '', window.location.pathname);
  }, [toast]);

  useEffect(() => {
    if (authenticatedPlatform) {
      localStorage.setItem('authenticatedPlatform', authenticatedPlatform);
    } else {
      localStorage.removeItem('authenticatedPlatform');
    }
  }, [authenticatedPlatform]);

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

  const handleSuccess = () => {
    setIsAuthenticating(false);
    setSelectedPlatform(null);
  };

  const handleConnect = async (platform: Platform) => {
    if (platform === 'zoho') {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error("You must be logged in to connect to Zoho");
        }

        const response = await fetch("https://iedlbysyadijjcpwgbvd.supabase.co/functions/v1/initiate-zoho-oauth", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to initiate Zoho connection");
        }

        const data = await response.json();
        
        if (data.status === "connected") {
          // If already connected, update local state
          setAuthenticatedPlatform("zoho");
          toast({
            title: "Already Connected",
            description: "Your Zoho account is already connected",
          });
          return;
        }

        // If not connected, redirect to Zoho OAuth URL
        if (data.url) {
          setSelectedPlatform(platform);
          setIsAuthenticating(true);
          window.location.href = data.url;
        } else {
          throw new Error("No authorization URL received");
        }
      } catch (error) {
        console.error("Failed to connect to Zoho:", error);
        toast({
          title: "Connection Failed",
          description: error instanceof Error ? error.message : "Failed to connect to Zoho",
          variant: "destructive",
        });
        setIsAuthenticating(false);
      }
    } else {
      setSelectedPlatform(platform);
      setIsAuthenticating(true);
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    try {
      if (platform === 'zoho') {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error("You must be logged in to disconnect from Zoho");
        }

        // Clear local state first
        setAuthenticatedPlatform(null);
        localStorage.removeItem('authenticatedPlatform');

        // Update database - using 'invalid' status instead of 'disconnected'
        const { error } = await supabase
          .from('zoho_credentials')
          .update({ status: 'invalid' })
          .eq('profile_id', session.user.id);

        if (error) throw error;

        toast({
          title: "Platform Disconnected",
          description: `Successfully disconnected from ${platform}`,
        });
      } else {
        setAuthenticatedPlatform(null);
        localStorage.removeItem('authenticatedPlatform');
        toast({
          title: "Platform Disconnected",
          description: `Successfully disconnected from ${platform}`,
        });
      }
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

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("You must be logged in to sync tickets");
      }

      let syncEndpoint = "";
      switch (platform) {
        case "zoho":
          syncEndpoint = "http://sync-tickets.us-east-2.elasticbeanstalk.com/sync-zoho-tickets";
          break;
        case "gmail":
          syncEndpoint = "http://ticket-server.us-east-2.elasticbeanstalk.com/sync-gmail-tickets";
          break;
        case "zendesk":
          syncEndpoint = "http://sync-tickets.us-east-2.elasticbeanstalk.com/sync-zendesk-tickets";
          break;
        default:
          throw new Error("Invalid platform");
      }

      const response = await fetch(syncEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to sync tickets");
      }

      const data = await response.json();
      console.log(`${platform} sync response:`, data);

      toast({
        title: "Sync Complete",
        description: `Successfully synced tickets from ${platform}`,
      });
    } catch (error) {
      console.error(`Failed to sync ${platform} tickets:`, error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : `Failed to sync tickets from ${platform}`,
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

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl sm:text-2xl font-semibold">Connect Your Support Platform</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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