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

        let parsedDb = data?.db;

        if (typeof parsedDb === "string") {
          parsedDb = JSON.parse(parsedDb);
        }

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

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4 md:w-1/2" />
        <Skeleton className="h-4 w-1/2 md:w-1/3" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!customerIntelligenceData || customerIntelligenceData.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Customer Intelligence Hub
        </h1>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Customer Intelligence Hub
        </h1>
        <p className="text-gray-500">
          Monitor and analyze trending customer support issues
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {customerIntelligenceData.map((issue, index) => {
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
        })}
      </div>
    </div>
  );
};

export default CustomerIntelligence;