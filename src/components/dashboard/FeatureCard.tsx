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
  // Get background color based on priority
  const getPriorityColor = (priority: number) => {
    if (priority >= 4.5) return "bg-red-50 hover:bg-red-100 border-red-200";
    if (priority >= 4.0) return "bg-orange-50 hover:bg-orange-100 border-orange-200";
    if (priority >= 3.5) return "bg-yellow-50 hover:bg-yellow-100 border-yellow-200";
    return "bg-green-50 hover:bg-green-100 border-green-200";
  };

  // Get text color based on priority
  const getPriorityTextColor = (priority: number) => {
    if (priority >= 4.5) return "text-red-700";
    if (priority >= 4.0) return "text-orange-700";
    if (priority >= 3.5) return "text-yellow-700";
    return "text-green-700";
  };

  // Get complexity color
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "High":
        return "bg-purple-100 text-purple-700";
      case "Medium":
        return "bg-blue-100 text-blue-700";
      case "Low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card className={`cursor-pointer transition-all duration-200 ${getPriorityColor(priority)} border-2`}>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-lg leading-tight">{summary}</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={`font-medium ${getPriorityTextColor(priority)}`}>
                  Priority: {priority.toFixed(1)}
                </span>
                <span className="text-gray-400">•</span>
                <span className={`px-2 py-1 rounded-full text-xs ${getComplexityColor(complexity)}`}>
                  {complexity} Complexity
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className="bg-white/50 hover:bg-white/80"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {createdAt && (
                <div className="text-sm text-gray-600">
                  Created {formatDistanceToNow(new Date(createdAt))} ago
                  {agentName && ` • Assigned to ${agentName}`}
                </div>
              )}

              {ticketUrl && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full bg-white/50 hover:bg-white/80 border-gray-200"
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
      <HoverCardContent className="w-96 p-6 bg-white/95 backdrop-blur-sm border-2 border-gray-100">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-lg mb-2">{summary}</h4>
            <p className="text-gray-600 text-sm">{description || "No detailed description available."}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Priority</p>
              <p className={`text-2xl font-bold ${getPriorityTextColor(priority)}`}>
                {priority.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Complexity</p>
              <p className={`text-lg font-semibold ${getComplexityColor(complexity)} inline-block px-2 py-1 rounded-full text-sm mt-1`}>
                {complexity}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
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