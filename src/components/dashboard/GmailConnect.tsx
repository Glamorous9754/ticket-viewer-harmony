import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";

export const GmailConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEmails, setIsFetchingEmails] = useState(false);
  const [searchParams] = useSearchParams();
  const connectionStatus = searchParams.get("connection");

  useEffect(() => {
    if (connectionStatus === "success") {
      toast({
        title: "Success",
        description: "Successfully connected to Gmail!",
      });
      onSuccess();
    } else if (connectionStatus === "error") {
      toast({
        title: "Error",
        description: "Failed to connect to Gmail. Please try again.",
        variant: "destructive",
      });
    }
  }, [connectionStatus, toast, onSuccess]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error("Failed to fetch session: " + sessionError.message);
      }

      if (!session?.session?.user) {
        throw new Error("You must be logged in to connect Gmail");
      }

      const { data, error } = await supabase.functions.invoke("initiate-google-oauth");

      if (error) throw error;
      if (!data?.url) throw new Error("No authorization URL received");

      window.location.href = data.url;
    } catch (error) {
      console.error("Error initiating Gmail OAuth:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchEmails = async () => {
    setIsFetchingEmails(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to fetch emails");
      }

      const { error } = await supabase.functions.invoke("sync-gmail-tickets", {
        body: {},
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully synced Gmail emails!",
      });
    } catch (error) {
      console.error("Error fetching Gmail emails:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch emails",
        variant: "destructive",
      });
    } finally {
      setIsFetchingEmails(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Connect Gmail</h2>
      <p className="text-sm text-gray-600">
        Connect your Gmail account to analyze your customer emails.
      </p>
      <div className="space-y-2">
        <Button onClick={handleConnect} disabled={isLoading} className="w-full">
          {isLoading ? "Connecting..." : "Connect with Gmail"}
        </Button>

        <Button
          onClick={handleFetchEmails}
          disabled={isFetchingEmails}
          variant="outline"
          className="w-full"
        >
          {isFetchingEmails ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Fetching...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Fetch Emails
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default GmailConnect;