import axios from 'axios';

const rawUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
const API_BASE = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

const adminAxios = axios.create({
  baseURL: `${API_BASE}/admin`
});

adminAxios.interceptors.request.use(config => {
  const token = localStorage.getItem('kv_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminAxios.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err.response?.data || { error: err.message || 'Server error' })
);

// Admin Auth
export const adminLogin = (email, password) =>
  adminAxios.post('/auth/login', { email, password });

export const getAdminMe = () =>
  adminAxios.get('/auth/me');

// Dashboard
export const getDashboardStats = () =>
  adminAxios.get('/dashboard/stats');

// User Management
export const getAdminUsers = (params) =>
  adminAxios.get('/users', { params });

export const getAdminUserDetail = (id) =>
  adminAxios.get(`/users/${id}`);

export const updateAdminUserStatus = (id, status, reason) =>
  adminAxios.put(`/users/${id}/status`, { status, reason });

export const updateAdminUserRestrictions = (id, restrictedCapabilities, reason) =>
  adminAxios.put(`/users/${id}/restrictions`, { restrictedCapabilities, reason });

export const updateAdminUserRole = (id, role) =>
  adminAxios.put(`/users/${id}/role`, { role });

export const deleteAdminUser = (id, permanent = false) =>
  adminAxios.delete(`/users/${id}`, { params: { permanent } });

// Story Moderation
export const getAdminStories = (params) =>
  adminAxios.get('/stories', { params });

export const getAdminStoryDetail = (id) =>
  adminAxios.get(`/stories/${id}`);

export const moderateStory = (id, status, payload = {}) => {
  const data = typeof payload === 'string'
    ? { status, reason: payload }
    : { status, ...payload };
  return adminAxios.put(`/stories/${id}/moderate`, data);
};

export const editAdminStory = (id, data) =>
  adminAxios.put(`/stories/${id}`, data);

export const deleteAdminStory = (id, reason = '', permanent = false) =>
  adminAxios.delete(`/stories/${id}`, { data: { reason, permanent } });

// Admin Account Management
export const getAdminsList = () =>
  adminAxios.get('/admins');

export const createAdminAccount = (data) =>
  adminAxios.post('/admins', data);

export const demoteAdminAccount = (id, newRole = 'user', reason = '') =>
  adminAxios.put(`/admins/${id}/demote`, { newRole, reason });

// Activity Audit Logs
export const getAdminAuditLogs = (params) =>
  adminAxios.get('/logs', { params });

export default adminAxios;
