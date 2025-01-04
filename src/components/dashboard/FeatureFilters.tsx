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
          <SelectValue placeholder="Filter by product" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Products</SelectItem>
          <SelectItem value="ticketing">Ticketing System</SelectItem>
          <SelectItem value="analytics">Analytics</SelectItem>
          <SelectItem value="automation">Automation</SelectItem>
          <SelectItem value="integration">Integrations</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};