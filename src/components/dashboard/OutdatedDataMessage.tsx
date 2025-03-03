import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface OutdatedDataMessageProps {
  hasActiveConnection: boolean;
  hasData: boolean;
}

export const OutdatedDataMessage = ({ hasActiveConnection, hasData }: OutdatedDataMessageProps) => {
  // Don't show the message if there's no data or if there is an active connection
  if (!hasData || hasActiveConnection) {
    return null;
  }

  return (
    <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
      <div className="flex items-start gap-4">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
        <div className="space-y-2">
          <h3 className="font-medium text-yellow-800">
            Viewing Historical Data
          </h3>
          <p className="text-yellow-700">
            The information shown here is based on previously synced data. To get the latest updates and insights, please reconnect your platform.
          </p>
          <Button asChild variant="outline" className="bg-white hover:bg-yellow-100">
            <Link to="/profile/integrations" className="flex items-center gap-2">
              Reconnect Your Platform
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};