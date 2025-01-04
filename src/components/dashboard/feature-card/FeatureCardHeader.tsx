import { CardHeader } from "@/components/ui/card";

interface FeatureCardHeaderProps {
  summary: string;
}

export const FeatureCardHeader = ({ summary }: FeatureCardHeaderProps) => {
  return (
    <CardHeader className="pb-2">
      <h3 className="font-semibold text-lg leading-tight">{summary}</h3>
    </CardHeader>
  );
};