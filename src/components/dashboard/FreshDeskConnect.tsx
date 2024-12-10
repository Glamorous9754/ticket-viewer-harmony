import { useState, useEffect } from "react";
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
import { Card } from "@/components/ui/card";
import { Edit, ExternalLink } from "lucide-react";

type FreshDeskCredentialsForm = {
  apiKey: string;
  domain: string;
};

type Connection = {
  id: string;
  auth_tokens: {
    domain: string;
    apiKey: string;
  };
};

export const FreshDeskConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const form = useForm<FreshDeskCredentialsForm>();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    const { data } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('platform_name', 'freshdesk');
    
    if (data) {
      setConnections(data);
    }
  };

  const handleConnect = async (data: FreshDeskCredentialsForm) => {
    setIsLoading(true);
    console.log("Starting FreshDesk connection validation...");

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("You must be logged in to connect FreshDesk");
      }

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

      const { error: insertError } = await supabase
        .from('platform_connections')
        .upsert({
          id: editingId || undefined,
          profile_id: session.session.user.id,
          platform_name: 'freshdesk',
          auth_tokens: {
            apiKey: data.apiKey,
            domain: data.domain
          }
        });

      if (insertError) {
        console.error("Error storing credentials:", insertError);
        throw new Error("Failed to store credentials");
      }

      toast({
        title: "Success",
        description: "Successfully connected to FreshDesk!",
      });

      setShowForm(false);
      setEditingId(null);
      fetchConnections();
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

  const handleDomainClick = async (connectionId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke(
        "sync-freshdesk-tickets",
        {
          body: { connectionId },
        }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully synced tickets!",
      });
      onSuccess();
    } catch (error) {
      console.error("Error syncing tickets:", error);
      toast({
        title: "Error",
        description: "Failed to sync tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {connections.length > 0 && !showForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((connection) => (
            <Card key={connection.id} className="p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleDomainClick(connection.id)}
                  className="text-lg font-medium hover:underline flex items-center gap-2"
                  disabled={isLoading}
                >
                  {connection.auth_tokens.domain}
                  <ExternalLink className="h-4 w-4" />
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingId(connection.id);
                    form.reset({
                      domain: connection.auth_tokens.domain,
                      apiKey: connection.auth_tokens.apiKey,
                    });
                    setShowForm(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {(!connections.length || showForm) && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit FreshDesk Connection" : "Connect FreshDesk"}
            </h2>
            {showForm && (
              <Button
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  form.reset();
                }}
              >
                Cancel
              </Button>
            )}
          </div>
          
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
                {isLoading ? "Processing..." : editingId ? "Update Connection" : "Validate Connection"}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {!showForm && connections.length > 0 && (
        <Button onClick={() => setShowForm(true)}>
          Add Another Connection
        </Button>
      )}
    </div>
  );
};