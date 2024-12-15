import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type ZohoCredentialsForm = {
  orgId: string;
};

export const ZohoConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ZohoCredentialsForm>();

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

  const handleConnectZoho = async (data: ZohoCredentialsForm) => {
    setIsLoading(true);
    console.log("Starting Zoho OAuth process...");

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("You must be logged in to connect Zoho");
      }

      const { data: authUrl, error: authError } = await supabase.functions.invoke(
        "initiate-zoho-oauth",
        {
          body: { 
            orgId: data.orgId,
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

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
      <h2 className="text-xl font-semibold">Connect Zoho</h2>
      <p className="text-sm text-gray-600">
        Enter your Zoho organization ID to connect your account.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleConnectZoho)} className="space-y-4">
          <FormField
            control={form.control}
            name="orgId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your Zoho organization ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Connecting..." : "Connect with Zoho"}
          </Button>
        </form>
      </Form>
    </div>
  );
};