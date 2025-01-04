import { useState } from "react";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters";
import { useFeatureManagement } from "@/hooks/useFeatureManagement";

const mockFeatures = [
  {
    summary: "Automated ticket categorization using AI",
    priority: 4.8,
    tags: ["automation", "analytics"],
    complexity: "High" as const,
    createdAt: "2024-02-15T10:00:00Z",
    agentName: "Sarah Chen",
    ticketUrl: "https://support.example.com/tickets/123",
    description: "Implement an AI-powered system that automatically categorizes incoming support tickets based on their content, urgency, and historical patterns. This will help reduce response times and ensure proper ticket routing.",
  },
  {
    summary: "Real-time chat translation for support agents",
    priority: 4.5,
    tags: ["integration", "automation"],
    complexity: "Medium" as const,
    createdAt: "2024-02-10T15:30:00Z",
    agentName: "Michael Brown",
    ticketUrl: "https://support.example.com/tickets/124",
    description: "Add real-time translation capabilities to the chat interface, allowing support agents to communicate with customers in their preferred language while typing in their own.",
  },
  {
    summary: "Bulk ticket management tools",
    priority: 4.2,
    tags: ["ticketing"],
    complexity: "Medium" as const,
    createdAt: "2024-02-08T09:15:00Z",
    ticketUrl: "https://support.example.com/tickets/125",
    description: "Develop tools for managing multiple tickets simultaneously, including bulk status updates, assignment changes, and automated responses for similar issues.",
  },
  {
    summary: "Custom dashboard widgets",
    priority: 3.9,
    tags: ["analytics", "integration"],
    complexity: "Medium" as const,
    createdAt: "2024-02-05T14:20:00Z",
    ticketUrl: "https://support.example.com/tickets/126",
    description: "Allow users to create and customize their own dashboard widgets, displaying key metrics and data visualizations relevant to their specific needs and role.",
  },
  {
    summary: "Advanced analytics for response times",
    priority: 3.7,
    tags: ["analytics"],
    complexity: "High" as const,
    createdAt: "2024-02-01T11:45:00Z",
    ticketUrl: "https://support.example.com/tickets/127",
    description: "Implement detailed analytics for tracking and improving response times, including breakdown by ticket type, agent performance, and peak hours analysis.",
  },
  {
    summary: "Integration with popular CRM platforms",
    priority: 3.5,
    tags: ["integration"],
    complexity: "Low" as const,
    createdAt: "2024-01-28T16:00:00Z",
    ticketUrl: "https://support.example.com/tickets/128",
    description: "Create seamless integrations with major CRM platforms to sync customer data, ticket history, and communication logs automatically.",
  },
];

const FeatureRequests = () => {
  const [isLoading] = useState(false);
  const {
    sortBy,
    filterBy,
    setSortBy,
    setFilterBy,
    filteredAndSortedFeatures
  } = useFeatureManagement(mockFeatures);

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
        features={filteredAndSortedFeatures}
        isLoading={isLoading}
      />
    </div>
  );
};

export default FeatureRequests;
