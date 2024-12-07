import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ZohoCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export const ZohoConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [zohoCredentials, setZohoCredentials] = useState<ZohoCredentials>({
    clientId: "",
    clientSecret: "",
    refreshToken: "",
  });

  const handleConnectZoho = async () => {
    const { clientId, clientSecret, refreshToken } = zohoCredentials;

    if (!clientId || !clientSecret || !refreshToken) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Store Zoho credentials
      const { error: connectionError } = await supabase
        .from('platform_connections')
        .insert({
          profile_id: user.id,
          platform_name: 'zoho',
          auth_tokens: {
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
          },
        });

      if (connectionError) throw connectionError;

      // Trigger initial sync
      const response = await supabase.functions.invoke('sync-zoho-tickets');
      if (response.error) throw response.error;

      // Process tickets with AI
      const aiResponse = await supabase.functions.invoke('process-tickets');
      if (aiResponse.error) throw aiResponse.error;

      toast({
        title: "Success",
        description: "Zoho account connected and tickets processed successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error connecting Zoho:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
      <h2 className="text-xl font-semibold">Connect Zoho Account</h2>
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
          <label className="text-sm font-medium">Refresh Token</label>
          <Input
            value={zohoCredentials.refreshToken}
            onChange={(e) =>
              setZohoCredentials((prev) => ({
                ...prev,
                refreshToken: e.target.value,
              }))
            }
            placeholder="Enter your Zoho Refresh Token"
          />
        </div>
        <Button onClick={handleConnectZoho}>
          Connect & Sync Tickets
        </Button>
      </div>
    </div>
  );
};