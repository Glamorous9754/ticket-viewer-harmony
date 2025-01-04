import { useState } from "react";
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
    setIsLoading(platform);
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.session?.user) {
        throw new Error("You must be logged in to connect a platform");
      }

      console.log(`🔵 Initiating OAuth flow for platform: ${platform}`);
      
      const { data, error } = await supabase.functions.invoke(
        `initiate-${platform}-oauth`,
        {
          body: {},
        }
      );

      console.log(`🔵 Response from edge function:`, data);

      if (error) {
        throw error;
      }

      if (!data?.url) {
        throw new Error("No authorization URL received");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Failed to initiate connection:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start platform connection",
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