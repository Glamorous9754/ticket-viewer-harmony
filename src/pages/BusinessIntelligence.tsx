import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import WorkingWellSection from "../components/dashboard/sections/WorkingWellSection";
import RiskAlertsSection from "../components/dashboard/sections/RiskAlertsSection";
import OpportunityMetricsSection from "../components/dashboard/sections/OpportunityMetricsSection";
import MarketInsightsSection from "../components/dashboard/sections/MarketInsightsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { OutdatedDataMessage } from "../components/dashboard/OutdatedDataMessage";

interface ProductMarketInsight {
  color: string;
  key_pain_points: string[];
  satisfaction_score: string;
  actionable_insights: string;
}

const BusinessIntelligence = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [workingWell, setWorkingWell] = useState([]);
  const [riskAlerts, setRiskAlerts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [insights, setInsights] = useState([]);
  const [hasActiveConnection, setHasActiveConnection] = useState(true);

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

        // Check for active platform connections
        const { data: connections, error: connectionsError } = await supabase
          .from("platform_connections")
          .select("is_active")
          .eq("profile_id", userProfileId)
          .eq("is_active", true)
          .limit(1);

        setHasActiveConnection(connections && connections.length > 0);

        const { data, error } = await supabase
          .from("dashboard_data")
          .select("db")
          .eq("profile_id", userProfileId)
          .single();

        if (error) {
          console.error("Error fetching data from dashboard_data:", error);
          return;
        }

        // Parse the db field if it's a string
        let parsedDb;
        if (data?.db) {
          parsedDb = typeof data.db === "string" ? JSON.parse(data.db) : data.db;
        }

        if (parsedDb?.business_intelligence_metrics?.segments) {
          const { whats_working, risk_alerts, opportunity_metrics, product_market_insights } =
            parsedDb.business_intelligence_metrics.segments;

          // Map working well items
          setWorkingWell(
            whats_working?.map((item) => ({
              title: item.title,
              count: parseInt(item.mentions),
              isRising: false,
              lastDate: item.since,
              sampleTickets: item.sample_tickets,
              commonPhrases: item.common_phrases,
              suggestedCategory: item.suggested_category,
              color: item.color,
            })) || []
          );

          // Map risk alerts
          setRiskAlerts(
            risk_alerts?.map((item) => ({
              type: item.title,
              severity: item.color === "red" ? "High" : "Low",
              segment: item.affecting,
              evidence: item.details,
            })) || []
          );

          // Map opportunities
          setOpportunities(
            opportunity_metrics?.map((item) => ({
              title: item.title,
              count: parseInt(item.mentions),
              isRising: item.color === "red",
              lastDate: item.since,
              sampleTickets: item.sample_tickets,
              commonPhrases: item.common_phrases,
              suggestedCategory: item.suggested_category,
              color: item.color,
            })) || []
          );

          // Map market insights
          if (product_market_insights) {
            setInsights(
              Object.entries(product_market_insights).map(([segment, data]) => ({
                segment,
                painPoints: (data as ProductMarketInsight).key_pain_points || [],
                satisfaction: parseFloat((data as ProductMarketInsight).satisfaction_score) || 0,
                suggestions: (data as ProductMarketInsight).actionable_insights || "",
              }))
            );
          }
        }
      } catch (error: any) {
        console.error("Error fetching data from Supabase:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      
      {!hasActiveConnection && !isLoading && (workingWell.length > 0 || 
       riskAlerts.length > 0 || opportunities.length > 0 || insights.length > 0) && (
        <OutdatedDataMessage />
      )}

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
