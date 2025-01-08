import TrendingIssue from "../components/dashboard/TrendingIssue";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const mockTrendingIssues = [
  {
    title: "Login Authentication Failures",
    count: 45,
    isRising: true,
    lastDate: "2024-03-20T14:30:00Z",
    sampleTickets: [
      "Unable to login after password reset",
      "2FA verification not receiving codes",
      "Session timeout occurring frequently",
    ],
    commonPhrases: ["password reset", "2FA", "timeout", "authentication"],
    suggestedCategory: "Authentication",
    recommendedSolutions: [
      "Guide users through the password reset process with step-by-step instructions",
      "Verify and update phone number for 2FA in account settings",
      "Clear browser cache and cookies, then try logging in again",
    ],
  },
  {
    title: "Mobile App Crashes on Startup",
    count: 32,
    isRising: false,
    lastDate: "2024-03-20T10:15:00Z",
    sampleTickets: [
      "App crashes immediately after splash screen",
      "Cannot open app after latest update",
      "Black screen on app launch",
    ],
    commonPhrases: ["crash", "startup", "black screen", "latest version"],
    suggestedCategory: "Mobile App Stability",
    recommendedSolutions: [
      "Uninstall and reinstall the latest version of the app",
      "Clear app cache and data from device settings",
      "Ensure device meets minimum OS requirements",
    ],
  },
];

const CustomerIntelligence = () => {
  const [isLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-5" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Customer Intelligence Hub
        </h1>
        <p className="text-gray-500">
          Monitor and analyze trending customer support issues
        </p>
      </div>
      
      <div className="space-y-4">
        {mockTrendingIssues.map((issue, index) => (
          <TrendingIssue key={index} {...issue} />
        ))}
      </div>
    </div>
  );
};

export default CustomerIntelligence;