import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { useState } from "react";

type Platform = "freshdesk" | "zoho" | "gmail" | null;

export const PlatformSelector = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);

  const handleSuccess = () => {
    setSelectedPlatform(null);
  };

  if (selectedPlatform === "freshdesk") {
    return <FreshDeskConnect onSuccess={handleSuccess} />;
  }

  if (selectedPlatform === "zoho") {
    return <ZohoConnect onSuccess={handleSuccess} />;
  }

  // Gmail connection will be implemented later
  if (selectedPlatform === "gmail") {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Gmail Connection</h2>
        <p className="text-gray-600">Gmail integration coming soon...</p>
        <Button onClick={() => setSelectedPlatform(null)} className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Connect Your Support Platform</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Zoho Desk</h3>
          <p className="text-gray-600 mb-4">
            Connect your Zoho Desk account to analyze customer tickets
          </p>
          <Button 
            onClick={() => setSelectedPlatform("zoho")}
            className="w-full"
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
            onClick={() => setSelectedPlatform("freshdesk")}
            className="w-full"
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
            onClick={() => setSelectedPlatform("gmail")}
            className="w-full"
          >
            Connect Gmail
          </Button>
        </Card>
      </div>
    </div>
  );
};