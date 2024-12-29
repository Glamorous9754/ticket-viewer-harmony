import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Platform } from "../types/platform";
import { PlatformInfo } from "../types/platformState";

interface PlatformCardProps extends PlatformInfo {
  authenticatedPlatform: Platform;
  isAuthenticating: boolean;
  onConnect: (platform: Platform) => void;
  onDisconnect: (platform: Platform) => void;
}

export const PlatformCard = ({
  name,
  id,
  description,
  comingSoon,
  authenticatedPlatform,
  isAuthenticating,
  onConnect,
  onDisconnect,
}: PlatformCardProps) => {
  const isAuthenticated = authenticatedPlatform === id;
  const isOtherPlatformAuthenticated = authenticatedPlatform && authenticatedPlatform !== id;

  return (
    <Card className="p-6">
      <h3 className="text-xl font-medium mb-4">{name}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {comingSoon ? (
        <Button className="w-full" disabled variant="secondary">
          Coming Soon
        </Button>
      ) : (
        <Button
          onClick={() => isAuthenticated ? onDisconnect(id) : onConnect(id)}
          className="w-full"
          disabled={isAuthenticating || (isOtherPlatformAuthenticated && !isAuthenticated)}
          variant={isAuthenticated ? "destructive" : "default"}
        >
          {isAuthenticating && isAuthenticated
            ? "Disconnecting..."
            : isAuthenticated
            ? "Disconnect"
            : `Connect ${name}`}
        </Button>
      )}
    </Card>
  );
};