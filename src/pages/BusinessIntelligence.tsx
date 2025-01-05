import { useState } from "react";
import WorkingWellSection from "../components/dashboard/sections/WorkingWellSection";
import RiskAlertsSection from "../components/dashboard/sections/RiskAlertsSection";
import OpportunityMetricsSection from "../components/dashboard/sections/OpportunityMetricsSection";
import MarketInsightsSection from "../components/dashboard/sections/MarketInsightsSection";
import { Skeleton } from "@/components/ui/skeleton";

const mockRiskAlerts = [
  {
    type: "High Churn Risk",
    severity: "High" as const,
    segment: "Enterprise Customers",
    evidence: "5 enterprise customers reported critical bugs in the last 24 hours",
  },
  {
    type: "Feature Adoption",
    severity: "Medium" as const,
    segment: "Pro Users",
    evidence: "New dashboard feature has 25% lower adoption rate than expected",
  },
];

const mockWorkingWell = [
  {
    title: "Mobile App Usage",
    count: 127,
    isRising: true,
    lastDate: "2024-03-15T10:30:00",
    sampleTickets: [
      "Love the new mobile interface!",
      "Mobile app makes tracking so much easier",
    ],
    commonPhrases: ["intuitive", "fast", "convenient"],
    suggestedCategory: "Mobile Experience",
    recommendedSolutions: ["Expand mobile features", "Add push notifications"],
  },
  {
    title: "API Integration Success",
    count: 85,
    isRising: true,
    lastDate: "2024-03-14T15:45:00",
    sampleTickets: [
      "Successfully integrated with Salesforce",
      "API documentation was very helpful",
    ],
    commonPhrases: ["easy integration", "well documented", "reliable"],
    suggestedCategory: "Developer Experience",
  },
];

const mockOpportunities = [
  {
    title: "Sustainability Features",
    count: 45,
    isRising: true,
    lastDate: "2024-03-15T09:00:00",
    sampleTickets: [
      "Can we track our carbon footprint?",
      "Need sustainability reporting features",
    ],
    commonPhrases: ["carbon tracking", "eco-friendly", "sustainability"],
    suggestedCategory: "Sustainability",
    recommendedSolutions: [
      "Implement carbon footprint tracking",
      "Add sustainability reporting dashboard",
    ],
  },
  {
    title: "Return Label Automation",
    count: 38,
    isRising: true,
    lastDate: "2024-03-14T16:20:00",
    sampleTickets: [
      "Need automated return labels",
      "Can we bulk generate return labels?",
    ],
    commonPhrases: ["return labels", "automation", "bulk processing"],
    suggestedCategory: "Process Automation",
  },
];

const mockInsights = [
  {
    segment: "Enterprise",
    painPoints: ["API Performance", "Custom Integrations"],
    satisfaction: 7.5,
    suggestions: "Improve API documentation and add more integration options",
  },
  {
    segment: "Small Business",
    painPoints: ["Pricing", "Onboarding"],
    satisfaction: 8.2,
    suggestions: "Simplify onboarding process and review pricing tiers",
  },
];

const BusinessIntelligence = () => {
  const [isLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-[600px] w-full" />
          </div>
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Business Intelligence
        </h1>
        <p className="text-muted-foreground">
          Monitor business health, opportunities, and customer satisfaction metrics
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WorkingWellSection items={mockWorkingWell} />
        <RiskAlertsSection alerts={mockRiskAlerts} />
        <OpportunityMetricsSection opportunities={mockOpportunities} />
        <MarketInsightsSection insights={mockInsights} />
      </div>
    </div>
  );
};

export default BusinessIntelligence;