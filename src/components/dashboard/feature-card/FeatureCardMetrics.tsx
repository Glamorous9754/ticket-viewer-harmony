interface FeatureCardMetricsProps {
  priority: number;
  complexity: "Low" | "Medium" | "High";
}

export const FeatureCardMetrics = ({ priority, complexity }: FeatureCardMetricsProps) => {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Priority: {priority.toFixed(1)}</span>
      <span>•</span>
      <span>Complexity: {complexity}</span>
    </div>
  );
};