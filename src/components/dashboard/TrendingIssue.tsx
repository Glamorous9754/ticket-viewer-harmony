import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface TrendingIssueProps {
  title: string;
  count: number;
  isRising: boolean;
  lastDate: string;
  sampleTickets: string[];
  commonPhrases: string[];
  suggestedCategory: string;
  color?: string;
  forceUpwardArrow?: boolean; // New prop to force upward arrow for BI tab
}

const TrendingIssue = ({
  title,
  count,
  isRising,
  lastDate,
  sampleTickets,
  commonPhrases,
  suggestedCategory,
  color,
  forceUpwardArrow = false, // Default to false for CI tab
}: TrendingIssueProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Map JSON colors to a Tailwind utility class for lighter borders:
  const getBorderClass = (col?: string) => {
    switch (col) {
      case "red":
        return "border-red-200";
      case "green":
        return "border-green-200";
      case "blue":
        return "border-blue-300";
      case "yellow":
        return "border-yellow-300";
      case "orange":
        return "border-orange-300";
      default:
        return "border-gray-300";
    }
  };

  // Determine which arrow to show based on context and color
  const renderTrendingArrow = () => {
    if (forceUpwardArrow) {
      // Business Intelligence tab - always show upward arrow
      return <TrendingUp className="w-5 h-5 text-primary" />;
    } else {
      // Customer Intelligence tab - arrow direction based on color
      if (color === "red") {
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      } else {
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      }
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 border ${getBorderClass(
        color
      )}`}
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {renderTrendingArrow()}
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">
              {count} related tickets • Last seen {lastDate}
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