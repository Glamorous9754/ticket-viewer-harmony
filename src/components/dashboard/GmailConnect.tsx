import { useState, useEffect } from "react";
import { gapi } from "gapi-script";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

// Retrieve environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const GmailConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initClient = () => {
      gapi.client
        .init({
          clientId: "714027482644-u8g50252cs9sb7j8eedomqbbv8v2ulg3.apps.googleusercontent.com",
          scope: "https://www.googleapis.com/auth/gmail.readonly",
        })
        .then(() => console.log("GAPI client initialized"))
        .catch((error) =>
          console.error("Error initializing GAPI client:", error)
        );
    };

    gapi.load("client:auth2", initClient);
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      const googleUser = await authInstance.signIn();
      const token = googleUser.getAuthResponse().id_token;

      console.log("Google ID Token:", token);

      // Send the token to your Supabase backend for verification
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/google-oauth-callback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({ token }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Supabase Response:", data);
        toast({
          title: "Success",
          description: "Successfully connected to Gmail!",
        });
        onSuccess();
      } else {
        throw new Error(data.message || "Failed to verify token with backend");
      }
    } catch (error: any) {
      console.error("Error during Google OAuth flow:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect Gmail. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Connect Gmail</h2>
      <p className="text-sm text-gray-600">
        Connect your Gmail account to analyze your customer emails.
      </p>
      <Button 
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Connecting..." : "Connect with Gmail"}
      </Button>
    </Card>
  );
};

export default GmailConnect;