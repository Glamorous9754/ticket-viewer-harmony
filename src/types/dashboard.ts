import { Json } from "@/integrations/supabase/types";

export interface DashboardData {
  id: string;
  profile_id: string;
  created_at: string | null;
  updated_at: string | null;
  customer_intelligence_issues: Json;
  business_intelligence_metrics: Json;
  feature_requests: Json;
}

export interface CustomerIntelligenceIssue {
  title: string;
  mentions: number;
  since: string;
  sample_tickets: string[];
  common_phrases: string[];
  suggested_category: string;
  overview: string;
}

export interface BusinessIntelligenceMetric {
  type: string;
  severity: "Low" | "Medium" | "High";
  segment: string;
  evidence: string;
}

export interface FeatureRequest {
  title: string;
  impact_score: number;
  tags: string[];
  complexity: "Low" | "Medium" | "High";
  description: string;
  since: string;
}