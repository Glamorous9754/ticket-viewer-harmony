export type Platform = "freshdesk" | "zoho" | "gmail" | "zendesk" | null;

export type ConnectionStatus = {
  freshdesk: any | null;
  gmail: any | null;
  zoho: any | null;
  zendesk: any | null;
};

export interface PlatformActionsProps {
  platform: Platform;
  isConnected: boolean;
  activePlatform: Platform;
  isSyncing: boolean;
  isLoading: Platform | null;
  onConnect: (platform: Platform) => void;
  onSync: (platform: Platform) => void;
  onDisconnect: (platform: Platform) => void;
}