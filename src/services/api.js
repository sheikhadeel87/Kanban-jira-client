import axios from 'axios';

// Get API base URL and ensure it ends with /api (but not /api/api)
let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

// Normalize the URL: remove trailing slashes and ensure it ends with /api (but not /api/api)
if (API_BASE_URL) {
  // Remove trailing slashes
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, '');
  
  // If it doesn't end with /api, add it
  // But if it ends with /api/api, remove one /api
  if (API_BASE_URL.endsWith('/api/api')) {
    API_BASE_URL = API_BASE_URL.replace(/\/api\/api$/, '/api');
  } else if (!API_BASE_URL.endsWith('/api')) {
    API_BASE_URL = API_BASE_URL + '/api';
  }
}

// API Base URL configured

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Organization API
export const organizationAPI = {
  create: (data) => api.post('/organizations', data),
  getMy: () => api.get('/organizations/me'),
  getUsers: () => api.get('/organizations/users'),
  invite: (email) => api.post('/organizations/invite', { email }),
  delete: (id) => api.delete(`/organizations/${id}`),
};

// Project API (renamed from workspace)
export const projectAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  assign: (id, userId) => api.post(`/projects/${id}/assign`, { userId }),
  addMember: (id, userId) => api.post(`/projects/${id}/members`, { userId }),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
  updateMemberRole: (id, userId, role) => api.put(`/projects/${id}/members/${userId}/role`, { role }),
};

// Board API
export const boardAPI = {
  getAll: () => api.get('/boards'),
  getByProject: (projectId) => api.get(`/boards/project/${projectId}`),
  getById: (id) => api.get(`/boards/${id}`),
  create: (data) => api.post('/boards', data),
  update: (id, data) => api.put(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
  sendInvite: (boardId, userId) => api.post(`/boards/${boardId}/invite`, { userId }),
};

// Task API
export const taskAPI = {
  getByBoard: (boardId) => api.get(`/tasks/board/${boardId}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        if (key === 'attachment' && data[key] instanceof File) {
          formData.append(key, data[key]);
        } else if (key === 'assignedTo' && Array.isArray(data[key])) {
          // Handle array of user IDs
          data[key].forEach((userId) => {
            formData.append('assignedTo[]', userId);
          });
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    return api.post('/tasks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        if (key === 'attachment' && data[key] instanceof File) {
          formData.append(key, data[key]);
        } else if (key === 'assignedTo' && Array.isArray(data[key])) {
          // Handle array of user IDs
          data[key].forEach((userId) => {
            formData.append('assignedTo[]', userId);
          });
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    return api.put(`/tasks/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// Team API
export const teamAPI = {
  getMyMembers: () => api.get('/teams/members'), // Get team members for current user (from Team table with inviting_id)
  create: (data) => api.post('/teams', data),
  getByBoard: (boardId) => api.get(`/teams/board/${boardId}`),
  addMember: (teamId, userId) => api.post(`/teams/${teamId}/add`, { userId }),
  removeMember: (teamId, userId) => api.delete(`/teams/${teamId}/remove/${userId}`),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  sendInvite: (data) => api.post('/users/invite', data),
};

export const commentAPI = {
  getByTask: (taskId) => api.get(`/comments/task/${taskId}`),
  create: (taskId, text) => api.post(`/comments/task/${taskId}`, { text }),
  update: (commentId, text) => api.put(`/comments/${commentId}`, { text }),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
};

export default api;

