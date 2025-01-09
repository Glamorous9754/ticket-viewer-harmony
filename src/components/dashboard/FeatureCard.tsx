import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info } from "lucide-react";
import { format } from "date-fns";
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
  url?: string | null;
}

const FeatureCard = ({ 
  summary, 
  priority, 
  segments, 
  complexity,
  status = "Open",
  createdAt,
  description,
  url,
}: FeatureCardProps) => {
  const impactScore = Math.round(priority * 20);
  const hasValidUrl = url && url.trim().length > 0;
  
  return (
    <Card className="h-full animate-fade-in group relative">
      <CardHeader className="pb-2">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-start gap-2 cursor-help group/title">
                  <h3 className="font-semibold text-lg leading-tight">
                    {summary}
                  </h3>
                  <Info 
                    className="h-4 w-4 text-primary/60 opacity-0 group-hover/title:opacity-100 transition-all duration-200" 
                    aria-label="View details"
                  />
                </div>
              </HoverCardTrigger>
              <HoverCardContent 
                align="start" 
                className="w-[360px] backdrop-blur-sm bg-card/95 border border-primary/20 shadow-lg animate-in fade-in-0 zoom-in-95"
                sideOffset={5}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-primary-foreground">Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {description || "No additional details available."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-primary-foreground">Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Impact Score</span>
                        <p className="text-base font-medium text-primary-foreground">{impactScore}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Complexity</span>
                        <p className="text-base font-medium text-primary-foreground">{complexity}</p>
                      </div>
                      {status && (
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <p className="text-base font-medium text-primary-foreground">{status}</p>
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
                className="capitalize bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                {segment}
              </Badge>
            ))}
          </div>

          {createdAt && (
            <div className="text-sm text-muted-foreground">
              Created on {format(new Date(createdAt), 'MMM dd, yyyy')}
            </div>
          )}

          <Button 
            variant="default"
            className="w-full bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasValidUrl}
            onClick={() => hasValidUrl && window.open(url, '_blank')}
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