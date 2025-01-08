import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardData } from "@/types/dashboard";

const mapCustomerIntelligence = (data: any) => {
  if (!data?.customer_intelligence_data?.customer_intelligence_issues) {
    return [];
  }
  
  return data.customer_intelligence_data.customer_intelligence_issues.map((issue: any) => ({
    title: issue.title,
    count: issue.mentions,
    isRising: true, // You might want to calculate this based on historical data
    lastDate: issue.since,
    sampleTickets: issue.sample_tickets,
    commonPhrases: issue.common_phrases,
    suggestedCategory: issue.suggested_category,
    overview: issue.description
  }));
};

const mapFeatureRequests = (data: any) => {
  if (!data?.feature_requests_data?.feature_requests?.requests) {
    return [];
  }

  return data.feature_requests_data.feature_requests.requests.map((request: any) => ({
    summary: request.title,
    priority: request.impact_score,
    segments: request.tags,
    complexity: request.complexity.charAt(0).toUpperCase() + request.complexity.slice(1),
    status: "Open",
    createdAt: request.since,
    description: request.description
  }));
};

const mapBusinessIntelligence = (data: any): BusinessIntelligenceData => {
  if (!data?.business_intelligence_data?.business_intelligence_metrics?.segments) {
    return {
      workingWell: [],
      opportunities: [],
      risks: [],
      insights: []
    };
  }

  const segments = data.business_intelligence_data.business_intelligence_metrics.segments;

  return {
    workingWell: segments.working_well?.map((item: any) => ({
      title: item.title,
      count: item.mentions,
      isRising: true,
      lastDate: item.since,
      sampleTickets: item.sample_tickets,
      commonPhrases: item.common_phrases,
      suggestedCategory: item.suggested_category,
      overview: item.description
    })) || [],
    opportunities: segments.opportunities?.map((item: any) => ({
      title: item.title,
      count: item.mentions,
      isRising: true,
      lastDate: item.since,
      sampleTickets: item.sample_tickets,
      commonPhrases: item.common_phrases,
      suggestedCategory: item.suggested_category,
      overview: item.description
    })) || [],
    risks: segments.risks?.map((risk: any) => ({
      type: risk.title,
      severity: risk.severity,
      segment: risk.affecting,
      evidence: risk.details
    })) || [],
    insights: segments.product_market_insights?.map((insight: any) => ({
      segment: insight.segment,
      painPoints: insight.key_pain_points,
      satisfaction: insight.satisfaction_score,
      suggestions: insight.actionable_insights
    })) || []
  };
};

const fetchDashboardData = async (): Promise<DashboardData> => {
  const { data, error } = await supabase
    .from("dashboard_data")
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return {
    customerIntelligence: mapCustomerIntelligence(data),
    featureRequests: mapFeatureRequests(data),
    businessIntelligence: mapBusinessIntelligence(data)
  };
};

export const useDashboardData = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: fetchDashboardData,
  });

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dashboard_data",
        },
        () => {
          refetch();
          toast.info("Dashboard data updated");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return {
    data,
    isLoading,
    error,
  };
};