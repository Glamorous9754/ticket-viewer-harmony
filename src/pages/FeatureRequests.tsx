import { PlatformSelector } from "../components/dashboard/PlatformSelector";

const FeatureRequests = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Support Ticket Analysis
        </h1>
        <p className="text-gray-500">
          Connect your support platform to analyze customer tickets and identify patterns
        </p>
      </div>
      
      <PlatformSelector />
    </div>
  );
};

export default FeatureRequests;