import { createContext, useContext, useState, useEffect, useRef } from 'react';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [isTracking, setIsTracking] = useState(false);
  const [activeTime, setActiveTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (isTracking && currentSession) {
      timerRef.current = setInterval(() => {
        setActiveTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTracking, currentSession]);

  const startSession = (projectId, taskId) => {
    if (isTracking) return;
    const session = {
      id: Date.now(),
      projectId: projectId || null,
      taskId: taskId || null,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      paused: false,
      pauses: [],
    };
    setCurrentSession(session);
    setActiveTime(0);
    setIsTracking(true);
  };

  const pauseSession = () => {
    if (!isTracking || !currentSession) return;
    setIsTracking(false);
    setCurrentSession((prev) => ({
      ...prev,
      pauses: [...(prev.pauses || []), { time: new Date().toISOString(), type: 'pause' }],
    }));
  };

  const resumeSession = () => {
    if (isTracking || !currentSession) return;
    setIsTracking(true);
    setCurrentSession((prev) => ({
      ...prev,
      pauses: [...(prev.pauses || []), { time: new Date().toISOString(), type: 'resume' }],
    }));
  };

  const endSession = () => {
    if (!currentSession) return;
    const endedSession = {
      ...currentSession,
      endTime: new Date().toISOString(),
      duration: activeTime,
    };
    setSessions((prev) => [endedSession, ...prev]);
    setCurrentSession(null);
    setActiveTime(0);
    setIsTracking(false);
  };

  const getSessionStats = () => {
    let totalTime = 0;
    const projectStats = {};
    const taskStats = {};
    sessions.forEach((session) => {
      totalTime += session.duration;
      if (session.projectId) {
        projectStats[session.projectId] = (projectStats[session.projectId] || 0) + session.duration;
      }
      if (session.taskId) {
        taskStats[session.taskId] = (taskStats[session.taskId] || 0) + session.duration;
      }
    });
    if (currentSession && isTracking) {
      totalTime += activeTime;
      if (currentSession.projectId) {
        projectStats[currentSession.projectId] = (projectStats[currentSession.projectId] || 0) + activeTime;
      }
      if (currentSession.taskId) {
        taskStats[currentSession.taskId] = (taskStats[currentSession.taskId] || 0) + activeTime;
      }
    }
    return { totalTime, projectStats, taskStats };
  };

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        sessions,
        isTracking,
        activeTime,
        startSession,
        pauseSession,
        resumeSession,
        endSession,
        getSessionStats,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}; 