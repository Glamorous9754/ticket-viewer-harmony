import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { GmailConnect } from "./GmailConnect";
import { ZendeskConnect } from "./ZendeskConnect";
import { PlatformCard } from "./PlatformCard";
import { PlatformActions } from "./PlatformActions";
import { Platform, ConnectionStatus } from "./types/platform";

export const PlatformSelector = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [isLoading, setIsLoading] = useState<Platform>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    freshdesk: null,
    gmail: null,
    zoho: null,
    zendesk: null,
  });
  const { toast } = useToast();

  // Get the currently active platform
  const activePlatform = Object.entries(connectionStatus).find(
    ([_, status]) => status?.is_active
  )?.[0] as Platform;

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: connections, error } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('profile_id', session.user.id);

      if (error) throw error;

      const status: ConnectionStatus = {
        freshdesk: null,
        gmail: null,
        zoho: null,
        zendesk: null,
      };

      connections?.forEach(connection => {
        status[connection.platform_type as keyof ConnectionStatus] = connection;
      });

      setConnectionStatus(status);
    } catch (error) {
      console.error("Error checking connections:", error);
    }
  };

  const handleSuccess = () => {
    setSelectedPlatform(null);
    checkConnections();
  };

  const handleSync = async (platform: Platform) => {
    if (!platform) return;
    
    setIsSyncing(true);
    try {
      const { error } = await supabase.functions.invoke(`sync-${platform}-tickets`);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully synced ${platform} tickets!`,
      });
    } catch (error) {
      console.error(`Error syncing ${platform} tickets:`, error);
      toast({
        title: "Error",
        description: `Failed to sync ${platform} tickets. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    if (!platform) return;
    
    setIsLoading(platform);
    try {
      const { error } = await supabase.rpc('unlink_platform_connection', {
        platform,
      });
      
      if (error) throw error;

      await checkConnections();
      toast({
        title: "Success",
        description: `Successfully disconnected from ${platform}!`,
      });
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      toast({
        title: "Error",
        description: `Failed to disconnect from ${platform}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
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
        <PlatformCard
          title="Zoho Desk"
          description="Connect your Zoho Desk account to analyze customer tickets"
          isConnected={!!connectionStatus.zoho?.is_active}
          actions={
            <PlatformActions
              platform="zoho"
              isConnected={!!connectionStatus.zoho?.is_active}
              activePlatform={activePlatform}
              isSyncing={isSyncing}
              isLoading={isLoading}
              onConnect={setSelectedPlatform}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
            />
          }
        />

        <PlatformCard
          title="FreshDesk"
          description="Connect your FreshDesk account to analyze customer tickets"
          isConnected={false}
          actions={
            <PlatformActions
              platform="freshdesk"
              isConnected={false}
              activePlatform={activePlatform}
              isSyncing={isSyncing}
              isLoading={isLoading}
              onConnect={setSelectedPlatform}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
            />
          }
        />

        <PlatformCard
          title="Gmail"
          description="Connect your Gmail account to analyze customer emails"
          isConnected={!!connectionStatus.gmail?.is_active}
          actions={
            <PlatformActions
              platform="gmail"
              isConnected={!!connectionStatus.gmail?.is_active}
              activePlatform={activePlatform}
              isSyncing={isSyncing}
              isLoading={isLoading}
              onConnect={setSelectedPlatform}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
            />
          }
        />

        <PlatformCard
          title="Zendesk"
          description="Connect your Zendesk account to analyze support tickets"
          isConnected={!!connectionStatus.zendesk?.is_active}
          actions={
            <PlatformActions
              platform="zendesk"
              isConnected={!!connectionStatus.zendesk?.is_active}
              activePlatform={activePlatform}
              isSyncing={isSyncing}
              isLoading={isLoading}
              onConnect={setSelectedPlatform}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
            />
          }
        />
      </div>
    </div>
  );
};