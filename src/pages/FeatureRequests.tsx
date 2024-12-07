import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import FeatureCard from "../components/dashboard/FeatureCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Feature {
  summary: string;
  priority: number;
  segments: string[];
  complexity: "Low" | "Medium" | "High";
}

const fetchFeatureRequests = async () => {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_date", { ascending: false });

  if (error) throw error;

  // Transform tickets into feature requests
  // This is a placeholder transformation until we implement AI processing
  return data.map((ticket) => ({
    summary: ticket.summary || "Feature request from ticket",
    priority: 4.5, // Placeholder until we implement priority scoring
    segments: ["Enterprise"], // Placeholder until we implement segment detection
    complexity: "Medium" as const, // Placeholder until we implement complexity analysis
  }));
};

const FeatureRequests = () => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");

  const { data: features, isLoading } = useQuery({
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
        {isLoading ? (
          // Show loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-1/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          ))
        ) : (
          filteredFeatures.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))
        )}
      </div>
    </div>
  );
};

export default FeatureRequests;