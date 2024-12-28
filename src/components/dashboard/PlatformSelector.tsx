import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { GmailConnect } from "./GmailConnect";
import { ZendeskConnect } from "./ZendeskConnect";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Platform = "freshdesk" | "zoho" | "gmail" | "zendesk" | null;

type ConnectionStatus = {
  freshdesk: boolean;
  zoho: boolean;
  gmail: boolean;
  zendesk: boolean;
};

export const PlatformSelector = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    freshdesk: false,
    zoho: false,
    gmail: false,
    zendesk: false,
  });

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Check Freshdesk connection
    const { data: freshdesk } = await supabase
      .from("platform_connections")
      .select("*")
      .eq("platform_type", "freshdesk")
      .single();

    // Check Gmail connection
    const { data: gmail } = await supabase
      .from("gmail_credentials")
      .select("*")
      .eq("status", "active")
      .single();

    // Check Zoho connection
    const { data: zoho } = await supabase
      .from("zoho_credentials")
      .select("*")
      .eq("status", "active")
      .single();

    // Check Zendesk connection
    const { data: zendesk } = await supabase
      .from("zendesk_credentials")
      .select("*")
      .eq("status", "active")
      .single();

    console.log("Connection status:", { freshdesk, gmail, zoho, zendesk });

    setConnectionStatus({
      freshdesk: !!freshdesk,
      gmail: !!gmail,
      zoho: !!zoho,
      zendesk: !!zendesk,
    });
  };

  const handleSuccess = () => {
    checkConnections();
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
            {connectionStatus.zoho ? "Sync Zoho Desk" : "Connect Zoho Desk"}
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
            {connectionStatus.freshdesk ? "Sync FreshDesk" : "Connect FreshDesk"}
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
            {connectionStatus.gmail ? "Sync Gmail" : "Connect Gmail"}
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
            {connectionStatus.zendesk ? "Sync Zendesk" : "Connect Zendesk"}
          </Button>
        </Card>
      </div>
    </div>
  );
};