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
import { useToast } from "@/components/ui/use-toast";

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
    .not('summary', 'is', null)
    .order("created_date", { ascending: false });

  if (error) throw error;

  // Transform tickets into feature requests using the AI-generated summaries
  return data.map((ticket) => ({
    summary: ticket.summary || "Feature request from ticket",
    priority: 4.5, // This could be enhanced with AI scoring
    segments: ["Enterprise"], // This could be enhanced with customer segmentation
    complexity: "Medium" as const,
  }));
};

const FeatureRequests = () => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");
  const { toast } = useToast();

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

  const handleConnectZoho = async () => {
    const clientId = prompt("Enter your Zoho Client ID:");
    const clientSecret = prompt("Enter your Zoho Client Secret:");
    const refreshToken = prompt("Enter your Zoho Refresh Token:");

    if (!clientId || !clientSecret || !refreshToken) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke('connect-zoho', {
        body: {
          clientId,
          clientSecret,
          refreshToken,
          profileId: user.id,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Zoho account connected successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
        <Button onClick={handleConnectZoho}>
          Connect Zoho Account
        </Button>
        
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