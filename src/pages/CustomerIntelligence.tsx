import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import TrendingIssue from "../components/dashboard/TrendingIssue";

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

        if (data && typeof data.db === "string") {
          const parsedDb = JSON.parse(data.db);
          if (parsedDb.customer_intelligence_issues) {
            setCustomerIntelligenceData(parsedDb.customer_intelligence_issues);
          }
        } else if (data?.db?.customer_intelligence_issues) {
          setCustomerIntelligenceData(data.db.customer_intelligence_issues);
        }
      } catch (error) {
        console.error("Error fetching data from Supabase:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Customer Intelligence Hub
        </h1>
        <p className="text-gray-500">Loading data...</p>
      </div>
    );
  }

  if (!customerIntelligenceData) {
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