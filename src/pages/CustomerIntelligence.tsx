// Import necessary modules and components
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client"; // Ensure this path is correct
import { Skeleton } from "@/components/ui/skeleton";
import TrendingIssue from "../components/dashboard/TrendingIssue"; // Adjust the import path as needed
import { toast } from "sonner";

// Define TypeScript interfaces
interface CustomerIntelligenceIssue {
  title: string;
  mentions: number;
  since: string;
  sample_tickets: string[];
  common_phrases: string[];
  suggested_category: string;
  color: string;
}

interface CustomerIntelligenceData {
  customer_intelligence_issues: CustomerIntelligenceIssue[];
}

const CustomerIntelligence = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [issues, setIssues] = useState<CustomerIntelligenceIssue[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the latest row from dashboard_data table
        const { data, error } = await supabase
          .from("dashboard_data")
          .select("customer_intelligence_issues")
          .order("created_at", { ascending: false }) // Ensure you have a 'created_at' timestamp column
          .limit(1)
          .single();

        if (error) throw error;

        // Extract issues from the fetched data
        const fetchedIssues: CustomerIntelligenceIssue[] = data.customer_intelligence_issues;

        // Map Supabase data to match TrendingIssue component's props
        const mappedIssues = fetchedIssues.map((issue) => ({
          title: issue.title,
          count: issue.mentions,
          isRising: determineIsRising(issue.color), // Define your logic based on 'color'
          lastDate: new Date(issue.since).toISOString(),
          sampleTickets: issue.sample_tickets,
          commonPhrases: issue.common_phrases,
          suggestedCategory: issue.suggested_category,
          // recommendedSolutions is omitted as per your request
        }));

        setIssues(mappedIssues);
      } catch (err: any) {
        console.error("Error fetching customer intelligence data:", err);
        setError(err.message || "Unknown error");
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
          const newData = payload.new.customer_intelligence_issues;
          if (newData) {
            const mappedIssues = newData.map((issue: CustomerIntelligenceIssue) => ({
              title: issue.title,
              count: issue.mentions,
              isRising: determineIsRising(issue.color),
              lastDate: new Date(issue.since).toISOString(),
              sampleTickets: issue.sample_tickets,
              commonPhrases: issue.common_phrases,
              suggestedCategory: issue.suggested_category,
              // recommendedSolutions is omitted
            }));
            setIssues(mappedIssues);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Helper function to determine if an issue is rising based on color
  const determineIsRising = (color: string): boolean => {
    // Define your logic. For example:
    // Red indicates rising, green not rising, yellow neutral
    if (color === "red") return true;
    if (color === "yellow") return false; // Or another logic
    return false;
  };

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

  if (error) {
    return (
      <div className="text-red-500">
        <p>Failed to load customer intelligence issues: {error}</p>
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
