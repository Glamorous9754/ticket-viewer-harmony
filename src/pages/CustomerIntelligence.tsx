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
          // Parse the JSON data if it's a string
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

  // Use mock data until we properly parse the JSON from Supabase
  const mockIssues = [
    {
      title: "App Performance",
      mentions: 45,
      since: "2024-03-15T10:30:00",
      sample_tickets: [
        "App is slow during peak hours",
        "Loading times are inconsistent",
      ],
      common_phrases: ["slow", "loading", "performance"],
      suggested_category: "Performance",
      overview: "Multiple users reporting performance issues during peak hours",
    },
  ];

  const customerIssues = dashboardData?.customer_intelligence_issues as CustomerIntelligenceIssue[] || mockIssues;

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