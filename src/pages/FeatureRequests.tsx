import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters";
import { supabase } from "@/integrations/supabase/client";
import type { FeatureRequestsData } from "@/types/featureRequests";

const FeatureRequests = () => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");

  const { data: featureData, isLoading } = useQuery({
    queryKey: ['dashboard_data', 'feature_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_data')
        .select('feature_requests, created_at, updated_at')
        .maybeSingle();

      if (error) {
        console.error('Error fetching feature requests:', error);
        throw error;
      }

      // Parse the feature_requests JSON structure
      const featureRequestsData = data?.feature_requests as FeatureRequestsData || {
        segments: [],
        requests: []
      };

      // Include created_at and updated_at for the unmodified check
      return {
        ...featureRequestsData,
        created_at: data?.created_at,
        updated_at: data?.updated_at
      };
    }
  });

  // Safely access arrays with fallbacks
  const requests = featureData?.requests || [];
  const segments = featureData?.segments || [];
  const createdAt = featureData?.created_at;
  const updatedAt = featureData?.updated_at;

  // Map the data to the format expected by FeatureGrid
  const mappedFeatures = requests.map(request => {
    const isUnmodified = createdAt === updatedAt;

    return {
      summary: request.title,
      priority: request.impact_score,
      segments: request.tags,
      complexity: request.complexity,
      status: isUnmodified ? "Unmodified" : "Open", // Mark as "Unmodified" if dates are the same
      createdAt: request.since,
      description: request.description,
      url: request.url,
      isDisabled: !request.url, // Disable button if URL is blank
      isUnmodified // Add an explicit flag for UI handling
    };
  });

  const filteredFeatures = mappedFeatures
    .filter(feature => 
      filterBy === "all" ? true : feature.segments.includes(filterBy.toLowerCase())
    )
    .sort((a, b) => 
      sortBy === "priority" 
        ? b.priority - a.priority 
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

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
          segments={segments}
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

// FeatureGrid Component
const FeatureGrid = ({ features, isLoading }) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {features.map((feature, index) => (
        <div key={index} className="feature-card">
          <h3>{feature.summary}</h3>
          <p>{feature.description}</p>
          {feature.isUnmodified && (
            <span className="badge badge-warning">Unmodified</span> // Visual indicator
          )}
          <button
            disabled={feature.isDisabled}
            className={`btn ${feature.isDisabled ? 'btn-disabled' : 'btn-primary'}`}
            onClick={() => feature.url && window.open(feature.url, '_blank')}
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );
};

export default FeatureRequests;
