import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { FeatureFilters } from "@/components/dashboard/FeatureFilters";

const FeatureRequests = () => {
  const [features, setFeatures] = useState([]);
  const [segments, setSegments] = useState<string[]>([]); // Unique tags from `tags` fields
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

        const { data, error } = await supabase
          .from("dashboard_data")
          .select("db")
          .eq("profile_id", userProfileId)
          .single();

        if (error) {
          console.error("Error fetching data from dashboard_data:", error);
          return;
        }

        // Ensure `db` field is parsed as JSON
        let parsedDb;
        if (data?.db) {
          parsedDb = typeof data.db === "string" ? JSON.parse(data.db) : data.db;
        }

        if (parsedDb?.feature_requests) {
          const { requests } = parsedDb.feature_requests;

          const mappedFeatures = requests.map((feature) => ({
            summary: feature.title,
            priority: feature.impact_score || 0,
            segments: feature.tags || [],
            complexity: feature.complexity || "Low",
            createdAt: feature.since,
            description: feature.description || "No description available",
            url: feature.url || null, // Pass the URL to the FeatureCard component
          }));

          setFeatures(mappedFeatures);

          // Extract unique tags from the `tags` field across all requests
          const uniqueTags = [
            ...new Set(requests.flatMap((feature) => feature.tags || [])),
          ];
          setSegments(uniqueTags);
        } else {
          console.warn("No feature requests found in the database.");
        }
      } catch (error) {
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
          segments={segments} // Pass the dynamic segments
        />
      </div>

      <FeatureGrid features={sortedAndFilteredFeatures} isLoading={isLoading} />
    </div>
  );
};

export default FeatureRequests;
