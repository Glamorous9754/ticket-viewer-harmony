import TrendingIssue from "../components/dashboard/TrendingIssue";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CustomerIntelligence = () => {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("dashboard_data")
          .select("customer_intelligence_data")
          .single();

        if (error) throw error;

        if (data?.customer_intelligence_data?.customer_intelligence_issues) {
          const formattedIssues = data.customer_intelligence_data.customer_intelligence_issues.map(
            (issue) => ({
              title: issue.title || "Unknown Issue",
              count: issue.mentions || 0,
              isRising: issue.color === "red",
              lastDate: issue.since ? new Date(issue.since).toLocaleString() : "Date Unavailable",
              sampleTickets: issue.sample_tickets || [],
              commonPhrases: issue.common_phrases || [],
              suggestedCategory: issue.suggested_category || "Uncategorized",
            })
          );
          setIssues(formattedIssues);
        }
      } catch (error) {
        console.error("Error fetching customer intelligence data:", error);
        toast.error("Failed to load customer intelligence data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("dashboard_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dashboard_data",
        },
        (payload) => {
          if (payload.new?.customer_intelligence_data?.customer_intelligence_issues) {
            const formattedIssues = payload.new.customer_intelligence_data.customer_intelligence_issues.map(
              (issue) => ({
                title: issue.title || "Unknown Issue",
                count: issue.mentions || 0,
                isRising: issue.color === "red",
                lastDate: issue.since ? new Date(issue.since).toLocaleString() : "Date Unavailable",
                sampleTickets: issue.sample_tickets || [],
                commonPhrases: issue.common_phrases || [],
                suggestedCategory: issue.suggested_category || "Uncategorized",
              })
            );
            setIssues(formattedIssues);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Loading Customer Intelligence Hub...
          </h1>
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
        {issues.map((issue, index) => (
          <TrendingIssue key={index} {...issue} />
        ))}
      </div>
    </div>
  );
};

export default CustomerIntelligence;
