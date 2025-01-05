import { ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface TrendingIssueProps {
  title: string;
  count: number;
  isRising: boolean;
  lastDate: string;
  sampleTickets: string[];
  commonPhrases: string[];
  suggestedCategory: string;
  overview?: string;
}

const TrendingIssue = ({
  title,
  count,
  isRising,
  lastDate,
  sampleTickets,
  commonPhrases,
  suggestedCategory,
  overview,
}: TrendingIssueProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const formattedDate = new Date(lastDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-card rounded-lg border border-border p-4 space-y-2 hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      <CollapsibleTrigger className="w-full text-left">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{title}</h3>
              <Badge
                variant={isRising ? "default" : "secondary"}
                className="font-normal"
              >
                {count} mentions
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                {isRising ? (
                  <ChevronUp className="w-4 h-4 text-primary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-secondary" />
                )}
                Since {formattedDate}
              </span>
            </div>
          </div>
          <div className="rounded-full p-2 transition-colors group-hover:bg-accent">
            {isOpen ? (
              <ChevronDown className="w-4 h-4 transition-transform duration-300 rotate-0" />
            ) : (
              <ChevronRight className="w-4 h-4 transition-transform duration-300 -rotate-90" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="space-y-4 pt-4 animate-fade-in">
          {overview && (
            <div className="bg-accent/50 rounded-lg p-4">
              <p className="text-sm text-foreground">{overview}</p>
            </div>
          )}
          <div>
            <h4 className="text-sm font-medium mb-2">Sample Tickets</h4>
            <ul className="space-y-2">
              {sampleTickets.map((ticket, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground bg-muted p-2 rounded"
                >
                  "{ticket}"
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Common Phrases</h4>
            <div className="flex flex-wrap gap-2">
              {commonPhrases.map((phrase, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="font-normal bg-background"
                >
                  {phrase}
                </Badge>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Suggested Category:{" "}
              <Badge variant="secondary" className="font-normal">
                {suggestedCategory}
              </Badge>
            </span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TrendingIssue;