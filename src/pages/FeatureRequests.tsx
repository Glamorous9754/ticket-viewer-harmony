import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client"; // Import your Supabase client
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters";

const FeatureRequests = () => {
  const [features, setFeatures] = useState([]);
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");
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

        const { data, error } = await supabase
          .from("dashboard_data")
          .select("db, profile_id")
          .eq("profile_id", userProfileId)
          .single();

        if (error) {
          console.error("Error fetching data from dashboard_data:", error);
          return;
        }

        if (data && data.db?.feature_requests?.requests) {
          // Filter out features without a URL
          const validFeatures = data.db.feature_requests.requests.filter(
            (feature) => feature.url && feature.url.length > 0
          );

          // Map data to match the required structure
          const mappedFeatures = validFeatures.map((feature) => ({
            summary: feature.title,
            priority: feature.impact_score,
            segments: feature.tags,
            complexity: feature.complexity,
            status: "Open", // Assuming status is "Open" as not provided
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

  const filteredFeatures = features
    .filter((feature) =>
      filterBy === "all" ? true : feature.segments.includes(filterBy.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === "priority"
        ? b.priority - a.priority
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
