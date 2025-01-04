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
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-lg leading-tight">{summary}</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Priority: {priority.toFixed(1)}</span>
                <span>•</span>
                <span>Complexity: {complexity}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              {createdAt && (
                <div className="text-sm text-muted-foreground">
                  Created {formatDistanceToNow(new Date(createdAt))} ago
                  {agentName && ` • Assigned to ${agentName}`}
                </div>
              )}

              {ticketUrl && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
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
            <p className="text-muted-foreground text-sm">{description || "No detailed description available."}</p>
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

          <div>
            <p className="text-sm font-medium mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {ticketUrl && (
            <Button 
              className="w-full"
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