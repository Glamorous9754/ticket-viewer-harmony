import { Home, MessageSquare, Lightbulb, BarChart, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Sidebar = () => {
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col animate-fade-in">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-foreground">Support AI</h1>
      </div>
      
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-white"
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
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary text-primary-foreground hover:bg-secondary/80 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chat</span>
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