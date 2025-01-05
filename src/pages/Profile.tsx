import { Outlet, Link, useLocation } from "react-router-dom";

const Profile = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-sm sm:text-base text-gray-500">
          Manage your account settings and integrations
        </p>
      </div>

      <div className="flex gap-2 sm:gap-4 border-b border-gray-200 overflow-x-auto">
        <Link
          to="/profile/settings"
          className={`px-3 sm:px-4 py-2 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
            isActive("settings")
              ? "border-primary text-primary-foreground"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          General Settings
        </Link>
        <Link
          to="/profile/integrations"
          className={`px-3 sm:px-4 py-2 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
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