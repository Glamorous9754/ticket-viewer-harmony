import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const ZohoConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTickets, setIsFetchingTickets] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to connect your Zoho account",
        variant: "destructive",
      });
      navigate("/login");
    }
  };

  const handleConnectZoho = async () => {
    setIsLoading(true);
    console.log("Starting Zoho OAuth process...");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to connect Zoho");
      }

      // Get the access token
      const { data: authUrl, error: authError } = await supabase.functions.invoke(
        "initiate-zoho-oauth",
        {
          body: {},
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (authError) {
        console.error("Auth function error:", authError);
        throw new Error(authError.message || "Failed to initiate OAuth flow");
      }

      if (!authUrl?.url) {
        console.error("No auth URL received");
        throw new Error("Failed to get authentication URL");
      }

      // Redirect to Zoho's OAuth page
      window.location.href = authUrl.url;

    } catch (error) {
      console.error("Error in Zoho connection process:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchTickets = async () => {
    setIsFetchingTickets(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to fetch tickets");
      }

      const { data, error } = await supabase.functions.invoke(
        "sync-zoho-tickets",
        {
          body: {},
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;

      console.log("Fetched tickets:", data.tickets);
      toast({
        title: "Success",
        description: `Retrieved ${data.tickets.length} tickets from Zoho`,
      });

    } catch (error) {
      console.error("Error fetching Zoho tickets:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch tickets",
        variant: "destructive",
      });
    } finally {
      setIsFetchingTickets(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
      <h2 className="text-xl font-semibold">Connect Zoho</h2>
      <p className="text-sm text-gray-600">
        Connect your Zoho Desk account to analyze your support tickets.
      </p>
      
      <div className="space-y-2">
        <Button 
          onClick={handleConnectZoho}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Connecting..." : "Connect with Zoho"}
        </Button>

        <Button
          onClick={handleFetchTickets}
          disabled={isFetchingTickets}
          variant="outline"
          className="w-full"
        >
          {isFetchingTickets ? "Fetching..." : "Fetch Tickets"}
        </Button>
      </div>
    </div>
  );
};