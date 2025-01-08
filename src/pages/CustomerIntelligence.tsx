import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomerIntelligenceIssue, DashboardData } from "@/types/dashboard";
import TrendingIssue from "@/components/dashboard/TrendingIssue";
import { Skeleton } from "@/components/ui/skeleton";

const CustomerIntelligence = () => {
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
      
      if (data?.customer_intelligence_issues) {
        try {
          const issues = typeof data.customer_intelligence_issues === 'string' 
            ? JSON.parse(data.customer_intelligence_issues)
            : data.customer_intelligence_issues;
            
          console.log("Parsed customer issues:", issues);
          return {
            ...data,
            customer_intelligence_issues: issues
          };
        } catch (e) {
          console.error("Error parsing customer issues:", e);
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      </div>
    );
  }

  // Map mock data to match TrendingIssue props
  const mockIssues = [
    {
      title: "App Performance",
      count: 45,
      isRising: true,
      lastDate: "2024-03-15T10:30:00",
      sampleTickets: [
        "App is slow during peak hours",
        "Loading times are inconsistent",
      ],
      commonPhrases: ["slow", "loading", "performance"],
      suggestedCategory: "Performance",
      overview: "Multiple users reporting performance issues during peak hours",
    },
  ];

  const customerIssues = dashboardData?.customer_intelligence_issues?.map(issue => ({
    title: issue.title,
    count: issue.mentions,
    isRising: true, // You might want to calculate this based on historical data
    lastDate: issue.since,
    sampleTickets: issue.sample_tickets,
    commonPhrases: issue.common_phrases,
    suggestedCategory: issue.suggested_category,
    overview: issue.overview,
  })) || mockIssues;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Customer Intelligence
        </h1>
        <p className="text-muted-foreground">
          Monitor and analyze customer feedback and issues
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {customerIssues.map((issue, index) => (
          <TrendingIssue key={index} {...issue} />
        ))}
      </div>
    </div>
  );
};

export default CustomerIntelligence;