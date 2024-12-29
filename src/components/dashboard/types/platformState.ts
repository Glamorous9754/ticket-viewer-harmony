import { Platform } from "./platform";

export interface PlatformState {
  selectedPlatform: Platform;
  authenticatedPlatform: Platform;
  isAuthenticating: boolean;
  isSyncing: boolean;
}

export interface PlatformInfo {
  name: string;
  id: Platform;
  description: string;
  comingSoon?: boolean;
}