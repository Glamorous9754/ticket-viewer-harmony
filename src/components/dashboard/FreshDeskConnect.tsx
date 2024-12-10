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

type FreshDeskCredentialsForm = {
  apiKey: string;
  domain: string;
};

export const FreshDeskConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FreshDeskCredentialsForm>();

  const handleConnect = async (data: FreshDeskCredentialsForm) => {
    setIsLoading(true);
    console.log("Starting FreshDesk connection validation...");

    try {
      const { data: validationResponse, error: validationError } = await supabase.functions.invoke(
        "validate-freshdesk-credentials",
        {
          body: { 
            apiKey: data.apiKey,
            domain: data.domain,
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
        description: "Successfully connected to FreshDesk!",
      });

      onSuccess();
    } catch (error) {
      console.error("Error in FreshDesk connection process:", error);
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
      <h2 className="text-xl font-semibold">Connect FreshDesk</h2>
      <p className="text-sm text-gray-600">
        Enter your FreshDesk credentials to validate the connection.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleConnect)} className="space-y-4">
          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domain</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="your-domain (without .freshdesk.com)" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input 
                    type="password"
                    placeholder="Enter your FreshDesk API key" 
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