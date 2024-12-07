import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ZohoConnect } from "../components/dashboard/ZohoConnect";
import { FeatureFilters } from "../components/dashboard/FeatureFilters";
import { FeatureGrid } from "../components/dashboard/FeatureGrid";

const fetchFeatureRequests = async () => {
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("*")
    .not('summary', 'is', null)
    .order("created_date", { ascending: false });

  if (error) throw error;

  return tickets.map((ticket) => ({
    summary: ticket.summary || "Feature request from ticket",
    priority: 4.5,
    segments: ["Enterprise"],
    complexity: "Medium" as const,
  }));
};

const FeatureRequests = () => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");

  const { data: features, isLoading, refetch } = useQuery({
    queryKey: ["features"],
    queryFn: fetchFeatureRequests,
  });

  const sortedFeatures = features
    ? [...features].sort((a, b) => {
        if (sortBy === "priority") {
          return b.priority - a.priority;
        }
        return 0;
      })
    : [];

  const filteredFeatures = sortedFeatures.filter((feature) => {
    if (filterBy === "all") return true;
    return feature.segments.includes(filterBy);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Feature Requests & Ideas
        </h1>
        <p className="text-gray-500">
          Connect your Zoho account to analyze customer feature requests
        </p>
      </div>
      
      <ZohoConnect onSuccess={refetch} />

      <FeatureFilters
        sortBy={sortBy}
        filterBy={filterBy}
        onSortChange={setSortBy}
        onFilterChange={setFilterBy}
      />
      
      <FeatureGrid features={filteredFeatures} isLoading={isLoading} />
    </div>
  );
};

export default FeatureRequests;