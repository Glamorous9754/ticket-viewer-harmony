export type Platform = "freshdesk" | "zoho" | "gmail" | "zendesk" | null;

export interface ConnectionStatus {
  [key: string]: {
    is_active: boolean;
    last_fetched_at?: string;
  } | null;
}