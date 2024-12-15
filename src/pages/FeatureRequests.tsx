import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FreshDeskConnect } from "../components/dashboard/FreshDeskConnect";
import { ZohoDeskConnect } from "../components/dashboard/ZohoDeskConnect";
import { FeatureFilters } from "../components/dashboard/FeatureFilters";
import { FeatureGrid } from "../components/dashboard/FeatureGrid";
import { PlatformSelector } from "../components/dashboard/PlatformSelector";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

const FeatureRequests = () => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");
  const location = useLocation();

  // Show platform selector if we're on the main features page
  const showPlatformSelector = location.pathname === "/features";

  const { data: features, isLoading, error, refetch } = useQuery({
    queryKey: ["features"],
    queryFn: fetchFeatureRequests,
  });

  if (error) {
    toast.error("Failed to load feature requests");
  }

  const sortedFeatures = features
    ? [...features].sort((a, b) => {
        if (sortBy === "priority") {
          return b.priority - a.priority;
        }
        if (sortBy === "date") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      })
    : [];

  const filteredFeatures = sortedFeatures.filter((feature) => {
    if (filterBy === "all") return true;
    if (filterBy === "open") return feature.status === "Open";
    if (filterBy === "closed") return feature.status === "Closed";
    return feature.segments.includes(filterBy);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Feature Requests & Ideas
        </h1>
        <p className="text-gray-500">
          Connect your support platforms to analyze customer feature requests
        </p>
      </div>

      {showPlatformSelector ? (
        <PlatformSelector />
      ) : (
        <>
          <FreshDeskConnect onSuccess={refetch} />
          <ZohoDeskConnect onSuccess={refetch} />
          <FeatureFilters
            sortBy={sortBy}
            filterBy={filterBy}
            onSortChange={setSortBy}
            onFilterChange={setFilterBy}
          />
          <FeatureGrid features={filteredFeatures} isLoading={isLoading} />
        </>
      )}
    </div>
  );
};

async function fetchFeatureRequests() {
  try {
    const { data, error } = await supabase.from("features").select("*");
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error fetching feature requests:", error);
    throw error;
  }
}

export default FeatureRequests;
