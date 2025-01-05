import { useState } from "react";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters";

const mockFeatures = [
  {
    summary: "Automated ticket categorization using AI",
    priority: 4.8,
    segments: ["automation", "analytics"],
    complexity: "High" as const,
    status: "Open",
    createdAt: "2023-03-15T10:00:00Z",
    agentName: "Sarah Chen"
  },
  {
    summary: "Real-time chat translation for support agents",
    priority: 4.5,
    segments: ["integration", "automation"],
    complexity: "Medium" as const,
    status: "Open",
    createdAt: "2023-03-15T10:00:00Z",
    agentName: "Michael Brown"
  },
  {
    summary: "Bulk ticket management tools",
    priority: 4.2,
    segments: ["ticketing"],
    complexity: "Medium" as const,
    status: "Open",
    createdAt: "2023-03-15T10:00:00Z"
  },
  {
    summary: "Custom dashboard widgets",
    priority: 3.9,
    segments: ["analytics", "integration"],
    complexity: "Medium" as const,
    status: "Open",
    createdAt: "2023-03-15T10:00:00Z"
  },
  {
    summary: "Advanced analytics for response times",
    priority: 3.7,
    segments: ["analytics"],
    complexity: "High" as const,
    status: "Open",
    createdAt: "2023-03-15T10:00:00Z"
  },
  {
    summary: "Integration with popular CRM platforms",
    priority: 3.5,
    segments: ["integration"],
    complexity: "Low" as const,
    status: "Open",
    createdAt: "2023-03-15T10:00:00Z"
  }
];

const FeatureRequests = () => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");
  const [isLoading] = useState(false);

  const filteredFeatures = mockFeatures
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
          Feature Requests
        </h1>
        <p className="text-muted-foreground">
          Track and manage feature requests from your customers across all platforms
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

      <FeatureGrid 
        features={filteredFeatures} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default FeatureRequests;