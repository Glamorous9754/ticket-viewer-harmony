import RiskAlert from "../RiskAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle } from "lucide-react";

interface RiskAlertsProps {
  alerts: Array<{
    type: string;
    severity: "Low" | "Medium" | "High";
    segment: string;
    evidence: string;
  }>;
}

const RiskAlertsSection = ({ alerts }: RiskAlertsProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Risk Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <RiskAlert key={index} {...alert} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RiskAlertsSection;