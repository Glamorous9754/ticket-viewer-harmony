import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters";
import { supabase } from "@/integrations/supabase/client";
import type { FeatureRequestsData } from "@/types/featureRequests";

const FeatureRequests = () => {
  const [sortBy, setSortBy] = useState("priority"); // Sorting logic: "priority" or "created"
  const [filterBy, setFilterBy] = useState("all"); // Filter by segment

  const { data: featureData, isLoading } = useQuery({
    queryKey: ["dashboard_data", "feature_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_data")
        .select("feature_requests_data")
        .maybeSingle();

      if (error) {
        console.error("Error fetching feature requests:", error);
        throw error;
      }

      // Provide default structure if data is missing or undefined
      const featureRequestsData = (data?.feature_requests_data as FeatureRequestsData) || {
        segments: [],
        requests: [],
      };

      console.log("Feature Requests Data:", featureRequestsData); // Debug log
      return featureRequestsData;
    },
  });

  // Safely access arrays with fallbacks
  const requests = featureData?.requests || [];
  const segments = featureData?.segments || [];

  // Map data to format expected by FeatureGrid
  const mappedFeatures = requests.map((request) => ({
    summary: request.title || "No Title",
    priority: request.impact_score || 0,
    segments: request.tags || [],
    complexity: request.complexity || "Low",
    status: "Open", // Default status
    createdAt: request.since || new Date().toISOString(),
    description: request.description || "No description available",
    url: request.url || "#",
  }));

  // Apply filtering and sorting
  const filteredFeatures = mappedFeatures
    .filter((feature) =>
      filterBy === "all"
        ? true
        : feature.segments.some((segment) => segment.toLowerCase() === filterBy.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "priority") {
        return b.priority - a.priority || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || b.priority - a.priority;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-foreground mb-2">Requests</h1>
        <p className="text-muted-foreground">
          Track and manage requests from your customers across all platforms
        </p>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center">
        <FeatureFilters
          sortBy={sortBy}
          filterBy={filterBy}
          onSortChange={setSortBy}
          onFilterChange={setFilterBy}
          segments={segments}
        />
      </div>

      {/* Loading or Empty State */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading Feature Requests...</div>
      ) : filteredFeatures.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No Feature Requests Found</div>
      ) : null}

      {/* Feature Requests Grid */}
      <FeatureGrid features={filteredFeatures} isLoading={isLoading} />
    </div>
  );
};

export default FeatureRequests;