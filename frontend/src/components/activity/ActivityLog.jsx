import { useState } from 'react';
import { useActivityLog } from '../../contexts/ActivityLogContext';
import { 
  Trash2, 
  Filter, 
  X,
  CheckCircle2,
  Edit,
  Plus,
  MessageSquare,
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';

const ActivityLog = ({ entityType, entityId, showFilters = true }) => {
  const { activities, getActivitiesByEntity, getActivitiesByType, clearActivities } = useActivityLog();
  const [filter, setFilter] = useState('all');

  const getFilteredActivities = () => {
    if (entityType && entityId) {
      return getActivitiesByEntity(entityType, entityId);
    }
    if (filter === 'all') {
      return activities;
    }
    return getActivitiesByType(filter);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'create':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'update':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'status_change':
        return <CheckCircle2 className="w-4 h-4 text-yellow-500" />;
      case 'due_date':
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'priority_change':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {showFilters && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>
            <div className="flex items-center space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="all">All Activities</option>
                <option value="create">Created</option>
                <option value="update">Updated</option>
                <option value="delete">Deleted</option>
                <option value="comment">Comments</option>
                <option value="status_change">Status Changes</option>
                <option value="due_date">Due Dates</option>
                <option value="priority_change">Priority Changes</option>
              </select>
              <button
                onClick={clearActivities}
                className="p-1 text-gray-400 hover:text-red-600"
                title="Clear all activities"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {getFilteredActivities().length > 0 ? (
          getFilteredActivities().map((activity) => (
            <div key={activity.id} className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No activities found
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog; 