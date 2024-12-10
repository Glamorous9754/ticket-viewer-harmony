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

  const handleConnectZoho = async (data: ZohoCredentialsForm) => {
    setIsLoading(true);
    console.log("Starting Zoho connection with org ID:", data.orgId);

    try {
      // Store org_id temporarily and validate it
      const { error: credentialsError } = await supabase
        .from("zoho_credentials")
        .upsert({
          org_id: data.orgId,
          profile_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (credentialsError) {
        console.error("Error storing credentials:", credentialsError);
        throw new Error("Failed to store organization ID");
      }

      // Call the validation function
      const { data: validationResponse, error: validationError } = await supabase.functions.invoke(
        "validate-zoho-credentials",
        {
          body: { orgId: data.orgId },
        }
      );

      if (validationError) {
        console.error("Validation function error:", validationError);
        throw new Error(validationError.message || "Failed to validate organization ID");
      }

      if (!validationResponse?.success) {
        console.error("Validation failed:", validationResponse?.error);
        throw new Error(validationResponse?.error || "Invalid organization ID");
      }

      toast({
        title: "Success",
        description: "Organization ID validated successfully.",
      });

      onSuccess();
    } catch (error) {
      console.error("Error in Zoho connection process:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to validate organization ID",
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
        Enter your Zoho organization ID to connect and validate.
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
            {isLoading ? "Connecting..." : "Connect & Validate"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
