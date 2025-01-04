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
      className={`rounded-lg border-2 p-3 sm:p-4 transition-all duration-200 hover:shadow-md ${getSeverityColor(
        severity
      )}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1.5 sm:space-y-2">
          <div>
            <h3 className="font-medium text-gray-900 text-base sm:text-lg leading-tight">
              {type}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">Affecting {segment}</p>
          </div>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            {evidence}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiskAlert;