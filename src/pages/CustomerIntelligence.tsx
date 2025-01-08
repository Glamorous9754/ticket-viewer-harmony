import { useQuery } from "@tanstack/react-query";
import TrendingIssue from "../components/dashboard/TrendingIssue";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const CustomerIntelligence = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard_data", "customer_intelligence"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_data")
        .select("customer_intelligence_issues")
        .maybeSingle();

      if (error) {
        console.error("Error fetching customer intelligence data:", error);
        throw error;
      }

      return data?.customer_intelligence_issues || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Intelligence Hub</h1>
      <p className="text-gray-500">Monitor and analyze trending customer support issues</p>

      {dashboardData.map((issue, index) => (
        <TrendingIssue
          key={index}
          title={issue.title}
          count={issue.mentions}
          isRising={issue.color === "red"}
          lastDate={issue.since}
          sampleTickets={issue.sample_tickets}
          commonPhrases={issue.common_phrases}
          suggestedCategory={issue.suggested_category}
          recommendedSolutions={[]} // Placeholder for solutions
        />
      ))}
    </div>
  );
};

export default CustomerIntelligence;
