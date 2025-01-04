import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";

interface ApiError {
  message?: string;
  error?: string;
}

export const ZohoConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const authStatus = searchParams.get('auth_status');

  useEffect(() => {
    if (authStatus === 'success') {
      toast({
        title: "Success",
        description: "Successfully connected to Zoho!",
      });
      onSuccess();
    } else if (authStatus === 'error') {
      toast({
        title: "Error",
        description: "Failed to connect to Zoho. Please try again.",
        variant: "destructive",
      });
    }
  }, [authStatus, toast, onSuccess]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.session?.user) {
        throw new Error("You must be logged in to connect Zoho");
      }

      const { data, error } = await supabase.functions.invoke(
        "initiate-zoho-oauth",
        {
          body: {},
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      );

      console.log("🔍 Response from Supabase function:", data);

      if (error) throw error;

      if (data?.url) {
        console.log("🔗 Redirecting to Zoho OAuth URL:", data.url);
        window.location.href = data.url;
        return;
      } else if (data?.redirect_url && data?.query_params) {
        const redirectUrl = new URL(data.redirect_url);
        Object.entries(data.query_params).forEach(([key, value]) => {
          redirectUrl.searchParams.set(key, value as string);
        });

        const fullRedirectUrl = redirectUrl.toString();
        console.log("🔗 Redirecting to constructed URL:", fullRedirectUrl);
        window.location.href = fullRedirectUrl;
        return;
      } else {
        toast({
          title: "Warning",
          description: "Unexpected response from the server. Please try again.",
          variant: "destructive",
        });
        console.warn("⚠️ Unexpected response structure:", data);
      }

    } catch (error: unknown) {
      console.error("Error initiating Zoho OAuth:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message :
          (error as ApiError).message || "Failed to start authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Connect Zoho</h2>
      <p className="text-sm text-gray-600">
        Connect your Zoho Desk account to analyze your support tickets.
      </p>
      <div className="space-y-2">
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Connecting..." : "Connect with Zoho"}
        </Button>
      </div>
    </Card>
  );
};

export default ZohoConnect;