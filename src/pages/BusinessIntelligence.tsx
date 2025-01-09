import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import WorkingWellSection from "../components/dashboard/sections/WorkingWellSection";
import RiskAlertsSection from "../components/dashboard/sections/RiskAlertsSection";
import OpportunityMetricsSection from "../components/dashboard/sections/OpportunityMetricsSection";
import MarketInsightsSection from "../components/dashboard/sections/MarketInsightsSection";
import { Skeleton } from "@/components/ui/skeleton";

const BusinessIntelligence = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [workingWell, setWorkingWell] = useState([]);
  const [riskAlerts, setRiskAlerts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error retrieving authenticated user:", userError);
          return;
        }

        if (!userData?.user) {
          console.error("No authenticated user found");
          return;
        }

        const userProfileId = userData.user.id;

        const { data, error } = await supabase
          .from("dashboard_data")
          .select("db")
          .eq("profile_id", userProfileId)
          .single();

        if (error) {
          console.error("Error fetching data from dashboard_data:", error);
          return;
        }

        // Ensure `db` field is parsed as JSON
        let parsedDb;
        if (data?.db) {
          parsedDb = typeof data.db === "string" ? JSON.parse(data.db) : data.db;
        }

        if (parsedDb?.business_intelligence_metrics) {
          const { whats_working, risk_alerts, opportunity_metrics, segments } =
            parsedDb.business_intelligence_metrics;

          setWorkingWell(whats_working || []);
          setRiskAlerts(risk_alerts || []);
          setOpportunities(opportunity_metrics || []);
          setInsights(
            Object.keys(segments || {}).map((segment) => ({
              segment,
              painPoints: segments[segment]?.key_pain_points || [],
              satisfaction: segments[segment]?.satisfaction_score || 0,
              suggestions: segments[segment]?.actionable_insights || "",
            }))
          );
        } else {
          console.warn("No business intelligence metrics found in the database.");
        }
      } catch (error) {
        console.error("Error fetching data from Supabase:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
        <WorkingWellSection items={workingWell} />
        <RiskAlertsSection alerts={riskAlerts} />
        <OpportunityMetricsSection opportunities={opportunities} />
        <MarketInsightsSection insights={insights} />
      </div>
    </div>
  );
};

export default BusinessIntelligence;
