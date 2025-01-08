import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FeatureFiltersProps {
  sortBy: string;
  filterBy: string;
  onSortChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  segments?: string[];
}

export const FeatureFilters = ({
  sortBy,
  filterBy,
  onSortChange,
  onFilterChange,
  segments = [],
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
      
      <Select value={filterBy} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by segment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Segments</SelectItem>
          {segments.map((segment) => (
            <SelectItem key={segment} value={segment.toLowerCase()}>
              {segment}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};