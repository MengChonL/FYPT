<<<<<<< HEAD
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses — auto logout on token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('admin_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// ===== Auth =====
export const adminLogin = (username, password) =>
  axios.post(`${API_BASE}/admin/login`, { username, password });

// ===== Health =====
export const checkHealth = () => api.get('/health');

// ===== Users =====
export const getUsers = () => api.get('/admin/users');
export const searchUsers = (query) => api.get('/admin/users/search', { params: { q: query } });
export const getUserProgress = (userId) => api.get(`/admin/users/${userId}/progress`);
export const getUserAttempts = (userId) => api.get(`/admin/users/${userId}/attempts`);
export const getUserReport = (userId) => api.get(`/admin/users/${userId}/report`);
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);

// ===== Reports =====
export const getAllReports = () => api.get('/admin/reports');

// ===== Scenarios =====
export const getScenarios = () => api.get('/scenarios');
export const getScenario = (code) => api.get(`/scenarios/${code}`);
export const getScenarioTypes = () => api.get('/scenario-types');
export const getPhases = () => api.get('/phases');
export const createScenario = (data) => api.post('/admin/scenarios', data);

=======
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses — auto logout on token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('admin_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// ===== Auth =====
export const adminLogin = (username, password) =>
  axios.post(`${API_BASE}/admin/login`, { username, password });

// ===== Health =====
export const checkHealth = () => api.get('/health');

// ===== Users =====
export const getUsers = () => api.get('/admin/users');
export const searchUsers = (query) => api.get('/admin/users/search', { params: { q: query } });
export const getUserProgress = (userId) => api.get(`/admin/users/${userId}/progress`);
export const getUserAttempts = (userId) => api.get(`/admin/users/${userId}/attempts`);
export const getUserReport = (userId) => api.get(`/admin/users/${userId}/report`);
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);

// ===== Reports =====
export const getAllReports = () => api.get('/admin/reports');

// ===== Scenarios =====
export const getScenarios = () => api.get('/scenarios');
export const getScenario = (code) => api.get(`/scenarios/${code}`);
export const getScenarioTypes = () => api.get('/scenario-types');
export const getPhases = () => api.get('/phases');
export const createScenario = (data) => api.post('/admin/scenarios', data);

>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
export default api;