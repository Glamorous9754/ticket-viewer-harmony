import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import TrendingIssue from "../components/dashboard/TrendingIssue";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerIntelligenceIssue {
  title: string;
  mentions: number;
  since: string;
  common_phrases: string[];
  sample_tickets: string[];
  suggested_category: string;
  color: "red" | "green";
}

interface DbStructure {
  customer_intelligence_issues?: CustomerIntelligenceIssue[];
}

const CustomerIntelligence = () => {
  const [customerIntelligenceData, setCustomerIntelligenceData] = useState<CustomerIntelligenceIssue[]>([]);
  const [loading, setLoading] = useState(true);

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

        const parsedDb = data?.db as DbStructure | undefined; // Type assertion
        if (parsedDb?.customer_intelligence_issues) {
          setCustomerIntelligenceData(parsedDb.customer_intelligence_issues);
        } else {
          console.warn("No customer intelligence issues found in the database.");
        }
      } catch (error: any) {
        console.error("Error fetching data from Supabase:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 px-4 md:px-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Customer Intelligence Hub
        </h1>
        <p className="text-gray-500">
          Monitor and analyze trending customer support issues
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          // Skeleton loading state matching exact dimensions
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-5 h-5 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="w-5 h-5" />
              </div>
            </div>
          ))
        ) : customerIntelligenceData && customerIntelligenceData.length > 0 ? (
          customerIntelligenceData.map((issue, index) => {
            const isRising = issue.color === "red";
            return (
              <TrendingIssue
                key={index}
                title={issue.title}
                count={issue.mentions}
                lastDate={issue.since}
                sampleTickets={issue.sample_tickets}
                commonPhrases={issue.common_phrases}
                suggestedCategory={issue.suggested_category}
                color={issue.color}
                isRising={isRising}
              />
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerIntelligence;
