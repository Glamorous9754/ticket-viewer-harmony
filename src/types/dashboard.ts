import { Json } from "@/integrations/supabase/types";
import { CustomerIntelligenceIssue } from "./customerIntelligence";
import { BusinessIntelligenceMetric } from "./businessIntelligence";
import { FeatureRequest } from "./featureRequest";

export interface DashboardData {
  id: string;
  profile_id: string;
  created_at: string | null;
  updated_at: string | null;
  customer_intelligence_issues: Json | CustomerIntelligenceIssue[];
  business_intelligence_metrics: Json | BusinessIntelligenceMetric[];
  feature_requests: Json | FeatureRequest[];
}

export type { CustomerIntelligenceIssue } from "./customerIntelligence";
export type { BusinessIntelligenceMetric } from "./businessIntelligence";
export type { FeatureRequest } from "./featureRequest";