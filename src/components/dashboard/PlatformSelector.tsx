import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { GmailConnect } from "./GmailConnect";
import { ZendeskConnect } from "./ZendeskConnect";
import { PlatformCard } from "./PlatformCard";
import { PlatformActions } from "./PlatformActions";
import { Platform } from "./types/platform";

export const PlatformSelector = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [isLoading, setIsLoading] = useState<Platform | null>(null);
  const { toast } = useToast();
  const [authenticatedPlatform, setAuthenticatedPlatform] = useState<Platform>(() => {
    const stored = localStorage.getItem('authenticatedPlatform');
    return stored as Platform;
  });

  const handleSuccess = () => {
    setSelectedPlatform(null);
  };

  const handleConnect = (platform: Platform) => {
    setSelectedPlatform(platform);
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