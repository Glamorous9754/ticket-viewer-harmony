import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TrendingIssue from "../components/dashboard/TrendingIssue";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const CustomerIntelligence = () => {
  const [isLoading, setIsLoading] = useState(true);

  const { data: dashboardData, isLoading: isQueryLoading } = useQuery({
    queryKey: ["dashboard_data", "customer_intelligence"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_data")
        .select("dashboard")
        .maybeSingle();

      if (error) {
        console.error("Error fetching customer intelligence data:", error);
        throw error;
      }

      const customerIntelligenceData =
        data?.dashboard?.customer_intelligence_issues || [];
      console.log("Customer Intelligence Data:", customerIntelligenceData);
      return customerIntelligenceData;
    },
    onSuccess: () => setIsLoading(false),
  });

  if (isLoading || isQueryLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-5" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData || dashboardData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No customer intelligence data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Customer Intelligence Hub
        </h1>
        <p className="text-gray-500">
          Monitor and analyze trending customer support issues
        </p>
      </div>

      <div className="space-y-4">
        {dashboardData.map((issue, index) => (
          <TrendingIssue
            key={index}
            title={issue.title}
            count={issue.mentions}
            isRising={issue.color === "red"} // Assuming red indicates rising issues
            lastDate={issue.since}
            sampleTickets={issue.sample_tickets}
            commonPhrases={issue.common_phrases}
            suggestedCategory={issue.suggested_category}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomerIntelligence;
