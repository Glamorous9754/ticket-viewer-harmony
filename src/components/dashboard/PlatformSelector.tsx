import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { GmailConnect } from "./GmailConnect";
import { ZendeskConnect } from "./ZendeskConnect";
import { Platform } from "./types/platform";
import { Link2Off, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PlatformSelector = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
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
    
    // Clean up URL after reading params
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
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const handleSyncTickets = () => {
    toast({
      title: "Syncing Tickets",
      description: "Starting ticket synchronization...",
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
          <Card key={platform.id} className="p-6 space-y-4">
            <h3 className="text-xl font-medium">{platform.name}</h3>
            <p className="text-gray-600">{platform.description}</p>
            <div className="space-y-2">
              <Button
                onClick={() => 
                  authenticatedPlatform === platform.id 
                    ? handleDisconnect(platform.id)
                    : handleConnect(platform.id)
                }
                className="w-full"
                disabled={isAuthenticating && selectedPlatform !== platform.id || 
                         (authenticatedPlatform && authenticatedPlatform !== platform.id) ||
                         platform.comingSoon}
                variant={authenticatedPlatform === platform.id ? "destructive" : "default"}
              >
                {authenticatedPlatform === platform.id ? (
                  <>
                    <Link2Off className="mr-2 h-4 w-4" />
                    Disconnect
                  </>
                ) : (
                  platform.comingSoon ? "Coming Soon" : `Connect ${platform.name}`
                )}
              </Button>
              {authenticatedPlatform === platform.id && (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={handleSyncTickets}
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