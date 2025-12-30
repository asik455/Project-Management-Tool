import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Plus, 
  MoreVertical, 
  User,
  Calendar,
  Tag,
  X
} from 'lucide-react';

const getInitialColumns = () => {
  // Load tasks from localStorage
  const savedTasks = localStorage.getItem('tasks');
  let tasks = savedTasks ? JSON.parse(savedTasks) : [];

  // If no tasks exist, create sample tasks for demo
  if (tasks.length === 0) {
    const today = new Date();
    tasks = [
      {
        id: 1,
        title: 'Project Planning',
        description: 'Initial project planning and requirements gathering',
        status: 'done',
        priority: 'high',
        dueDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignee: 'John Doe',
        project: 'Website Redesign',
        tags: ['Planning', 'Strategy']
      },
      {
        id: 2,
        title: 'UI/UX Design',
        description: 'Create wireframes and design mockups',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignee: 'Jane Smith',
        project: 'Website Redesign',
        tags: ['Design', 'UI/UX']
      },
      {
        id: 3,
        title: 'Frontend Development',
        description: 'Implement the frontend components',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignee: 'Mike Johnson',
        project: 'Website Redesign',
        tags: ['Frontend', 'React']
      },
      {
        id: 4,
        title: 'Backend API',
        description: 'Develop REST API endpoints',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignee: 'Sarah Wilson',
        project: 'Mobile App Development',
        tags: ['Backend', 'API']
      },
      {
        id: 5,
        title: 'Database Schema',
        description: 'Design and implement database schema',
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignee: 'Alex Chen',
        project: 'Mobile App Development',
        tags: ['Database', 'Schema']
      }
    ];
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  return [
    {
      id: 'todo',
      title: 'To Do',
      tasks: tasks.filter((t) => t.status === 'todo'),
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: tasks.filter((t) => t.status === 'in-progress'),
    },
    {
      id: 'done',
      title: 'Done',
      tasks: tasks.filter((t) => t.status === 'done'),
    },
  ];
};

const KanbanBoard = () => {
  const [columns, setColumns] = useState(getInitialColumns);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignee: '', dueDate: '', tags: '' });

  // Keep Kanban in sync with tasks in localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      setColumns([
        { id: 'todo', title: 'To Do', tasks: tasks.filter((t) => t.status === 'todo') },
        { id: 'in-progress', title: 'In Progress', tasks: tasks.filter((t) => t.status === 'in-progress') },
        { id: 'done', title: 'Done', tasks: tasks.filter((t) => t.status === 'done') },
      ]);
    }
  }, []);

  const updateTasksInStorage = (allColumns) => {
    // Flatten all tasks and update their status
    const allTasks = allColumns.flatMap((col) =>
      col.tasks.map((task) => ({ ...task, status: col.id }))
    );
    localStorage.setItem('tasks', JSON.stringify(allTasks));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColIdx = columns.findIndex((col) => col.id === source.droppableId);
    const destColIdx = columns.findIndex((col) => col.id === destination.droppableId);
    const sourceTasks = Array.from(columns[sourceColIdx].tasks);
    const destTasks = Array.from(columns[destColIdx].tasks);
    const [moved] = sourceTasks.splice(source.index, 1);
    moved.status = columns[destColIdx].id;
    destTasks.splice(destination.index, 0, moved);

    const newColumns = columns.map((col, idx) => {
      if (idx === sourceColIdx) return { ...col, tasks: sourceTasks };
      if (idx === destColIdx) return { ...col, tasks: destTasks };
      return col;
    });
    setColumns(newColumns);
    updateTasksInStorage(newColumns);
  };

  const handleNewTask = (e) => {
    e.preventDefault();
    const id = Date.now();
    const task = {
      id,
      title: newTask.title,
      description: newTask.description,
      assignee: newTask.assignee,
      dueDate: newTask.dueDate,
      tags: newTask.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'todo',
    };
    const updatedColumns = columns.map(col =>
      col.id === 'todo' ? { ...col, tasks: [task, ...col.tasks] } : col
    );
    setColumns(updatedColumns);
    updateTasksInStorage(updatedColumns);
    setModalOpen(false);
    setNewTask({ title: '', description: '', assignee: '', dueDate: '', tags: '' });
  };

  return (
    <div className="space-y-6 bg-blue-50 min-h-screen p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-red-600 bg-clip-text text-transparent drop-shadow">Kanban Board</h1>
        <button
          className="flex items-center px-6 py-3 text-lg font-bold text-white bg-red-600 rounded-xl shadow hover:bg-red-700 transition-all border-2 border-black"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="w-6 h-6 mr-2" />
          New Task
        </button>
      </div>

      {/* New Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border-t-8 border-blue-600">
            <button className="absolute top-3 right-3 text-black hover:text-red-600" onClick={() => setModalOpen(false)}><X /></button>
            <h2 className="text-2xl font-extrabold mb-6 text-black">Create New Task</h2>
            <form onSubmit={handleNewTask} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-black">Title</label>
                <input className="w-full border-2 border-blue-600 rounded px-3 py-2 text-black" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-black">Description</label>
                <textarea className="w-full border-2 border-blue-600 rounded px-3 py-2 text-black" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-black">Assignee</label>
                <input className="w-full border-2 border-blue-600 rounded px-3 py-2 text-black" value={newTask.assignee} onChange={e => setNewTask({ ...newTask, assignee: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-black">Due Date</label>
                <input type="date" className="w-full border-2 border-blue-600 rounded px-3 py-2 text-black" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-black">Tags (comma separated)</label>
                <input className="w-full border-2 border-blue-600 rounded px-3 py-2 text-black" value={newTask.tags} onChange={e => setNewTask({ ...newTask, tags: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 rounded bg-black text-white font-bold hover:bg-gray-800" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 border-2 border-black">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {columns.map((column) => (
            <div key={column.id} className={`rounded-2xl p-5 shadow-2xl border-t-8 ${column.id === 'todo' ? 'border-blue-700 bg-white' : column.id === 'in-progress' ? 'border-red-600 bg-white' : 'border-black bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-extrabold ${column.id === 'in-progress' ? 'text-red-700' : column.id === 'todo' ? 'text-blue-700' : 'text-black'}`}>{column.title}</h2>
                <span className={`px-4 py-1 text-lg font-bold rounded-full border-2 border-black ${column.id === 'in-progress' ? 'bg-red-100 text-red-700' : column.id === 'todo' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-black'}`}>
                  {column.tasks.length}
                </span>
              </div>
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4 min-h-[40px]"
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-5 rounded-xl shadow border-2 border-black"
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-extrabold text-black">
                                {task.title}
                              </h3>
                              <button className="text-black hover:text-red-600">
                                <MoreVertical className="w-6 h-6" />
                              </button>
                            </div>
                            <p className="mt-1 text-base text-black">
                              {task.description}
                            </p>
                            <div className="mt-4 space-y-3">
                              <div className="flex items-center text-base text-black">
                                <User className="w-5 h-5 mr-1" />
                                {task.assignee}
                              </div>
                              <div className="flex items-center text-base text-black">
                                <Calendar className="w-5 h-5 mr-1" />
                                {task.dueDate}
                              </div>
                              <div className="flex flex-wrap gap-2">
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard; 