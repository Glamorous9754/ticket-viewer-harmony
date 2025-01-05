import { AlertTriangle } from "lucide-react";

interface RiskAlertProps {
  type: string;
  severity: "Low" | "Medium" | "High";
  segment: string;
  evidence: string;
}

const RiskAlert = ({ type, severity, segment, evidence }: RiskAlertProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Low":
        return "border-primary/20 bg-primary/10 text-primary-foreground";
      case "Medium":
        return "border-secondary/20 bg-secondary/10 text-secondary-foreground";
      case "High":
        return "border-destructive/20 bg-destructive/10 text-destructive-foreground";
      default:
        return "border-muted bg-muted text-muted-foreground";
    }
  };

  return (
    <div
      className={`rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md ${getSeverityColor(severity)}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div className="space-y-2">
          <div>
            <h3 className="font-medium">{type}</h3>
            <p className="text-sm opacity-80">Affecting {segment}</p>
          </div>
          <p className="text-sm">{evidence}</p>
        </div>
      </div>
    </div>
  );
};

export default RiskAlert;