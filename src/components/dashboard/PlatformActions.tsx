import { Button } from "@/components/ui/button";
import { RefreshCw, Link2Off } from "lucide-react";
import { Platform } from "./types/platform";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlatformActionsProps {
  platform: Platform;
  isConnected: boolean;
  activePlatform: Platform;
  isSyncing: boolean;
  isLoading: Platform | null;
  onConnect: (platform: Platform) => void;
  onSync: (platform: Platform) => void;
  onDisconnect: (platform: Platform) => void;
}

interface ApiError {
  message?: string;
  error?: string;
}

export const PlatformActions = ({
  platform,
  isConnected,
  activePlatform,
  isSyncing,
  isLoading,
  onConnect,
  onSync,
  onDisconnect,
}: PlatformActionsProps) => {
  const { toast } = useToast();

  const handleSync = async () => {
    // Show immediate toast notification about the sync process
    toast({
      title: "Sync Started",
      description: "Please wait for several minutes. Changes will be reflected in the dashboard once the process is complete.",
    });

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("You must be logged in to sync tickets");
      }

      const endpoints = {
        zoho: 'http://sync-tickets.us-east-2.elasticbeanstalk.com/sync-zoho-tickets',
        gmail: 'http://ticket-server.us-east-2.elasticbeanstalk.com/sync-gmail-tickets',
        zendesk: 'http://sync-tickets.us-east-2.elasticbeanstalk.com/sync-zendesk-tickets'
      };

      const endpoint = endpoints[platform];
      if (!endpoint) {
        throw new Error(`No endpoint configured for platform: ${platform}`);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to sync tickets");
      }

      const data = await response.json();
      console.log(`Sync response for ${platform}:`, data);

      if (data?.message) {
        toast({
          title: "Success",
          description: data.message || `Successfully initiated sync for ${platform} tickets!`,
        });
      } else {
        toast({
          title: "Warning",
          description: "Unexpected response from the server. The sync process has started but may take several minutes to complete.",
          variant: "destructive", // Changed from "warning" to "destructive" to match allowed variants
        });
        console.warn("⚠️ Unexpected response structure:", data);
      }
    } catch (error) {
      console.error(`Failed to sync ${platform} tickets:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 
          (error as ApiError).message || `Failed to sync tickets from ${platform}`,
        variant: "destructive",
      });
    }

    // Call the parent's onSync handler to update UI state
    onSync(platform);
  };

  if (!isConnected) {
    return (
      <Button
        onClick={() => onConnect(platform)}
        disabled={!!activePlatform || platform === 'freshdesk'}
        className="w-full"
      >
        {platform === 'freshdesk' ? 'Coming Soon' : `Connect ${platform}`}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSync}
        variant="outline"
        disabled={isSyncing}
        className="w-full"
      >
        {isSyncing ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Tickets
          </>
        )}
      </Button>
      <Button
        onClick={() => onDisconnect(platform)}
        variant="destructive"
        disabled={isLoading === platform}
        className="w-full"
      >
        {isLoading === platform ? (
          "Disconnecting..."
        ) : (
          <>
            <Link2Off className="mr-2 h-4 w-4" />
            Disconnect
          </>
        )}
      </Button>
    </div>
  );
};