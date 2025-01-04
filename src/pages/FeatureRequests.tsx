import { useState } from "react";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters";

const mockFeatures = [
  {
    summary: "Automated ticket categorization using AI",
    priority: 4.8,
    segments: ["Enterprise", "Pro Users"],
    complexity: "High",
    status: "Open",
    createdAt: "2024-02-15T10:00:00Z",
    agentName: "Sarah Chen",
  },
  {
    summary: "Real-time chat translation for support agents",
    priority: 4.5,
    segments: ["Enterprise"],
    complexity: "Medium",
    status: "In Progress",
    createdAt: "2024-02-10T15:30:00Z",
    agentName: "Michael Brown",
  },
  {
    summary: "Bulk ticket management tools",
    priority: 4.2,
    segments: ["Pro Users", "Small Business"],
    complexity: "Medium",
    status: "Open",
    createdAt: "2024-02-08T09:15:00Z",
  },
  {
    summary: "Custom dashboard widgets",
    priority: 3.9,
    segments: ["Enterprise", "Pro Users"],
    complexity: "Medium",
    status: "Under Review",
    createdAt: "2024-02-05T14:20:00Z",
  },
  {
    summary: "Advanced analytics for response times",
    priority: 3.7,
    segments: ["Enterprise"],
    complexity: "High",
    status: "Open",
    createdAt: "2024-02-01T11:45:00Z",
  },
  {
    summary: "Integration with popular CRM platforms",
    priority: 3.5,
    segments: ["Small Business", "Pro Users"],
    complexity: "Low",
    status: "Planned",
    createdAt: "2024-01-28T16:00:00Z",
  },
];

const FeatureRequests = () => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");
  const [isLoading] = useState(false);

  const filteredFeatures = mockFeatures
    .filter((feature) => 
      filterBy === "all" ? true : feature.segments.includes(filterBy)
    )
    .sort((a, b) => 
      sortBy === "priority" 
        ? b.priority - a.priority
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <div className="space-y-8">
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