import { useState } from "react";
import { Plus, ListFilter, ArrowUpDown, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Types for our feature requests
type FeatureStatus = "pending" | "in-progress" | "completed" | "rejected";
type FeaturePriority = "low" | "medium" | "high";

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  priority: FeaturePriority;
  votes: number;
  requester: string;
  dateRequested: string;
  lastUpdated: string;
}

// Sample data
const sampleFeatures: FeatureRequest[] = [
  {
    id: "1",
    title: "Slack Integration Support",
    description: "Add ability to sync and manage Slack conversations alongside other platforms",
    status: "in-progress",
    priority: "high",
    votes: 42,
    requester: "Enterprise Customer",
    dateRequested: "2024-02-15",
    lastUpdated: "2024-03-10",
  },
  {
    id: "2",
    title: "Batch Ticket Processing",
    description: "Enable processing multiple support tickets simultaneously with AI assistance",
    status: "pending",
    priority: "medium",
    votes: 28,
    requester: "Support Team Lead",
    dateRequested: "2024-03-01",
    lastUpdated: "2024-03-08",
  },
  {
    id: "3",
    title: "Custom Analytics Dashboard",
    description: "Provide customizable analytics views for different support metrics",
    status: "completed",
    priority: "medium",
    votes: 35,
    requester: "Product Manager",
    dateRequested: "2024-02-01",
    lastUpdated: "2024-03-05",
  },
];

const FeatureRequests = () => {
  const [filter, setFilter] = useState<FeatureStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusColor = (status: FeatureStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
    }
  };

  const getPriorityColor = (priority: FeaturePriority) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "high":
        return "bg-red-100 text-red-800";
    }
  };

  const filteredFeatures = sampleFeatures
    .filter((feature) => filter === "all" || feature.status === filter)
    .filter((feature) =>
      feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Feature Requests
        </h1>
        <p className="text-gray-500">
          Track and manage feature requests from customers and team members
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search feature requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filter} onValueChange={(value: FeatureStatus | "all") => setFilter(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredFeatures.map((feature) => (
          <Card key={feature.id} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {feature.description}
                  </CardDescription>
                </div>
                <Badge
                  className={`${getStatusColor(feature.status)} capitalize`}
                >
                  {feature.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
                <Badge variant="outline" className={getPriorityColor(feature.priority)}>
                  {feature.priority} priority
                </Badge>
                <span>•</span>
                <span>{feature.votes} votes</span>
                <span>•</span>
                <span>Requested by {feature.requester}</span>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>Requested: {feature.dateRequested}</span>
                <span>•</span>
                <span>Last updated: {feature.lastUpdated}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeatureRequests;