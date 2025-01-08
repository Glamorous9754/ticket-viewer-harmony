export interface CustomerIntelligenceIssue {
  title: string;
  mentions: number;
  since: string;
  common_phrases: string[];
  sample_tickets: string[];
  suggested_category: string;
  color: "red" | "green";
}

export interface CustomerIntelligenceData {
  customer_intelligence_issues: CustomerIntelligenceIssue[];
}