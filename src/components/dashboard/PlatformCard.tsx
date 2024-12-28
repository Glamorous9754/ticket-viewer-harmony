import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

interface PlatformCardProps {
  title: string;
  description: string;
  isConnected: boolean;
  isLoading: boolean;
  onConnect: () => void;
  onSync: () => void;
}

export const PlatformCard = ({
  title,
  description,
  isConnected,
  isLoading,
  onConnect,
  onSync,
}: PlatformCardProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-medium mb-4">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {isConnected ? (
        <Button 
          onClick={onSync}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
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
      ) : (
        <Button 
          onClick={onConnect}
          className="w-full"
        >
          Connect {title}
        </Button>
      )}
    </Card>
  );
};