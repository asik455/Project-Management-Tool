import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Lock, Bell, CreditCard, Settings, LogOut } from 'lucide-react';

const ProfileLayout = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/profile/security', icon: Lock, label: 'Security' },
    { path: '/profile/notifications', icon: Bell, label: 'Notifications' },
    { path: '/profile/billing', icon: CreditCard, label: 'Billing' },
    { path: '/profile/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Account Settings</h2>
        </div>
        <nav className="mt-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-sm font-medium ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-l-4 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
          <button
            className="w-full flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
            onClick={() => {
              // Handle logout
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/signin';
            }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;
