import { Home, MessageSquare, Lightbulb, BarChart, LogOut, Settings, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  onClose: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const links = [
    {
      title: "Customer Intelligence",
      icon: Home,
      path: "/",
    },
    {
      title: "Feature Requests",
      icon: Lightbulb,
      path: "/features",
    },
    {
      title: "Business Intelligence",
      icon: BarChart,
      path: "/business",
    },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-white to-accent/20 border-r border-gray-200 flex flex-col animate-fade-in backdrop-blur-sm z-50">
      {/* Header with close button for mobile */}
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-foreground">Support AI</h1>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <nav className="flex-1 px-4 overflow-y-auto">
        <ul className="space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={isMobile ? onClose : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:bg-muted"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 space-y-2 border-t border-gray-200">
        <Link
          to="/chat"
          onClick={isMobile ? onClose : undefined}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            location.pathname === "/chat"
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 hover:bg-muted"
          }`}
        >
          <MessageSquare className={`w-5 h-5 ${location.pathname === "/chat" ? "animate-pulse" : ""}`} />
          <span>Chat</span>
        </Link>
        
        <Link
          to="/profile/settings"
          onClick={isMobile ? onClose : undefined}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            location.pathname.startsWith("/profile")
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 hover:bg-muted"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Profile</span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-muted transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;