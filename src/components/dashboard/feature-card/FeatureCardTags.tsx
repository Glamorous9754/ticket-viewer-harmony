import { Badge } from "@/components/ui/badge";

interface FeatureCardTagsProps {
  tags: string[];
}

export const FeatureCardTags = ({ tags }: FeatureCardTagsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="outline">
          {tag}
        </Badge>
      ))}
    </div>
  );
};