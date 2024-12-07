import { Star } from "lucide-react";

interface FeatureCardProps {
  summary: string;
  priority: number;
  segments: string[];
  complexity: "Low" | "Medium" | "High";
}

const FeatureCard = ({
  summary,
  priority,
  segments,
  complexity,
}: FeatureCardProps) => {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-900">{summary}</h3>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium">{priority}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500 mb-2">Customer Segments</p>
          <div className="flex flex-wrap gap-2">
            {segments.map((segment, index) => (
              <span
                key={index}
                className="text-xs bg-primary/10 text-primary-foreground px-2 py-1 rounded-full"
              >
                {segment}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span
            className={`text-xs px-2 py-1 rounded-full ${getComplexityColor(
              complexity
            )}`}
          >
            {complexity} Complexity
          </span>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;