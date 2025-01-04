import { formatDistanceToNow } from "date-fns";

interface FeatureCardDetailsProps {
  createdAt?: string;
  agentName?: string;
}

export const FeatureCardDetails = ({ createdAt, agentName }: FeatureCardDetailsProps) => {
  if (!createdAt) return null;
  
  return (
    <div className="text-sm text-muted-foreground">
      Created {formatDistanceToNow(new Date(createdAt))} ago
      {agentName && ` • Assigned to ${agentName}`}
    </div>
  );
};