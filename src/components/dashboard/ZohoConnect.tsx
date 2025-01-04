import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/lib/hooks/auth";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ZohoConnectProps {
  onSuccess?: () => void;
}

const ZohoConnect = ({ onSuccess }: ZohoConnectProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      // Logic to check if connected to Zoho
      // Simulating an API call
      const response = await fetch('/api/check-zoho-connection');
      const data = await response.json();
      setIsConnected(data.isConnected);
      setIsLoading(false);
    };

    checkConnection();
  }, [user, toast]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // Logic to connect to Zoho
      const response = await fetch('/api/connect-zoho', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "Successfully connected to Zoho Desk.",
        });
        if (onSuccess) onSuccess();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to Zoho Desk.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      // Logic to disconnect from Zoho
      const response = await fetch('/api/disconnect-zoho', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setIsConnected(false);
        toast({
          title: "Disconnected",
          description: "Successfully disconnected from Zoho Desk.",
        });
        if (onSuccess) onSuccess();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect from Zoho Desk.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <Card className="w-full">
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
