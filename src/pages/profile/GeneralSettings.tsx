import { Card } from "@/components/ui/card";

const GeneralSettings = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <p className="text-gray-500">
          General settings and preferences for your account will appear here.
        </p>
      </Card>
    </div>
  );
};

export default GeneralSettings;