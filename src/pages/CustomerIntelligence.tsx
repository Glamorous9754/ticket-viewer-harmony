import TrendingIssue from "../components/dashboard/TrendingIssue";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CustomerIntelligenceIssue {
  title: string;
  mentions: number;
  since: string;
  sample_tickets: string[];
  common_phrases: string[];
  suggested_category: string;
  overview?: string;
}

const CustomerIntelligence = () => {
  const [issues, setIssues] = useState<CustomerIntelligenceIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        console.log("Fetching customer intelligence issues...");

        const { data, error } = await supabase
          .from('dashboard_data')
          .select('customer_intelligence_issues')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Supabase Error:", error);
          throw error;
        }

        if (!data) {
          console.log('No data found in dashboard_data');
          setIssues([]);
          return;
        }

        const issues = data.customer_intelligence_issues || [];
        console.log("Retrieved issues:", issues);
        
        setIssues(issues);
      } catch (err) {
        console.error("Fetch Issues Error:", err);
        toast({
          title: "Error fetching data",
          description: "Could not load customer intelligence data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();
  }, [toast]);

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

  if (issues.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No Customer Intelligence Data
        </h2>
        <p className="text-gray-500">
          There are currently no customer intelligence issues to display.
        </p>
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
          <TrendingIssue
            key={index}
            title={issue.title}
            count={issue.mentions}
            isRising={issue.mentions > 20}
            lastDate={issue.since}
            sampleTickets={issue.sample_tickets}
            commonPhrases={issue.common_phrases}
            suggestedCategory={issue.suggested_category}
            overview={issue.overview}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomerIntelligence;