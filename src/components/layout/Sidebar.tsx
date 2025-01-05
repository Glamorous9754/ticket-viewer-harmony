import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  MessageSquare,
  BrainCircuit,
  MessagesSquare,
  UserCircle,
  PlusSquare,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const links = [
    {
      name: "Customer Intelligence",
      href: "/",
      icon: BrainCircuit,
    },
    {
      name: "Feature Requests",
      href: "/features",
      icon: MessageSquare,
    },
    {
      name: "Custom Requests",
      href: "/custom-requests",
      icon: PlusSquare,
    },
    {
      name: "Business Intelligence",
      href: "/business",
      icon: BarChart3,
    },
    {
      name: "Chat",
      href: "/chat",
      icon: MessagesSquare,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: UserCircle,
    },
  ];

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform">
      <div className="h-full px-3 py-4 overflow-y-auto bg-accent border-r border-border">
        <div className="mb-10 pl-3">
          <h1 className="text-2xl font-bold text-primary-foreground">Lovable</h1>
          <p className="text-sm text-muted-foreground">Customer Intelligence Platform</p>
        </div>
        <ul className="space-y-2 font-medium">
          {links.map((link) => (
            <li key={link.name}>
              <Link
                to={link.href}
                className={cn(
                  "flex items-center p-3 text-primary-foreground rounded-lg hover:bg-muted group transition-colors",
                  isActive(link.href) && "bg-muted"
                )}
              >
                <link.icon className="w-5 h-5" />
                <span className="ml-3">{link.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;