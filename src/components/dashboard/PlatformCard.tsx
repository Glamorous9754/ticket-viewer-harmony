import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Platform } from "./types/platform";

interface PlatformCardProps {
  name: string;
  id: Platform;
  description: string;
  isConnected: boolean;
  isAuthenticating: boolean;
  selectedPlatform: Platform;
  onConnect: (platform: Platform) => void;
  onDisconnect: (platform: Platform) => void;
}

export const PlatformCard = ({
  name,
  id,
  description,
  isConnected,
  isAuthenticating,
  selectedPlatform,
  onConnect,
  onDisconnect,
}: PlatformCardProps) => {
  const handleSync = async () => {
    try {
      const response = await fetch(`http://sync-tickets.us-east-2.elasticbeanstalk.com/sync-${id}-tickets`);
      if (!response.ok) {
        throw new Error(`Failed to sync ${name} tickets`);
      }
      toast.success(`Started syncing ${name} tickets`);
    } catch (error) {
      console.error(`Error syncing ${name} tickets:`, error);
      toast.error(`Failed to sync ${name} tickets`);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-medium mb-4">{name}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="space-y-2">
        <Button
          onClick={() => 
            isConnected ? onDisconnect(id) : onConnect(id)
          }
          className="w-full"
          disabled={
            isAuthenticating && selectedPlatform !== id || 
            id === 'freshdesk'
          }
          variant={isConnected ? "secondary" : "default"}
        >
          {id === 'freshdesk' 
            ? "Coming Soon"
            : isConnected
              ? "Disconnect" 
              : `Connect ${name}`}
        </Button>
        <Button
          onClick={handleSync}
          className="w-full"
          variant="default"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync Tickets
        </Button>
      </div>
    </Card>
  );
};