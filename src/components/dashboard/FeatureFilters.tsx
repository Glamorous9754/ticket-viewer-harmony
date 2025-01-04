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
}

export const FeatureFilters = ({
  sortBy,
  filterBy,
  onSortChange,
  onFilterChange,
}: FeatureFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="recent">Most Recent</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={filterBy} onValueChange={onFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by segment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Segments</SelectItem>
          <SelectItem value="Enterprise">Enterprise</SelectItem>
          <SelectItem value="Pro Users">Pro Users</SelectItem>
          <SelectItem value="Small Business">Small Business</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};