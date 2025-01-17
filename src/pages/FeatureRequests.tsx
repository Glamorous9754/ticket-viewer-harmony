import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters";
import { OutdatedDataMessage } from "../components/dashboard/OutdatedDataMessage";
import { EmptyStateMessage } from "../components/dashboard/EmptyStateMessage";

interface FeatureRequest {
  title: string;
  impact_score?: number;
  tags?: string[];
  complexity?: string;
  since: string;
  description?: string;
  url?: string;
}

interface Feature {
  summary: string;
  priority: number;
  segments: string[];
  complexity: "Low" | "Medium" | "High";
  createdAt: string;
  description: string;
  url: string | null;
}

interface ParsedDb {
  feature_requests?: {
    requests: FeatureRequest[];
  };
}

const FeatureRequests = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [segments, setSegments] = useState<string[]>([]);
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveConnection, setHasActiveConnection] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error retrieving authenticated user:", userError);
          return;
        }

        if (!userData?.user) {
          console.error("No authenticated user found");
          return;
        }

        const userProfileId = userData.user.id;

        // Check for active platform connections
        const { data: connections, error: connectionsError } = await supabase
          .from("platform_connections")
          .select("is_active")
          .eq("profile_id", userProfileId)
          .eq("is_active", true)
          .limit(1);

        setHasActiveConnection(connections && connections.length > 0);

        const { data, error } = await supabase
          .from("dashboard_data")
          .select("db")
          .eq("profile_id", userProfileId)
          .single();

        if (error) {
          console.error("Error fetching data from dashboard_data:", error);
          return;
        }

        const parsedDb = data?.db as ParsedDb | undefined;

        if (parsedDb?.feature_requests) {
          const { requests } = parsedDb.feature_requests;

          const mappedFeatures = requests.map((feature) => ({
            summary: feature.title,
            priority: feature.impact_score || 0,
            segments: feature.tags || [],
            complexity: (["Low", "Medium", "High"].includes(
              feature.complexity || "Low"
            )
              ? feature.complexity
              : "Low") as "Low" | "Medium" | "High",
            createdAt: feature.since,
            description: feature.description || "No description available",
            url: feature.url || null,
          }));

          setFeatures(mappedFeatures);

          const uniqueTags = [
            ...new Set(requests.flatMap((feature) => feature.tags || [])),
          ] as string[];
          setSegments(uniqueTags);
        } else {
          console.warn("No feature requests found in the database.");
        }
      } catch (error: any) {
        console.error("Error fetching data from Supabase:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortedAndFilteredFeatures = features
    .filter((feature) =>
      filterBy === "all"
        ? true
        : feature.segments.some((tag) => tag.toLowerCase() === filterBy.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "priority") {
        return b.priority - a.priority;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Requests
        </h1>
        <p className="text-gray-500">
          Track and manage requests from your customers across all platforms
        </p>
      </div>

      {!isLoading && features.length > 0 && (
        <OutdatedDataMessage 
          hasActiveConnection={hasActiveConnection}
          hasData={features.length > 0}
        />
      )}

      {!isLoading && features.length === 0 ? (
        <EmptyStateMessage />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <FeatureFilters
              sortBy={sortBy}
              filterBy={filterBy}
              onSortChange={setSortBy}
              onFilterChange={setFilterBy}
              segments={segments}
            />
          </div>

          <FeatureGrid features={sortedAndFilteredFeatures} isLoading={isLoading} />
        </>
      )}
    </div>
  );
};

export default FeatureRequests;
