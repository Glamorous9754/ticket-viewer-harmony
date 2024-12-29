export type Platform = "freshdesk" | "zoho" | "gmail" | "zendesk" | null;

export type ConnectionStatus = {
  freshdesk: any | null;
  gmail: any | null;
  zoho: any | null;
  zendesk: any | null;
};