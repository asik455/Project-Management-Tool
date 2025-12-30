import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token and log requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  signup: (userData) => api.post('/auth/signup', userData),
  signin: (credentials) => api.post('/auth/signin', credentials),
  updateEmail: (newEmail) => api.put('/auth/update-email', { newEmail }),
  joinTeam: (teamData) => api.post('/teams/join', teamData),
  // Profile endpoints - note the double 'profile' in the path is correct
  // because the routes are mounted at /profile in auth.js and then the routes are defined in profileRoutes.js
  getProfile: () => api.get('/auth/profile/me'),
  updateProfile: (profileData) => api.put('/auth/profile/updatedetails', profileData),
  updatePassword: (currentPassword, newPassword) => 
    api.put('/auth/profile/updatepassword', { currentPassword, newPassword })
};

// Projects API
export const projects = {
  create: async (projectData) => {
    try {
      console.log('Creating project:', projectData);
      const response = await api.post('/projects', projectData);
      console.log('Project created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },
  getAll: async () => {
    try {
      console.log('Fetching all projects...');
      const response = await api.get('/projects');
      console.log('Projects fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      console.log(`Fetching project with id: ${id}`);
      const response = await api.get(`/projects/${id}`);
      console.log('Project fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },
  update: async (id, projectData) => {
    try {
      console.log(`Updating project ${id}:`, projectData);
      const response = await api.put(`/projects/${id}`, projectData);
      console.log('Project updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      console.log(`Deleting project ${id}`);
      const response = await api.delete(`/projects/${id}`);
      console.log('Project deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  },
  addTeamMember: async (projectId, userId) => {
    try {
      console.log(`Adding user ${userId} to project ${projectId}`);
      const response = await api.post(`/projects/${projectId}/team`, { userId });
      console.log('Team member added:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error adding team member to project ${projectId}:`, error);
      throw error;
    }
  },
  removeTeamMember: async (projectId, userId) => {
    try {
      console.log(`Removing user ${userId} from project ${projectId}`);
      const response = await api.delete(`/projects/${projectId}/team/${userId}`);
      console.log('Team member removed:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error removing team member from project ${projectId}:`, error);
      throw error;
    }
  },
};

// Tasks API
export const tasks = {
  create: async (projectId, taskData) => {
    const response = await api.post(`/projects/${projectId}/tasks`, taskData);
    return response.data;
  },
  getAll: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data;
  },
  getById: async (projectId, taskId) => {
    const response = await api.get(`/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },
  update: async (projectId, taskId, taskData) => {
    const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, taskData);
    return response.data;
  },
  delete: async (projectId, taskId) => {
    const response = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },
  updateStatus: async (projectId, taskId, status) => {
    const response = await api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status });
    return response.data;
  },
};

// Teams API
export const teams = {
  create: async (teamData) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },
  getMembers: async (teamId) => {
    const response = await api.get(`/teams/${teamId}/members`);
    return response.data;
  },
  leave: async () => {
    const response = await api.delete('/teams/leave');
    return response.data;
  },
};

export default {
  auth,
  projects,
  tasks,
  teams,
};
