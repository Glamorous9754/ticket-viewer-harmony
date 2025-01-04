import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FeatureFiltersProps {
  sortBy: string;
  filterByTag: string;
  onSortChange: (value: string) => void;
  onTagFilterChange: (value: string) => void;
}

export const FeatureFilters = ({
  sortBy,
  filterByTag,
  onSortChange,
  onTagFilterChange,
}: FeatureFiltersProps) => {
  return (
    <div className="flex gap-4">
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="recent">Most Recent</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={filterByTag} onValueChange={onTagFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tags</SelectItem>
          <SelectItem value="API">API</SelectItem>
          <SelectItem value="Integration">Integration</SelectItem>
          <SelectItem value="UI/UX">UI/UX</SelectItem>
          <SelectItem value="Performance">Performance</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};