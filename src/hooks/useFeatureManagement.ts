import { useState, useMemo } from 'react';

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

export const useFeatureManagement = (features: Feature[]) => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");

  const filteredAndSortedFeatures = useMemo(() => {
    return features
      .filter((feature) => 
        filterBy === "all" ? true : feature.tags.includes(filterBy)
      )
      .sort((a, b) => 
        sortBy === "priority" 
          ? b.priority - a.priority
          : new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
  }, [features, sortBy, filterBy]);

  return {
    sortBy,
    filterBy,
    setSortBy,
    setFilterBy,
    filteredAndSortedFeatures,
  };
};