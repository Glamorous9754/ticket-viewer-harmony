import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/lib/hooks/auth";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ZohoConnect = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/zoho_credentials?profile_id=eq.${user?.id}`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch Zoho connection status');
        }

        const data = await response.json();
        setIsConnected(data.length > 0);
      } catch (error) {
        console.error('Error checking Zoho connection:', error);
        toast({
          title: "Error",
          description: "Failed to check Zoho connection status.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      checkConnection();
    }
  }, [user, toast]);

  const handleConnect = () => {
    const clientId = import.meta.env.VITE_ZOHO_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_ZOHO_REDIRECT_URI;
    const scope = 'Desk.tickets.READ,Desk.basic.READ';
    const responseType = 'code';
    const accessType = 'offline';

    const authUrl = `https://accounts.zoho.com/oauth/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}&access_type=${accessType}`;

    window.location.href = authUrl;
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/zoho_credentials?profile_id=eq.${user?.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect Zoho');
      }

      toast({
        title: "Disconnected from Zoho",
        description: "Your Zoho account has been disconnected successfully.",
        variant: "default",
      });

      setIsConnected(false);
    } catch (error) {
      console.error('Error disconnecting Zoho:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect from Zoho. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zoho Desk Integration</CardTitle>
        <CardDescription>
          Connect your Zoho Desk account to import and analyze support tickets
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            className="w-full"
          >
            Disconnect from Zoho
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={handleConnect}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Connect to Zoho
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ZohoConnect;