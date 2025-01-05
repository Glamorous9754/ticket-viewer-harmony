import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface FeatureCardProps {
  summary: string;
  priority: number;
  segments: string[];
  complexity: "Low" | "Medium" | "High";
  status?: string;
  createdAt?: string;
  description?: string;
}

const FeatureCard = ({ 
  summary, 
  priority, 
  segments, 
  complexity,
  status = "Open",
  createdAt,
  description,
}: FeatureCardProps) => {
  // Calculate impact score (example calculation, maintains existing priority data)
  const impactScore = Math.round((priority * 20));
  
  return (
    <Card className="h-full animate-fade-in">
      <CardHeader className="pb-2">
        <div className="space-y-2">
          <HoverCard>
            <HoverCardTrigger asChild>
              <h3 className="font-semibold text-lg leading-tight cursor-help">
                {summary}
              </h3>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {description || "No additional details available."}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Impact Score:</span>
                  <span className="text-xs">{impactScore}</span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary-foreground">Impact Score: {impactScore}</span>
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
                className="capitalize bg-primary/10"
              >
                {segment}
              </Badge>
            ))}
          </div>

          {createdAt && (
            <div className="text-sm text-muted-foreground">
              Created {formatDistanceToNow(new Date(createdAt))} ago
            </div>
          )}

          <Button 
            variant="default"
            className="w-full bg-primary hover:bg-primary/90"
          >
            View Request
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;