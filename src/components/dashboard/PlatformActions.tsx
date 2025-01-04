import { Button } from "@/components/ui/button";
import { Link2Off, RefreshCw } from "lucide-react";
import { Platform } from "./types/platform";
import { useToast } from "@/hooks/use-toast";

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

  const handleSyncTickets = () => {
    toast({
      title: "Syncing Tickets",
      description: "Starting ticket synchronization...",
    });
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
        onClick={handleSyncTickets}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Sync Tickets
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