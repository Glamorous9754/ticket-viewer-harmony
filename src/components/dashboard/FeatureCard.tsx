import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info } from "lucide-react";
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
  const impactScore = Math.round((priority * 20));
  
  return (
    <Card className="h-full animate-fade-in group relative">
      <CardHeader className="pb-2">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-start gap-2 cursor-help">
                  <h3 className="font-semibold text-lg leading-tight">
                    {summary}
                  </h3>
                  <Info 
                    className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" 
                    aria-label="View details"
                  />
                </div>
              </HoverCardTrigger>
              <HoverCardContent 
                align="start" 
                className="w-[320px] backdrop-blur-sm bg-card/95 border-primary/20"
                sideOffset={5}
              >
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {description || "No additional details available."}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Impact Score:</span>
                        <span className="ml-1 font-medium">{impactScore}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Complexity:</span>
                        <span className="ml-1 font-medium">{complexity}</span>
                      </div>
                      {status && (
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <span className="ml-1 font-medium">{status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
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