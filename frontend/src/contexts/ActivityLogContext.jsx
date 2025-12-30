import { createContext, useContext, useState, useEffect } from 'react';

const ActivityLogContext = createContext();

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error('useActivityLog must be used within an ActivityLogProvider');
  }
  return context;
};

export const ActivityLogProvider = ({ children }) => {
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('activities');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);

  const addActivity = (activity) => {
    const newActivity = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...activity,
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const clearActivities = () => {
    setActivities([]);
  };

  const getActivitiesByType = (type) => {
    return activities.filter(activity => activity.type === type);
  };

  const getActivitiesByEntity = (entityType, entityId) => {
    return activities.filter(
      activity => activity.entityType === entityType && activity.entityId === entityId
    );
  };

  return (
    <ActivityLogContext.Provider
      value={{
        activities,
        addActivity,
        clearActivities,
        getActivitiesByType,
        getActivitiesByEntity,
      }}
    >
      {children}
    </ActivityLogContext.Provider>
  );
}; 