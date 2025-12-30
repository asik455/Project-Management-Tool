import { useState, useEffect } from 'react';
import { Bell, Moon, Sun, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import ThemeSelector from '../theme/ThemeSelector';

const Settings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('settings');
    return saved
      ? JSON.parse(saved)
      : {
          notifications: true,
          darkMode: false,
        };
  });

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    // Mock logout (add real logic if needed)
    window.location.reload();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <SettingsIcon className="w-10 h-10 text-blue-700" />
        <h1 className="highlighted-heading">Settings</h1>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-black">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-700 to-red-600 flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-white dark:border-gray-800"></div>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-black">User</h2>
              <p className="text-gray-500 dark:text-gray-400">user@email.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 border-2 border-black text-lg font-bold transition-all duration-200 transform hover:scale-105"
            title="Logout"
          >
            <LogOut className="w-5 h-5 mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-black">
        <h2 className="highlighted-heading mb-6">Theme & Appearance</h2>
        <ThemeSelector />
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-black">
        <h2 className="highlighted-heading mb-6">General Settings</h2>
        <div className="space-y-8">
          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all duration-200 border border-blue-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-black">Notifications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enable or disable notifications
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('notifications')}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none ${
                settings.notifications 
                  ? 'bg-gradient-to-r from-blue-700 to-red-600' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              title={settings.notifications ? 'Disable notifications' : 'Enable notifications'}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                  settings.notifications ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-all duration-200 border border-red-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                {settings.darkMode ? (
                  <Moon className="w-6 h-6 text-red-600" />
                ) : (
                  <Sun className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-black">Dark Mode</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle dark mode
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('darkMode')}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none ${
                settings.darkMode 
                  ? 'bg-gradient-to-r from-blue-700 to-red-600' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              title={settings.darkMode ? 'Disable dark mode' : 'Enable dark mode'}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                  settings.darkMode ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 