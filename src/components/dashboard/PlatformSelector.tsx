import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { GmailConnect } from "./GmailConnect";
import { ZendeskConnect } from "./ZendeskConnect";
import { Platform } from "./types/platform";
import { PlatformCard } from "./components/PlatformCard";
import { usePlatformState } from "./hooks/usePlatformState";
import { PlatformInfo } from "./types/platformState";

const platforms: PlatformInfo[] = [
  {
    name: "Zoho Desk",
    id: "zoho",
    description: "Connect your Zoho Desk account to analyze customer tickets",
  },
  {
    name: "FreshDesk",
    id: "freshdesk",
    description: "Connect your FreshDesk account to analyze customer tickets",
    comingSoon: true,
  },
  {
    name: "Gmail",
    id: "gmail",
    description: "Connect your Gmail account to analyze customer emails",
  },
  {
    name: "Zendesk",
    id: "zendesk",
    description: "Connect your Zendesk account to analyze support tickets",
  },
];

export const PlatformSelector = () => {
  const {
    selectedPlatform,
    authenticatedPlatform,
    isAuthenticating,
    handleConnect,
    handleDisconnect,
  } = usePlatformState();

  // Render platform-specific connect components
  if (selectedPlatform === "freshdesk") {
    return <FreshDeskConnect onSuccess={() => {}} />;
  }
  if (selectedPlatform === "zoho") {
    return <ZohoConnect onSuccess={() => {}} />;
  }
  if (selectedPlatform === "gmail") {
    return <GmailConnect onSuccess={() => {}} />;
  }
  if (selectedPlatform === "zendesk") {
    return <ZendeskConnect onSuccess={() => {}} />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Connect Your Support Platform</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((platform) => (
          <PlatformCard
            key={platform.id}
            {...platform}
            authenticatedPlatform={authenticatedPlatform}
            isAuthenticating={isAuthenticating}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        ))}
      </div>
    </div>
  );
};