import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import WorkingWellSection from "../components/dashboard/sections/WorkingWellSection";
import RiskAlertsSection from "../components/dashboard/sections/RiskAlertsSection";
import OpportunityMetricsSection from "../components/dashboard/sections/OpportunityMetricsSection";
import MarketInsightsSection from "../components/dashboard/sections/MarketInsightsSection";
import { Skeleton } from "@/components/ui/skeleton";

const BusinessIntelligence = () => {
  const [businessData, setBusinessData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

        if (data?.db) {
          const parsedDb = typeof data.db === 'string' ? JSON.parse(data.db) : data.db;
          if (parsedDb.business_intelligence_metrics) {
            setBusinessData(parsedDb.business_intelligence_metrics);
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

  if (!businessData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Business Intelligence
          </h1>
          <p className="text-muted-foreground">No data available</p>
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
        <WorkingWellSection items={businessData.working_well || []} />
        <RiskAlertsSection alerts={businessData.risk_alerts || []} />
        <OpportunityMetricsSection opportunities={businessData.opportunities || []} />
        <MarketInsightsSection insights={businessData.market_insights || []} />
      </div>
    </div>
  );
};

export default BusinessIntelligence;