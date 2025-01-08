import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CustomerIntelligenceItem {
  title: string;
  count: number;
  isRising: boolean;
  lastDate: string;
  sampleTickets: string[];
  commonPhrases: string[];
  suggestedCategory: string;
  overview?: string;
}

export interface FeatureRequest {
  summary: string;
  priority: number;
  segments: string[];
  complexity: "Low" | "Medium" | "High";
  status?: string;
  createdAt: string;
  description?: string;
}

export interface BusinessIntelligenceData {
  workingWell: {
    title: string;
    count: number;
    isRising: boolean;
    lastDate: string;
    sampleTickets: string[];
    commonPhrases: string[];
    suggestedCategory: string;
    overview?: string;
  }[];
  opportunities: {
    title: string;
    count: number;
    isRising: boolean;
    lastDate: string;
    sampleTickets: string[];
    commonPhrases: string[];
    suggestedCategory: string;
    overview?: string;
  }[];
  risks: {
    type: string;
    severity: "Low" | "Medium" | "High";
    segment: string;
    evidence: string;
  }[];
  insights: {
    segment: string;
    painPoints: string[];
    satisfaction: number;
    suggestions: string;
  }[];
}

export interface DashboardData {
  customerIntelligence: CustomerIntelligenceItem[];
  featureRequests: FeatureRequest[];
  businessIntelligence: BusinessIntelligenceData;
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  const { data, error } = await supabase
    .from("dashboard_data")
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return {
    customerIntelligence: data.customer_intelligence_data || [],
    featureRequests: data.feature_requests_data || [],
    businessIntelligence: data.business_intelligence_data || {
      workingWell: [],
      opportunities: [],
      risks: [],
      insights: [],
    },
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