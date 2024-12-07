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
        return "border-green-200 bg-green-50";
      case "Medium":
        return "border-yellow-200 bg-yellow-50";
      case "High":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div
      className={`rounded-lg border-2 p-4 ${getSeverityColor(severity)}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div className="space-y-2">
          <div>
            <h3 className="font-medium text-gray-900">{type}</h3>
            <p className="text-sm text-gray-500">Affecting {segment}</p>
          </div>
          <p className="text-sm text-gray-600">{evidence}</p>
        </div>
      </div>
    </div>
  );
};

export default RiskAlert;