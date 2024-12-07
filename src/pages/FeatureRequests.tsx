import { useState } from "react";
import FeatureCard from "../components/dashboard/FeatureCard";
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
    summary: "Dark Mode Support",
    priority: 4.5,
    segments: ["Pro Users", "Enterprise"],
    complexity: "Low" as const,
  },
  {
    summary: "Bulk Export Functionality",
    priority: 4.8,
    segments: ["Enterprise", "Small Business"],
    complexity: "Medium" as const,
  },
  {
    summary: "API Rate Limit Increase",
    priority: 4.2,
    segments: ["Enterprise"],
    complexity: "High" as const,
  },
];

const FeatureRequests = () => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");

  const sortedFeatures = [...mockFeatures].sort((a, b) => {
    if (sortBy === "priority") {
      return b.priority - a.priority;
    }
    return 0;
  });

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
          Track and prioritize customer feature requests
        </p>
      </div>
      
      <div className="flex gap-4">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            <SelectItem value="Enterprise">Enterprise</SelectItem>
            <SelectItem value="Pro Users">Pro Users</SelectItem>
            <SelectItem value="Small Business">Small Business</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeatures.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};

export default FeatureRequests;