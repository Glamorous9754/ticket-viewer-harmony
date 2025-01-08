import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerIntelligenceData, CustomerIntelligenceIssue } from "@/types/customerIntelligence";
import { toast } from "sonner";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const CustomerIntelligence = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [issues, setIssues] = useState<CustomerIntelligenceIssue[]>([]);
  const [openItems, setOpenItems] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("dashboard_data")
          .select("customer_intelligence_data")
          .single();

        if (error) throw error;

        const customerData = data?.customer_intelligence_data as unknown as CustomerIntelligenceData;
        if (customerData?.customer_intelligence_issues) {
          setIssues(customerData.customer_intelligence_issues);
        }
      } catch (error) {
        console.error("Error fetching customer intelligence data:", error);
        toast.error("Failed to load customer intelligence data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

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
          const newData = payload.new as { customer_intelligence_data: CustomerIntelligenceData };
          if (newData?.customer_intelligence_data?.customer_intelligence_issues) {
            setIssues(newData.customer_intelligence_data.customer_intelligence_issues);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleItem = (index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
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

      <div className="grid gap-4 md:grid-cols-1">
        {issues.map((issue, index) => (
          <Collapsible
            key={index}
            open={openItems[index]}
            onOpenChange={() => toggleItem(index)}
            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  {openItems[index] ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">
                      {issue.title || "Unknown Issue"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Since {issue.since ? format(new Date(issue.since), "MMM dd, yyyy") : "Date Unavailable"}
                    </p>
                  </div>
                </div>
                <Badge variant={issue.color === "red" ? "destructive" : "default"}>
                  {issue.mentions || 0} mentions
                </Badge>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-6 border-t">
                <div>
                  <h4 className="text-sm font-medium mb-3">Sample Tickets</h4>
                  <div className="space-y-2">
                    {issue.sample_tickets?.length > 0 ? (
                      issue.sample_tickets.map((ticket, i) => (
                        <div key={i} className="text-sm text-green-600 bg-green-50 p-2 rounded">
                          "{ticket}"
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No sample tickets available</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Common Phrases</h4>
                  <div className="flex flex-wrap gap-2">
                    {issue.common_phrases?.length > 0 ? (
                      issue.common_phrases.map((phrase, i) => (
                        <Badge key={i} variant="outline" className="bg-gray-50">
                          {phrase}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No common phrases available</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Suggested Category:</span>
                    <Badge variant="secondary" className="bg-yellow-50">
                      {issue.suggested_category || "Uncategorized"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default CustomerIntelligence;