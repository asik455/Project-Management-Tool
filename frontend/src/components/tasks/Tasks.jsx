import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Calendar, 
  User,
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  Mail,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useActivityLog } from '../../contexts/ActivityLogContext';
import { useTemplate } from '../../contexts/TemplateContext';
import SessionTracker from '../session/SessionTracker';
import PrivateNotes from '../notes/PrivateNotes';
import TaskTemplates from '../templates/TaskTemplates';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useUser } from '../../contexts/UserContext';

const initialTasks = [
  {
    id: 1,
    title: 'Design System Implementation',
    description: 'Create and implement a comprehensive design system',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2024-05-20',
    assignee: 'John Doe',
    project: 'Website Redesign',
    tags: ['Design', 'Frontend'],
  },
  {
    id: 2,
    title: 'API Integration',
    description: 'Integrate third-party APIs for payment processing',
    status: 'todo',
    priority: 'medium',
    dueDate: '2024-05-25',
    assignee: 'Jane Smith',
    project: 'Mobile App Development',
    tags: ['Backend', 'API'],
  },
  {
    id: 3,
    title: 'User Authentication',
    description: 'Implement secure user authentication system',
    status: 'done',
    priority: 'high',
    dueDate: '2024-05-15',
    assignee: 'Mike Johnson',
    project: 'API Integration',
    tags: ['Security', 'Backend'],
  },
];

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];
const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// Helper for comments persistence
const getInitialComments = () => {
  const saved = localStorage.getItem('comments');
  return saved ? JSON.parse(saved) : {};
};

