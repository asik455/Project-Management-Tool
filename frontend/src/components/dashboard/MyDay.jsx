import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, StickyNote, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';

const getTodayTasks = (tasks) => {
  const today = dayjs().format('YYYY-MM-DD');
  return tasks.filter((task) => task.dueDate === today);
};

const MyDay = () => {
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
    <div className="space-y-6 bg-background">
      <h1 className="text-2xl font-bold text-foreground">My Day</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="bg-card rounded-lg shadow p-4 col-span-1 md:col-span-2 transition-all border border-border">
          <h2 className="text-lg font-semibold mb-2 flex items-center text-foreground"><CheckCircle2 className="w-5 h-5 mr-2" />Today's Tasks</h2>
          {todayTasks.length > 0 ? (
            <ul className="space-y-2">
              {todayTasks.map((task) => (
                <li key={task.id} className="p-3 rounded-lg bg-muted flex items-center transition hover:scale-[1.01]">
                  <span className="font-medium text-foreground">{task.title}</span>
                  <span className="ml-2 text-xs text-muted">{task.project}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted">No tasks due today.</div>
          )}
        </div>
        {/* Calendar */}
        <div className="bg-card rounded-lg shadow p-4 transition-all border border-border">
          <h2 className="text-lg font-semibold mb-2 flex items-center text-foreground"><CalendarIcon className="w-5 h-5 mr-2" />Calendar</h2>
          <input
            type="date"
            value={calendarDate}
            onChange={(e) => setCalendarDate(e.target.value)}
            className="w-full p-2 rounded border border-border bg-background text-foreground"
          />
          <div className="mt-2 text-sm text-muted">Selected: {dayjs(calendarDate).format('dddd, MMM D, YYYY')}</div>
        </div>
        {/* Quick Notes */}
        <div className="bg-card rounded-lg shadow p-4 transition-all border border-border">
          <h2 className="text-lg font-semibold mb-2 flex items-center text-foreground"><StickyNote className="w-5 h-5 mr-2" />Quick Notes</h2>
          <textarea
            value={quickNotes}
            onChange={(e) => setQuickNotes(e.target.value)}
            placeholder="Jot down your thoughts..."
            className="w-full h-32 p-2 rounded border border-border bg-background text-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default MyDay; 