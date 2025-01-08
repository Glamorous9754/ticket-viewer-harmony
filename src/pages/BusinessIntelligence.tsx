import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import WorkingWellSection from "../components/dashboard/sections/WorkingWellSection";
import RiskAlertsSection from "../components/dashboard/sections/RiskAlertsSection";
import OpportunityMetricsSection from "../components/dashboard/sections/OpportunityMetricsSection";
import MarketInsightsSection from "../components/dashboard/sections/MarketInsightsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardData, BusinessIntelligenceMetric } from "@/types/dashboard";
import { toast } from "sonner";

const BusinessIntelligence = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard_data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_data")
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
        return null;
      }

      console.log("Raw dashboard data:", data);
      
      if (data?.business_intelligence_metrics) {
        try {
          // Parse the JSON data if it's a string
          const metrics = typeof data.business_intelligence_metrics === 'string' 
            ? JSON.parse(data.business_intelligence_metrics)
            : data.business_intelligence_metrics;
            
          console.log("Parsed business metrics:", metrics);
          return {
            ...data,
            business_intelligence_metrics: metrics
          };
        } catch (e) {
          console.error("Error parsing business metrics:", e);
          toast.error("Error parsing dashboard data");
          return data;
        }
      }
      
      return data;
    },
  });

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

  // Use mock data until we properly parse the JSON from Supabase
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
    },
  ];

  const mockInsights = [
    {
      segment: "Enterprise",
      painPoints: ["API Performance", "Custom Integrations"],
      satisfaction: 7.5,
      suggestions: "Improve API documentation and add more integration options",
    },
  ];

  const businessMetrics = dashboardData?.business_intelligence_metrics as BusinessIntelligenceMetric[] || mockRiskAlerts;

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
        <RiskAlertsSection alerts={businessMetrics} />
        <OpportunityMetricsSection opportunities={mockOpportunities} />
        <MarketInsightsSection insights={mockInsights} />
      </div>
    </div>
  );
};

export default BusinessIntelligence;
