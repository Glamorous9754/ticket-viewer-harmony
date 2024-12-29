export type Platform = "freshdesk" | "zoho" | "gmail" | "zendesk" | null;

export interface ConnectionStatus {
  [key: string]: {
    is_active: boolean;
    last_fetched_at?: string;
  } | null;
}

export interface PlatformActionsProps {
  platform: Platform;
  isConnected: boolean;
  activePlatform: Platform | undefined;
  isSyncing: boolean;
  isLoading: Platform | null;
  onConnect: (platform: Platform) => void;
  onSync: (platform: Platform) => void;
  onDisconnect: (platform: Platform) => void;
}