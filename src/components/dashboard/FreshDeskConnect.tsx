import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";

export const FreshDeskConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const connectionStatus = searchParams.get('connection');

  useEffect(() => {
    if (connectionStatus === 'success') {
      toast({
        title: "Success",
        description: "Successfully connected to Freshdesk!",
      });
      onSuccess();
    } else if (connectionStatus === 'error') {
      toast({
        title: "Error",
        description: "Failed to connect to Freshdesk. Please try again.",
        variant: "destructive",
      });
    }
  }, [connectionStatus, toast, onSuccess]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("You must be logged in to connect Freshdesk");
      }

      const { data, error } = await supabase.functions.invoke(
        "initiate-freshdesk-oauth",
        {
          body: {},
        }
      );

      if (error) throw error;
      if (!data?.url) throw new Error("No authorization URL received");

      window.location.href = data.url;
    } catch (error) {
      console.error("Error initiating Freshdesk OAuth:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start authentication",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Connect Freshdesk</h2>
      <p className="text-sm text-gray-600">
        Connect your Freshdesk account to analyze your support tickets.
      </p>
      <div className="space-y-2">
        <Button 
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Connecting..." : "Connect with Freshdesk"}
        </Button>
      </div>
    </Card>
  );
};