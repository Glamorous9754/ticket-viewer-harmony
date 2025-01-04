import { Button } from "@/components/ui/button";
import { RefreshCw, Link2Off } from "lucide-react";
import { Platform } from "./types/platform";

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
        onClick={() => onSync(platform)}
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