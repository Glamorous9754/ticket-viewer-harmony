import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-mobile";

const Layout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-white to-muted">
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white/80 backdrop-blur-sm"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
      
      <div className={`
        fixed inset-0 bg-black/50 z-40 transition-opacity duration-200
        ${sidebarOpen && isMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        md:hidden
      `} onClick={() => setSidebarOpen(false)} />
      
      <div className={`
        fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-in-out
        ${!sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        md:translate-x-0
      `}>
        <Sidebar />
      </div>
      
      <main className={`
        transition-all duration-200 ease-in-out
        ${sidebarOpen ? 'md:pl-64' : 'pl-0'}
      `}>
        <div className="container py-8 px-4 md:px-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;