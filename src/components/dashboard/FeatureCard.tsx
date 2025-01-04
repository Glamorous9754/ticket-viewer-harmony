import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";

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

const FeatureCard = ({ 
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
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm border-primary/10">
          <CardHeader className="pb-2 space-y-2">
            <h3 className="font-semibold text-lg leading-tight text-primary-foreground">{summary}</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-primary-foreground/80">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Priority:</span>
                  <span className="font-bold text-primary">{priority.toFixed(1)}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Complexity:</span>
                  <span>{complexity}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className="bg-primary/5 text-primary-foreground border-primary/20"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {createdAt && (
                <div className="text-sm text-primary-foreground/70 space-y-1">
                  <div>Created {formatDistanceToNow(new Date(createdAt))} ago</div>
                  {agentName && (
                    <div className="font-medium text-primary-foreground">
                      Assigned to {agentName}
                    </div>
                  )}
                </div>
              )}

              {ticketUrl && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-primary/20"
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
      <HoverCardContent 
        align="start" 
        className="w-[calc(100vw-2rem)] sm:w-[450px] p-6 backdrop-blur-sm bg-white/90"
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-lg mb-2 text-primary-foreground">{summary}</h4>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              {description || "No detailed description available."}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-primary-foreground/70">Priority</p>
              <p className="text-2xl font-bold text-primary">{priority.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-primary-foreground/70">Complexity</p>
              <p className="text-lg font-semibold text-primary-foreground">{complexity}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2 text-primary-foreground/70">Tags</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="bg-primary/10 text-primary-foreground"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

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

export default FeatureCard;