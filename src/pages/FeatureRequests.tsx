import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FeatureRequest, DashboardData } from "@/types/dashboard";
import FeatureCard from "@/components/dashboard/FeatureCard";
import FeatureFilters from "@/components/dashboard/FeatureFilters";
import FeatureGrid from "@/components/dashboard/FeatureGrid";
import { Skeleton } from "@/components/ui/skeleton";

const FeatureRequests = () => {
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
          // Parse the JSON data if it's a string
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

  // Use mock data until we properly parse the JSON from Supabase
  const mockFeatures = [
    {
      title: "Dark Mode Support",
      impact_score: 85,
      tags: ["UI/UX", "Accessibility"],
      complexity: "Medium" as const,
      description: "Add system-wide dark mode support",
      since: "2024-03-15T09:00:00",
    },
  ];

  const featureRequests = dashboardData?.feature_requests as FeatureRequest[] || mockFeatures;

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

      <FeatureFilters />
      <FeatureGrid>
        {featureRequests.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </FeatureGrid>
    </div>
  );
};

export default FeatureRequests;