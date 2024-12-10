export interface FreshDeskCredentials {
  domain: string;
  apiKey: string;
}

export interface FreshDeskConnection {
  id: string;
  auth_tokens: FreshDeskCredentials;
  created_at: string;
  updated_at: string;
  last_fetched_at: string;
  is_active: boolean;
  platform_name: string;
  profile_id: string;
}