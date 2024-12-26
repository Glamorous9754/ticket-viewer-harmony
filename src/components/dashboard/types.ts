export interface FreshDeskCredentials {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  status: 'active' | 'inactive' | 'expired';
}

export interface GmailCredentials {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  status: 'active' | 'inactive' | 'expired';
  email: string;
}

export interface ZendeskCredentials {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  status: 'active' | 'inactive' | 'expired';
  subdomain: string;
}

export interface FreshDeskConnection {
  id: string;
  auth_tokens: FreshDeskCredentials;
  created_at: string;
  updated_at: string;
  last_fetched_at: string;
  is_active: boolean;
  platform_name: string;
  platform_type: 'freshdesk' | 'zoho_desk' | 'zendesk' | 'gmail';
  profile_id: string;
}

export type PlatformConnectionRow = {
  id: string;
  auth_tokens: any;
  created_at: string;
  updated_at: string;
  last_fetched_at: string;
  is_active: boolean;
  platform_name: string;
  platform_type: 'freshdesk' | 'zoho_desk' | 'zendesk' | 'gmail';
  profile_id: string;
}