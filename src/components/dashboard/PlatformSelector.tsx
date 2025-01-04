import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Platform } from "./types/platform";
import { PlatformCard } from "./PlatformCard";
import { PlatformActions } from "./PlatformActions";
import { supabase } from "@/integrations/supabase/client";

export const PlatformSelector = () => {
  const [isLoading, setIsLoading] = useState<Platform | null>(null);
  const { toast } = useToast();
  const [authenticatedPlatform, setAuthenticatedPlatform] = useState<Platform>(() => {
    const stored = localStorage.getItem('authenticatedPlatform');
    return stored as Platform;
  });

  const handleConnect = async (platform: Platform) => {
    try {
      setIsLoading(platform);
      
      // Get the appropriate edge function name based on the platform
      const functionName = `initiate-${platform}-oauth`;
      console.log(`🔵 Initiating OAuth flow for ${platform} using function: ${functionName}`);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {},
      });

      if (error) {
        console.error(`Failed to initiate ${platform} connection:`, error);
        throw error;
      }

      if (!data?.url) {
        throw new Error("No authorization URL received");
      }

      console.log(`🔵 Redirecting to ${platform} OAuth URL:`, data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error('Failed to initiate connection:', error);
      toast({
        title: "Error",
        description: `Failed to start ${platform} connection: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
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
                isLoading={isLoading}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            }
          />
        ))}
      </div>
    </div>
  );
};