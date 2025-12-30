import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Users
} from 'lucide-react';
import ActivityLog from '../activity/ActivityLog';

const Dashboard = () => {
  // Demo metrics
  const metrics = [
    {
      name: 'Total Projects',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: BarChart3,
    },
    {
      name: 'Completed Tasks',
      value: '48',
      change: '+12',
      trend: 'up',
      icon: CheckCircle2,
    },
    {
      name: 'In Progress',
      value: '24',
      change: '-4',
      trend: 'down',
      icon: Clock,
    },
    {
      name: 'Overdue',
      value: '3',
      change: '+1',
      trend: 'up',
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Track your projects and team's progress</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2">
            <Users className="w-4 h-4" />
            New Project
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>
      {/* Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.name}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${metric.trend === 'up' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                  <metric.icon className={`w-5 h-5 ${metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {metric.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 dark:text-green-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500 dark:text-red-400" />
                )}
                <span className={`ml-2 text-sm font-medium ${
                  metric.trend === 'up' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {metric.change}
                </span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">from last week</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Activity Log */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Track your team's latest actions</p>
            </div>
            <button className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              View all
            </button>
          </div>
          <ActivityLog showFilters={true} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 