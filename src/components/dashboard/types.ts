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
  platform_type: 'freshdesk' | 'zoho_desk' | 'zendesk' | 'gmail';
  profile_id: string;
}

// Type guard to check if a JSON object is FreshDeskCredentials
export function isFreshDeskCredentials(obj: any): obj is FreshDeskCredentials {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'domain' in obj &&
    'apiKey' in obj &&
    typeof obj.domain === 'string' &&
    typeof obj.apiKey === 'string'
  );
}