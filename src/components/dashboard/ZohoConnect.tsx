import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ZohoCredentialsForm>();

  const handleSyncZoho = async (data: ZohoCredentialsForm) => {
    setIsLoading(true);
    console.log("Starting Zoho sync with org ID:", data.orgId);

    try {
      // First, store the credentials
      const { error: credentialsError } = await supabase
        .from('zoho_credentials')
        .upsert({
          org_id: data.orgId,
          profile_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (credentialsError) {
        console.error("Credentials error:", credentialsError);
        throw new Error(credentialsError.message || 'Failed to store credentials');
      }

      // Then sync tickets
      const { data: response, error: functionError } = await supabase.functions.invoke('sync-zoho-tickets', {
        body: {},
      });

      console.log("Edge function response:", response);
      
      if (functionError) {
        console.error("Function error:", functionError);
        throw new Error(functionError.message || 'Failed to sync tickets');
      }

      if (!response?.success) {
        console.error("Response error:", response?.error);
        throw new Error(response?.error || 'Failed to sync tickets');
      }

      toast({
        title: "Success",
        description: "Zoho credentials saved and tickets synced successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error in Zoho sync process:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete Zoho sync process",
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
        Enter your Zoho organization ID to sync tickets.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSyncZoho)} className="space-y-4">
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
            {isLoading ? "Connecting..." : "Connect & Sync"}
          </Button>
        </form>
      </Form>
    </div>
  );
};