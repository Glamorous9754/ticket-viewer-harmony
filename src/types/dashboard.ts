export interface CustomerIntelligenceItem {
  title: string;
  count: number;
  isRising: boolean;
  lastDate: string;
  sampleTickets: string[];
  commonPhrases: string[];
  suggestedCategory: string;
  overview?: string;
}

export interface FeatureRequest {
  summary: string;
  priority: number;
  segments: string[];
  complexity: "Low" | "Medium" | "High";
  status?: string;
  createdAt: string;
  description?: string;
}

export interface BusinessIntelligenceData {
  workingWell: {
    title: string;
    count: number;
    isRising: boolean;
    lastDate: string;
    sampleTickets: string[];
    commonPhrases: string[];
    suggestedCategory: string;
    overview?: string;
  }[];
  opportunities: {
    title: string;
    count: number;
    isRising: boolean;
    lastDate: string;
    sampleTickets: string[];
    commonPhrases: string[];
    suggestedCategory: string;
    overview?: string;
  }[];
  risks: {
    type: string;
    severity: "Low" | "Medium" | "High";
    segment: string;
    evidence: string;
  }[];
  insights: {
    segment: string;
    painPoints: string[];
    satisfaction: number;
    suggestions: string;
  }[];
}

export interface DashboardData {
  customerIntelligence: CustomerIntelligenceItem[];
  featureRequests: FeatureRequest[];
  businessIntelligence: BusinessIntelligenceData;
}