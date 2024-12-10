import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, ExternalLink } from "lucide-react";
import { FreshDeskConnection } from "./types";

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
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onSync(connection.id)}
          className="text-lg font-medium hover:underline flex items-center gap-2"
          disabled={isLoading}
        >
          {connection.auth_tokens.domain}
          <ExternalLink className="h-4 w-4" />
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(connection)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};