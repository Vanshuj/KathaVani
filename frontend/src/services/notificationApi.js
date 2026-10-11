import axios from 'axios';

const rawUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
const API_BASE = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

const getHeaders = (isAdmin = false) => {
  const token = isAdmin
    ? (localStorage.getItem('kv_admin_token') || localStorage.getItem('kv_token'))
    : (localStorage.getItem('kv_token') || localStorage.getItem('kv_admin_token'));
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchNotifications = async ({ filter = 'all', limit = 50, isAdmin = false } = {}) => {
  const res = await axios.get(`${API_BASE}/notifications`, {
    params: { filter, limit },
    headers: getHeaders(isAdmin)
  });
  return res.data;
};

export const markNotificationRead = async (id, isAdmin = false) => {
  const res = await axios.put(`${API_BASE}/notifications/${id}/read`, {}, {
    headers: getHeaders(isAdmin)
  });
  return res.data;
};

export const markAllNotificationsRead = async (isAdmin = false) => {
  const res = await axios.put(`${API_BASE}/notifications/read-all`, {}, {
    headers: getHeaders(isAdmin)
  });
  return res.data;
};

export const deleteNotification = async (id, isAdmin = false) => {
  const res = await axios.delete(`${API_BASE}/notifications/${id}`, {
    headers: getHeaders(isAdmin)
  });
  return res.data;
};
