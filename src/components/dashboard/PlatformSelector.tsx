import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { GmailConnect } from "./GmailConnect";
import { ZendeskConnect } from "./ZendeskConnect";
import { Platform, PlatformInfo } from "./types/platform";
import { useToast } from "@/components/ui/use-toast";

const platforms: PlatformInfo[] = [
  {
    name: "Zoho Desk",
    id: "zoho",
    description: "Connect your Zoho Desk account to analyze customer tickets",
  },
  {
    name: "FreshDesk",
    id: "freshdesk",
    description: "Connect your FreshDesk account to analyze customer tickets",
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
];

export const PlatformSelector = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticatedPlatform, setAuthenticatedPlatform] = useState<Platform>(() => {
    const stored = localStorage.getItem('authenticatedPlatform');
    return stored as Platform;
  });
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const authStatus = searchParams.get('auth_status');
    const platform = searchParams.get('platform') as Platform;
    const errorMessage = searchParams.get('error_message');
    
    if (authStatus === 'success' && platform) {
      setIsAuthenticating(false);
      setSelectedPlatform(null);
      setAuthenticatedPlatform(platform);
      localStorage.setItem('authenticatedPlatform', platform);
      
      toast({
        title: "Success",
        description: `Successfully connected to ${platform}!`,
      });
    } else if (authStatus === 'error') {
      setIsAuthenticating(false);
      setSelectedPlatform(null);
      localStorage.removeItem('authenticatedPlatform');
      
      toast({
        title: "Error",
        description: errorMessage || `Failed to connect. Please try again.`,
        variant: "destructive",
      });
      console.error('Authentication failed:', errorMessage);
    }
    
    // Clean up URL after reading params
    if (authStatus) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, toast]);

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
        title: "Success",
        description: `Successfully disconnected from ${platform}!`,
      });
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast({
        title: "Error",
        description: `Failed to disconnect from ${platform}. Please try again.`,
        variant: "destructive",
      });
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
        {platforms.map((platform) => (
          <Card key={platform.id} className="p-6">
            <h3 className="text-xl font-medium mb-4">{platform.name}</h3>
            <p className="text-gray-600 mb-4">{platform.description}</p>
            <Button
              onClick={() => 
                authenticatedPlatform === platform.id 
                  ? handleDisconnect(platform.id)
                  : handleConnect(platform.id)
              }
              className="w-full"
              disabled={
                isAuthenticating && selectedPlatform !== platform.id || 
                (authenticatedPlatform && authenticatedPlatform !== platform.id) ||
                platform.id === 'freshdesk'
              }
              variant={authenticatedPlatform === platform.id ? "destructive" : "default"}
            >
              {platform.id === 'freshdesk' 
                ? "Coming Soon"
                : authenticatedPlatform === platform.id 
                  ? "Disconnect" 
                  : `Connect ${platform.name}`}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};