import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Calendar, FileText, FileSpreadsheet } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useActivityLog } from '../../contexts/ActivityLogContext';
import authFetch from '../../utils/authFetch';
import { useUser } from '../../contexts/UserContext';
import { projects } from '../../services/api';

const statusOptions = [
  { value: 'on-track', label: 'On Track' },
  { value: 'at-risk', label: 'At Risk' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'completed', label: 'Completed' }
];

const Projects = () => {
  const { addNotification } = useNotifications();
  const { addActivity } = useActivityLog();
  const { user } = useUser();
  const [projectList, setProjectList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'on-track',
    progress: '0',
    dueDate: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [exportToast, setExportToast] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchProjects = async () => {
      try {
        setError(null);
        setIsLoading(true);
        console.log('Fetching projects...');
        const data = await projects.getAll();
        console.log('Projects data:', data);
        
        if (isMounted) {
          setProjectList(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load projects');
          addNotification({
            type: 'error',
            message: err.response?.data?.message || 'Failed to load projects from server'
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchProjects();
    
    return () => {
      isMounted = false;
    };
  }, [addNotification]);

  const openAddModal = () => {
    setEditProject(null);
    setForm({
      name: '',
      description: '',
      status: 'on-track',
      progress: '0',
      dueDate: ''
    });
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setEditProject(project);
    setForm({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'on-track',
      progress: project.progress?.toString() || '0',
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditProject(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Basic validation
      if (!form.name.trim()) {
        throw new Error('Project name is required');
      }

      if (!form.dueDate) {
        throw new Error('Due date is required');
      }

      setIsLoading(true);
      
      const projectData = { 
        name: form.name.trim(),
        description: form.description.trim(),
        dueDate: new Date(form.dueDate).toISOString(),
        status: form.status || 'on-track',
        progress: Number(form.progress) || 0
      };

      if (editProject) {
        // Update existing project
        const updatedProject = await projects.update(editProject._id, projectData);
        
        setProjectList(prevProjects => 
          prevProjects.map(p => p._id === editProject._id ? updatedProject : p)
        );
        
        addNotification({
          type: 'success',
          message: 'Project updated successfully!'
        });
        
        addActivity({
          action: 'updated',
          entity: 'project',
          entityId: updatedProject._id,
          entityName: updatedProject.name,
          timestamp: new Date().toISOString(),
          user: user?.name || 'System'
        });
      } else {
        // Create new project
        const newProject = await projects.create(projectData);
        
        setProjectList(prevProjects => [...prevProjects, newProject]);
        
        addNotification({
          type: 'success',
          message: 'Project created successfully!'
        });
        
        addActivity({
          action: 'created',
          entity: 'project',
          entityId: newProject._id,
          entityName: newProject.name,
          timestamp: new Date().toISOString(),
          user: user?.name || 'System'
        });
      }
      
      // Reset form and close modal on success
      setForm({
        name: '',
        description: '',
        status: 'on-track',
        progress: '0',
        dueDate: ''
      });
      setShowModal(false);
      setEditProject(null);

    } catch (error) {
      console.error('Error saving project:', error);
      
      let errorMessage = 'Failed to save project';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addNotification({
        type: 'error',
        message: errorMessage
      });
      
      // Re-throw the error so it can be caught by error boundaries if needed
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      console.error('No project ID provided for deletion');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get the project before deleting it for the activity log
      const projectToDelete = projectList.find(p => (p._id || p.id) === id);
      if (!projectToDelete) {
        throw new Error('Project not found');
      }
      
      // Delete the project
      await projects.delete(id);
      
      // Update the UI
      setProjectList(prevProjects => 
        prevProjects.filter(p => (p._id || p.id) !== id)
      );
      
      // Show success notification
      addNotification({
        type: 'success',
        message: `Project "${projectToDelete.name}" was deleted`,
      });
      
      // Log the activity
      addActivity({
        type: 'delete',
        entityType: 'project',
        entityId: id,
        message: `Project "${projectToDelete.name}" was deleted`,
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      addNotification({
        type: 'error',
        message: 'Failed to delete project',
      });
    }
  };

  const handleExportPDF = () => {
    // Simple implementation - in a real app, you would use a library like jspdf
    setExportToast('Export to PDF would be implemented here');
    setTimeout(() => setExportToast(''), 2000);
  };

  const handleExportExcel = () => {
    // Simple implementation - in a real app, you would use a library like xlsx
    setExportToast('Export to Excel would be implemented here');
    setTimeout(() => setExportToast(''), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-red-600 bg-clip-text text-transparent drop-shadow-2xl">
          Projects
        </h1>
        <button
          className="flex items-center px-6 py-3 text-lg font-semibold text-white bg-red-600 rounded-xl shadow hover:bg-red-700 transition-all border border-red-600"
          onClick={openAddModal}
        >
          <Plus className="w-6 h-6 mr-2" />
          New Project
        </button>
      </div>

      {exportToast && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
          {exportToast}
        </div>
      )}

      <div className="flex space-x-4 mb-8">
        <button 
          className="flex items-center px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-xl shadow hover:bg-blue-700 transition-all border border-blue-600"
          onClick={handleExportPDF}
        >
          <FileText className="w-6 h-6 mr-2" /> Export PDF
        </button>
        <button 
          className="flex items-center px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-xl shadow hover:bg-green-700 transition-all border border-green-600"
          onClick={handleExportExcel}
        >
          <FileSpreadsheet className="w-6 h-6 mr-2" /> Export Excel
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 w-full">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : projectList.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              New Project
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectList.map((project) => {
            const dueDate = project.dueDate ? new Date(project.dueDate) : null;
            const isOverdue = dueDate && dueDate < new Date() && project.status !== 'completed';
            const progress = project.progress || 0;

            return (
              <div key={project._id || project.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                      {project.status?.replace('-', ' ') || 'No Status'}
                    </span>
                  </div>

                  <p className="mt-2 text-gray-600">
                    {project.description || 'No description provided.'}
                  </p>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          progress < 30 ? 'bg-red-500' :
                          progress < 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        {dueDate ? dueDate.toLocaleDateString() : 'No due date'}
                        {isOverdue && ' (Overdue)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                  <button
                    onClick={() => openEditModal(project)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project._id || project.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
            <div className="p-6 pb-0">
              <h2 className="text-2xl font-bold mb-2">
                {editProject ? 'Edit Project' : 'Create New Project'}
              </h2>
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <span className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600">
                    Project Details
                  </span>
                </nav>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows="3"
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Progress
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          name="progress"
                          min="0"
                          max="100"
                          value={form.progress}
                          onChange={(e) => setForm({ ...form, progress: e.target.value })}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-medium w-12 text-right">
                          {form.progress}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
