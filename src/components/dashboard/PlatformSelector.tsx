import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { GmailConnect } from "./GmailConnect";
import { ZendeskConnect } from "./ZendeskConnect";
import { useState } from "react";

type Platform = "freshdesk" | "zoho" | "gmail" | "zendesk" | null;

export const PlatformSelector = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleSuccess = () => {
    setIsConnected(false);
    setSelectedPlatform(null);
  };

  const handleConnect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsConnected(true);
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
            onClick={() => handleConnect("zoho")}
            className="w-full"
            disabled={isConnected}
          >
            Connect Zoho Desk
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">FreshDesk</h3>
          <p className="text-gray-600 mb-4">
            Connect your FreshDesk account to analyze customer tickets
          </p>
          <Button
            onClick={() => handleConnect("freshdesk")}
            className="w-full"
            disabled={isConnected}
          >
            Connect FreshDesk
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Gmail</h3>
          <p className="text-gray-600 mb-4">
            Connect your Gmail account to analyze customer emails
          </p>
          <Button
            onClick={() => handleConnect("gmail")}
            className="w-full"
            disabled={isConnected}
          >
            Connect Gmail
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Zendesk</h3>
          <p className="text-gray-600 mb-4">
            Connect your Zendesk account to analyze support tickets
          </p>
          <Button
            onClick={() => handleConnect("zendesk")}
            className="w-full"
            disabled={isConnected}
          >
            Connect Zendesk
          </Button>
        </Card>
      </div>
    </div>
  );
};