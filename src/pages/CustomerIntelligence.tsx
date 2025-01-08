import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerIntelligenceData, CustomerIntelligenceIssue } from "@/types/customerIntelligence";
import { toast } from "sonner";

const CustomerIntelligence = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [issues, setIssues] = useState<CustomerIntelligenceIssue[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("dashboard_data")
          .select("customer_intelligence_data")
          .single();

        if (error) throw error;

        if (data?.customer_intelligence_data?.customer_intelligence_issues) {
          setIssues(data.customer_intelligence_data.customer_intelligence_issues);
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
          table: "dashboard_data"
        },
        (payload) => {
          if (payload.new?.customer_intelligence_data?.customer_intelligence_issues) {
            setIssues(payload.new.customer_intelligence_data.customer_intelligence_issues);
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
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[300px] w-full" />
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {issues.map((issue, index) => (
          <Card 
            key={index}
            className={`border-l-4 ${
              issue.color === "red" ? "border-l-red-500" : "border-l-green-500"
            }`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">
                  {issue.title || "Unknown Issue"}
                </CardTitle>
                <Badge variant={issue.color === "red" ? "destructive" : "default"}>
                  {issue.mentions || 0} Mentions
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Since {issue.since ? format(new Date(issue.since), "MMM dd, yyyy") : "Date Unavailable"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Common Phrases</h4>
                <div className="flex flex-wrap gap-2">
                  {issue.common_phrases?.length > 0 ? (
                    issue.common_phrases.map((phrase, i) => (
                      <Badge key={i} variant="secondary">
                        {phrase}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No common phrases available</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Sample Tickets</h4>
                <ul className="space-y-2">
                  {issue.sample_tickets?.length > 0 ? (
                    issue.sample_tickets.map((ticket, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {ticket}
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No sample tickets available</p>
                  )}
                </ul>
              </div>

              <div className="pt-2 border-t">
                <Badge variant="outline">
                  Category: {issue.suggested_category || "Uncategorized"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerIntelligence;