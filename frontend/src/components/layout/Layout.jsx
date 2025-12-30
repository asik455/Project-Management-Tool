import { useState, useEffect } from 'react';
import { Link, useLocation, NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Settings,
  Menu,
  X,
  Search,
  User,
  BarChart3,
  Bell,
  Users,
  ChevronDown
} from 'lucide-react';
import NotificationsComponent from '../notifications/Notifications';
import { useUser } from '../../contexts/UserContext';
import UserProfile from '../UserProfile';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setRole } = useUser();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-menu')) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col`}
      >
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800 bg-gray-900">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <span className="text-lg font-bold text-blue-500">ProjectHub</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
              title="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavLink
            to="/myday"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 mt-1 text-sm font-semibold text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200 ${isActive && 'bg-gray-800 text-white'}`
            }
          >
            <span className="mr-3 text-xl">🌞</span>
            <span className="text-sm">My Day</span>
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 mt-1 text-sm font-semibold text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200 ${isActive && 'bg-gray-800 text-white'}`
            }
          >
            <LayoutDashboard className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
            <span className="text-sm">Dashboard</span>
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 mt-1 text-sm font-semibold text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200 ${isActive && 'bg-gray-800 text-white'}`
            }
          >
            <FolderKanban className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
            <span className="text-sm">Projects</span>
          </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 mt-1 text-sm font-semibold text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200 ${isActive && 'bg-gray-800 text-white'}`
            }
          >
            <CheckSquare className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
            <span className="text-sm">Tasks</span>
          </NavLink>
          <NavLink
            to="/kanban"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 mt-1 text-sm font-semibold text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200 ${isActive && 'bg-gray-800 text-white'}`
            }
          >
            <FolderKanban className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
            <span className="text-sm">Kanban</span>
          </NavLink>
          <NavLink
            to="/gantt"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 mt-1 text-sm font-semibold text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200 ${isActive && 'bg-gray-800 text-white'}`
            }
          >
            <Calendar className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
            <span className="text-sm">Gantt Chart</span>
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 mt-1 text-sm font-semibold text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200 ${isActive && 'bg-gray-800 text-white'}`
            }
          >
            <BarChart3 className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
            <span className="text-sm">Reports</span>
          </NavLink>
          <NavLink
            to="/team"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 mt-1 text-sm font-semibold text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200 ${isActive && 'bg-gray-800 text-white'}`
            }
          >
            <Users className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
            <span className="text-sm">Team</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 mt-1 text-sm font-semibold text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200 ${isActive && 'bg-gray-800 text-white'}`
            }
          >
            <Settings className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
            <span className="text-sm">Settings</span>
          </NavLink>
        </nav>
        {/* Role Switcher for demo/testing - only visible for members */}
        {user?.role === 'member' && (
          <div className="p-4 mt-auto border-t border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Switch Role</span>
              <button
                onClick={() => setRole(user.role === 'member' ? 'manager' : 'member')}
                className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                {user.role === 'member' ? 'Try Manager' : 'Back to Member'}
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="lg:pl-72 min-h-screen flex flex-col">
        {/* Top navigation */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="relative hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Quick search..."
                    className="w-72 pl-10 pr-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-900 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <NotificationsComponent />
              
              {/* User Profile */}
              <div className="relative">
                <UserProfile />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white dark:bg-gray-900 shadow-sm h-16 flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
            title="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <NotificationsComponent />
            <UserProfile />
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;