import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface TrendingIssueProps {
  title: string;
  count: number;
  isRising: boolean;
  lastDate: string;
  sampleTickets: string[];
  commonPhrases: string[];
  suggestedCategory: string;
  recommendedSolutions?: string[];
}

const TrendingIssue = ({
  title,
  count,
  isRising,
  lastDate,
  sampleTickets,
  commonPhrases,
  suggestedCategory,
  recommendedSolutions = [],
}: TrendingIssueProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format the date if it's a valid date string
  const formattedDate = (() => {
    try {
      return format(new Date(lastDate), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return lastDate;
    }
  })();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {isRising ? (
            <TrendingUp className="w-5 h-5 text-red-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-green-500" />
          )}
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">
              {count} related tickets • Last ticket created at {formattedDate}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 animate-fade-in">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">
                Sample Tickets
              </h4>
              <ul className="space-y-2">
                {sampleTickets.map((ticket, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200"
                  >
                    {ticket}
                  </li>
                ))}
              </ul>
            </div>
            
            {recommendedSolutions && recommendedSolutions.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  Recommended Solutions
                </h4>
                <ul className="space-y-2">
                  {recommendedSolutions.map((solution, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200 border-l-4 border-l-primary"
                    >
                      {solution}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">
                Common Phrases
              </h4>
              <div className="flex flex-wrap gap-2">
                {commonPhrases.map((phrase, index) => (
                  <span
                    key={index}
                    className="text-sm bg-primary/10 text-primary-foreground px-3 py-1 rounded-full"
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">
                Suggested Category
              </h4>
              <span className="text-sm bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-full">
                {suggestedCategory}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendingIssue;