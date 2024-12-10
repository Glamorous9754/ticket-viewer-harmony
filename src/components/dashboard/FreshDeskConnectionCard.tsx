import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, ExternalLink, RefreshCw } from "lucide-react";
import { FreshDeskConnection } from "./types";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface FreshDeskConnectionCardProps {
  connection: FreshDeskConnection;
  onEdit: (connection: FreshDeskConnection) => void;
  onSync: (connectionId: string) => Promise<void>;
  isLoading: boolean;
}

export const FreshDeskConnectionCard = ({
  connection,
  onEdit,
  onSync,
  isLoading,
}: FreshDeskConnectionCardProps) => {
  const [days, setDays] = useState<number>(30);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onSync(connection.id)}
          className="text-lg font-medium hover:underline flex items-center gap-2"
          disabled={isLoading}
        >
          {connection.auth_tokens.domain}
          <ExternalLink className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(connection)}
            title="Edit connection"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSync(connection.id)}
            disabled={isLoading}
            title="Sync tickets"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          max={90}
          value={days}
          onChange={(e) => setDays(Math.min(90, Math.max(1, parseInt(e.target.value) || 1)))}
          className="w-20"
          title="Number of days to sync"
        />
        <span className="text-sm text-gray-500">days of tickets</span>
      </div>
    </Card>
  );
};