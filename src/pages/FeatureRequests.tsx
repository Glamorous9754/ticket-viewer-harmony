import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client"; // Import your Supabase client
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters"; // Assuming this handles filter UI

const FeatureRequests = () => {
  const [features, setFeatures] = useState([]);
  const [segments, setSegments] = useState([]); // Dynamic segments
  const [filterBy, setFilterBy] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching authenticated user...");
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

        console.log("Fetching dashboard data...");
        const { data, error } = await supabase
          .from("dashboard_data")
          .select("db, profile_id")
          .eq("profile_id", userProfileId)
          .single();

        if (error) {
          console.error("Error fetching data from dashboard_data:", error);
          return;
        }

        console.log("Fetched dashboard data:", data);

        if (data && data.db?.feature_requests) {
          const { requests, segments: dynamicSegments } = data.db.feature_requests;

          console.log("Raw feature requests:", requests);
          console.log("Dynamic segments:", dynamicSegments);

          // Map data to match the required structure
          const mappedFeatures = requests.map((feature) => ({
            summary: feature.title,
            segments: feature.tags,
            complexity: feature.complexity,
            impactScore: feature.impact_score, // Ensure impact score is correctly displayed
            createdAt: new Date(feature.since).toLocaleDateString("en-US"), // Format date accurately
            description: "No description available", // Add placeholder if needed
          }));

          setFeatures(mappedFeatures);
          setSegments(["all", ...dynamicSegments]); // Dynamically add "all" option and fetched segments
        } else {
          console.log("No feature requests found in the database.");
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

      {/* Dynamic Filtering UI */}
      <div className="flex justify-between items-center">
        <FeatureFilters
          filterBy={filterBy}
          onFilterChange={setFilterBy}
          availableSegments={segments} // Pass dynamic segments for filter options
        />
      </div>

      {/* Feature Grid */}
      <FeatureGrid features={filteredFeatures} isLoading={isLoading} />
    </div>
  );
};

export default FeatureRequests;
