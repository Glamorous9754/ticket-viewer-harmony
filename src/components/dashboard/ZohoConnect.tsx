import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ZohoConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSyncZoho = async () => {
    setIsLoading(true);
    console.log("Starting Zoho sync...");

    try {
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
        description: "Tickets synced successfully from Zoho",
      });

      onSuccess();
    } catch (error) {
      console.error('Error syncing Zoho tickets:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sync Zoho tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
      <h2 className="text-xl font-semibold">Sync Zoho Tickets</h2>
      <p className="text-sm text-gray-600">
        Click the button below to sync tickets from Zoho.
      </p>
      <Button 
        onClick={handleSyncZoho} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Syncing..." : "Sync Tickets"}
      </Button>
    </div>
  );
};