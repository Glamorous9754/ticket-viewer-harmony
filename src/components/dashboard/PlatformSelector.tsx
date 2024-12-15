import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { useState } from "react";

type Platform = "freshdesk" | "zoho" | null;

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Select Integration Platform</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">FreshDesk Integration</h3>
          <p className="text-gray-600 mb-4">
            Connect your FreshDesk account to analyze customer feature requests
          </p>
          <Button 
            onClick={() => setSelectedPlatform("freshdesk")}
            className="w-full"
          >
            Connect FreshDesk
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-medium mb-4">Zoho Desk Integration</h3>
          <p className="text-gray-600 mb-4">
            Connect your Zoho Desk account to analyze customer feature requests
          </p>
          <Button 
            onClick={() => setSelectedPlatform("zoho")}
            className="w-full"
          >
            Connect Zoho Desk
          </Button>
        </Card>
      </div>
    </div>
  );
};