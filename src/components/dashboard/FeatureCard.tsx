import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  resolvedAt,
  agentName,
}: FeatureCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-semibold text-lg leading-tight">{summary}</h3>
          <Badge variant={status === "Open" ? "default" : "secondary"}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Priority: {priority.toFixed(1)}</span>
            <span>•</span>
            <span>Complexity: {complexity}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {segments.map((segment) => (
              <Badge key={segment} variant="outline">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;