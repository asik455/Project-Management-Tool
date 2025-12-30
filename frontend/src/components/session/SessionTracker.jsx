import { useState, useEffect } from 'react';
import { Play, Pause, StopCircle, Clock, Calendar } from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const SessionTracker = ({ projectId, taskId }) => {
  const {
    currentSession,
    activeTime,
    isTracking,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    getSessionStats,
  } = useSession();

  const [showStats, setShowStats] = useState(false);
  const stats = getSessionStats();

  const handleStart = () => {
    startSession(projectId, taskId);
  };

  const handlePause = () => {
    if (isTracking) {
      pauseSession();
    } else {
      resumeSession();
    }
  };

  const handleStop = () => {
    endSession();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Session Tracker</h3>
        <button
          onClick={() => setShowStats(!showStats)}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>

      {currentSession ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-2xl font-mono">{formatTime(activeTime)}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handlePause}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isTracking ? (
                  <Pause className="w-5 h-5 text-gray-500" />
                ) : (
                  <Play className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
                onClick={handleStop}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <StopCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Started: {formatDate(currentSession.startTime)}
          </div>
        </div>
      ) : (
        <button
          onClick={handleStart}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Session
        </button>
      )}

      {showStats && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium mb-2">Session Statistics</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Time</span>
              <span className="font-medium">{formatTime(stats.totalTime)}</span>
            </div>
            {projectId && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Project Time</span>
                <span className="font-medium">
                  {formatTime(stats.projectStats[projectId] || 0)}
                </span>
              </div>
            )}
            {taskId && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Task Time</span>
                <span className="font-medium">
                  {formatTime(stats.taskStats[taskId] || 0)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionTracker; 