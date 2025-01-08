import { useState, useMemo } from "react";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters";
import { useDashboardData } from "@/hooks/use-dashboard-data";

const FeatureRequests = () => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");
  const { data, isLoading } = useDashboardData();

  const segments = useMemo(() => {
    if (!data?.featureRequests) return ["all"];
    const uniqueSegments = new Set<string>();
    data.featureRequests.forEach((feature) => {
      feature.segments.forEach((segment) => uniqueSegments.add(segment));
    });
    return ["all", ...Array.from(uniqueSegments)];
  }, [data?.featureRequests]);

  const filteredFeatures = useMemo(() => {
    if (!data?.featureRequests) return [];
    return data.featureRequests
      .filter((feature) =>
        filterBy === "all" ? true : feature.segments.includes(filterBy.toLowerCase())
      )
      .sort((a, b) =>
        sortBy === "priority"
          ? b.priority - a.priority
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [data?.featureRequests, filterBy, sortBy]);

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

      <FeatureGrid 
        features={filteredFeatures} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default FeatureRequests;