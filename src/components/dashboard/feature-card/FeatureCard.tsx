import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ExternalLink } from "lucide-react";
import { FeatureCardHeader } from "./FeatureCardHeader";
import { FeatureCardMetrics } from "./FeatureCardMetrics";
import { FeatureCardTags } from "./FeatureCardTags";
import { FeatureCardDetails } from "./FeatureCardDetails";

interface FeatureCardProps {
  summary: string;
  priority: number;
  tags: string[];
  complexity: "Low" | "Medium" | "High";
  createdAt?: string;
  ticketUrl?: string;
  description?: string;
  agentName?: string;
}

export const FeatureCard = ({ 
  summary, 
  priority, 
  tags,
  complexity,
  createdAt,
  ticketUrl,
  description,
  agentName,
}: FeatureCardProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-md">
          <FeatureCardHeader summary={summary} />
          <CardContent>
            <div className="space-y-4">
              <FeatureCardMetrics priority={priority} complexity={complexity} />
              <FeatureCardTags tags={tags} />
              <FeatureCardDetails createdAt={createdAt} agentName={agentName} />

              {ticketUrl && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary-foreground border-primary/20"
                  onClick={() => window.open(ticketUrl, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Ticket
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-96 p-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-lg mb-2">{summary}</h4>
            <p className="text-muted-foreground text-sm">
              {description || "No detailed description available."}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Priority</p>
              <p className="text-2xl font-bold text-primary">{priority.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Complexity</p>
              <p className="text-lg font-semibold">{complexity}</p>
            </div>
          </div>

          <FeatureCardTags tags={tags} />

          {ticketUrl && (
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => window.open(ticketUrl, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in Support Platform
            </Button>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};