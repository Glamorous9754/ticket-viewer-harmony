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
  clientId: string;
  clientSecret: string;
};

export const ZohoConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ZohoCredentialsForm>();

  const handleConnectZoho = async (data: ZohoCredentialsForm) => {
    setIsLoading(true);
    console.log("Starting Zoho connection validation...");

    try {
      // Call the validation function with all credentials
      const { data: validationResponse, error: validationError } = await supabase.functions.invoke(
        "validate-zoho-credentials",
        {
          body: { 
            orgId: data.orgId,
            clientId: data.clientId,
            clientSecret: data.clientSecret
          },
        }
      );

      if (validationError) {
        console.error("Validation function error:", validationError);
        throw new Error(validationError.message || "Failed to validate credentials");
      }

      if (!validationResponse?.success) {
        console.error("Validation failed:", validationResponse?.error);
        throw new Error(validationResponse?.error || "Invalid credentials");
      }

      toast({
        title: "Success",
        description: "Successfully connected to Zoho!",
      });

      onSuccess();
    } catch (error) {
      console.error("Error in Zoho connection process:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to validate credentials",
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
        Enter your Zoho credentials to validate the connection.
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

          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your Zoho client ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientSecret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Secret</FormLabel>
                <FormControl>
                  <Input 
                    type="password"
                    placeholder="Enter your Zoho client secret" 
                    {...field} 
                  />
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
            {isLoading ? "Validating..." : "Validate Connection"}
          </Button>
        </form>
      </Form>
    </div>
  );
};