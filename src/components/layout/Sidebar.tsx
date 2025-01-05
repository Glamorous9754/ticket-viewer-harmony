import { Home, MessageSquare, Lightbulb, BarChart, LogOut, Settings, ChevronLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isRetracted: boolean;
  onRetract: () => void;
}

const Sidebar = ({ isRetracted, onRetract }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-gradient-to-b from-white to-accent/20 border-r border-gray-200 flex flex-col animate-fade-in backdrop-blur-sm transition-all duration-300 ease-in-out",
        isRetracted ? "w-16" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        <h1 className={cn(
          "text-2xl font-bold text-primary-foreground transition-opacity duration-300",
          isRetracted ? "opacity-0 w-0" : "opacity-100"
        )}>
          Support AI
        </h1>
        <button
          onClick={onRetract}
          className="p-2 rounded-lg hover:bg-muted transition-colors duration-300 ease-in-out"
          aria-label={isRetracted ? "Expand sidebar" : "Retract sidebar"}
        >
          <ChevronLeft className={cn(
            "w-5 h-5 text-primary-foreground transition-transform duration-300",
            isRetracted && "rotate-180"
          )} />
        </button>
      </div>
      
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:bg-muted"
                  )}
                >
                  <link.icon className="w-5 h-5 shrink-0" />
                  <span className={cn(
                    "transition-opacity duration-300 whitespace-nowrap",
                    isRetracted ? "opacity-0 w-0" : "opacity-100"
                  )}>
                    {link.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 space-y-2 border-t border-gray-200">
        <Link
          to="/chat"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            location.pathname === "/chat"
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 hover:bg-muted"
          )}
        >
          <MessageSquare className={cn(
            "w-5 h-5 shrink-0",
            location.pathname === "/chat" && "animate-pulse"
          )} />
          <span className={cn(
            "transition-opacity duration-300 whitespace-nowrap",
            isRetracted ? "opacity-0 w-0" : "opacity-100"
          )}>
            Chat
          </span>
        </Link>
        
        <Link
          to="/profile/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            location.pathname.startsWith("/profile")
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 hover:bg-muted"
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          <span className={cn(
            "transition-opacity duration-300 whitespace-nowrap",
            isRetracted ? "opacity-0 w-0" : "opacity-100"
          )}>
            Profile
          </span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-muted transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className={cn(
            "transition-opacity duration-300 whitespace-nowrap",
            isRetracted ? "opacity-0 w-0" : "opacity-100"
          )}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;