import { TrendingUp } from "lucide-react";
import TrendingIssue from "../TrendingIssue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WorkingWellProps {
  items: Array<{
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

const WorkingWellSection = ({ items }: WorkingWellProps) => {
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          What's Working Well
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {items.map((item, index) => (
              <TrendingIssue key={index} {...item} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WorkingWellSection;