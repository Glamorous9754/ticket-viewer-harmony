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
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight">{summary}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary-foreground">Priority: {priority.toFixed(1)}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-primary-foreground">Complexity: {complexity}</span>
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
                className="capitalize"
              >
                {segment}
              </Badge>
            ))}
          </div>

          {createdAt && (
            <div className="text-sm text-muted-foreground">
              Created {formatDistanceToNow(new Date(createdAt))} ago
              {agentName && ` • Assigned to ${agentName}`}
            </div>
          )}

          <Button 
            variant="outline" 
            className="w-full"
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