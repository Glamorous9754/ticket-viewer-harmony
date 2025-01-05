import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FeatureCardProps {
  summary: string;
  priority: number;
  segments: string[];
  complexity: "Low" | "Medium" | "High";
  status?: string;
  createdAt?: string;
  resolvedAt?: string | null;
  agentName?: string;
}

const FeatureCard = ({ 
  summary, 
  priority, 
  segments, 
  complexity,
  status = "Open",
  createdAt,
  agentName,
}: FeatureCardProps) => {
  return (
    <Card className="h-full animate-fade-in hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="space-y-2">
          <h3 className="font-semibold text-base sm:text-lg leading-tight line-clamp-2">
            {summary}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-primary-foreground whitespace-nowrap">
              Priority: {priority.toFixed(1)}
            </span>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <span className="text-primary-foreground whitespace-nowrap">
              Complexity: {complexity}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {segments.map((segment) => (
              <Badge 
                key={segment} 
                variant="outline"
                className="capitalize bg-primary/10 text-xs sm:text-sm whitespace-nowrap"
              >
                {segment}
              </Badge>
            ))}
          </div>

          {createdAt && (
            <div className="text-xs sm:text-sm text-muted-foreground">
              Created {formatDistanceToNow(new Date(createdAt))} ago
              {agentName && (
                <>
                  <span className="hidden sm:inline"> • </span>
                  <span className="block sm:inline">
                    Assigned to {agentName}
                  </span>
                </>
              )}
            </div>
          )}

          <Button 
            variant="default"
            className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base"
          >
            View Ticket
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;