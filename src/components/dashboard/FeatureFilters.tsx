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
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-full sm:max-w-[600px]">
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-[200px] bg-white/50 backdrop-blur-sm border-primary/10">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-white/90 backdrop-blur-sm border-primary/10">
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="recent">Most Recent</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={filterBy} onValueChange={onFilterChange}>
        <SelectTrigger className="w-full sm:w-[200px] bg-white/50 backdrop-blur-sm border-primary/10">
          <SelectValue placeholder="Filter by product" />
        </SelectTrigger>
        <SelectContent className="bg-white/90 backdrop-blur-sm border-primary/10">
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