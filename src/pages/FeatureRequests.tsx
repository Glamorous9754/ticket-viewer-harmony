import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client"; // Import your Supabase client
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";

const FeatureRequests = () => {
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching authenticated user..."); // Log user fetching
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
        console.log("Authenticated user ID:", userProfileId); // Log user ID

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

        console.log("Fetched dashboard data:", data); // Log fetched data

        if (data && data.db?.feature_requests) {
          const { requests } = data.db.feature_requests;

          // Log raw requests data
          console.log("Raw feature requests:", requests);

          // Filter out features without a URL
          const validFeatures = requests.filter(
            (feature) => feature.url && feature.url.length > 0
          );

          console.log("Valid features after filtering:", validFeatures); // Log valid features

          // Map data to match the required structure
          const mappedFeatures = validFeatures.map((feature) => ({
            summary: feature.title,
            segments: feature.tags,
            complexity: feature.complexity,
            status: "Open", // Assuming status is "Open" as not provided
            createdAt: feature.since,
            description: feature.description || "No description available",
          }));

          console.log("Mapped features:", mappedFeatures); // Log mapped features

          setFeatures(mappedFeatures);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary-foreground mb-2">
          Requests
        </h1>
        <p className="text-muted-foreground">Loading data...</p>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary-foreground mb-2">
          Requests
        </h1>
        <p className="text-muted-foreground">No feature requests available.</p>
      </div>
    );
  }

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

      <FeatureGrid features={features} isLoading={isLoading} />
    </div>
  );
};

export default FeatureRequests;
