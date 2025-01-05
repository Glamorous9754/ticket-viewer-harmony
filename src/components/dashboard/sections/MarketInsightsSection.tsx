import { LineChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface MarketInsightsProps {
  insights: Array<{
    segment: string;
    painPoints: string[];
    satisfaction: number;
    suggestions: string;
  }>;
}

const MarketInsightsSection = ({ insights }: MarketInsightsProps) => {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <LineChart className="w-5 h-5 text-blue-500" />
          Product-Market Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-border p-6 space-y-4 hover:shadow-md transition-all duration-200"
              >
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {insight.segment}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Key Pain Points
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {insight.painPoints.map((point, idx) => (
                          <Badge
                            key={idx}
                            variant="destructive"
                            className="bg-destructive/10 text-destructive hover:bg-destructive/20"
                          >
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Satisfaction Score
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2.5">
                          <div
                            className="bg-primary rounded-full h-2.5 transition-all duration-300"
                            style={{
                              width: `${(insight.satisfaction / 10) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium min-w-[48px]">
                          {insight.satisfaction}/10
                        </span>
                      </div>
                    </div>
                    <div className="bg-accent/50 rounded-lg p-4">
                      <p className="text-sm text-foreground leading-relaxed">
                        {insight.suggestions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MarketInsightsSection;