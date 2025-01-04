import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#006837]">Feature Requests</h1>
        <p className="text-gray-600">
          Track and manage feature requests from your customers across all platforms
        </p>
      </div>

      <div className="flex gap-4">
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Priority</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="automation">Automation</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
            <SelectItem value="integration">Integration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <FeatureGrid features={mockFeatures} isLoading={false} />
    </div>
  );
};

export default FeatureRequests;