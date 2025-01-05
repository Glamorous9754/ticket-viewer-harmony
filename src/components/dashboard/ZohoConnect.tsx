import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";

interface ApiError {
  message?: string;
  error?: string;
}

export const ZohoConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTickets, setIsFetchingTickets] = useState(false);
  const [searchParams] = useSearchParams();
  const authStatus = searchParams.get("auth_status"); // Updated to 'auth_status'

  useEffect(() => {
    if (authStatus === "success") {
      toast({
        title: "Success",
        description: "Successfully connected to Zoho!",
      });
      onSuccess();
    } else if (authStatus === "error") {
      toast({
        title: "Error",
        description: "Failed to connect to Zoho. Please try again.",
        variant: "destructive",
      });
    }
  }, [authStatus, toast, onSuccess]);

  /**
   * Don't change this: calls the Supabase Edge Function for initiating Zoho OAuth
   */
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.session?.user) {
        throw new Error("You must be logged in to connect Zoho");
      }

      const { data, error } = await supabase.functions.invoke("initiate-zoho-oauth", {
        body: {},
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      console.log("🔍 Response from Supabase function:", data);

      if (error) throw error;

      if (data?.url) {
        console.log("🔗 Redirecting to Zoho OAuth URL:", data.url);
        window.location.href = data.url;
        return;
      } else if (data?.redirect_url && data?.query_params) {
        const redirectUrl = new URL(data.redirect_url);
        Object.entries(data.query_params).forEach(([key, value]) => {
          if (typeof value === "string") {
            redirectUrl.searchParams.set(key, value);
          }
        });
        const fullRedirectUrl = redirectUrl.toString();
        console.log("🔗 Redirecting to constructed URL:", fullRedirectUrl);
        window.location.href = fullRedirectUrl;
        return;
      } else {
        toast({
          title: "Error",
          description: "Unexpected response from the server. Please try again.",
          variant: "destructive",
        });
        console.warn("⚠️ Unexpected response structure:", data);
      }
    } catch (error: unknown) {
      console.error("Error initiating Zoho OAuth:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : (error as ApiError).message || "Failed to start authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updated function: calls your local Express server for fetching tickets
   */
  const handleFetchTickets = async () => {
    setIsFetchingTickets(true);
    try {
      // 1. Retrieve the current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("You must be logged in to fetch tickets");
      }

      // 2. Call your Express API (adjust URL if needed)
      const response = await fetch("http://ticket-server.us-east-2.elasticbeanstalk.com/sync-zoho-tickets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch tickets");
      }

      // 3. Handle JSON response from the Express server
      const data = await response.json();
      console.log("Fetch response:", data);

      if (data?.message) {
        toast({
          title: "Success",
          description: data.message || "Successfully synced Zoho tickets!",
        });
      } else {
        toast({
          title: "Warning",
          description: "Unexpected response from the server. Please try again.",
          variant: "warning",
        });
        console.warn("⚠️ Unexpected response structure:", data);
      }
    } catch (error: unknown) {
      console.error("Error fetching Zoho tickets:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : (error as ApiError).message || "Failed to fetch tickets",
        variant: "destructive",
      });
    } finally {
      setIsFetchingTickets(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Connect Zoho</h2>
      <p className="text-sm text-gray-600">
        Connect your Zoho Desk account to analyze your support tickets.
      </p>
      <div className="space-y-2">
        <Button onClick={handleConnect} disabled={isLoading} className="w-full">
          {isLoading ? "Connecting..." : "Connect with Zoho"}
        </Button>

        <Button
          onClick={handleFetchTickets}
          disabled={isFetchingTickets}
          variant="outline"
          className="w-full"
        >
          {isFetchingTickets ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Fetching...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Fetch Tickets
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default ZohoConnect;
