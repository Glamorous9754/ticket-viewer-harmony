import { useState } from "react";
import RiskAlert from "../components/dashboard/RiskAlert";
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
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for demonstration
  setTimeout(() => setIsLoading(false), 1500);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Business Intelligence
        </h1>
        <p className="text-gray-500">
          Monitor business health and customer satisfaction metrics
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Risk Alerts</h2>
          {isLoading ? (
            <>
              {[1, 2].map((index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            mockRiskAlerts.map((alert, index) => (
              <RiskAlert key={index} {...alert} />
            ))
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Product-Market Insights
          </h2>
          <div className="space-y-4">
            {isLoading ? (
              <>
                {[1, 2].map((index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-1/2" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              mockInsights.map((insight, index) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligence;