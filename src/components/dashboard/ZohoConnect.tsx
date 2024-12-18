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
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!session || error) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect your Zoho account.",
        variant: "destructive",
      });
      navigate("/login");
    }
  };

  const handleConnectZoho = async () => {
    setIsLoading(true);
    console.log("Starting Zoho OAuth process...");

    try {
      // Check user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to connect Zoho.");
      }

      // Fetch OAuth URL from Supabase Edge Function
      const response = await fetch("/functions/v1/initiate-zoho-oauth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`, // Pass the token
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to initiate Zoho OAuth flow.");
      }

      const { url } = await response.json();
      if (!url) throw new Error("No OAuth URL returned from server.");

      // Redirect to Zoho OAuth page
      window.location.href = url;

    } catch (error: any) {
      console.error("Error connecting to Zoho:", error.message);
      toast({
        title: "Connection Failed",
        description: error.message || "An error occurred during Zoho connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchTickets = async () => {
    setIsFetchingTickets(true);
    try {
      // Check user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to fetch tickets.");
      }

      // Invoke Supabase function to fetch Zoho tickets
      const response = await fetch("/functions/v1/sync-zoho-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`, // Pass token
        },
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to fetch Zoho tickets.");
      }

      const data = await response.json();
      console.log("Tickets fetched:", data.tickets);
      toast({
        title: "Tickets Fetched",
        description: `Successfully retrieved ${data.tickets.length} tickets.`,
      });

    } catch (error: any) {
      console.error("Error fetching tickets:", error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch tickets.",
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
