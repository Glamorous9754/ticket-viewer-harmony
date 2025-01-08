import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FeatureRequest, DashboardData } from "@/types/dashboard";
import FeatureCard from "@/components/dashboard/FeatureCard";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { Skeleton } from "@/components/ui/skeleton";

const FeatureRequests = () => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard_data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_data")
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
        return null;
      }

      console.log("Raw dashboard data:", data);
      
      if (data?.feature_requests) {
        try {
          const features = typeof data.feature_requests === 'string' 
            ? JSON.parse(data.feature_requests)
            : data.feature_requests;
            
          console.log("Parsed feature requests:", features);
          return {
            ...data,
            feature_requests: features
          };
        } catch (e) {
          console.error("Error parsing feature requests:", e);
          toast.error("Error parsing dashboard data");
          return data;
        }
      }
      
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  // Map the mock data to match FeatureCard props
  const mockFeatures = [
    {
      summary: "Dark Mode Support",
      priority: 4,
      segments: ["UI/UX", "Accessibility"],
      complexity: "Medium" as const,
      description: "Add system-wide dark mode support",
      createdAt: "2024-03-15T09:00:00",
    },
  ];

  const featureRequests = dashboardData?.feature_requests?.map(feature => ({
    summary: feature.title,
    priority: Math.floor(feature.impact_score / 20),
    segments: feature.tags,
    complexity: feature.complexity,
    description: feature.description,
    createdAt: feature.since,
  })) || mockFeatures;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Feature Requests
        </h1>
        <p className="text-muted-foreground">
          Track and prioritize feature requests from customers
        </p>
      </div>

      <FeatureFilters 
        sortBy={sortBy}
        filterBy={filterBy}
        onSortChange={setSortBy}
        onFilterChange={setFilterBy}
      />
      
      <FeatureGrid 
        features={featureRequests}
        isLoading={isLoading}
      />
    </div>
  );
};

export default FeatureRequests;