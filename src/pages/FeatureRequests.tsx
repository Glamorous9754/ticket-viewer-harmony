import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FeatureFilters } from "../components/dashboard/FeatureFilters";
import { FeatureGrid } from "../components/dashboard/FeatureGrid";
import { PlatformSelector } from "../components/dashboard/PlatformSelector";
import { toast } from "sonner";

const FeatureRequests = () => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");

  const { data: features, isLoading, error, refetch } = useQuery({
    queryKey: ["features"],
    queryFn: async () => {
      const { data: tickets, error: ticketsError } = await supabase
        .from("tickets")
        .select("*")
        .not('thread', 'is', null)
        .order("created_date", { ascending: false });

      if (ticketsError) throw ticketsError;

      return tickets.map((ticket) => ({
        summary: ticket.thread?.split('\n')[0] || "Feature request from ticket",
        priority: ticket.status === 'Open' ? 4.5 : 3,
        segments: ["Enterprise"],
        complexity: "Medium" as const,
        status: ticket.status,
        createdAt: ticket.created_date,
        resolvedAt: ticket.resolved_date,
        agentName: ticket.agent_name,
      }));
    }
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
          Connect your ticket management platform to analyze customer feature requests
        </p>
      </div>
      
      <PlatformSelector />

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