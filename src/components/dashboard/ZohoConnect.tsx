import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ZohoCredentials {
  clientId: string;
  clientSecret: string;
  organizationId: string;
}

export const ZohoConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [zohoCredentials, setZohoCredentials] = useState<ZohoCredentials>({
    clientId: "",
    clientSecret: "",
    organizationId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [existingConnection, setExistingConnection] = useState<any>(null);

  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: connection, error } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('platform_name', 'zoho')
        .eq('profile_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (connection) {
        setExistingConnection(connection);
        setZohoCredentials({
          clientId: connection.auth_tokens.client_id || "",
          clientSecret: connection.auth_tokens.client_secret || "",
          organizationId: connection.auth_tokens.organization_id || "",
        });
      }
    } catch (error) {
      console.error('Error checking existing connection:', error);
    }
  };

  const handleConnectZoho = async () => {
    const { clientId, clientSecret, organizationId } = zohoCredentials;

    if (!clientId || !clientSecret || !organizationId) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First check if user is authenticated
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to connect your Zoho account",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Update or insert Zoho credentials
      const { error: connectionError } = await supabase
        .from('platform_connections')
        .upsert({
          profile_id: session.user.id,
          platform_name: 'zoho',
          auth_tokens: {
            client_id: clientId,
            client_secret: clientSecret,
            organization_id: organizationId,
          },
          ...(existingConnection && { id: existingConnection.id }),
        }, {
          onConflict: 'profile_id,platform_name'
        });

      if (connectionError) throw connectionError;

      // Trigger initial sync with proper error handling
      const syncResponse = await supabase.functions.invoke('sync-zoho-tickets', {
        body: { 
          clientId,
          clientSecret,
          organizationId
        }
      });

      if (syncResponse.error) {
        throw new Error(syncResponse.error.message || 'Failed to sync tickets');
      }

      if (!syncResponse.data.success) {
        throw new Error(syncResponse.data.error || 'Failed to sync tickets');
      }

      toast({
        title: "Success",
        description: existingConnection 
          ? "Zoho connection updated and tickets synced successfully"
          : "Zoho account connected and tickets synced successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error connecting Zoho:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect Zoho account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
      <h2 className="text-xl font-semibold">
        {existingConnection ? "Update Zoho Connection" : "Connect Zoho Account"}
      </h2>
      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium">Client ID</label>
          <Input
            value={zohoCredentials.clientId}
            onChange={(e) =>
              setZohoCredentials((prev) => ({
                ...prev,
                clientId: e.target.value,
              }))
            }
            placeholder="Enter your Zoho Client ID"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Client Secret</label>
          <Input
            type="password"
            value={zohoCredentials.clientSecret}
            onChange={(e) =>
              setZohoCredentials((prev) => ({
                ...prev,
                clientSecret: e.target.value,
              }))
            }
            placeholder="Enter your Zoho Client Secret"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Organization ID</label>
          <Input
            value={zohoCredentials.organizationId}
            onChange={(e) =>
              setZohoCredentials((prev) => ({
                ...prev,
                organizationId: e.target.value,
              }))
            }
            placeholder="Enter your Zoho Organization ID"
          />
        </div>
        <Button 
          onClick={handleConnectZoho} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading 
            ? "Connecting..." 
            : existingConnection 
              ? "Update & Sync Tickets" 
              : "Connect & Sync Tickets"
          }
        </Button>
      </div>
    </div>
  );
};