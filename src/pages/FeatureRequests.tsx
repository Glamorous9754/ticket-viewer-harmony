import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters";

const FeatureRequests = () => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard_data", "feature_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_data")
        .select("feature_requests")
        .maybeSingle();

      if (error) {
        console.error("Error fetching feature requests:", error);
        throw error;
      }

      return data?.feature_requests || { segments: [], requests: [] };
    },
  });

  const requests = dashboardData?.requests || [];
  const segments = dashboardData?.segments || [];

  const mappedFeatures = requests.map((request) => ({
    summary: request.title || "No Title",
    priority: request.impact_score || 0,
    segments: request.tags || [],
    complexity: request.complexity || "Low",
    status: "Open",
    createdAt: request.since || new Date().toISOString(),
    description: request.description || "No description available",
    url: request.url?.[0] || null,
  }));

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
      <h1 className="text-3xl font-bold text-primary-foreground mb-2">Requests</h1>
      <p className="text-muted-foreground">
        Track and manage requests from your customers across all platforms
      </p>

      <FeatureFilters
        sortBy={sortBy}
        filterBy={filterBy}
        onSortChange={setSortBy}
        onFilterChange={setFilterBy}
        segments={segments}
      />

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading Feature Requests...</div>
      ) : filteredFeatures.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No Feature Requests Found</div>
      ) : (
        <FeatureGrid
          features={filteredFeatures.map((feature) => ({
            ...feature,
            actions: (
              <button
                disabled={!feature.url}
                onClick={() => feature.url && window.open(feature.url, "_blank")}
                className={`px-4 py-2 rounded ${
                  feature.url ? "bg-primary text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                View Request
              </button>
            ),
          }))}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default FeatureRequests;
