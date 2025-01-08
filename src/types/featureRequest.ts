export interface FeatureRequest {
  title: string;
  impact_score: number;
  tags: string[];
  complexity: "Low" | "Medium" | "High";
  description: string;
  since: string;
}