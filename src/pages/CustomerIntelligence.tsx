// import TrendingIssue from "../components/dashboard/TrendingIssue";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useState, useEffect } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/hooks/use-toast";

// // interface CustomerIntelligenceIssue {
// //   title: string;
// //   mentions: number;
// //   since: string;
// //   sample_tickets: string[];
// //   common_phrases: string[];
// //   suggested_category: string;
// //   overview?: string;
// //   color: string;
// // }

// const CustomerIntelligence = () => {
//   const [issues, setIssues] = useState<CustomerIntelligenceIssue[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const { toast } = useToast();

//   useEffect(() => {
//     const fetchIssues = async () => {
//       try {
//         console.log("Fetching customer intelligence issues...");

//         const { data, error } = await supabase
//           .from('dashboard_data')
//           .select('customer_intelligence_issues')
//           .single();

//         if (error) {
//           console.error("Supabase Error:", error);
//           throw error;
//         }

//         console.log("Raw data from Supabase:", data);

//         if (!data || !data.customer_intelligence_issues) {
//           console.log('No customer intelligence issues found in dashboard_data');
//           setIssues([]);
//           return;
//         }

//         // Ensure we're working with an array of issues
//         const issuesArray = Array.isArray(data.customer_intelligence_issues) 
//           ? data.customer_intelligence_issues 
//           : [data.customer_intelligence_issues];

//         // Type cast and validate each issue
//         const parsedIssues = issuesArray.map((issue: any) => ({
//           title: String(issue.title || ''),
//           mentions: Number(issue.mentions || 0),
//           since: String(issue.since || ''),
//           sample_tickets: Array.isArray(issue.sample_tickets)
//             ? issue.sample_tickets.map(String)
//             : [],
//           common_phrases: Array.isArray(issue.common_phrases)
//             ? issue.common_phrases.map(String)
//             : [],
//           suggested_category: String(issue.suggested_category || ''),
//           color: String(issue.color || 'gray'),
//           overview: issue.overview ? String(issue.overview) : undefined
//         }));

//         console.log("Parsed issues:", parsedIssues);
//         setIssues(parsedIssues);
//       } catch (err) {
//         console.error("Fetch Issues Error:", err);
//         toast({
//           title: "Error fetching data",
//           description: "Could not load customer intelligence data. Please try again later.",
//           variant: "destructive",
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchIssues();
//   }, [toast]);

//   if (isLoading) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <Skeleton className="h-8 w-64 mb-2" />
//           <Skeleton className="h-4 w-96" />
//         </div>
        
//         <div className="space-y-4">
//           {Array.from({ length: 3 }).map((_, index) => (
//             <div key={index} className="rounded-lg border p-4 space-y-3">
//               <div className="flex items-center gap-4">
//                 <Skeleton className="h-5 w-5" />
//                 <div className="space-y-2 flex-1">
//                   <Skeleton className="h-6 w-3/4" />
//                   <Skeleton className="h-4 w-1/2" />
//                 </div>
//                 <Skeleton className="h-5 w-5" />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (issues.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <h2 className="text-xl font-semibold text-gray-900 mb-2">
//           No Customer Intelligence Data
//         </h2>
//         <p className="text-gray-500">
//           There are currently no customer intelligence issues to display.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//           Customer Intelligence Hub
//         </h1>
//         <p className="text-gray-500">
//           Monitor and analyze trending customer support issues
//         </p>
//       </div>
      
//       <div className="space-y-4">
//         {issues.map((issue, index) => (
//           <TrendingIssue
//             key={index}
//             title={issue.title}
//             count={issue.mentions}
//             isRising={issue.mentions > 5}
//             lastDate={issue.since}
//             sampleTickets={issue.sample_tickets}
//             commonPhrases={issue.common_phrases}
//             suggestedCategory={issue.suggested_category}
//             overview={issue.overview}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CustomerIntelligence;
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export interface CustomerIntelligenceIssue {
  title: string;
  mentions: number;
  since: string;
  common_phrases: string[];
  sample_tickets: string[];
  suggested_category: string;
  color: "red" | "green" | "yellow";
}

const CustomerIntelligence = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [issues, setIssues] = useState<CustomerIntelligenceIssue[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("dashboard_data")
          .select("customer_intelligence_issues")
          .single();

        if (error) throw error;

        if (data[0]?.customer_intelligence_issues) {
          setIssues(data.customer_intelligence_issues);
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
          table: "dashboard_data",
        },
        (payload) => {
          if (payload.new?.customer_intelligence_issues) {
            setIssues(payload.new.customer_intelligence_issues);
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
              issue.color === "red"
                ? "border-l-red-500"
                : issue.color === "green"
                ? "border-l-green-500"
                : "border-l-yellow-500"
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
