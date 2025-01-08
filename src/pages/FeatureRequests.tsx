import { useState } from "react";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardData, FeatureRequest } from "@/types/dashboard";

const mockFeatureRequests = {
  requests: [
    {
      title: "Mobile App Integration",
      impact_score: 85,
      tags: ["Mobile", "Integration"],
      complexity: "Medium" as const,
      description: "Enable seamless integration with mobile applications",
      since: "2024-03-01T00:00:00Z",
    },
    {
      title: "Bulk Export Feature",
      impact_score: 75,
      tags: ["Data", "Export"],
      complexity: "Low" as const,
      description: "Add ability to export data in bulk",
      since: "2024-03-05T00:00:00Z",
    },
  ],
};

const FeatureRequests = () => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard_data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_data")
        .select("*")
        .single();

      if (error) throw error;
      return data as DashboardData;
    },
  });

  const mappedFeatures = mockFeatureRequests.requests.map((request) => ({
    summary: request.title,
    priority: request.impact_score,
    segments: request.tags,
    complexity: request.complexity,
    status: "Open",
    createdAt: request.since,
    description: request.description,
    url: null,
  }));

  const filteredFeatures = mappedFeatures
    .filter((feature) =>
      filterBy === "all"
        ? true
        : feature.segments.some((segment) => segment.toLowerCase() === filterBy.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "priority") {
        return b.priority - a.priority;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-foreground mb-2">Requests</h1>
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
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading Feature Requests...</div>
      ) : filteredFeatures.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No Feature Requests Found</div>
      ) : null}

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
    </div>
  );
};

export default FeatureRequests;