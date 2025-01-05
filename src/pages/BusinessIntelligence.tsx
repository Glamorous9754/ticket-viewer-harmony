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
    overview: "The mobile app has seen significant adoption with consistently positive feedback. Users particularly appreciate the intuitive interface and quick access to key features. The trend shows increasing engagement with mobile features, suggesting strong product-market fit in this area.",
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
    overview: "Developer satisfaction with API integration capabilities is trending upward. The well-documented API and successful integrations with major platforms like Salesforce indicate strong technical foundation and developer-friendly approach.",
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
    overview: "Growing demand for sustainability features, particularly carbon footprint tracking and reporting. This trend aligns with increasing environmental consciousness in the market and could represent a significant differentiation opportunity.",
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
    overview: "Consistent requests for return label automation indicate a clear pain point in current workflows. The focus on bulk processing suggests this feature could particularly benefit high-volume customers and improve operational efficiency.",
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