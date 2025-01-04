import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters";

const mockFeatures = [
  {
    summary: "Automated ticket categorization using AI",
    priority: 4.8,
    complexity: "High" as const,
    tags: ["automation", "analytics"],
    createdAt: "2023-04-15T10:00:00Z",
    agentName: "Sarah Chen",
    ticketUrl: "#"
  },
  {
    summary: "Real-time chat translation for support agents",
    priority: 4.5,
    complexity: "Medium" as const,
    tags: ["integration", "automation"],
    createdAt: "2023-04-15T10:00:00Z",
    agentName: "Michael Brown",
    ticketUrl: "#"
  },
  {
    summary: "Bulk ticket management tools",
    priority: 4.2,
    complexity: "Medium" as const,
    tags: ["ticketing"],
    createdAt: "2023-04-15T10:00:00Z",
    ticketUrl: "#"
  },
  {
    summary: "Custom dashboard widgets",
    priority: 3.9,
    complexity: "Medium" as const,
    tags: ["analytics", "integration"],
    createdAt: "2023-04-15T10:00:00Z",
    ticketUrl: "#"
  },
  {
    summary: "Advanced analytics for response times",
    priority: 3.7,
    complexity: "High" as const,
    tags: ["analytics"],
    createdAt: "2023-04-15T10:00:00Z",
    ticketUrl: "#"
  },
  {
    summary: "Integration with popular CRM platforms",
    priority: 3.5,
    complexity: "Low" as const,
    tags: ["integration"],
    createdAt: "2023-04-15T10:00:00Z",
    ticketUrl: "#"
  }
];

const FeatureRequests = () => {
  return (
    <div className="space-y-6 p-2 sm:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#006837]">Feature Requests</h1>
        <p className="text-gray-600">
          Track and manage feature requests from your customers across all platforms
        </p>
      </div>

      <div className="w-full">
        <FeatureFilters
          sortBy="all"
          filterBy="all"
          onSortChange={() => {}}
          onFilterChange={() => {}}
        />
      </div>

      <FeatureGrid features={mockFeatures} isLoading={false} />
    </div>
  );
};

export default FeatureRequests;
