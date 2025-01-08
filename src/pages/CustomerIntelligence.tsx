import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerIntelligenceData, CustomerIntelligenceIssue } from "@/types/customerIntelligence";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const CustomerIntelligence = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [issues, setIssues] = useState<CustomerIntelligenceIssue[]>([]);
  const [openItems, setOpenItems] = useState<{ [key: number]: boolean }>({
    0: true // First item expanded by default
  });

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
                  {issue.color === "red" ? (
                    <div className="text-red-500">
                      {openItems[index] ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  ) : (
                    <div className="text-green-500">
                      {openItems[index] ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {issue.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {issue.mentions} related tickets • Last seen {format(new Date(issue.since), "d 'hours ago'")}
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Sample Tickets</h4>
                  <div className="space-y-2">
                    {issue.sample_tickets?.map((ticket, i) => (
                      <div key={i} className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {ticket}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Common Phrases</h4>
                  <div className="flex flex-wrap gap-2">
                    {issue.common_phrases?.map((phrase, i) => (
                      <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {phrase}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Category</h4>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {issue.suggested_category}
                  </Badge>
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