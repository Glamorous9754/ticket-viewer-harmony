import { Card } from "@/components/ui/card";

interface PlatformCardProps {
  title: string;
  description: string;
  isConnected: boolean;
  actions: React.ReactNode;
}

export const PlatformCard = ({
  title,
  description,
  isConnected,
  actions,
}: PlatformCardProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="mt-auto">
        {actions}
      </div>
    </Card>
  );
};