const Tasks = () => {
  const { addNotification } = useNotifications();
  const { addActivity } = useActivityLog();
  const { getTemplatesByProject } = useTemplate();
  const { user } = useUser();
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'low',
    dueDate: '',
    assignee: '',
    project: '',
    tags: '', // comma separated for input
  });
  const [comments, setComments] = useState(getInitialComments);
  const [commentForm, setCommentForm] = useState({ text: '', parentId: null });
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderTask, setReminderTask] = useState(null);
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderSuccess, setReminderSuccess] = useState(false);
  const [exportToast, setExportToast] = useState('');
  const fileInputRef = useRef();
  const [file, setFile] = useState(null);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('comments', JSON.stringify(comments));
  }, [comments]);

  const openAddModal = () => {
    setEditTask(null);
    setForm({
      title: '',
      description: '',
      status: 'todo',
      priority: 'low',
      dueDate: '',
      assignee: '',
      project: '',
      tags: '',
    });
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setForm({
      ...task,
      tags: task.tags ? task.tags.join(', ') : '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTask(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile({
        name: f.name,
        type: f.type,
        url: URL.createObjectURL(f),
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean), file };
    if (editTask) {
      setTasks((prev) => prev.map((t) => (t.id === editTask.id ? { ...newTask, id: editTask.id } : t)));
      addNotification({
        type: 'project_update',
        projectName: newTask.project,
        message: `Task "${newTask.title}" was updated`,
      });
      addActivity({
        type: 'update',
        entityType: 'task',
        entityId: editTask.id,
        message: `Task "${newTask.title}" was updated`,
      });
    } else {
      const taskId = Date.now();
      setTasks((prev) => [...prev, { ...newTask, id: taskId }]);
      addNotification({
        type: 'task_assigned',
        taskTitle: newTask.title,
        message: `New task "${newTask.title}" was created`,
      });
      addActivity({
        type: 'create',
        entityType: 'task',
        entityId: taskId,
        message: `New task "${newTask.title}" was created`,
      });
    }
    setFile(null);
    closeModal();
  };

  const handleDelete = (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (taskToDelete) {
      addNotification({
        type: 'project_update',
        projectName: taskToDelete.project,
        message: `Task "${taskToDelete.title}" was deleted`,
      });
      addActivity({
        type: 'delete',
        entityType: 'task',
        entityId: id,
        message: `Task "${taskToDelete.title}" was deleted`,
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'high':
        return 'bg-red-100 text-red-700';
      default:
        return '';
    }
  };

  // Comments logic
  const openComments = (taskId) => {
    setActiveTaskId(taskId);
    setCommentForm({ text: '', parentId: null });
  };
  const closeComments = () => setActiveTaskId(null);

  const handleCommentChange = (e) => {
    setCommentForm((prev) => ({ ...prev, text: e.target.value }));
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentForm.text.trim()) return;
    const newComment = {
      id: Date.now(),
      text: commentForm.text,
      parentId: commentForm.parentId,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setComments((prev) => {
      const taskComments = prev[activeTaskId] || [];
      if (commentForm.parentId) {
        // Add as reply
        const addReply = (commentsArr) =>
          commentsArr.map((c) =>
            c.id === commentForm.parentId
              ? { ...c, replies: [...(c.replies || []), newComment] }
              : { ...c, replies: c.replies ? addReply(c.replies) : [] }
          );
        return {
          ...prev,
          [activeTaskId]: addReply(taskComments),
        };
      } else {
        // Add as root comment
        return {
          ...prev,
          [activeTaskId]: [...taskComments, newComment],
        };
      }
    });

    // Add notification and activity for new comment
    const task = tasks.find(t => t.id === activeTaskId);
    if (task) {
      addNotification({
        type: 'comment',
        taskTitle: task.title,
        user: 'You',
        message: `New comment on "${task.title}"`,
      });
      addActivity({
        type: 'comment',
        entityType: 'task',
        entityId: activeTaskId,
        message: `New comment on "${task.title}"`,
      });
    }

    setCommentForm({ text: '', parentId: null });
  };

  const renderComments = (commentsArr, parentId = null) => (
    <div className={parentId ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}>
      {commentsArr.map((c) => (
        <div key={c.id} className="mb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-800">{c.text}</span>
            <button
              className="text-xs text-blue-500 ml-2"
              onClick={() => setCommentForm((prev) => ({ ...prev, parentId: c.id }))}
            >
              Reply
            </button>
          </div>
          {c.replies && c.replies.length > 0 && renderComments(c.replies, c.id)}
        </div>
      ))}
    </div>
  );

  const handleUseTemplate = (template) => {
    setForm({
      title: template.name,
      description: template.description,
      status: 'todo',
      priority: template.priority,
      dueDate: '',
      assignee: '',
      project: selectedProject,
      tags: '',
    });
    setShowModal(true);
    setShowTemplates(false);
  };

  const openReminderModal = (task) => {
    setReminderTask(task);
    setShowReminderModal(true);
    setReminderEmail('');
    setReminderTime('');
    setReminderSuccess(false);
  };

  const closeReminderModal = () => {
    setShowReminderModal(false);
    setReminderTask(null);
    setReminderEmail('');
    setReminderTime('');
    setReminderSuccess(false);
  };

  const handleSendReminder = (e) => {
    e.preventDefault();
    // Mock sending email (replace with backend API call)
    setReminderSuccess(true);
    setTimeout(() => {
      closeReminderModal();
    }, 1500);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [[
        'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Assignee', 'Project', 'Tags'
      ]],
      body: tasks.map(task => [
        task.title,
        task.description,
        task.status,
        task.priority,
        task.dueDate,
        task.assignee,
        task.project,
        (task.tags || []).join(', ')
      ]),
    });
    doc.save('tasks.pdf');
    setExportToast('Tasks exported as PDF!');
    setTimeout(() => setExportToast(''), 2000);
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tasks.map(task => ({
      Title: task.title,
      Description: task.description,
      Status: task.status,
      Priority: task.priority,
      'Due Date': task.dueDate,
      Assignee: task.assignee,
      Project: task.project,
      Tags: (task.tags || []).join(', '),
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
    XLSX.writeFile(workbook, 'tasks.xlsx');
    setExportToast('Tasks exported as Excel!');
    setTimeout(() => setExportToast(''), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-red-600 bg-clip-text text-transparent drop-shadow-2xl">Tasks</h1>
        {(user.role === 'admin' || user.role === 'manager') && (
          <button
            className="flex items-center px-6 py-3 text-lg font-semibold text-white bg-red-600 rounded-xl shadow hover:bg-red-700 transition-all border border-red-600"
            onClick={openAddModal}
          >
            <Plus className="w-6 h-6 mr-2" />
            New Task
          </button>
        )}
      </div>
      {/* Export Buttons */}
      <div className="flex space-x-4 mb-8">
        <button className="flex items-center px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-xl shadow hover:bg-blue-700 transition-all border border-blue-600" onClick={handleExportPDF}>
          <FileText className="w-6 h-6 mr-2" /> Export PDF
        </button>
        <button className="flex items-center px-6 py-3 text-lg font-semibold text-white bg-red-600 rounded-xl shadow hover:bg-red-700 transition-all border border-red-600" onClick={handleExportExcel}>
          <FileSpreadsheet className="w-6 h-6 mr-2" /> Export Excel
        </button>
      </div>
      {/* Task Cards */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-xl shadow border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{task.title}</h2>
              <button className="text-black hover:text-red-600">
                <MoreVertical className="w-6 h-6" />
              </button>
            </div>
            <p className="text-base text-gray-700 mb-2">{task.description}</p>
            <div className="flex items-center space-x-4 mb-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">{task.status}</span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">{task.priority}</span>
            </div>
            <div className="flex items-center space-x-4 mb-2">
              <span className="flex items-center text-base text-gray-700"><Calendar className="w-5 h-5 mr-1 text-gray-400" /> {task.dueDate}</span>
              <span className="flex items-center text-base text-gray-700"><User className="w-5 h-5 mr-1 text-gray-400" /> {task.assignee}</span>
            </div>
            <div className="flex items-center space-x-4 mb-2">
              <span className="flex items-center text-base text-gray-700"><Tag className="w-5 h-5 mr-1 text-gray-400" /> {task.tags && task.tags.join(', ')}</span>
            </div>
            {task.file && (
              <div className="mt-2">
                <a href={task.file.url} download={task.file.name} className="text-blue-600 underline text-xs">{task.file.name}</a>
              </div>
            )}
            <div className="flex space-x-2 mt-4">
              {(user.role === 'admin' || user.role === 'manager') && (
                <button className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 border border-blue-600" onClick={() => openEditModal(task)}>Edit</button>
              )}
              {(user.role === 'admin' || user.role === 'manager') && (
                <button className="px-4 py-2 rounded bg-gray-800 text-white font-semibold hover:bg-gray-900 border border-gray-800" onClick={() => handleDelete(task.id)}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Session Tracker */}
      <SessionTracker />

      {/* Private Notes */}
      {activeTaskId && (
        <PrivateNotes entityType="task" entityId={activeTaskId} />
      )}

      {/* Task Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowTemplates(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Select Task Template</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Select a project</option>
                {Array.from(new Set(tasks.map(task => task.project))).map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>
            <TaskTemplates projectId={selectedProject} onUseTemplate={handleUseTemplate} />
          </div>
        </div>
      )}

      {/* Email Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 animate-fade-in">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={closeReminderModal}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4 flex items-center"><Mail className="w-5 h-5 mr-2" />Set Email Reminder</h2>
            {reminderSuccess ? (
              <div className="text-green-600 text-center font-medium py-8">Reminder scheduled! (Mocked)</div>
            ) : (
              <form onSubmit={handleSendReminder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Task</label>
                  <div className="mt-1 text-gray-900 font-medium">{reminderTask?.title}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={reminderEmail}
                    onChange={(e) => setReminderEmail(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reminder Time</label>
                  <input
                    type="datetime-local"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Schedule Reminder
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Task */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={closeModal}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">{editTask ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  >
                    {priorityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Assignee</label>
                  <input
                    type="text"
                    name="assignee"
                    value={form.assignee}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Project</label>
                  <input
                    type="text"
                    name="project"
                    value={form.project}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={form.tags}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Attachment</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                {file && (
                  <div className="mt-2 flex items-center space-x-2">
                    <a href={file.url} download={file.name} className="text-blue-600 underline text-sm">{file.name}</a>
                    <button type="button" className="text-xs text-red-500" onClick={() => setFile(null)}>Remove</button>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editTask ? 'Update Task' : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Comments Modal */}
      {activeTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={closeComments}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Comments</h2>
            <form onSubmit={handleCommentSubmit} className="flex mb-4">
              <input
                type="text"
                value={commentForm.text}
                onChange={handleCommentChange}
                placeholder={commentForm.parentId ? 'Reply...' : 'Add a comment...'}
                className="flex-1 border border-gray-300 rounded-l-md p-2"
                required
              />
              <button
                type="submit"
                className="px-4 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                Post
              </button>
            </form>
            <div className="max-h-64 overflow-y-auto">
              {comments[activeTaskId] && comments[activeTaskId].length > 0 ? (
                renderComments(comments[activeTaskId])
              ) : (
                <div className="text-gray-500 text-sm">No comments yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks; 