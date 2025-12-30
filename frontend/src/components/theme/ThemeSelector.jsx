import { useState } from 'react';
import { Plus, Trash2, Save, X, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeSelector = () => {
  const {
    themes,
    activeTheme,
    addTheme,
    updateTheme,
    deleteTheme,
    setTheme,
  } = useTheme();

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTheme, setNewTheme] = useState({
    name: '',
    colors: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      accent: '#8B5CF6',
      background: '#FFFFFF',
      text: '#1F2937',
    },
  });

  const handleAddTheme = () => {
    if (newTheme.name && !themes[newTheme.name]) {
      addTheme(newTheme.name, newTheme.colors);
      setNewTheme({
        name: '',
        colors: {
          primary: '#3B82F6',
          secondary: '#6B7280',
          accent: '#8B5CF6',
          background: '#FFFFFF',
          text: '#1F2937',
        },
      });
      setIsAdding(false);
    }
  };

  const handleUpdateTheme = (name, colors) => {
    updateTheme(name, colors);
    setIsEditing(false);
  };

  const handleDeleteTheme = (name) => {
    deleteTheme(name);
  };

  const handleColorChange = (colorKey, value) => {
    setNewTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Project Themes</h3>
        {!isAdding && !isEditing && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            title="Add new theme"
          >
            <Plus className="w-4 h-4" />
            <span>Add Theme</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme Name
              </label>
              <input
                type="text"
                value={newTheme.name}
                onChange={(e) =>
                  setNewTheme((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter theme name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(newTheme.colors).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="h-8 w-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewTheme({
                    name: '',
                    colors: {
                      primary: '#3B82F6',
                      secondary: '#6B7280',
                      accent: '#8B5CF6',
                      background: '#FFFFFF',
                      text: '#1F2937',
                    },
                  });
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleAddTheme}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                title="Save theme"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(themes).map(([name, colors]) => (
          <div
            key={name}
            className={`p-4 border rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.03] cursor-pointer relative ${
              activeTheme === name
                ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
            onClick={() => setTheme(name)}
            title={activeTheme === name ? 'Active theme' : 'Select theme'}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium flex items-center">
                {name}
                {activeTheme === name && (
                  <span className="ml-2 text-blue-600" title="Active theme">
                    <Check className="w-5 h-5" />
                  </span>
                )}
              </h4>
              {name !== 'default' && name !== 'dark' && (
                <button
                  onClick={e => { e.stopPropagation(); handleDeleteTheme(name); }}
                  className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full p-1 transition-all duration-150"
                  title="Delete theme"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {Object.entries(colors).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: value }}
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {key}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={e => { e.stopPropagation(); setTheme(name); }}
              className={`mt-4 w-full py-1 px-3 rounded text-sm font-medium transition-all duration-150 ${
                activeTheme === name
                  ? 'bg-blue-600 text-white cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-900'
              }`}
              disabled={activeTheme === name}
              title={activeTheme === name ? 'Active theme' : 'Select theme'}
            >
              {activeTheme === name ? 'Active' : 'Select'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector; 