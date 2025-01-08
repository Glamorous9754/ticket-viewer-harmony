import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import TrendingIssue from "../components/dashboard/TrendingIssue";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

interface CustomerIntelligenceIssue {
  title: string;
  mentions: number;
  since: string;
  sample_tickets: string[];
  common_phrases: string[];
  suggested_category: string;
  color: "red" | "green" | "yellow";
}

const CustomerIntelligence = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: issues, isLoading } = useQuery({
    queryKey: ["customer-intelligence"],
    queryFn: async () => {
        const { data, error } = await supabase
          .from("dashboard_data")
          .select("customer_intelligence_issues")
          .eq("profile_id", (await supabase.auth.getUser()).data.user?.id)
          .maybeSingle();
      if (error) {
        console.error("Error fetching customer intelligence data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch customer intelligence data",
          variant: "destructive",
        });
        throw error;
      }
      if (!data || !data.customer_intelligence_issues) {
        return [];
      }
      try {
        const parsedIssues = JSON.parse(
          data.customer_intelligence_issues as string
        ) as CustomerIntelligenceIssue[];
        return parsedIssues;
      } catch (parseError) {
        console.error("Error parsing customer intelligence data:", parseError);
          toast({
            title: "Error",
            description: "Failed to parse customer intelligence data",
              variant: "destructive",
          });
        return [];
      }
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dashboard_data",
        },
        (payload) => {
          // Invalidate the query to refetch data
          void queryClient.invalidateQueries({ queryKey: ["customer-intelligence"] });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isLoading) {
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
        {issues?.map((issue, index) => (
          <TrendingIssue
            key={index}
            title={issue.title}
            count={issue.mentions}
            isRising={issue.color === "red"}
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
