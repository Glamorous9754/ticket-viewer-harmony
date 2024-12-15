import { Card } from "@/components/ui/card";
import { MessageSquare, Mail, Headphones, PhoneCall } from "lucide-react";
import { useNavigate } from "react-router-dom";

const platforms = [
  {
    name: "FreshDesk",
    icon: PhoneCall,
    description: "Connect your FreshDesk account to analyze customer tickets",
    path: "/features/freshdesk",
  },
  {
    name: "Zoho Desk",
    icon: Headphones,
    description: "Integrate with Zoho Desk for ticket analysis",
    path: "/features/zoho",
  },
  {
    name: "Zendesk",
    icon: MessageSquare,
    description: "Connect your Zendesk account for ticket insights",
    path: "/features/zendesk",
  },
  {
    name: "Gmail",
    icon: Mail,
    description: "Analyze customer emails from Gmail",
    path: "/features/gmail",
  },
];

export const PlatformSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {platforms.map((platform) => (
        <Card
          key={platform.name}
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate(platform.path)}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <platform.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{platform.name}</h3>
              <p className="text-muted-foreground">{platform.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};