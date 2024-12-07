import { Home, MessageSquare, Lightbulb, BarChart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  
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

      <div className="p-4 mt-auto border-t border-gray-200">
        <Link
          to="/chat"
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary text-primary-foreground hover:bg-secondary/80 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chat</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;