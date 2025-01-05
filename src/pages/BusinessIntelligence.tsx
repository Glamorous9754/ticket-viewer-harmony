import RiskAlert from "../components/dashboard/RiskAlert";
import TrendingIssue from "../components/dashboard/TrendingIssue";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { TrendingUp, Rocket } from "lucide-react";

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
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-6 w-48 mb-4" />
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
          
          <div>
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="rounded-lg border p-4 space-y-3">
                  <Skeleton className="h-6 w-1/2" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Business Intelligence
        </h1>
        <p className="text-gray-500">
          Monitor business health, opportunities, and customer satisfaction metrics
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* What's Working Well Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">What's Working Well</h2>
          </div>
          <div className="space-y-4">
            {mockWorkingWell.map((item, index) => (
              <TrendingIssue key={index} {...item} />
            ))}
          </div>
        </div>

        {/* Risk Alerts Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Risk Alerts</h2>
          {mockRiskAlerts.map((alert, index) => (
            <RiskAlert key={index} {...alert} />
          ))}
        </div>

        {/* Opportunity Metrics Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Opportunity Metrics</h2>
          </div>
          <div className="space-y-4">
            {mockOpportunities.map((item, index) => (
              <TrendingIssue key={index} {...item} />
            ))}
          </div>
        </div>
        
        {/* Product-Market Insights */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Product-Market Insights
          </h2>
          <div className="space-y-4">
            {mockInsights.map((insight, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <h3 className="font-medium text-gray-900 mb-2">
                  {insight.segment} Segment
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Key Pain Points</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {insight.painPoints.map((point, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Satisfaction Score: {insight.satisfaction}/10
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{
                          width: `${(insight.satisfaction / 10) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{insight.suggestions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligence;