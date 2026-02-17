import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

export default api;