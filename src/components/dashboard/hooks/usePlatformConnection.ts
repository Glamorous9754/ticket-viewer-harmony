import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Platform, ConnectionStatus } from "../types/platform";

export const usePlatformConnection = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [isLoading, setIsLoading] = useState<Platform | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({});
  const { toast } = useToast();

  const checkConnections = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: connections, error } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('profile_id', session.user.id);

      if (error) throw error;

      const status: ConnectionStatus = {};
      connections?.forEach(connection => {
        status[connection.platform_type as string] = {
          is_active: connection.is_active,
          last_fetched_at: connection.last_fetched_at
        };
      });

      setConnectionStatus(status);
    } catch (error) {
      console.error("Error checking connections:", error);
    }
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
        platform_type: platform,
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

  useEffect(() => {
    checkConnections();
  }, []);

  return {
    selectedPlatform,
    setSelectedPlatform,
    isLoading,
    isSyncing,
    connectionStatus,
    handleSync,
    handleDisconnect,
    checkConnections,
  };
};