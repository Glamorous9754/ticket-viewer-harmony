import { Rocket } from "lucide-react";
import TrendingIssue from "../TrendingIssue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OpportunityMetricsProps {
  opportunities: Array<{
    title: string;
    count: number;
    isRising: boolean;
    lastDate: string;
    sampleTickets: string[];
    commonPhrases: string[];
    suggestedCategory: string;
    recommendedSolutions?: string[];
  }>;
}

const OpportunityMetricsSection = ({ opportunities }: OpportunityMetricsProps) => {
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          Opportunity Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {opportunities.map((item, index) => (
              <TrendingIssue key={index} {...item} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default OpportunityMetricsSection;
