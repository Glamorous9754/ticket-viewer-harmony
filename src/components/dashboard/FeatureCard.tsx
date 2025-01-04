import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatDistanceToNow } from "date-fns";
import { Eye, Link } from "lucide-react";

interface FeatureCardProps {
  summary: string;
  priority: number;
  tags: string[];
  complexity: "Low" | "Medium" | "High";
  ticketUrl?: string;
  createdAt?: string;
  description: string;
  requester?: string;
}

const FeatureCard = ({ 
  summary, 
  priority, 
  tags, 
  complexity,
  ticketUrl,
  createdAt,
  description,
  requester,
}: FeatureCardProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card className="transition-all hover:shadow-md cursor-pointer">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-4">
              <h3 className="font-semibold text-lg leading-tight">{summary}</h3>
              {ticketUrl && (
                <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10" asChild>
                  <a href={ticketUrl} target="_blank" rel="noopener noreferrer">
                    <Link className="h-4 w-4" />
                  </a>
                </Button>
              )}
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
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {tag}
                  </Badge>
                ))}
              </div>

              {createdAt && (
                <div className="text-sm text-muted-foreground">
                  Created {formatDistanceToNow(new Date(createdAt))} ago
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-96 bg-accent shadow-lg animate-fade-in">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-primary">{summary}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-primary">Priority:</span> {priority.toFixed(1)}
            </div>
            <div>
              <span className="font-medium text-primary">Complexity:</span> {complexity}
            </div>
            {requester && (
              <div className="col-span-2">
                <span className="font-medium text-primary">Requested by:</span> {requester}
              </div>
            )}
            {createdAt && (
              <div className="col-span-2">
                <span className="font-medium text-primary">Created:</span>{" "}
                {formatDistanceToNow(new Date(createdAt))} ago
              </div>
            )}
          </div>

          <div>
            <span className="font-medium text-sm text-primary">Tags:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="bg-primary/10 text-primary border-primary/20">
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