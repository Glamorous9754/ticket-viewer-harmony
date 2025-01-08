import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import WorkingWellSection from "../components/dashboard/sections/WorkingWellSection";
import RiskAlertsSection from "../components/dashboard/sections/RiskAlertsSection";
import OpportunityMetricsSection from "../components/dashboard/sections/OpportunityMetricsSection";
import MarketInsightsSection from "../components/dashboard/sections/MarketInsightsSection";

const BusinessIntelligence = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard_data", "business_intelligence"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_data")
        .select("business_intelligence_metrics")
        .maybeSingle();

      if (error) {
        console.error("Error fetching business intelligence data:", error);
        throw error;
      }

      return data?.business_intelligence_metrics || {};
    },
  });

  const { whats_working = [], risk_alerts = [], opportunity_metrics = [], product_market_insights = {} } =
    dashboardData.segments || {};

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Intelligence</h1>
      <p className="text-gray-500">
        Monitor business health, opportunities, and customer satisfaction metrics
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WorkingWellSection items={whats_working} />
        <RiskAlertsSection alerts={risk_alerts} />
        <OpportunityMetricsSection opportunities={opportunity_metrics} />
        <MarketInsightsSection insights={Object.entries(product_market_insights).map(([segment, insight]) => ({
          segment,
          painPoints: insight.key_pain_points,
          satisfaction: insight.satisfaction_score,
          suggestions: insight.actionable_insights,
        }))} />
      </div>
    </div>
  );
};

export default BusinessIntelligence;
