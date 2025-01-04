import { useState, useEffect } from "react";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { GmailConnect } from "./GmailConnect";
import { ZendeskConnect } from "./ZendeskConnect";
import { supabase } from "@/integrations/supabase/client";
import { Platform } from "./types/platform";
import { PlatformCard } from "./PlatformCard";
import { toast } from "sonner";

interface PlatformConnection {
  platform_type: Platform;
  is_active: boolean;
}

const platforms = [
  {
    name: "Zoho Desk",
    id: "zoho_desk" as Platform,
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

export const PlatformSelector = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    fetchConnectedPlatforms();
  }, []);

  const fetchConnectedPlatforms = async () => {
    try {
      const { data: connections, error: connectionsError } = await supabase
        .from('platform_connections')
        .select('platform_type, is_active')
        .eq('is_active', true);

      if (connectionsError) throw connectionsError;

      const { data: zohoData } = await supabase
        .from('zoho_credentials')
        .select('status')
        .eq('status', 'active')
        .maybeSingle();

      const { data: zendeskData } = await supabase
        .from('zendesk_credentials')
        .select('status')
        .eq('status', 'active')
        .maybeSingle();

      const { data: gmailData } = await supabase
        .from('gmail_credentials')
        .select('status')
        .eq('status', 'active')
        .maybeSingle();

      const activePlatforms = connections
        .filter((conn: PlatformConnection) => conn.is_active)
        .map((conn: PlatformConnection) => conn.platform_type);

      if (zohoData?.status === 'active' && !activePlatforms.includes('zoho_desk')) {
        activePlatforms.push('zoho_desk');
      }
      if (zendeskData?.status === 'active' && !activePlatforms.includes('zendesk')) {
        activePlatforms.push('zendesk');
      }
      if (gmailData?.status === 'active' && !activePlatforms.includes('gmail')) {
        activePlatforms.push('gmail');
      }

      setConnectedPlatforms(activePlatforms);
    } catch (error) {
      console.error('Error fetching platform connections:', error);
      toast.error("Failed to fetch platform connections");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth_status');
    const platform = params.get('platform') as Platform;
    
    if (authStatus === 'success' && platform) {
      setIsAuthenticating(false);
      setSelectedPlatform(null);
      fetchConnectedPlatforms();
    } else if (authStatus === 'error') {
      setIsAuthenticating(false);
      setSelectedPlatform(null);
      const errorMessage = params.get('error_message');
      console.error('Authentication failed:', errorMessage);
    }
    
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  const handleConnect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsAuthenticating(true);
  };

  const handleDisconnect = async (platform: Platform) => {
    try {
      const { error } = await supabase
        .from('platform_connections')
        .update({ is_active: false })
        .eq('platform_type', platform);

      if (error) throw error;

      await fetchConnectedPlatforms();
      toast.success("Platform disconnected successfully");
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast.error("Failed to disconnect platform");
    }
  };

  if (selectedPlatform === "freshdesk") return <FreshDeskConnect onSuccess={() => fetchConnectedPlatforms()} />;
  if (selectedPlatform === "zoho_desk") return <ZohoConnect onSuccess={() => fetchConnectedPlatforms()} />;
  if (selectedPlatform === "gmail") return <GmailConnect onSuccess={() => fetchConnectedPlatforms()} />;
  if (selectedPlatform === "zendesk") return <ZendeskConnect onSuccess={() => fetchConnectedPlatforms()} />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Connect Your Support Platform</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((platform) => (
          <PlatformCard
            key={platform.id}
            {...platform}
            isConnected={connectedPlatforms.includes(platform.id)}
            isAuthenticating={isAuthenticating}
            selectedPlatform={selectedPlatform}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        ))}
      </div>
    </div>
  );
};