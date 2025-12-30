import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, StickyNote, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';

const getTodayTasks = (tasks) => {
  const today = dayjs().format('YYYY-MM-DD');
  return tasks.filter((task) => task.dueDate === today);
};

const MyDayWidget = () => {
  const [tasks, setTasks] = useState([]);
  const [quickNotes, setQuickNotes] = useState(() => localStorage.getItem('quickNotes') || '');
  const [calendarDate, setCalendarDate] = useState(dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    const saved = localStorage.getItem('tasks');
    setTasks(saved ? JSON.parse(saved) : []);
  }, []);

  useEffect(() => {
    localStorage.setItem('quickNotes', quickNotes);
  }, [quickNotes]);

  const todayTasks = getTodayTasks(tasks);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Today's Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
        <h3 className="text-base font-semibold mb-1 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" />Today</h3>
        {todayTasks.length > 0 ? (
          <ul className="space-y-1">
            {todayTasks.map((task) => (
              <li key={task.id} className="text-sm text-gray-900 dark:text-white flex items-center">
                <span className="truncate">{task.title}</span>
                <span className="ml-2 text-xs text-gray-500">{task.project}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-xs text-gray-500">No tasks due today.</div>
        )}
      </div>
      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
        <h3 className="text-base font-semibold mb-1 flex items-center"><CalendarIcon className="w-4 h-4 mr-1" />Calendar</h3>
        <input
          type="date"
          value={calendarDate}
          onChange={(e) => setCalendarDate(e.target.value)}
          className="w-full p-1 rounded border border-gray-300 dark:bg-gray-700 dark:text-white text-xs"
        />
        <div className="mt-1 text-xs text-gray-500">{dayjs(calendarDate).format('MMM D, YYYY')}</div>
      </div>
      {/* Quick Notes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
        <h3 className="text-base font-semibold mb-1 flex items-center"><StickyNote className="w-4 h-4 mr-1" />Quick Notes</h3>
        <textarea
          value={quickNotes}
          onChange={(e) => setQuickNotes(e.target.value)}
          placeholder="Jot down your thoughts..."
          className="w-full h-16 p-1 rounded border border-gray-300 dark:bg-gray-700 dark:text-white text-xs"
        />
      </div>
    </div>
  );
};

export default MyDayWidget; 