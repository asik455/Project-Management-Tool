import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  User,
  Tag,
  Edit3,
  X
} from 'lucide-react';

const getInitialTasks = () => {
  const saved = localStorage.getItem('tasks');
  let tasks = saved ? JSON.parse(saved) : [];

  // If no tasks exist, create sample tasks for demo
  if (tasks.length === 0) {
    const today = new Date();
    tasks = [
      {
        id: 1,
        title: 'Project Planning',
        description: 'Initial project planning and requirements gathering',
        status: 'completed',
        priority: 'high',
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignee: 'John Doe',
        project: 'Website Redesign'
      },
      {
        id: 2,
        title: 'UI/UX Design',
        description: 'Create wireframes and design mockups',
        status: 'in-progress',
        priority: 'high',
        startDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignee: 'Jane Smith',
        project: 'Website Redesign'
      },
      {
        id: 3,
        title: 'Frontend Development',
        description: 'Implement the frontend components',
        status: 'todo',
        priority: 'medium',
        startDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignee: 'Mike Johnson',
        project: 'Website Redesign'
      },
      {
        id: 4,
        title: 'Backend API',
        description: 'Develop REST API endpoints',
        status: 'todo',
        priority: 'high',
        startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignee: 'Sarah Wilson',
        project: 'Mobile App Development'
      }
    ];
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // Convert tasks to have startDate and endDate for Gantt chart
  return tasks.map(task => {
    if (!task.startDate && task.dueDate) {
      // If no startDate, set it to 3 days before dueDate
      const dueDate = new Date(task.dueDate);
      const startDate = new Date(dueDate);
      startDate.setDate(dueDate.getDate() - 3);

      return {
        ...task,
        startDate: startDate.toISOString().split('T')[0],
        endDate: task.dueDate
      };
    }
    return task;
  });
};

const Tooltip = ({ children, content }) => (
  <div className="relative group">
    {children}
    <div className="absolute z-50 left-1/2 -translate-x-1/2 -top-12 opacity-0 group-hover:opacity-100 pointer-events-none transition bg-gray-900 text-white text-xs rounded px-3 py-2 shadow-lg whitespace-nowrap">
      {content}
    </div>
  </div>
);

const EditTaskModal = ({ open, onClose, task, onSave }) => {
  const [form, setForm] = useState(task || {});
  useEffect(() => { setForm(task || {}); }, [task]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={onClose}><X /></button>
        <h2 className="text-xl font-bold mb-4 flex items-center"><Edit3 className="w-5 h-5 mr-2 text-blue-500" /> Edit Task</h2>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input className="w-full border rounded px-3 py-2" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assignee</label>
            <input className="w-full border rounded px-3 py-2" value={form.assignee || ''} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" className="w-full border rounded px-3 py-2" value={form.startDate || ''} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" className="w-full border rounded px-3 py-2" value={form.endDate || ''} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <input className="w-full border rounded px-3 py-2" value={form.tags ? form.tags.join(', ') : ''} onChange={e => setForm(f => ({ ...f, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GanttChart = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState(getInitialTasks);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragStartDay, setDragStartDay] = useState(null);
  const [dragType, setDragType] = useState(null); // 'start' or 'end'
  const [editTask, setEditTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const getTaskPosition = (task) => {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const duration = endDay - startDay + 1;
    return {
      left: `${(startDay + firstDay - 1) * 40}px`,
      width: `${duration * 40}px`,
    };
  };

  // Drag-to-reschedule logic
  const handleBarMouseDown = (task, day, type) => {
    setDraggedTask(task);
    setDragStartDay(day);
    setDragType(type);
    document.body.style.userSelect = 'none';
  };

  const handleBarMouseUp = () => {
    setDraggedTask(null);
    setDragStartDay(null);
    setDragType(null);
    document.body.style.userSelect = '';
  };

  const handleBarMouseMove = (e) => {
    if (!draggedTask || dragStartDay == null || !dragType) return;
    const rect = document.getElementById('gantt-calendar').getBoundingClientRect();
    const x = e.clientX - rect.left;
    const day = Math.round(x / 40) - getFirstDayOfMonth(currentDate) + 1;
    const daysInMonth = getDaysInMonth(currentDate);
    console.log('mousemove', { draggedTask, dragType, day, x });
    if (day < 1 || day > daysInMonth) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== draggedTask.id) return t;
        let start = new Date(t.startDate);
        let end = new Date(t.endDate);
        const oldStart = t.startDate;
        const oldEnd = t.endDate;
        if (dragType === 'start') {
          if (day > end.getDate()) return t;
          start.setDate(day);
        } else {
          if (day < start.getDate()) return t;
          end.setDate(day);
        }
        if (start > end) return t;
        if (start.getMonth() !== currentDate.getMonth() || end.getMonth() !== currentDate.getMonth()) return t;
        if (!isValidDate(start) || !isValidDate(end)) return t;
        const newStart = start.toISOString().slice(0, 10);
        const newEnd = end.toISOString().slice(0, 10);
        console.log('update', { oldStart, oldEnd, newStart, newEnd });
        return {
          ...t,
          startDate: newStart,
          endDate: newEnd,
        };
      })
    );
  };

  useEffect(() => {
    if (draggedTask) {
      window.addEventListener('mousemove', handleBarMouseMove);
      window.addEventListener('mouseup', handleBarMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleBarMouseMove);
        window.removeEventListener('mouseup', handleBarMouseUp);
      };
    }
  });

  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleBarClick = (task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleModalSave = (updatedTask) => {
    setTasks(tasks => tasks.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
    setModalOpen(false);
  };

  function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="highlighted-heading">Gantt Chart</h1>
        <div className="flex items-center space-x-2">
          <button className="p-3 text-white bg-blue-600 rounded-full border-2 border-black hover:bg-blue-700 transition-all" onClick={prevMonth}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold text-black">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button className="p-3 text-white bg-red-600 rounded-full border-2 border-black hover:bg-red-700 transition-all" onClick={nextMonth}>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl border-2 border-black overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Calendar Header */}
            <div id="gantt-calendar" className="flex border-b border-blue-200">
              <div className="w-64 flex-shrink-0 p-4 border-r border-blue-200 bg-blue-50">
                <span className="text-lg font-extrabold text-blue-700">Task</span>
              </div>
              <div className="flex">
                {generateCalendarDays().map((day, index) => (
                  <div
                    key={index}
                    className="w-10 flex-shrink-0 p-2 text-center border-r border-blue-200 bg-blue-50 text-black font-bold"
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-blue-200">
              {tasks.map((task) => (
                <div key={task.id} className="flex">
                  <div className="w-64 flex-shrink-0 p-4 border-r border-blue-200 bg-blue-50">
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold bg-gradient-to-r from-blue-700 to-red-600 bg-clip-text text-transparent drop-shadow-2xl outline outline-2 outline-blue-700 outline-offset-2">
                        {task.title}
                      </h3>
                      <div className="flex items-center text-base text-black">
                        <User className="w-5 h-5 mr-1" />
                        {task.assignee}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {task.tags && task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-3 py-1 rounded text-sm font-bold bg-blue-100 text-blue-700 border border-blue-700"
                          >
                            <Tag className="w-4 h-4 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <Tooltip content={<div>
                      <div className='font-semibold'>{task.title}</div>
                      <div>Assignee: {task.assignee}</div>
                      <div>Start: {task.startDate}</div>
                      <div>End: {task.endDate}</div>
                      <div>Tags: {task.tags && task.tags.join(', ')}</div>
                    </div>}>
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-8 rounded bg-blue-100 border border-blue-200 group"
                        style={getTaskPosition(task)}
                      >
                        {/* Left drag handle for start date */}
                        <div
                          className="absolute left-0 top-0 h-full w-4 bg-blue-700 rounded-l cursor-ew-resize z-10 transition hover:bg-blue-900"
                          onMouseDown={(e) => { e.stopPropagation(); console.log('Drag start handle'); handleBarMouseDown(task, new Date(task.startDate).getDate(), 'start'); }}
                          title="Drag start date"
                        />
                        {/* Main bar for editing */}
                        <div
                          className="h-full bg-blue-500 rounded cursor-pointer mx-2"
                          style={{ width: 'calc(100% - 16px)' }}
                          onClick={() => handleBarClick(task)}
                          title="Click to edit task"
                        />
                        {/* Right drag handle for end date */}
                        <div
                          className="absolute right-0 top-0 h-full w-4 bg-blue-700 rounded-r cursor-ew-resize z-10 transition hover:bg-blue-900"
                          onMouseDown={(e) => { e.stopPropagation(); console.log('Drag end handle'); handleBarMouseDown(task, new Date(task.endDate).getDate(), 'end'); }}
                          title="Drag end date"
                        />
                      </div>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <EditTaskModal open={modalOpen} onClose={() => setModalOpen(false)} task={editTask} onSave={handleModalSave} />
    </div>
  );
};

export default GanttChart; 