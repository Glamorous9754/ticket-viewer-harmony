import { useState, useEffect } from "react";
import { FreshDeskConnect } from "./FreshDeskConnect";
import { ZohoConnect } from "./ZohoConnect";
import { GmailConnect } from "./GmailConnect";
import { ZendeskConnect } from "./ZendeskConnect";
import { PlatformCard } from "./PlatformCard";
import { PlatformActions } from "./PlatformActions";
import { usePlatformConnection } from "./hooks/usePlatformConnection";
import { Platform } from "./types/platform";

export const PlatformSelector = () => {
  const {
    selectedPlatform,
    setSelectedPlatform,
    isLoading,
    isSyncing,
    connectionStatus,
    handleSync,
    handleDisconnect,
    checkConnections,
  } = usePlatformConnection();

  const handleSuccess = () => {
    setSelectedPlatform(null);
    checkConnections();
  };

  // Get the currently active platform
  const activePlatform = Object.entries(connectionStatus).find(
    ([_, status]) => status?.is_active
  )?.[0] as Platform | undefined;

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
        <PlatformCard
          title="Zoho Desk"
          description="Connect your Zoho Desk account to analyze customer tickets"
          isConnected={!!connectionStatus.zoho?.is_active}
          actions={
            <PlatformActions
              platform="zoho"
              isConnected={!!connectionStatus.zoho?.is_active}
              activePlatform={activePlatform}
              isSyncing={isSyncing}
              isLoading={isLoading}
              onConnect={() => setSelectedPlatform("zoho")}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
            />
          }
        />

        <PlatformCard
          title="FreshDesk"
          description="Connect your FreshDesk account to analyze customer tickets"
          isConnected={false}
          actions={
            <PlatformActions
              platform="freshdesk"
              isConnected={false}
              activePlatform={activePlatform}
              isSyncing={isSyncing}
              isLoading={isLoading}
              onConnect={() => setSelectedPlatform("freshdesk")}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
            />
          }
        />

        <PlatformCard
          title="Gmail"
          description="Connect your Gmail account to analyze customer emails"
          isConnected={!!connectionStatus.gmail?.is_active}
          actions={
            <PlatformActions
              platform="gmail"
              isConnected={!!connectionStatus.gmail?.is_active}
              activePlatform={activePlatform}
              isSyncing={isSyncing}
              isLoading={isLoading}
              onConnect={() => setSelectedPlatform("gmail")}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
            />
          }
        />

        <PlatformCard
          title="Zendesk"
          description="Connect your Zendesk account to analyze support tickets"
          isConnected={!!connectionStatus.zendesk?.is_active}
          actions={
            <PlatformActions
              platform="zendesk"
              isConnected={!!connectionStatus.zendesk?.is_active}
              activePlatform={activePlatform}
              isSyncing={isSyncing}
              isLoading={isLoading}
              onConnect={() => setSelectedPlatform("zendesk")}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
            />
          }
        />
      </div>
    </div>
  );
};
