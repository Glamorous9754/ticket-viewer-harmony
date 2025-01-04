import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2Off, RefreshCw } from "lucide-react";
import { Platform } from "./types/platform";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApiError {
  message?: string;
}

interface PlatformActionsProps {
  platform: Platform;
  isConnected: boolean;
  activePlatform: Platform;
  isLoading: Platform | null;
  onConnect: (platform: Platform) => void;
  onDisconnect: (platform: Platform) => void;
}

export const PlatformActions = ({
  platform,
  isConnected,
  activePlatform,
  isLoading,
  onConnect,
  onDisconnect,
}: PlatformActionsProps) => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("You must be logged in to sync tickets");
      }

      let endpoint = "";
      switch (platform) {
        case "zoho":
          endpoint = "sync-zoho-tickets";
          break;
        case "zendesk":
          endpoint = "sync-zendesk-tickets";
          break;
        case "gmail":
          endpoint = "sync-gmail-tickets";
          break;
        default:
          throw new Error("Invalid platform");
      }

      const response = await fetch(
        `http://ticket-server.us-east-2.elasticbeanstalk.com/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to sync tickets");
      }

      const data = await response.json();
      console.log(`${platform} sync response:`, data);

      if (data?.message) {
        toast({
          title: "Success",
          description: data.message || `Successfully synced ${platform} tickets!`,
        });
      } else {
        toast({
          title: "Warning",
          description: "Unexpected response from the server. Please try again.",
          variant: "warning",
        });
        console.warn("⚠️ Unexpected response structure:", data);
      }
    } catch (error: unknown) {
      console.error(`Error syncing ${platform} tickets:`, error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : (error as ApiError).message || "Failed to sync tickets",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
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
        variant="default"
        className="w-full"
        disabled={platform === 'freshdesk' || isSyncing}
        onClick={handleSync}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? "Syncing..." : "Sync Tickets"}
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