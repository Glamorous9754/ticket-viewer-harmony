import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FeatureCardProps {
  summary: string;
  priority: number;
  complexity: "Low" | "Medium" | "High";
  tags: string[];
  createdAt: string;
  agentName?: string;
  ticketUrl: string;
}

const FeatureCard = ({
  summary,
  priority,
  complexity,
  tags,
  createdAt,
  agentName,
  ticketUrl,
}: FeatureCardProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-lg leading-tight">{summary}</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-[#006837]">
                <span>Priority: {priority.toFixed(1)}</span>
                <span>•</span>
                <span>Complexity: {complexity}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="bg-muted text-primary-foreground"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="text-sm text-muted-foreground">
                Created {formatDistanceToNow(new Date(createdAt))} ago
                {agentName && ` • Assigned to ${agentName}`}
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => window.open(ticketUrl, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">{summary}</h4>
            <p className="text-sm text-muted-foreground">
              This feature request was created {formatDistanceToNow(new Date(createdAt))} ago
              {agentName && ` and is being handled by ${agentName}`}.
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-sm">
              <span className="font-medium">Priority Score:</span>{" "}
              <span className="text-[#006837]">{priority.toFixed(1)}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Complexity Level:</span>{" "}
              <span className="text-[#006837]">{complexity}</span>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium">Tags:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-muted text-primary-foreground"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default FeatureCard;