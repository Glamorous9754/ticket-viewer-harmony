import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client"; // <-- import your Supabase client here
import TrendingIssue from "../components/dashboard/TrendingIssue";

// Your existing mock data (kept for example/demo purposes)
const mockTrendingIssues = [
  {
    title: "Login Authentication Failures",
    count: 45,
    isRising: true,
    lastDate: "2 hours ago",
    sampleTickets: [
      "Unable to login after password reset",
      "2FA verification not receiving codes",
      "Session timeout occurring frequently",
    ],
    commonPhrases: ["password reset", "2FA", "timeout", "authentication"],
    suggestedCategory: "Authentication",
  },
  {
    title: "Mobile App Crashes on Startup",
    count: 32,
    isRising: false,
    lastDate: "4 hours ago",
    sampleTickets: [
      "App crashes immediately after splash screen",
      "Cannot open app after latest update",
      "Black screen on app launch",
    ],
    commonPhrases: ["crash", "startup", "black screen", "latest version"],
    suggestedCategory: "Mobile App Stability",
  },
];

const CustomerIntelligence = () => {
  // State for storing fetched JSON data
  const [customerIntelligenceData, setCustomerIntelligenceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data from Supabase on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error("Error retrieving authenticated user:", userError)
          return
        }
        
        if (!userData?.user) {
          console.error("No authenticated user found")
          return
        }
        
        const userProfileId = userData.user.id
        const { data, error } = await supabase
          .from("dashboard_data")
          .select("customer_intelligence_data, profile_id")
          .eq("profile_id", userProfileId)
          .single()

          if (error) {
            console.error("Error fetching data from dashboard_data:", error)
            return
          }

        console.log(data)

        // Assuming the data has your JSON in the "customer_intelligence_issues" property
        if (data && data?.customer_intelligence_data?.customer_intelligence_issues) {
          setCustomerIntelligenceData(data?.customer_intelligence_data?.customer_intelligence_issues);
        }
      } catch (error) {
        console.error("Error fetching data from Supabase:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // While data is being fetched
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

  // If no data is available
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

      {/* Example of your mock trending issues */}
      {/* <div className="space-y-4">
        {mockTrendingIssues.map((issue, index) => (
          <TrendingIssue key={index} {...issue} />
        ))}
      </div> */}

      {/* Now render the Supabase data properly */}
      <div className="space-y-4">
        {/* <h2 className="text-2xl font-semibold text-gray-800 mt-8">
          Customer Intelligence Issues
        </h2> */}

        {customerIntelligenceData.map((issue, index) => {
          // Decide your own logic for `isRising`.
          // For example, if the color is 'red', we can consider it a "negative" trend
          // but let’s say it's "trending up" in volume (i.e., more issues).
          // You can tweak this logic to suit your needs.

          const isRising = issue.color === "red";

          return (
            <TrendingIssue
              key={index}
              title={issue.title}
              count={issue.mentions}              // JSON calls it 'mentions'
              lastDate={issue.since}               // JSON calls it 'since'
              sampleTickets={issue.sample_tickets} // JSON calls it 'sample_tickets'
              commonPhrases={issue.common_phrases} // JSON calls it 'common_phrases'
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
