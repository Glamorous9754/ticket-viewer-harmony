import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const EmptyStateMessage = () => {
  return (
    <Card className="p-8 text-center space-y-4 max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-semibold">Welcome to Your Dashboard!</h2>
      <p className="text-gray-600">
        To get started, connect your support platform (like Zendesk, Freshdesk, or Gmail) 
        and let us help you analyze your customer interactions.
      </p>
      <div className="flex justify-center">
        <Button asChild>
          <Link to="/profile/integrations" className="flex items-center gap-2">
            Connect Your Platform
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};