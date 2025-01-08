export type FeatureRequest = {
  title: string;
  impact_score: number;
  complexity: "Low" | "Medium" | "High";
  tags: string[];
  since: string;
  url?: string;
  description?: string;
};

export type FeatureRequestsData = {
  requests: FeatureRequest[];
  segments: string[];
};