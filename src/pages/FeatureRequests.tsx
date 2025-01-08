import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters";
import { supabase } from "@/integrations/supabase/client";

interface FeatureRequestsData {
  segments: string[];
  requests: {
    title: string;
    impact_score: number;
    complexity: "Low" | "Medium" | "High";
    tags: string[];
    since: string;
    url?: string;
    description?: string;
  }[];
}

const FeatureRequests = () => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");

  const { data: featureData, isLoading } = useQuery({
    queryKey: ['dashboard_data', 'feature_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_data')
        .select('feature_requests_data')
        .maybeSingle();

      if (error) {
        console.error('Error fetching feature requests:', error);
        throw error;
      }

      return data?.feature_requests_data as FeatureRequestsData || { segments: [], requests: [] };
    }
  });

  // Map the data to the format expected by FeatureGrid
  const mappedFeatures = featureData?.requests.map(request => ({
    summary: request.title,
    priority: request.impact_score,
    segments: request.tags,
    complexity: request.complexity,
    status: "Open",
    createdAt: request.since,
    description: request.description,
    url: request.url
  })) || [];

  const filteredFeatures = mappedFeatures
    .filter(feature => 
      filterBy === "all" ? true : feature.segments.includes(filterBy.toLowerCase())
    )
    .sort((a, b) => 
      sortBy === "priority" 
        ? b.priority - a.priority 
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Get unique segments for the filter dropdown
  const availableSegments = featureData?.segments || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-foreground mb-2">
          Requests
        </h1>
        <p className="text-muted-foreground">
          Track and manage requests from your customers across all platforms
        </p>
      </div>

      <div className="flex justify-between items-center">
        <FeatureFilters
          sortBy={sortBy}
          filterBy={filterBy}
          onSortChange={setSortBy}
          onFilterChange={setFilterBy}
          segments={availableSegments}
        />
      </div>

      {filteredFeatures.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          No Feature Requests Found
        </div>
      )}

      <FeatureGrid 
        features={filteredFeatures} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default FeatureRequests;