import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

export const ZohoConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTickets, setIsFetchingTickets] = useState(false);

  useEffect(() => {
    checkAuth();
    handleOAuthCallback();
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

  const handleOAuthCallback = async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code && state) {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Authentication required");

        const response = await fetch(
          'https://jpbsjrjrmhpojphysrsd.supabase.co/functions/v1/connect-zoho',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ code, state }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to complete Zoho connection");
        }

        const result = await response.json();
        
        toast({
          title: "Success!",
          description: "Successfully connected to Zoho Desk",
        });

        onSuccess();
      } catch (error) {
        console.error("Error in OAuth callback:", error);
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect to Zoho Desk",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        // Clear URL parameters
        navigate('/features', { replace: true });
      }
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

      const response = await fetch(
        'https://jpbsjrjrmhpojphysrsd.supabase.co/functions/v1/initiate-zoho-oauth',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to initiate OAuth flow");
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error("No authorization URL received");
      }

      // Redirect to Zoho's OAuth page
      window.location.href = url;

    } catch (error) {
      console.error("Error in Zoho connection process:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to start Zoho connection",
        variant: "destructive",
      });
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

      const response = await fetch(
        'https://jpbsjrjrmhpojphysrsd.supabase.co/functions/v1/sync-zoho-tickets',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      console.log("Fetched tickets:", data);
      
      toast({
        title: "Success",
        description: `Retrieved ${data.tickets?.length || 0} tickets from Zoho`,
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
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect with Zoho"
          )}
        </Button>

        <Button
          onClick={handleFetchTickets}
          disabled={isFetchingTickets}
          variant="outline"
          className="w-full"
        >
          {isFetchingTickets ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching...
            </>
          ) : (
            "Fetch Tickets"
          )}
        </Button>
      </div>
    </div>
  );
};