import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters";

const FeatureRequests = () => {
  const [features, setFeatures] = useState([]);
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [isLoading, setIsLoading] = useState(true);

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
        console.log("Authenticated user ID:", userProfileId);

        const { data, error } = await supabase
          .from("dashboard_data")
          .select("db, profile_id")
          .eq("profile_id", userProfileId)
          .single();

        if (error) {
          console.error("Error fetching data from dashboard_data:", error);
          return;
        }

        if (data && data.db?.feature_requests) {
          const { requests, segments: dynamicSegments } = data.db.feature_requests;

          // Map data to match the required structure
          const mappedFeatures = requests.map((feature) => ({
            summary: feature.title,
            priority: feature.impact_score || 0,
            segments: feature.tags || [],
            complexity: feature.complexity || "Low",
            createdAt: feature.since,
            description: feature.description || "No description available",
          }));

          setFeatures(mappedFeatures);
        }
      } catch (error) {
        console.error("Error fetching data from Supabase:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredFeatures = features.filter((feature) =>
    filterBy === "all" ? true : feature.segments.includes(filterBy)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-foreground mb-2">
          Requests
        </h1>
        <p className="text-muted-foreground">
          Track and manage requests from your customers across all platforms
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

      <FeatureGrid features={filteredFeatures} isLoading={isLoading} />
    </div>
  );
};

export default FeatureRequests;