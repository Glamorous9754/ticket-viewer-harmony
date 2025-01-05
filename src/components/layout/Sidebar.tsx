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
        "fixed left-0 top-0 h-screen bg-gradient-to-b from-white to-accent/20 border-r border-gray-200 flex flex-col",
        isRetracted ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        <h1 className={cn(
          "text-2xl font-bold text-primary-foreground whitespace-nowrap overflow-hidden",
          isRetracted ? "w-0 opacity-0" : "w-auto opacity-100"
        )}>
          Support&nbsp;AI
        </h1>
        <button
          onClick={onRetract}
          className="p-2 rounded-lg hover:bg-muted"
          aria-label={isRetracted ? "Expand sidebar" : "Retract sidebar"}
        >
          <ChevronLeft className={cn(
            "w-6 h-6 text-primary-foreground",
            isRetracted && "rotate-180"
          )} />
        </button>
      </div>
      
      <nav className="flex-1 px-2">
        <ul className="space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={cn(
                    "flex items-center h-12 gap-3 px-3 rounded-lg group relative",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center",
                    isRetracted ? "w-full" : "w-6"
                  )}>
                    <link.icon className="w-5 h-5 shrink-0 mx-auto" />
                  </div>
                  <span className={cn(
                    "whitespace-nowrap overflow-hidden",
                    isRetracted ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}>
                    {link.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-2 space-y-2 border-t border-gray-200">
        <Link
          to="/chat"
          className={cn(
            "flex items-center h-12 gap-3 px-3 rounded-lg relative",
            location.pathname === "/chat"
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 hover:bg-muted"
          )}
        >
          <div className={cn(
            "flex items-center justify-center",
            isRetracted ? "w-full" : "w-6"
          )}>
            <MessageSquare className={cn(
              "w-5 h-5 shrink-0 mx-auto",
              location.pathname === "/chat" && "animate-pulse"
            )} />
          </div>
          <span className={cn(
            "whitespace-nowrap overflow-hidden",
            isRetracted ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            Chat
          </span>
        </Link>
        
        <Link
          to="/profile/settings"
          className={cn(
            "flex items-center h-12 gap-3 px-3 rounded-lg relative",
            location.pathname.startsWith("/profile")
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 hover:bg-muted"
          )}
        >
          <div className={cn(
            "flex items-center justify-center",
            isRetracted ? "w-full" : "w-6"
          )}>
            <Settings className="w-5 h-5 shrink-0 mx-auto" />
          </div>
          <span className={cn(
            "whitespace-nowrap overflow-hidden",
            isRetracted ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            Profile
          </span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex w-full items-center h-12 gap-3 px-3 rounded-lg text-gray-600 hover:bg-muted relative"
        >
          <div className={cn(
            "flex items-center justify-center",
            isRetracted ? "w-full" : "w-6"
          )}>
            <LogOut className="w-5 h-5 shrink-0 mx-auto" />
          </div>
          <span className={cn(
            "whitespace-nowrap overflow-hidden",
            isRetracted ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;