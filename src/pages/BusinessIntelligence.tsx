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
              isRising: false, // You might want to add this to your data structure
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
              severity: "High", // You might want to add this to your data structure
              segment: item.affecting,
              evidence: item.details,
            })) || []
          );

          // Map opportunities
          setOpportunities(
            opportunity_metrics?.map((item) => ({
              title: item.title,
              count: parseInt(item.mentions),
              isRising: true, // You might want to add this to your data structure
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
                painPoints: data.key_pain_points || [],
                satisfaction: parseFloat(data.satisfaction_score) || 0,
                suggestions: data.actionable_insights || "",
              }))
            );
          }
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