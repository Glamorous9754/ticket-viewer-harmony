import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { GmailConnect } from "./GmailConnect";
import { ZendeskConnect } from "./ZendeskConnect";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlatformConnectionRow } from "./types";

type Platform = "freshdesk" | "zoho" | "gmail" | "zendesk" | null;

export const PlatformSelector = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [connections, setConnections] = useState<PlatformConnectionRow[]>([]);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    const { data, error } = await supabase
      .from("platform_connections")
      .select("*");

    if (!error && data) {
      console.log("Fetched connections:", data); // Debug log
      setConnections(data);
    }
  };

  const handleSuccess = () => {
    fetchConnections();
    setSelectedPlatform(null);
  };

  if (selectedPlatform === "freshdesk") {
    return <FreshDeskConnect onSuccess={handleSuccess} />;
  }

  if (selectedPlatform === "zoho") {
    return <ZohoConnect onSuccess={handleSuccess} />;
  }

  if (selectedPlatform === "gmail") {
    return <GmailConnect onSuccess={handleSuccess} />;
  }

  if (selectedPlatform === "zendesk") {
    return <ZendeskConnect onSuccess={handleSuccess} />;
  }

  const getConnectionStatus = (platformType: string) => {
    const connection = connections.find(conn => conn.platform_type === platformType);
    console.log(`Checking connection for ${platformType}:`, connection); // Debug log
    return connection;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Connect Your Support Platform</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Zoho Desk</h3>
          <p className="text-gray-600 mb-4">
            Connect your Zoho Desk account to analyze customer tickets
          </p>
          <Button 
            onClick={() => setSelectedPlatform("zoho")}
            className="w-full"
          >
            {getConnectionStatus("zoho_desk") ? "Sync Zoho Desk" : "Connect Zoho Desk"}
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">FreshDesk</h3>
          <p className="text-gray-600 mb-4">
            Connect your FreshDesk account to analyze customer tickets
          </p>
          <Button 
            onClick={() => setSelectedPlatform("freshdesk")}
            className="w-full"
          >
            {getConnectionStatus("freshdesk") ? "Sync FreshDesk" : "Connect FreshDesk"}
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Gmail</h3>
          <p className="text-gray-600 mb-4">
            Connect your Gmail account to analyze customer emails
          </p>
          <Button 
            onClick={() => setSelectedPlatform("gmail")}
            className="w-full"
          >
            {getConnectionStatus("gmail") ? "Sync Gmail" : "Connect Gmail"}
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Zendesk</h3>
          <p className="text-gray-600 mb-4">
            Connect your Zendesk account to analyze support tickets
          </p>
          <Button 
            onClick={() => setSelectedPlatform("zendesk")}
            className="w-full"
          >
            {getConnectionStatus("zendesk") ? "Sync Zendesk" : "Connect Zendesk"}
          </Button>
        </Card>
      </div>
    </div>
  );
};