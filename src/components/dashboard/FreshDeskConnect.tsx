import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FreshDeskConnection, FreshDeskCredentials } from "./types";
import { FreshDeskConnectionCard } from "./FreshDeskConnectionCard";
import { FreshDeskConnectionForm } from "./FreshDeskConnectionForm";

export const FreshDeskConnect = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [connections, setConnections] = useState<FreshDeskConnection[]>([]);
  const [editingConnection, setEditingConnection] = useState<FreshDeskConnection | null>(null);

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
      setConnections(data as FreshDeskConnection[]);
    }
  };

  const handleConnect = async (credentials: FreshDeskCredentials) => {
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
          body: credentials,
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
          id: editingConnection?.id || undefined,
          profile_id: session.session.user.id,
          platform_name: 'freshdesk',
          auth_tokens: credentials
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
      setEditingConnection(null);
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

  const handleSync = async (connectionId: string) => {
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

  const handleEdit = (connection: FreshDeskConnection) => {
    setEditingConnection(connection);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {connections.length > 0 && !showForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((connection) => (
            <FreshDeskConnectionCard
              key={connection.id}
              connection={connection}
              onEdit={handleEdit}
              onSync={handleSync}
              isLoading={isLoading}
            />
          ))}
        </div>
      ) : null}

      {(!connections.length || showForm) && (
        <FreshDeskConnectionForm
          onSubmit={handleConnect}
          initialData={editingConnection?.auth_tokens}
          isLoading={isLoading}
          onCancel={() => {
            setShowForm(false);
            setEditingConnection(null);
          }}
        />
      )}

      {!showForm && connections.length > 0 && (
        <Button onClick={() => setShowForm(true)}>
          Add Another Connection
        </Button>
      )}
    </div>
  );
};