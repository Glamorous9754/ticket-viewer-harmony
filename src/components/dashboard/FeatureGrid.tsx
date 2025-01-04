import { Skeleton } from "@/components/ui/skeleton";
import FeatureCard from "./FeatureCard";

interface Feature {
  summary: string;
  priority: number;
  tags: string[];
  complexity: "Low" | "Medium" | "High";
  createdAt?: string;
  ticketUrl?: string;
  description?: string;
  agentName?: string;
}

interface FeatureGridProps {
  features: Feature[];
  isLoading: boolean;
}

export const FeatureGrid = ({ features, isLoading }: FeatureGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-1/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </div>
  );
};