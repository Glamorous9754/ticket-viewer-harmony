import { Outlet, Link, useLocation } from "react-router-dom";

const Profile = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-500">Manage your account settings and integrations</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <Link
          to="/profile/settings"
          className={`px-4 py-2 border-b-2 transition-colors ${
            isActive("settings")
              ? "border-primary text-primary-foreground"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          General Settings
        </Link>
        <Link
          to="/profile/integrations"
          className={`px-4 py-2 border-b-2 transition-colors ${
            isActive("integrations")
              ? "border-primary text-primary-foreground"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Integrations
        </Link>
      </div>

      <Outlet />
    </div>
  );
};

export default Profile;