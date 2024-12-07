import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-muted">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <div className="container py-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;