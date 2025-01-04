import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Platform } from "./types/platform";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

interface ApiError {
  message: string;
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
  const [isFetchingTickets, setIsFetchingTickets] = useState(false);

  const handleSync = async () => {
    setIsFetchingTickets(true);
    try {
      // Show initial toast message
      toast.info(
        "Please wait while we fetch the tickets for you. They will automatically be updated inside the dashboard.",
        {
          duration: 5000,
        }
      );

      // 1. Retrieve the current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("You must be logged in to fetch tickets");
      }

      // 2. Call the API with the correct endpoint
      const endpoint = id === 'zoho_desk' 
        ? 'http://zoho-server-env.eba-hsu363pe.us-east-2.elasticbeanstalk.com/sync-zoho-tickets'
        : `http://sync-tickets.us-east-2.elasticbeanstalk.com/sync-${id}-tickets`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to sync ${name} tickets`);
      }

      // 3. Handle JSON response
      const data = await response.json();
      console.log("Sync response:", data);

      if (data?.message) {
        toast.success(data.message || `Successfully synced ${name} tickets!`);
      } else {
        toast.warning("Unexpected response from the server. Please try again.");
        console.warn("⚠️ Unexpected response structure:", data);
      }
    } catch (error: unknown) {
      console.error(`Error syncing ${name} tickets:`, error);
      toast.error(
        error instanceof Error
          ? error.message
          : (error as ApiError).message || `Failed to sync ${name} tickets`
      );
    } finally {
      setIsFetchingTickets(false);
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
          disabled={isFetchingTickets}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetchingTickets ? 'animate-spin' : ''}`} />
          {isFetchingTickets ? 'Syncing...' : 'Sync Tickets'}
        </Button>
      </div>
    </Card>
  );
};