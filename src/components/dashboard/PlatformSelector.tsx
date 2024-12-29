import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { GmailConnect } from "./GmailConnect";
import { ZendeskConnect } from "./ZendeskConnect";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Platform } from "./types/platform";
import { useSearchParams, useNavigate } from "react-router-dom";

const STORAGE_KEY = "authenticatedPlatform";

export const PlatformSelector = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [authenticatedPlatform, setAuthenticatedPlatform] = useState<Platform>(() => {
    return localStorage.getItem(STORAGE_KEY) as Platform;
  });
  const [isLoading, setIsLoading] = useState<Platform | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Handle localStorage persistence
  useEffect(() => {
    if (authenticatedPlatform) {
      localStorage.setItem(STORAGE_KEY, authenticatedPlatform);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [authenticatedPlatform]);

  // Handle URL parameters and authentication status
  useEffect(() => {
    const authStatus = searchParams.get("auth_status");
    const platform = searchParams.get("platform") as Platform;

    if (authStatus && platform) {
      if (authStatus === "success") {
        setAuthenticatedPlatform(platform);
        setSelectedPlatform(null);
        toast({
          title: "Connected",
          description: `Successfully connected to ${platform}`,
        });
      } else if (authStatus === "error") {
        const errorMessage = searchParams.get("error_message");
        console.error("Authentication failed:", errorMessage);
        localStorage.removeItem(STORAGE_KEY);
        setAuthenticatedPlatform(null);
        toast({
          title: "Error",
          description: errorMessage || "Failed to authenticate",
          variant: "destructive",
        });
      }

      // Clean up URL parameters
      navigate("/profile/integrations", { replace: true });
    }
  }, [searchParams, toast, navigate]);

  const handleConnect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsLoading(platform);
  };

  const handleDisconnect = async (platform: Platform) => {
    try {
      setIsLoading(platform);
      const { error } = await supabase.functions.invoke(`logout_${platform}`);
      if (error) throw error;

      setAuthenticatedPlatform(null);
      localStorage.removeItem(STORAGE_KEY);
      toast({ 
        title: "Disconnected", 
        description: `Successfully disconnected from ${platform}` 
      });
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
      toast({ 
        title: "Error", 
        description: `Failed to disconnect from ${platform}`, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleFetchTickets = async (platform: Platform) => {
    try {
      setIsSyncing(true);
      const { error } = await supabase.functions.invoke(`sync_${platform}_tickets`);
      if (error) throw error;

      toast({ 
        title: "Success", 
        description: `Successfully fetched tickets for ${platform}` 
      });
    } catch (error) {
      console.error(`Error fetching tickets for ${platform}:`, error);
      toast({ 
        title: "Error", 
        description: `Failed to fetch tickets for ${platform}`, 
        variant: "destructive" 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const platforms = [
    { 
      name: "Zoho Desk", 
      id: "zoho" as Platform, 
      description: "Connect your Zoho Desk account to analyze customer tickets" 
    },
    { 
      name: "FreshDesk", 
      id: "freshdesk" as Platform, 
      description: "Connect your FreshDesk account to analyze customer tickets", 
      comingSoon: true 
    },
    { 
      name: "Gmail", 
      id: "gmail" as Platform, 
      description: "Connect your Gmail account to analyze customer emails" 
    },
    { 
      name: "Zendesk", 
      id: "zendesk" as Platform, 
      description: "Connect your Zendesk account to analyze support tickets" 
    },
  ];

  // Render platform-specific connect components
  if (selectedPlatform === "freshdesk") {
    return <FreshDeskConnect onSuccess={() => setAuthenticatedPlatform("freshdesk")} />;
  }
  if (selectedPlatform === "zoho") {
    return <ZohoConnect onSuccess={() => setAuthenticatedPlatform("zoho")} />;
  }
  if (selectedPlatform === "gmail") {
    return <GmailConnect onSuccess={() => setAuthenticatedPlatform("gmail")} />;
  }
  if (selectedPlatform === "zendesk") {
    return <ZendeskConnect onSuccess={() => setAuthenticatedPlatform("zendesk")} />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Connect Your Support Platform</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((platform) => (
          <Card key={platform.id} className="p-6">
            <h3 className="text-xl font-medium mb-4">{platform.name}</h3>
            <p className="text-gray-600 mb-4">{platform.description}</p>
            {platform.comingSoon ? (
              <Button className="w-full" disabled variant="secondary">
                Coming Soon
              </Button>
            ) : (
              <>
                <Button
                  onClick={() =>
                    authenticatedPlatform === platform.id
                      ? handleDisconnect(platform.id)
                      : handleConnect(platform.id)
                  }
                  className="w-full"
                  disabled={
                    isLoading === platform.id ||
                    (authenticatedPlatform && authenticatedPlatform !== platform.id)
                  }
                  variant={authenticatedPlatform === platform.id ? "destructive" : "default"}
                >
                  {isLoading === platform.id
                    ? "Processing..."
                    : authenticatedPlatform === platform.id
                    ? "Disconnect"
                    : `Connect ${platform.name}`}
                </Button>
                {authenticatedPlatform === platform.id && (
                  <Button
                    onClick={() => handleFetchTickets(platform.id)}
                    className="w-full mt-4"
                    disabled={isSyncing}
                  >
                    {isSyncing ? "Syncing..." : "Fetch Tickets"}
                  </Button>
                )}
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};