import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "./Sidebar";

const Layout = () => {
  const navigate = useNavigate();
  const [isRetracted, setIsRetracted] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };

    checkUser();

    // Listen for auth state changes
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
      <Sidebar isRetracted={isRetracted} onRetract={() => setIsRetracted(!isRetracted)} />
      <main className={`transition-all duration-200 ease-out ${isRetracted ? 'pl-16' : 'pl-64'} min-h-screen`}>
        <div className="container py-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;