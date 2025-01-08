import TrendingIssue from "../components/dashboard/TrendingIssue";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import supabase from "@/integrations/supabase/client"; // Ensure this path is correct

const CustomerIntelligence = () => {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        // Fetch the customer_intelligence_issues field from dashboard_data table
        const { data, error } = await supabase
          .from('dashboard_data')
          .select('customer_intelligence_issues')
          .single(); // Assuming there's only one row

        if (error) throw error;

        // Set the issues state with the fetched data
        setIssues(data.customer_intelligence_issues);
      } catch (err) {
        // Handle any errors during fetch
        setError(err.message || 'An unexpected error occurred');
      } finally {
        // Set loading to false after fetch is complete
        setIsLoading(false);
      }
    };

    fetchIssues();
  }, []);

  // Render loading skeletons while data is being fetched
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

  // Render error message if there's an error during fetch
  if (error) {
    return (
      <div className="text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  // Render the fetched issues using the TrendingIssue component
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
          <TrendingIssue
            key={index}
            title={issue.title}
            count={issue.mentions}
            isRising={determineIsRising(issue)} // Custom logic to determine if rising
            lastDate={issue.since}
            sampleTickets={issue.sample_tickets}
            commonPhrases={issue.common_phrases}
            suggestedCategory={issue.suggested_category}
            // You can add recommendedSolutions here if available
            color={issue.color} // Assuming TrendingIssue can handle a color prop
          />
        ))}
      </div>
    </div>
  );
};

// Helper function to determine if an issue is rising
// You can implement your own logic based on your data
const determineIsRising = (issue) => {
  // Example: If mentions are greater than a threshold, it's rising
  const threshold = 20;
  return issue.mentions > threshold;
};

export default CustomerIntelligence;
