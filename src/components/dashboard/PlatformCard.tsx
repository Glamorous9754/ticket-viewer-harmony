import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Platform } from "./types/platform";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

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
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // 1. Retrieve the current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("You must be logged in to fetch tickets");
      }

      // 2. Call the appropriate endpoint based on platform
      let endpoint = '';
      switch (id) {
        case 'zoho_desk':
          endpoint = 'http://zoho-server-env.eba-hsu363pe.us-east-2.elasticbeanstalk.com/sync-zoho-tickets';
          break;
        case 'gmail':
          endpoint = 'http://ticket-server.us-east-2.elasticbeanstalk.com/sync-gmail-tickets';
          break;
        case 'zendesk':
          endpoint = 'http://ticket-server.us-east-2.elasticbeanstalk.com/sync-zendesk-tickets';
          break;
        default:
          throw new Error(`Sync not supported for ${name}`);
      }

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

      const data = await response.json();
      console.log(`${name} sync response:`, data);

      if (data?.message) {
        toast.success(data.message || `Successfully synced ${name} tickets!`);
      } else {
        toast.warning("Unexpected response from the server. Please try again.");
        console.warn("⚠️ Unexpected response structure:", data);
      }
    } catch (error: any) {
      console.error(`Error syncing ${name} tickets:`, error);
      toast.error(error.message || `Failed to sync ${name} tickets`);
    } finally {
      setIsSyncing(false);
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
        {id !== 'freshdesk' && (
          <Button
            onClick={handleSync}
            className="w-full"
            variant="default"
            disabled={isSyncing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Tickets'}
          </Button>
        )}
      </div>
    </Card>
  );
};