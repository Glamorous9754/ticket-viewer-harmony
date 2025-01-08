export interface BusinessIntelligenceMetric {
  type: string;
  severity: "Low" | "Medium" | "High";
  segment: string;
  evidence: string;
}